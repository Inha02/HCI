import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LogoImg from '../../assets/logo.svg';

const Mode2Page = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0); 
  const TOTAL_COUNT = 10; 


  const completeExercise = async () => {
    const payload = {
      userId: "6a1a843ca1b8851b791f7485",
      type: "FOCUS", 
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
      console.log('초점 전환 운동 기록 저장 성공');
    } catch (error) {
      console.error('초점 전환 운동 기록 저장 실패:', error);
    } finally {
      navigate('/exercisecomplete');
    }
  };

  useEffect(() => {
    if (count >= TOTAL_COUNT) {
      const timer = setTimeout(() => {
        completeExercise();
      }, 1000); 
      return () => clearTimeout(timer);
    }


    const interval = setInterval(() => {
      setCount((prev) => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [count]);

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
          <Title>초점 전환하기</Title>
          <SubTitle>화면의 텍스트에 초점을 맞추세요. 크기가 변할 때 눈의 초점을 따라가세요.</SubTitle>
        </InstructionSection>

        {/* 크기가 변하는 중앙 텍스트 */}
        <FocusTextWrapper>
          <FocusText>눈</FocusText>
        </FocusTextWrapper>

        <ProgressSection>
          <ProgressInfo>
            <span></span> {/* 모드 1 디자인 유지를 위한 빈 공간 */}
            <span>{count} / {TOTAL_COUNT}회</span>
          </ProgressInfo>
          <ProgressBarContainer>
            {/* 진행률에 따라 차오르는 바 */}
            <ProgressBarInner progress={(count / TOTAL_COUNT) * 100} />
          </ProgressBarContainer>
        </ProgressSection>
      </ExerciseArea>
    </Container>
  );
};

const scaleUpDown = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(4); opacity: 1; }
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

const FocusTextWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;

const FocusText = styled.div`
  font-size: 3rem;
  font-weight: 900;
  color: #7B86FF;
  animation: ${scaleUpDown} 4s infinite ease-in-out;
`;

const ProgressSection = styled.div`
  width: 70%;
  max-width: 900px;
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
  transition: width 0.5s ease-out;
`;

export default Mode2Page;