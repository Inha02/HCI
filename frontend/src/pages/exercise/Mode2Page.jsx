import React from 'react';
import styled from 'styled-components';
import LogoImg from '../../assets/logo.svg';

const Mode2Page = () => {
  return (
    <Container>
      <Navbar>
        <Logo src={LogoImg} alt="NOON" />
        <ButtonGroup>
          <GhostButton>운동 중단하기</GhostButton>
        </ButtonGroup>
      </Navbar>
    </Container>
  );
};


const Container = styled.div`
  width: 100%;
  background-color: #0C0F2F;
  color:#D5D5D5;
  font-family: 'Pretendard', sans-serif;
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4rem;
`;

const Logo = styled.img`
  width: 100px;
  height: 100px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const GhostButton = styled.button`
  background: none;
  border: 1px solid #D5D5D5;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  color: white;
  font-weight: 700;
`;

export default Mode2Page;