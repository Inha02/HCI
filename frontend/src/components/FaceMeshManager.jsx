import React, { useEffect, useRef } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// 랜드마크 인덱스
const RIGHT_EYE = { p1: 33, p2: 160, p3: 158, p4: 133, p5: 153, p6: 144 };
const LEFT_EYE = { p1: 362, p2: 385, p3: 387, p4: 263, p5: 373, p6: 380 };

// Electron IPC
const electron = window.require ? window.require('electron') : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

// 리렌더링 방지용 외부 변수
let earBuffer = [];
let blinkCount = 0;
let isWasClosed = false;
let earBelowThresholdStartTime = null;
let maxEarBelowThresholdTime = 0;
let isDrowsyWindowOpen = false;

const DROWSY_THRESHOLD_TIME = 1500;

const FaceMeshManager = ({ isActive, onDrowsyDetected }) => {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const requestRef = useRef(null);

  const calculateEAR = (landmarks, eye) => {
    const p = [
      landmarks[eye.p1], landmarks[eye.p2], landmarks[eye.p3],
      landmarks[eye.p4], landmarks[eye.p5], landmarks[eye.p6],
    ];

    const v1 = Math.hypot(p[1].x - p[5].x, p[1].y - p[5].y);
    const v2 = Math.hypot(p[2].x - p[4].x, p[2].y - p[4].y);
    const h = Math.hypot(p[0].x - p[3].x, p[0].y - p[3].y);

    return (v1 + v2) / (2.0 * h);
  };

  // MediaPipe 초기화
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks('/wasm');

        landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
        });

        console.log('✅ MediaPipe Face Landmarker 로드 완료');
      } catch (err) {
        console.error('❌ MediaPipe 초기화 실패:', err);
      }
    };

    initMediaPipe();
  }, []);

  // 2초 주기 데이터 전송
  useEffect(() => {
    if (!isActive) return;

    const logAndCheckDrowsy = async () => {
      if (earBuffer.length === 0) return;

      const avg = earBuffer.reduce((a, b) => a + b, 0) / earBuffer.length;
      const isDrowsyNow = maxEarBelowThresholdTime >= DROWSY_THRESHOLD_TIME;

      // 🔐 로컬스토리지에서 인증 토큰 꺼내오기 (대소문자 둘 다 체크)
      const token = localStorage.getItem('token') || localStorage.getItem('token');

      // 💡 [데이터타입 매칭] 백엔드가 요구하는 완벽한 폼 구성
      const payload = {
        userId: "6a171e97e513581fb9f3b6bf", 
        sessionId: "session-1", 
        windowDuration: 2,
        ear: {
          avg: Number(avg.toFixed(4)),
          min: Number(Math.min(...earBuffer).toFixed(4)),
          max: Number(Math.max(...earBuffer).toFixed(4)),
        },
        blink: {
          count: blinkCount,
        },
        drowsiness: {
          // 초 단위(데이터타입 예시의 0.8 참고)로 변환하기 위해 밀리초를 1000으로 나눔
          earBelowThresholdTime: Number((maxEarBelowThresholdTime / 1000).toFixed(1)),
          isDrowsy: isDrowsyNow,
        }
      };

      console.log('%c2초 요약 데이터 전송 시도', 'color: #7B86FF; font-weight: bold;');
      console.table(payload);

      // 서버 전송
      try {
        const response = await fetch('http://localhost:5001/api/eye/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 만약 백엔드 라우터에 토큰 인증(verifyToken 등)이 걸려있다면 아래 주석을 풀어주세요.
            // 'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP 오류: ${response.status}`);
        }

        const data = await response.json().catch(() => null);

        console.log(
          '%c서버 전송 성공',
          'color: #00C853; font-weight: bold; font-size: 14px;'
        );
        console.log('서버 응답:', data);
      } catch (err) {
        console.error('전송 실패:', err);
      }

      // 졸음 감지 트리거
      if (isDrowsyNow && !isDrowsyWindowOpen) {
        if (onDrowsyDetected) {
          onDrowsyDetected();
        } else if (ipcRenderer) {
          ipcRenderer.send('open-drowsy-window');
        }
        isDrowsyWindowOpen = true;
      }

      // 버퍼 초기화
      earBuffer = [];
      blinkCount = 0;
      maxEarBelowThresholdTime = 0;
    };

    const intervalId = setInterval(logAndCheckDrowsy, 2000);
    return () => clearInterval(intervalId);
  }, [isActive, onDrowsyDetected]);

  // 팝업 닫힘 이벤트
  useEffect(() => {
    if (!ipcRenderer) return;

    ipcRenderer.on('drowsy-window-closed', () => {
      isDrowsyWindowOpen = false;
    });

    return () => {
      ipcRenderer.removeAllListeners('drowsy-window-closed');
    };
  }, []);

  // 실시간 웹캠 분석
  useEffect(() => {
    let stream = null;

    const predict = () => {
      if (!landmarkerRef.current || !videoRef.current || !isActive) return;

      const results = landmarkerRef.current.detectForVideo(
        videoRef.current,
        performance.now()
      );

      if (results.faceLandmarks?.length > 0) {
        const landmarks = results.faceLandmarks[0];
        const leftEAR = calculateEAR(landmarks, LEFT_EYE);
        const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
        const avgEAR = (leftEAR + rightEAR) / 2;

        earBuffer.push(avgEAR);

        if (avgEAR < 0.2) {
          if (!isWasClosed) {
            earBelowThresholdStartTime = performance.now();
            blinkCount++;
            isWasClosed = true;
            console.log('%c✨ Blink!', 'color: #FF7B7B; font-weight: bold;');
          } else {
            const duration = performance.now() - earBelowThresholdStartTime;
            if (duration > maxEarBelowThresholdTime) {
              maxEarBelowThresholdTime = duration;
            }
            if (duration > DROWSY_THRESHOLD_TIME) {
              console.warn('⚠️ 졸음 감지 중...');
            }
          }
        } else {
          isWasClosed = false;
          earBelowThresholdStartTime = null;
        }
      }

      requestRef.current = requestAnimationFrame(predict);
    };

    const startCamera = async () => {
      if (!isActive) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => predict();
        }
      } catch (err) {
        console.error('❌ 웹캠 연결 실패:', err);
      }
    };

    const stopCamera = () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current) videoRef.current.srcObject = null;
    };

    startCamera();
    return () => stopCamera();
  }, [isActive]);

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {isActive && (
        <div style={{ textAlign: 'center' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '240px',
              borderRadius: '12px',
              border: '3px solid #7B86FF',
              transform: 'scaleX(-1)',
              background: '#000',
            }}
          />
          <p style={{ color: '#7B86FF', fontSize: '12px', marginTop: '5px' }}>
            👁️ 눈 깜박임 감지 중
          </p>
        </div>
      )}
    </div>
  );
};

export default FaceMeshManager;