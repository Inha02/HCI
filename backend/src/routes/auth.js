const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.get('/kakao', (req, res) => {
  const kakaoAuthUrl =
    `https://kauth.kakao.com/oauth/authorize` +
    `?response_type=code` +
    `&client_id=${process.env.KAKAO_REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(process.env.KAKAO_REDIRECT_URI)}`;

  res.redirect(kakaoAuthUrl);
});

router.get('/kakao/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: '인가 코드가 없습니다.' });
    }

    // 1. 인가 코드로 카카오 access token 요청
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_REST_API_KEY,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code,
        client_secret: process.env.KAKAO_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      }
    );

    const kakaoAccessToken = tokenResponse.data.access_token;

    // 2. access token으로 카카오 사용자 정보 요청
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${kakaoAccessToken}`,
      },
    });

    const kakaoUser = userResponse.data;

    const kakaoId = String(kakaoUser.id);
    const nickname = kakaoUser.kakao_account?.profile?.nickname || '카카오사용자';
    const profileImage = kakaoUser.kakao_account?.profile?.profile_image_url || '';
    const email = kakaoUser.kakao_account?.email;

    // 3. 우리 DB에서 회원 찾기 or 생성
    let user = await User.findOne({
      socialType: 'kakao',
      socialId: kakaoId,
    });

    if (!user) {
      user = await User.create({
        email,
        nickname,
        profileImage,
        socialType: 'kakao',
        socialId: kakaoId,
      });
    }

    // 4. 우리 서비스 JWT 발급
    const serviceToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. 프론트로 이동
    res.redirect(`${process.env.FRONTEND_URL}/oauth/kakao?token=${serviceToken}`);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      message: '카카오 로그인 실패',
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;