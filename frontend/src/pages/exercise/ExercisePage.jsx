import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ExercisePage = () => {
  const navigate = useNavigate();
  
  const [completedCount, setCompletedCount] = useState(0);

  const userId = '6a171e97e513581fb9f3b6bf';

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

  useEffect(() => {
    const fetchExerciseLogs = async () => {
      const types = ['TRACKING', 'FOCUS', 'BLINK'];
      
      try {
        const promises = types.map(type =>
          fetch(`http://localhost:5001/api/exercise/logs?userId=${userId}&type=${type}`)
            .then(res => res.json())
            .catch(err => ({ success: false, error: err.message }))
        );

        const results = await Promise.all(promises);
        console.log("백데이터", results);

        const trueCount = results.filter(result => {
            return result.success === true && result.data && result.data.length > 0;
          }).length;
        
        setCompletedCount(trueCount);
        console.log(`안구 운동 로그 조회 완료 (성공 개수: ${trueCount}/3)`);
      } catch (error) {
        console.error('운동 로그 정보를 가져오는 중 에러 발생:', error);
      }
    };

    fetchExerciseLogs();
  }, [userId]);

  return (
    <Container>
      <MainContent>
        <HeaderSection>
          <TitleRow>
            <PageTitle>안구 운동</PageTitle>
            <StatusBadge>오늘 운동 현황 {completedCount}/3 완료</StatusBadge>
          </TitleRow>
          <SubTitle>눈의 피로를 풀어주는 3가지 안구 운동을 선택하세요!</SubTitle>
        </HeaderSection>

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

export default ExercisePage;