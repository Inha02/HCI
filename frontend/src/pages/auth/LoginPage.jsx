import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom'; // 💡 페이지 이동을 위해 useNavigate 임포트
import LogoImg from '../../assets/logo.svg';
import KakaoLoginImg from '../../assets/kakaologin.svg'; 

const electron = window.require ? window.require('electron') : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

const LoginPage = () => {
  const navigate = useNavigate(); // 💡 네비게이터 함수 선언

  const handleKakaoLogin = () => {
    console.log("카카오 로그인 버튼 클릭됨 -> 백엔드 인증 라우트로 이동");
    const BACKEND_KAKAO_URL = "http://localhost:5001/auth/kakao";
    window.location.href = BACKEND_KAKAO_URL;
  };

  // 💡 비회원 메인(GuestHomePage, 주소 '/')으로 돌아가는 함수
  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <Container>
      <ContentArea>
        <Logo src={LogoImg} alt="NOON" />  
        <TitleText>로그인</TitleText>
        <KakaoButton onClick={handleKakaoLogin}>
          <img src={KakaoLoginImg} alt="카카오 로그인" />
        </KakaoButton>
        
        <BackButton onClick={handleGoBack}>
          메인으로 돌아가기
        </BackButton>
      </ContentArea>
    </Container>
  );
};



const Container = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #0C0F2F;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  font-family: 'Pretendard', sans-serif;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 400px;
  animation: fadeIn 0.6s ease-in-out;
`;

const Logo = styled.img`
  width: 520px;
  height: auto;
  margin-bottom: 20px;
`;

const TitleText = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 25px;
  letter-spacing: -0.5px;
`;

const KakaoButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px; 

  img {
    width: 100%;
    max-width: 300px;
    height: auto;
  }

  &:hover {
    transform: scale(1.02);
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const BackButton = styled.div`
  color: #A0A0A0;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 4px;
  margin-top: 10px;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;

  &:hover {
    color: #ffffff;
  }
`;

export default LoginPage;