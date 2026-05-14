import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Navbar 경로에 맞춰 수정하세요
import styled from 'styled-components';

const Layout = () => {
  return (
    <Wrapper>
      <Navbar />
      <MainContent>
        <Outlet /> {/* 이 자리에 UserHomePage, ExercisePage 등이 들어갑니다 */}
      </MainContent>
    </Wrapper>
  );
};

export default Layout;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0C0F2F;
`;

const MainContent = styled.main`
  flex: 1;
`;