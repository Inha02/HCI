const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 및 카카오 로그인 API
 */

/**
 * @swagger
 * /auth/kakao:
 *   get:
 *     summary: 카카오 로그인 페이지로 리다이렉트
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: 카카오 OAuth 로그인 페이지로 이동
 */
router.get('/kakao', (req, res) => {
  const kakaoAuthUrl =
    `https://kauth.kakao.com/oauth/authorize` +
    `?response_type=code` +
    `&client_id=${process.env.KAKAO_REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(process.env.KAKAO_REDIRECT_URI)}`;

  res.redirect(kakaoAuthUrl);
});

/**
 * @swagger
 * /auth/kakao/callback:
 *   get:
 *     summary: 카카오 로그인 콜백 처리
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: 카카오에서 전달받은 인가 코드
 *     responses:
 *       302:
 *         description: 로그인 성공 후 프론트엔드로 JWT 토큰과 함께 리다이렉트
 *       400:
 *         description: 인가 코드 없음
 *       500:
 *         description: 카카오 로그인 실패
 */
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
        name: nickname,
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

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: 로그인한 사용자 정보 조회
 *     description: JWT 토큰을 이용해 현재 로그인한 특정 사용자 1명의 정보를 조회합니다.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "665f123abc"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     name:
 *                       type: string
 *                       example: "카카오닉네임"
 *                     socialType:
 *                       type: string
 *                       example: "kakao"
 *                     socialId:
 *                       type: string
 *                       example: "4914606845"
 *                     profileImage:
 *                       type: string
 *                       example: "https://profile.kakao.com/image.jpg"
 *                     settings:
 *                       type: object
 *                       properties:
 *                         blinkThreshold:
 *                           type: number
 *                           example: 0.2
 *                         drowsyThresholdTime:
 *                           type: number
 *                           example: 1.5
 *                         notificationEnabled:
 *                           type: boolean
 *                           example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: 토큰 없음 또는 유효하지 않은 토큰
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: '토큰이 없습니다.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select(
      'email name socialType socialId profileImage settings createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '사용자 정보 조회 실패',
      error: error.message,
    });
  }
});

module.exports = router;