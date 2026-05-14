import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import LogoImg from '../assets/logo.svg'; // 경로 확인 필요

const Navbar = () => {
  const location = useLocation();

  return (
    <NavContainer>
      <LogoWrapper to="/">
        <Logo src={LogoImg} alt="NOON" />
      </LogoWrapper>
      <RightNav>
      <NavLinks>
        <StyledLink to="/" $active={location.pathname === '/' || location.pathname === '/home'}>메인</StyledLink>
        <StyledLink to="/exercisemode" $active={location.pathname === '/exercisemode'}>운동</StyledLink>
        <StyledLink to="/dashboard" $active={location.pathname === '/dashboard'}>대시보드</StyledLink>
        <StyledLink to="/mypage" $active={location.pathname === '/mypage'}>마이페이지</StyledLink>
      </NavLinks>
        <UserProfile>
          <UserName>동서연 님</UserName>
        </UserProfile>
      </RightNav>
    </NavContainer>
  );
};

// --- 스타일 정의 ---
const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #0C0F2F;
`;

const RightNav = styled.div`
  display: flex;
  align-items: center;
  gap: 60px;
`;

const LogoWrapper = styled(Link)` display: flex; align-items: center; `;
const Logo = styled.img` width: 200px; `;

const NavLinks = styled.div` display: flex; gap: 40px; `;

// Link에 styled-components를 적용
const StyledLink = styled(Link)`
  text-decoration: none;
  cursor: pointer;
  /* active 상태일 때 색상 변경 */
  color: ${props => props.$active ? '#7B86FF' : '#A0A0A0'};
  font-weight: ${props => props.$active ? '700' : '500'};
  font-size: 1.2rem;
  &:hover { color: white; }
`;

const UserProfile = styled.div` display: flex; align-items: center; `;
const UserName = styled.span` font-weight: 700; font-size: 1.2rem; color: white; `;

export default Navbar;