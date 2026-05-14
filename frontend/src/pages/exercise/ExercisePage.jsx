import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// 아이콘이나 이미지가 있다면 import 하세요. 여기서는 임시 텍스트 아이콘을 사용합니다.
const ExercisePage = () => {
  const navigate = useNavigate();

  // 운동 데이터 리스트
  const exercises = [
    {
      id: 1,
      title: '포인트 추적',
      description: '움직이는 원을 따라가며\n외안근을 스트레칭 해보세요.',
      info: '15초 x 1세트',
      route: '/exercise1',
    },
    {
      id: 2,
      title: '초점 전환',
      description: '초점을 가까이 → 멀리 반복 전환하며\n수정체 유연성을 향상시켜 보세요.',
      info: '10회 반복',
      route: '/exercise2',
    },
    {
      id: 3,
      title: '눈 꼭 감기',
      description: '5초간 눈을 감아 눈물막을\n재생하고 피로를 해소해 보세요.',
      info: '5초 x 3세트',
      route: '/exercise3',
    },
  ];

  return (
    <Container>
      <MainContent>
        {/* 상단 헤더 섹션 */}
        <HeaderSection>
          <TitleRow>
            <PageTitle>안구 운동</PageTitle>
            <StatusBadge>오늘 운동 현황 2/3 완료</StatusBadge>
          </TitleRow>
          <SubTitle>눈의 피로를 풀어주는 3가지 안구 운동을 선택하세요!</SubTitle>
        </HeaderSection>

        {/* 운동 카드 리스트 섹션 */}
        <CardGrid>
          {exercises.map((ex) => (
            <ExerciseCard key={ex.id}>
              <IconWrapper>👁️</IconWrapper>
              <CardTitle>{ex.title}</CardTitle>
              <CardDescription>{ex.description}</CardDescription>
              <InfoBadge>{ex.info}</InfoBadge>
              <StartButton onClick={() => navigate(ex.route)}>시작하기</StartButton>
            </ExerciseCard>
          ))}
        </CardGrid>

        {/* 최근 운동 기록 섹션 (디자인 하단 참고) */}
        <HistorySection>
           <SectionTitle>최근 운동 기록</SectionTitle>
           <HistoryItem>
             <HistoryName>초점 전환</HistoryName>
             <HistoryDate>오늘 16:30</HistoryDate>
             <HistoryStatus>완료</HistoryStatus>
           </HistoryItem>
        </HistorySection>
      </MainContent>
    </Container>
  );
};


const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #0C0F2F;
  color: #D5D5D5;
  font-family: 'Pretendard', sans-serif;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 40px 4rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const HeaderSection = styled.div`
  margin-bottom: 40px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #D5D5D5;
  margin: 0;
`;

const StatusBadge = styled.div`
  background: rgba(123, 134, 255, 0.1);
  color: #7B86FF;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 700;
`;

const SubTitle = styled.p`
  font-size: 1.1rem;
  color: #A0A0A0;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
`;

const ExerciseCard = styled.div`
  background: #161B40;
  padding: 40px 30px;
  border-radius: 25px;
  border: 2px dashed #D5D5D5; 
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: #7B86FF;
  }
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: #7B86FF;
  margin-bottom: 15px;
`;

const CardDescription = styled.p`
  font-size: 1rem;
  line-height: 1.5;
  color: #D5D5D5;
  white-space: pre-line;
  margin-bottom: 20px;
  height: 3rem;
`;

const InfoBadge = styled.div`
  border: 1px solid #7B86FF;
  color: #D5D5D5;
  padding: 5px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 25px;
  margin-top: 10px;
`;

const StartButton = styled.button`
  width: 100%;
  background: #7B86FF;
  border: none;
  color: white;
  padding: 12px 0;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  
  &:hover {
    background: #6a76f0;
  }
`;

const HistorySection = styled.section`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 10px;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 20px;
`;

const HistoryItem = styled.div`
  background: rgba(22, 27, 64, 0.5);
  padding: 15px 25px;
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 600px;
`;

const HistoryName = styled.span` font-weight: 600; `;
const HistoryDate = styled.span` color: #A0A0A0; font-size: 0.9rem; `;
const HistoryStatus = styled.span` color: #4CAF50; font-weight: 700; `;

export default ExercisePage;