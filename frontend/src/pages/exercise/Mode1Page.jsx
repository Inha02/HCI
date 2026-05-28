import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LogoImg from '../../assets/logo.svg';

const Mode1Page = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(15);
  const TOTAL_TIME = 15;


  const completeExercise = async () => {
    const payload = {
      userId: "6a171e97e513581fb9f3b6bf",
      type: "TRACKING", 
      duration: 60,
      success: true,
      score: 100 
    };

    try {
      await fetch('http://localhost:5001/api/exercise/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      console.log('운동 기록 저장 성공');
    } catch (error) {
      console.error('운동 기록 저장 실패:', error);
    } finally {
      navigate('/exercisecomplete');
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      completeExercise();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <Container>
      <Navbar>
        <Logo src={LogoImg} alt="NOON" />
        <ButtonGroup>
          <GhostButton onClick={() => navigate('/exercisemode')}>
            운동 중단하기
          </GhostButton>
        </ButtonGroup>
      </Navbar>

      <ExerciseArea>
        <InstructionSection>
          <Title>포인트 추적하기</Title>
          <SubTitle>점을 눈으로 따라가세요. 머리는 움직이지 마세요.</SubTitle>
        </InstructionSection>

        <Stage>
          {timeLeft > 0 && <MovingPoint />}
        </Stage>

        <ProgressSection>
          <ProgressInfo>
            <span>1세트</span>
            <span>{timeLeft > 0 ? timeLeft : 0}초</span>
          </ProgressInfo>
          <ProgressBarContainer>
            <ProgressBarInner progress={(timeLeft / TOTAL_TIME) * 100} />
          </ProgressBarContainer>
        </ProgressSection>
      </ExerciseArea>
    </Container>
  );
};

const movePattern = keyframes`
  0% { top: 50%; left: 50%; }
  20% { top: 15%; left: 85%; }
  40% { top: 75%; left: 15%; }
  60% { top: 40%; left: 10%; }
  80% { top: 40%; left: 90%; }
  100% { top: 50%; left: 50%; }
`;

const Container = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #0C0F2F;
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: white;
  }
`;

const ExerciseArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 80px;
  position: relative;
`;

const InstructionSection = styled.div`
  text-align: center;
  margin-top: 20px;
 daytime;
`;

const Title = styled.h2`
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 10px;
`;

const SubTitle = styled.p`
  font-size: 1.2rem;
  color: #A0A0A0;
`;

const Stage = styled.div`
  position: absolute;
  top: 25%;
  bottom: 25%;
  left: 5%;
  right: 5%;
`;

const MovingPoint = styled.div`
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: #7B86FF;
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(123, 134, 255, 0.8);
  animation: ${movePattern} 10s infinite ease-in-out;
  transform: translate(-50%, -50%);
`;

const ProgressSection = styled.div`
  width: 70%;
  max-width: 900px;
  z-index: 20;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #D5D5D5;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 20px;
  background: #333959;
  border-radius: 20px;
  overflow: hidden;
`;

const ProgressBarInner = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background: #7B86FF;
  transition: width 1s linear;
`;

export default Mode1Page;