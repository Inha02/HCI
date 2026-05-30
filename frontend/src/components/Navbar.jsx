import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import LogoImg from '../assets/logo.svg';

const Navbar = () => {
  const location = useLocation();
  // 🎯 카카오에서 받아와 보관된 이름을 상태로 관리 (기본값은 '회원')
  const [userName, setUserName] = useState('회원');

  useEffect(() => {
    // 로컬스토리지에 저장된 카카오 닉네임(name)을 읽어옵니다.
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
  }, [location]); // 페이지가 전환될 때마다 세션 갱신 여부를 체크하도록 설정

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
          {/* 🎯 "ㅇㅇ 님" 형태로 유연하게 출력 */}
          <UserName>{userName} 님</UserName>
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

const LogoWrapper = styled(Link)` 
  display: flex; 
  align-items: center; 
`;

const Logo = styled.img` 
  width: 200px; 
`;

const NavLinks = styled.div` 
  display: flex; 
  gap: 40px; 
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  cursor: pointer;
  color: ${props => props.$active ? '#7B86FF' : '#A0A0A0'};
  font-weight: ${props => props.$active ? '700' : '500'};
  font-size: 1.2rem;
  transition: color 0.2s;
  
  &:hover { 
    color: white; 
  }
`;

const UserProfile = styled.div` 
  display: flex; 
  align-items: center; 
`;

const UserName = styled.span` 
  font-weight: 700; 
  font-size: 1.2rem; 
  color: white; 
`;

export default Navbar;