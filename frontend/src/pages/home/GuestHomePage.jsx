import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom'; // 💡 페이지 이동을 위한 useNavigate 임포트
import LogoImg from '../../assets/logo.svg';

const GuestHomePage = () => {
  const navigate = useNavigate(); // 💡 네비게이터 함수 선언

  const handleGoToLogin = () => {
    navigate('/login'); // 💡 로그인 페이지로 이동시킵니다.
  };

  return (
    <Container>
      <Navbar>
        <Logo src={LogoImg} alt="NOON" />
        <ButtonGroup>
          {/* 💡 div 버튼에 클릭 이벤트 연결 */}
          <GhostButton onClick={handleGoToLogin}>로그인</GhostButton>
        </ButtonGroup>
      </Navbar>

      <HeroSection>
        <BigLogo src={LogoImg} alt="NOON"/>
        <MainTitle>눈, 지금 깜빡이고 있나요?</MainTitle>
        <SubDescription>
          웹캠으로 실시간 눈 깜빡임·졸음을 감지하고<br />
          맞춤 알림과 안구 운동 가이드를 제공해요.
        </SubDescription>
      </HeroSection>

      <FeatureSection>
        <SectionTitle>눈 건강, 이제 NOON이 지켜드릴게요!</SectionTitle>
        <SectionSubtitle>주요 기능</SectionSubtitle>
        
        <Grid>
          <Card>
            <Icon>👁️</Icon>
            <CardTitle>실시간 깜박임 감지</CardTitle>
            <CardText>EAR 기반으로 분당 깜빡임 횟수(BPM)를 실시간 측정</CardText>
          </Card>
          <Card>
            <Icon>🔔</Icon>
            <CardTitle>졸음 감지 알림</CardTitle>
            <CardText>연속 2초 이상 눈 감김 시 경고 알림 발송</CardText>
          </Card>
          <Card>
            <Icon>⏰</Icon>
            <CardTitle>20-20-20 타이머</CardTitle>
            <CardText>20분 작업 후 20초 눈 휴식을 자동 안내</CardText>
          </Card>
          <Card>
            <Icon>🔄</Icon>
            <CardTitle>안구 운동 가이드</CardTitle>
            <CardText>포인트 추적·초점 전환·눈 감기 3종 운동 제공</CardText>
          </Card>
        </Grid>
      </FeatureSection>

      <Footer>
        <InfoText>하루 평균 눈 깜빡임 정상치 15~20회/분</InfoText>
        <FooterTitle>지금 바로 눈 건강을 확인하세요!</FooterTitle>
        {/* 💡 div 버튼에 클릭 이벤트 연결 */}
        <OutlineButton onClick={handleGoToLogin}>바로 시작하기</OutlineButton>
      </Footer>
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.img`
  width: 100px;
  height: 100px;
`;

const BigLogo = styled.img`
  width: 700px;
  height: 200px;
  margin-top:40px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

// 기존 PrimaryButton 컴포넌트 유지 (필요 시 아래처럼 div로 교체 가능)
const PrimaryButton = styled.button`
  background-color: #7B86FF;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 700; 
`;

// 💡 styled.button에서 styled.div로 변경하여 폰트 상속 문제를 완벽 해결했습니다.
const GhostButton = styled.div`
  background: none;
  border: 1px solid #7B86FF;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  color: white;
  font-weight: 700;
  
  /* 정렬 및 글자 드래그 방지용 스타일 보완 */
  display: inline-block;
  text-align: center;
  user-select: none;

  &:hover {
    opacity: 0.9;
  }
`;

const HeroSection = styled.header`
  padding: 50px 20px;
  text-align: center;
`;

const MainTitle = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 50px;
  margin-top:50px;
`;

const SubDescription = styled.p`
  font-size: 1.7rem;
  line-height: 1.6;
  color: #D5D5D5; 
`;

const FeatureSection = styled.section`
  padding: 0 4rem;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
`;

const SectionSubtitle = styled.p`
  color: #7B86FF;
  margin-top:30px;
  margin-bottom: 50px;
  font-size: 1.5rem;
  font-weight: 700;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05); 
  padding: 40px 30px;
  border-radius: 20px;
  border: 4px solid #D5D5D5;
`;

const Icon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  font-size: 1.45rem;
  margin-bottom: 10px;
`;

const CardText = styled.p`
  font-size: 1rem;
  color: #B0B0B0;
  line-height: 1.5;
`;

const Footer = styled.footer`
  padding: 100px 20px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const InfoText = styled.p`
  color: #888;
  margin-bottom: 0px;
  font-size:1.2rem;
`;

const FooterTitle = styled.h4`
  font-size: 1.8rem;
  margin-top: 5px;
  margin-bottom: 30px;
`;

// 💡 styled.button에서 styled.div로 변경하여 폰트 상속 문제를 완벽 해결했습니다.
const OutlineButton = styled.div`
  background-color: #7B86FF;
  color: white;
  border: none;
  padding: 20px 50px;
  border-radius: 10px;
  font-size: 2.5rem;
  font-weight: 700;
  cursor: pointer;
  
  /* 정렬 및 글자 드래그 방지용 스타일 보완 */
  display: inline-block;
  text-align: center;
  user-select: none;

  &:hover {
    background-color: #626ee6;
  }
`;

export default GuestHomePage;