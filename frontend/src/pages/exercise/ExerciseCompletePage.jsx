import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ExerciseCompletePage = () => {
  const navigate = useNavigate();
  const [completedCount, setCompletedCount] = useState(0);
  const userId = '6a1a843ca1b8851b791f7485';

  // 📊 실시간 오늘 운동 현황 (X/3) 데이터 패치 단일화 수정
  useEffect(() => {
    const fetchCurrentStatus = async () => {
      try {
        // 🎯 새로운 대시보드 API 주소로 단일 요청 처리
        const res = await fetch(`http://localhost:5001/api/dashboard/summary?userId=${userId}&period=day`);
        
        if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
        
        const result = await res.json();
        console.log("새로운 대시보드 완료 페이지 수신 데이터:", result);

        // 최근 로그 배열 안전하게 가져오기 (없으면 빈 배열 보장)
        const recentLogs = result.exercise?.recentLogs || [];

        // 🎯 TRACKING, FOCUS, BLINK 중 성공한(success: true) 고유 타입 카운트 계산
        const targetTypes = ['TRACKING', 'FOCUS', 'BLINK'];
        
        const finishedTypes = targetTypes.filter(type => {
          // 해당 타입이 존재하면서 success가 true인 기록이 1개라도 있는지 확인
          return recentLogs.some(log => log.type === type && log.success === true);
        });

        const trueCount = finishedTypes.length; // 0 ~ 3 범위 값 생성
        setCompletedCount(trueCount);
        
      } catch (error) {
        console.error('📊 현황 집계 오류:', error);
      }
    };

    fetchCurrentStatus();
  }, [userId]);

  return (
    <Container>
      <CardContainer>
        <CheckIcon>✓</CheckIcon>
        <MainTitle>안구 운동 완료</MainTitle>
        <SubDescription>
          안구 스트레칭 및 피로 해소 운동을 완료했습니다.<br />
          꾸준한 루틴 유지로 눈 건강을 지켜보세요!
        </SubDescription>

        <StatusSection>
          <StatusLabel>오늘의 운동 현황</StatusLabel>
          <StatusBadge>{completedCount} / 3 완료</StatusBadge>
        </StatusSection>

        <ButtonContainer>
          <DivButton $primary onClick={() => navigate('/exercisemode')}>
            다른 운동하기
          </DivButton>
          <DivButton onClick={() => navigate('/home')}>
            메인으로
          </DivButton>
        </ButtonContainer>
      </CardContainer>
    </Container>
  );
};

// --- 스타일 컴포넌트 ---

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

const CardContainer = styled.div`
  background: #161B40;
  border: 2px solid #7B86FF;
  border-radius: 25px;
  padding: 50px 40px;
  width: 90%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  
  animation: slideUp 0.4s ease-out;
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const CheckIcon = styled.div`
  width: 70px;
  height: 70px;
  background: rgba(123, 134, 255, 0.2);
  border: 2px solid #7B86FF;
  color: #7B86FF;
  border-radius: 50%;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 25px auto;
  font-weight: bold;
`;

const MainTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: #FFFFFF;
  margin-bottom: 15px;
`;

const SubDescription = styled.p`
  font-size: 1.05rem;
  line-height: 1.6;
  color: #A0A0A0;
  margin-bottom: 35px;
`;

const StatusSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  border: 1px solid rgba(123, 134, 255, 0.1);
`;

const StatusLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #D5D5D5;
`;

const StatusBadge = styled.span`
  background: rgba(123, 134, 255, 0.15);
  color: #7B86FF;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 700;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const DivButton = styled.div`
  flex: 1;
  padding: 15px 0;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;

  background-color: ${props => props.$primary ? '#7B86FF' : 'transparent'};
  color: ${props => props.$primary ? '#FFFFFF' : '#D5D5D5'};
  border: ${props => props.$primary ? 'none' : '1px solid #333959'};

  &:hover {
    background-color: ${props => props.$primary ? '#6a76f0' : 'rgba(255,255,255,0.05)'};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default ExerciseCompletePage;