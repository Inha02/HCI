import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ExerciseCompletePage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <ButtonContainer>
        <Button onClick={() => navigate('/exercisemode')}>
          다른 운동하기
        </Button>

        <Button onClick={() => navigate('/home')}>
          메인으로
        </Button>
      </ButtonContainer>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #0C0F2F;
  color: #D5D5D5;
  font-family: 'Pretendard', sans-serif;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const Button = styled.button`
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  background-color: #D5D5D5;
  color: #0C0F2F;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

export default ExerciseCompletePage;