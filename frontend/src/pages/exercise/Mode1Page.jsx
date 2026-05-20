import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LogoImg from '../../assets/logo.svg';

const Mode1Page = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(15);
  const TOTAL_TIME = 15;

  useEffect(() => {
    if (timeLeft <= 0) {
      navigate('/exercisecomplete');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  return (
    <Container>
      <Navbar>
        <Logo src={LogoImg} alt="NOON" />
        <ButtonGroup>
          {/* 버튼 디자인을 처음 코드로 복구 */}
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

        {/* 포인트가 노는 영역을 제한하기 위한 컨테이너 */}
        <Stage>
          <MovingPoint />
        </Stage>

        <ProgressSection>
          <ProgressInfo>
            <span>1세트</span>
            <span>{timeLeft}초</span>
          </ProgressInfo>
          <ProgressBarContainer>
            <ProgressBarInner progress={(timeLeft / TOTAL_TIME) * 100} />
          </ProgressBarContainer>
        </ProgressSection>
      </ExerciseArea>
    </Container>
  );
};

// --- 애니메이션 및 스타일 ---

// 포인트가 화면 하단 글씨를 침범하지 않도록 범위를 10% ~ 85% 사이로 조정
const movePattern = keyframes`
  0% { top: 50%; left: 50%; }
  20% { top: 15%; left: 85%; }   /* 우상단 */
  40% { top: 75%; left: 15%; }   /* 좌하단 (너무 내려가지 않게 조정) */
  60% { top: 40%; left: 10%; }   /* 왼쪽 */
  80% { top: 40%; left: 90%; }   /* 오른쪽 */
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
  padding: 0 4rem; /* 기존 패딩 유지 */
`;

const Logo = styled.img`
  width: 100px; /* 처음 코드 크기 복구 */
  height: 100px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

// 처음 보내주신 GhostButton 디자인 그대로 유지
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

/* 포인트 이동 영역 제한 컨테이너 */
const Stage = styled.div`
  position: absolute;
  top: 25%; /* 제목 아래부터 */
  bottom: 25%; /* 프로그레스 바 위까지 */
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
  z-index: 20; /* 포인트보다 위에 오도록 설정 */
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