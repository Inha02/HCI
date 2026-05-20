import React from 'react';
import styled from 'styled-components';
import LogoImg from '../../assets/logo.svg';
import KakaoLoginImg from '../../assets/kakaologin.svg'; 

const electron = window.require ? window.require('electron') : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

const LoginPage = () => {

  const handleKakaoLogin = () => {
    console.log("카카오 로그인 버튼 클릭됨");
    
    // Electron 환경일 경우 메인 프로세스에 로그인 창 오픈 요청 보냄
    if (ipcRenderer) {
      ipcRenderer.send('kakao-login-request');
    } else {
      // 웹 브라우저 테스트 환경용
      // window.location.href = `https://kauth.kakao.com/oauth/authorize?...`;
    }
  };

  return (
    <Container>
      <ContentArea>
        <Logo src={LogoImg} alt="NOON" />  
        <TitleText>로그인</TitleText>
        <KakaoButton onClick={handleKakaoLogin}>
          <img src={KakaoLoginImg} alt="카카오 로그인" />
        </KakaoButton>
      </ContentArea>
    </Container>
  );
};

// --- 스타일 컴포넌트 정의 ---

const Container = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #0C0F2F;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
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
  margin-bottom: 12px;
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

export default LoginPage;