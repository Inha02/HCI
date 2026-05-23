import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout'; 
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
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

// Electron 환경 체크
const electron = window.require ? window.require('electron') : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

function AppRouter() {

  // 💡 [핵심 추가] 초기 구동 시 로컬스토리지 설정을 Electron 프로세스로 동기화
  useEffect(() => {
    if (ipcRenderer) {
      const drowsyPopup = JSON.parse(localStorage.getItem('drowsyPopup')) ?? true;
      const drowsySound = JSON.parse(localStorage.getItem('drowsySound')) ?? true;
      const blinkAlert = JSON.parse(localStorage.getItem('blinkAlert')) ?? true;
      const timer202020 = JSON.parse(localStorage.getItem('timer202020')) ?? true;

      // Electron 메인(Main.js)의 4개 변수 공간에 로컬 상태 덮어쓰기
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
        {/* 1. 네비게이션 바가 "필요한" 페이지들 */}
        <Route element={<Layout />}>
          <Route path="/" element={<UserHomePage />} />
          <Route path="/home" element={<UserHomePage />} />
          <Route path="/exercisemode" element={<ExercisePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>

        {/* 2. 네비게이션 바가 "필요 없는" 나머지 페이지들 */}
        <Route path="/guesthome" element={<GuestHomePage />} />
        <Route path="/break-popup" element={<BreakPopup />}/>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/exercise1" element={<Mode1Page />} />
        <Route path="/exercise2" element={<Mode2Page />} />
        <Route path="/exercise3" element={<Mode3Page />} />
        <Route path="/exercisecomplete" element={<ExerciseCompletePage />} />
        <Route path="/editinfo" element={<EditUserInfoPage />} />
        <Route path="/drowsy-popup" element={<DrowsinessPopup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;