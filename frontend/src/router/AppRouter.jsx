import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout'; 
import LoginPage from '../pages/auth/LoginPage';
import KakaoCallback from '../pages/auth/KakaoCallback';
import GuestHomePage from '../pages/home/GuestHomePage';
import UserHomePage from '../pages/home/UserHomePage';
import BreakPopup from '../pages/popup/BreakPopup';
import ExercisePage from '../pages/exercise/ExercisePage';
import Mode1Page from '../pages/exercise/Mode1Page';
import Mode2Page from '../pages/exercise/Mode2Page';
import Mode3Page from '../pages/exercise/Mode3Page';
import ExerciseCompletePage from '../pages/exercise/ExerciseCompletePage';
import MyPage from '../pages/user/MyPage';
import EditUserInfoPage from '../pages/user/EditUserInfoPage';
import DashboardPage from '../pages/user/DashboardPage';
import DrowsinessPopup from '../pages/popup/DrowsinessPopup';
import BlinkPopup from '../pages/popup/BlinkPopup'; 

// Electron 환경 체크
const electron = window.require ? window.require('electron') : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

function AppRouter() {

  // 로컬 스토리지에 토큰이 존재하는지 실시간 검사 (로그인 여부 판별)
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token; // 토큰이 있으면 true, 없으면 false

  // 💡 [초기화 로직] 구동 시 로컬스토리지 설정을 Electron 프로세스로 동기화
  useEffect(() => {
    if (ipcRenderer) {
      const drowsyPopup = JSON.parse(localStorage.getItem('drowsyPopup')) ?? true;
      const drowsySound = JSON.parse(localStorage.getItem('drowsySound')) ?? true;
      const blinkAlert = JSON.parse(localStorage.getItem('blinkAlert')) ?? true;
      const timer202020 = JSON.parse(localStorage.getItem('timer202020')) ?? true;

      ipcRenderer.send('update-notification-setting', { key: 'drowsyPopup', value: drowsyPopup });
      ipcRenderer.send('update-notification-setting', { key: 'drowsySound', value: drowsySound });
      ipcRenderer.send('update-notification-setting', { key: 'blinkAlert', value: blinkAlert });
      ipcRenderer.send('update-notification-setting', { key: 'timer202020', value: timer202020 });

      console.log("📡 [초기 동기화 완료] 로컬스토리지 환경설정이 Electron 메인으로 이식되었습니다.");
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* ================= 비로그인 유저도 접근 가능한 오픈 라우트 ================= */}
        
        {/* 💡 1. 메인 주소(/): 로그인 상태에 따라 보여주는 홈화면 분기 처리 */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/home" replace /> : <GuestHomePage />} />
        
        {/* Guest 전용 홈화면과 로그인창 */}
        <Route path="/guesthome" element={isLoggedIn ? <Navigate to="/home" replace /> : <GuestHomePage />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/home" replace /> : <LoginPage />} />
        
        {/* 카카오 인증 처리 대기실 (토큰을 발급받아 저장하는 곳) */}
        <Route path="/oauth/kakao" element={<KakaoCallback />} />

        {/* 팝업창 레이아웃 (독립 창이라 네비게이션 바 불필요, 비로그인 상태 제한 없음) */}
        <Route path="/break-popup" element={<BreakPopup />}/>
        <Route path="/drowsy-popup" element={<DrowsinessPopup />} />
        <Route path="/blink-popup" element={<BlinkPopup />} /> 


        {/* ================= 🔒 로그인 필수 권한 제어 라우트 ================= */}
        
        {/* 2. 네비게이션 바가 "필요한" 회원전용 페이지들 */}
        <Route element={isLoggedIn ? <Layout /> : <Navigate to="/login" replace />}>
          <Route path="/home" element={<UserHomePage />} />
          <Route path="/exercisemode" element={<ExercisePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>

        {/* 3. 네비게이션 바가 "필요 없는" 회원전용 내부 서브 페이지들 */}
        <Route element={isLoggedIn ? null : <Navigate to="/login" replace />}>
          <Route path="/exercise1" element={<Mode1Page />} />
          <Route path="/exercise2" element={<Mode2Page />} />
          <Route path="/exercise3" element={<Mode3Page />} />
          <Route path="/exercisecomplete" element={<ExerciseCompletePage />} />
          <Route path="/editinfo" element={<EditUserInfoPage />} />
        </Route>

        {/* 잘못된 주소 접근 시 자동으로 알맞은 홈화면으로 튕겨내기 처리 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;