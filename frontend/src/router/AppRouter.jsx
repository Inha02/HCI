import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout'; // 방금 만든 레이아웃
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

function AppRouter() {
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