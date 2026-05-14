import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; 
import styled from 'styled-components';

const Layout = () => {
  return (
    <Wrapper>
      <Navbar />
      <MainContent>
        <Outlet /> {/* 페이지자리 */}
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