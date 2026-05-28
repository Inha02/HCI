import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import LogoImg from '../../assets/logo.svg';

// MediaPipe 랜드마크 인덱스 정의
const RIGHT_EYE = { p1: 33, p2: 160, p3: 158, p4: 133, p5: 153, p6: 144 };
const LEFT_EYE = { p1: 362, p2: 385, p3: 387, p4: 263, p5: 373, p6: 380 };

const Mode3Page = () => {
  const navigate = useNavigate();

  // --- 상태 관리 ---
  const [isStarted, setIsStarted] = useState(false); // 전체 운동 시작 여부
  const [isSetIntermission, setIsSetIntermission] = useState(false); // 세트 사이 대기 상태 플래그
  const [currentSet, setCurrentSet] = useState(1); // 1~3 세트
  const [timeLeft, setTimeLeft] = useState(5); // 세트당 5초
  const [isEyeClosed, setIsEyeClosed] = useState(true); // 현재 눈을 감았는지 여부
  const [isModelLoaded, setIsModelLoaded] = useState(false); // 미디어파이프 로딩 상태

  const TOTAL_SETS = 3;

  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const requestRef = useRef(null);


  const completeExercise = async () => {
    const payload = {
      userId: "6a171e97e513581fb9f3b6bf",
      type: "BLINK",
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
      console.log('눈 꼭 감기 운동 기록 저장 성공');
    } catch (error) {
      console.error('눈 꼭 감기 운동 기록 저장 실패:', error);
    } finally {
      navigate('/exercisecomplete');
    }
  };

  // --- EAR 계산 함수 ---
  const calculateEAR = (landmarks, eye) => {
    const p = [
      landmarks[eye.p1], landmarks[eye.p2], landmarks[eye.p3],
      landmarks[eye.p4], landmarks[eye.p5], landmarks[eye.p6]
    ];
    const v1 = Math.hypot(p[1].x - p[5].x, p[1].y - p[5].y);
    const v2 = Math.hypot(p[2].x - p[4].x, p[2].y - p[4].y);
    const h = Math.hypot(p[0].x - p[3].x, p[0].y - p[3].y);
    return (v1 + v2) / (2.0 * h);
  };

  // 1. 페이지 진입 시 MediaPipe 모델 초기화
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1
        });
        console.log("✅ MediaPipe 로드 완료");
        setIsModelLoaded(true);
      } catch (error) {
        console.error("MediaPipe 초기화 실패:", error);
      }
    };
    initMediaPipe();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  
  useEffect(() => {
    let stream = null;

    const predict = () => {
      if (landmarkerRef.current && videoRef.current && isStarted && !isSetIntermission) {
        const startTimeMs = performance.now();
        const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          const leftEAR = calculateEAR(landmarks, LEFT_EYE);
          const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
          const avgEAR = (leftEAR + rightEAR) / 2;

          if (avgEAR < 0.2) {
            setIsEyeClosed(true);
          } else {
            setIsEyeClosed(false);
          }
        }
        requestRef.current = requestAnimationFrame(predict);
      }
    };

    const startCamera = async () => {
      if (isStarted && !isSetIntermission) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => predict();
          }
        } catch (err) {
          console.error("웹캠 스트림 확보 실패:", err);
        }
      }
    };

    const stopCamera = () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    if (isStarted && !isSetIntermission) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isStarted, isSetIntermission]);


  // 타이머 로직 
  useEffect(() => {
    if (!isStarted || isSetIntermission) return;

    let timer = null;

    if (isEyeClosed && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } 
    else if (timeLeft === 0) {
      if (currentSet < TOTAL_SETS) {
        setIsSetIntermission(true);
      } else {
        completeExercise();
      }
    }

    return () => clearInterval(timer);
  }, [isStarted, isSetIntermission, isEyeClosed, timeLeft, currentSet]);

  // 다음 세트 시작 처리 함수
  const handleNextSetStart = () => {
    setCurrentSet((prev) => prev + 1);
    setTimeLeft(5); 
    setIsEyeClosed(true); 
    setIsSetIntermission(false); 
  };


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

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ display: 'none' }}
      />

      <ExerciseArea>
        <InstructionSection>
          <Title>눈 꼭 감기</Title>
          <SubTitle>
            눈을 꼭 감고 5초 동안 유지하세요.<br />
            <span>* '눈 감기 시작' 버튼을 누르면 웹캠과 연결되어 실제로 눈을 감고 있는지 확인합니다.</span>
          </SubTitle>
        </InstructionSection>

        <CenterContent>
          {!isStarted ? (
            <StartButton 
              disabled={!isModelLoaded} 
              onClick={() => setIsStarted(true)}
            >
              {isModelLoaded ? "눈 감기 시작" : "준비 중..."}
            </StartButton>
          ) : isSetIntermission ? (
            <>
              <CompletedText>{currentSet}세트 완료!</CompletedText>
              <StartButton onClick={handleNextSetStart}>
                다음 세트 시작하기
              </StartButton>
            </>
          ) : (
            <>
              <CountText $error={!isEyeClosed}>
                {isEyeClosed ? timeLeft : "!"}
              </CountText>
              
              <StatusMessage $error={!isEyeClosed}>
                {isEyeClosed ? "눈을 꼭 감고 있으세요" : "⚠️ 눈을 감아주세요! 운동이 일시정지 되었습니다."}
              </StatusMessage>
            </>
          )}
        </CenterContent>

        <ProgressSection>
          <ProgressInfo>
            <span>{currentSet}세트</span>
            <span>{TOTAL_SETS}세트</span>
          </ProgressInfo>
          <ProgressBarContainer>
            <ProgressBarInner progress={((currentSet - 1 + (5 - timeLeft) / 5) / TOTAL_SETS) * 100} />
          </ProgressBarContainer>
        </ProgressSection>
      </ExerciseArea>
    </Container>
  );
};

// --- 스타일 컴포넌트 정의 ---
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
  line-height: 1.6;
  span {
    font-size: 0.95rem;
    color: #7B86FF;
    font-weight: 500;
  }
`;

const CenterContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  gap: 24px;
`;

const StartButton = styled.button`
  background-color: #7B86FF;
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background-color: #626ee6;
  }
  &:disabled {
    background-color: #555875;
    cursor: not-allowed;
  }
`;

const CompletedText = styled.div`
  font-size: 3rem;
  font-weight: 800;
  color: #7B86FF;
  margin-bottom: 10px;
  animation: fadeIn 0.5s ease-in-out;
`;

// DOM 경고를 없애기 위해 transient prop $error 적용
const CountText = styled.div`
  font-size: 10rem;
  font-weight: 900;
  color: ${props => props.$error ? '#FF5252' : '#7B86FF'};
  line-height: 1;
  transition: color 0.3s;
`;

const StatusMessage = styled.p`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => props.$error ? '#FF5252' : 'white'};
  text-align: center;
  transition: color 0.3s;
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
  transition: width 0.3s linear;
`;

export default Mode3Page;