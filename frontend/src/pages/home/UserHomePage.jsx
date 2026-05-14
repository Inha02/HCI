import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FaceMeshManager from '../../components/FaceMeshManager';

// Electron 환경 체크
const electron = window.require ? window.require('electron') : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

const UserHomePage = () => {
  // --- 상태 관리 ---
  const [seconds, setSeconds] = useState(0); 
  const [isActive, setIsActive] = useState(false); 
  const [showBreakModal, setShowBreakModal] = useState(false); 
  const [breakTimer, setBreakTimer] = useState(20); 
  
  // 웹캠 상태 관리 추가
  const [isWebcamActive, setIsWebcamActive] = useState(false); 
  
  const TOTAL_WORK_TIME = 10; // 테스트 코드 (10초)

  // --- 메인 타이머 로직 ---
  useEffect(() => {
    let interval = null;
    if (isActive && seconds < TOTAL_WORK_TIME) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (seconds >= TOTAL_WORK_TIME) {
      setIsActive(false);
      setShowBreakModal(true); 
      setSeconds(0);
      
      if (ipcRenderer) {
        ipcRenderer.send('open-rest-window');
      }

      if (Notification.permission === "granted") {
        new Notification("시간이 되었습니다!", { body: "눈을 휴식해주세요." });
      }
      clearInterval(interval);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, TOTAL_WORK_TIME]); 

  // --- 휴식 타이머 로직 ---
  useEffect(() => {
    let timeout = null;
    if (showBreakModal && breakTimer > 0) {
      timeout = setInterval(() => {
        setBreakTimer((prev) => prev - 1);
      }, 1000);
    } else if (breakTimer <= 0) {
      setShowBreakModal(false);
      setBreakTimer(20);
      
      if (ipcRenderer) {
        ipcRenderer.send('close-rest-window');
      }
    }
    return () => clearInterval(timeout);
  }, [showBreakModal, breakTimer]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Container>
      {/* 웹캠 및 모델 로직 컴포넌트 연결 */}
      <FaceMeshManager isActive={isWebcamActive} />

      {showBreakModal && (
        <FullOverlay>
          <ModalContent>
            <h2>👀 눈 휴식 시간</h2>
            <p>20초 동안 먼 곳(6m 이상)을 응시하세요.</p>
            <BreakClock>{breakTimer}s</BreakClock>
            <CloseButton onClick={() => {
              setShowBreakModal(false);
              if (ipcRenderer) ipcRenderer.send('close-rest-window');
            }}>건너뛰기</CloseButton>
          </ModalContent>
        </FullOverlay>
      )}

      <MainContent>
        <TopStatusRow>
          {/* 웹캠 토글 버튼: 클릭 시 isWebcamActive 상태 반전 */}
          <WebcamToggle 
            onClick={() => setIsWebcamActive(!isWebcamActive)}
            style={{ backgroundColor: isWebcamActive ? '#FF4B4B' : '#7B86FF', color: 'white' }}
          >
            {isWebcamActive ? '웹캠 활성화 끄기' : '웹캠 활성화 켜기'}
          </WebcamToggle>
          
          <StatusBadge>
            {isWebcamActive ? '모니터링 중' : '모니터링 일시정지'}
          </StatusBadge>
        </TopStatusRow>

        <StatusSection>
          <SectionTitle>현재 상태</SectionTitle>
          <StatusCardsWrapper>
            <StatusCard>
              <Label>BPM (분당 깜박임)</Label>
              <StatusMainValue>16</StatusMainValue>
              <StatusText>정상 범위 15~20</StatusText>
            </StatusCard>
            <StatusCard>
              <Label>졸음 상태</Label>
              <StatusMainValue>집중</StatusMainValue>
              <StatusText>이상 없음</StatusText>
            </StatusCard>
          </StatusCardsWrapper>
        </StatusSection>

        <TimerSection>
          <SectionTitle>20-20-20 타이머</SectionTitle>
          <TimerCard>
            <BigTime>{formatTime(seconds)}</BigTime>

            <TimerDetails>
              <TimerInfoRow>
                <TimerLabel>다음 휴식까지</TimerLabel>
                <TimeLeft>{formatTime(TOTAL_WORK_TIME - seconds)}</TimeLeft>
              </TimerInfoRow>

              <ProgressBarContainer>
                <ProgressBarInner progress={(seconds / TOTAL_WORK_TIME) * 100} />
              </ProgressBarContainer>

              <TimerMessage>
                {TOTAL_WORK_TIME === 10 ? "테스트 모드: 10초 후 휴식!" : "20분 작업 후 20초간 멀리 바라보세요!"}
              </TimerMessage>

              <TimerControls>
                {seconds === 0 && !isActive ? (
                  <ControlButton variant="pause" onClick={() => setIsActive(true)}>START</ControlButton>
                ) : (
                  <ControlButton variant="pause" onClick={() => setIsActive(!isActive)}>
                    {isActive ? '일시정지' : '재개'}
                  </ControlButton>
                )}
                <ControlButton variant="reset" onClick={() => { setIsActive(false); setSeconds(0); }}>리셋</ControlButton>
              </TimerControls>
            </TimerDetails>
          </TimerCard>
        </TimerSection>
      </MainContent>
    </Container>
  );
};

// --- 스타일 컴포넌트 정의 (변경 없음) ---
const Container = styled.div` width: 100%; color: white; `;
const MainContent = styled.main` flex: 1; padding: 40px 4rem; max-width: 1400px; margin: 0 auto; width: 100%; `;
const TopStatusRow = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; `;
const WebcamToggle = styled.button` border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-size: 1.1rem; font-weight: 800; transition: all 0.3s ease; `;
const StatusBadge = styled.div` background: rgba(76, 175, 80, 0.1); color: #4CAF50; padding: 8px 16px; border-radius: 20px; font-size: 0.95rem; font-weight: 700; `;
const StatusSection = styled.div` display: flex; gap: 50px; margin-bottom: 80px; `;
const SectionTitle = styled.h2` font-size: 1.75rem; white-space: nowrap; `;
const StatusCardsWrapper = styled.div` display: flex; gap: 80px; flex: 1; `;
const StatusCard = styled.div` background: #161B40; padding: 20px; min-width: 300px; border-radius: 25px; display: flex; flex-direction: column; align-items: center; border: 2px solid #7B86FF; `;
const Label = styled.span` color: #D5D5D5; font-size: 1.2rem; `;
const StatusMainValue = styled.span` font-size: 3.5rem; font-weight: 800; color: #7B86FF; `;
const StatusText = styled.span` color: #A0A0A0; `;
const TimerSection = styled.section` margin-top: 10px; `;
const TimerCard = styled.div` display: flex; align-items: center; gap: 50px; padding: 20px 0; `;
const BigTime = styled.div` font-size: 4.5rem; font-weight: 800; color: #7B86FF; flex: 0.3; text-align: center; `;
const TimerDetails = styled.div` flex: 0.7; display: flex; flex-direction: column; gap: 15px; `;
const TimerInfoRow = styled.div` display: flex; align-items: baseline; gap: 15px; `;
const TimerLabel = styled.span` color: #D5D5D5; font-size: 1.4rem; font-weight: 600; `;
const TimeLeft = styled.span` font-size: 1.4rem; font-weight: 700; color: #7B86FF; `;
const ProgressBarContainer = styled.div` width: 100%; height: 20px; background: #333; border-radius: 50px; overflow: hidden; `;
const ProgressBarInner = styled.div` width: ${props => props.progress}%; height: 100%; background: #7B86FF; transition: width 0.5s ease; `;
const TimerMessage = styled.p` font-size: 1.1rem; color: #D5D5D5; `;
const TimerControls = styled.div` display: flex; gap: 15px; `;
const ControlButton = styled.button` padding: 10px 25px; border-radius: 10px; font-weight: 700; cursor: pointer; background: ${props => props.variant === 'pause' ? '#D5D5D5' : 'transparent'}; color: ${props => props.variant === 'pause' ? '#0C0F2F' : '#D5D5D5'}; border: ${props => props.variant === 'reset' ? '1px solid #D5D5D5' : 'none'}; `;
const FullOverlay = styled.div` position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(12, 15, 47, 0.98); display: flex; justify-content: center; align-items: center; z-index: 9999; `;
const ModalContent = styled.div` text-align: center; `;
const BreakClock = styled.div` font-size: 10rem; font-weight: 900; color: #7B86FF; margin: 20px 0; `;
const CloseButton = styled.button` background: transparent; border: 1px solid #7B86FF; color: #7B86FF; padding: 10px 30px; border-radius: 8px; cursor: pointer; &:hover { background: #7B86FF; color: white; } `;

export default UserHomePage;