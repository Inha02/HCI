import React, { useEffect, useRef } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// 랜드마크 인덱스
const RIGHT_EYE = { p1: 33, p2: 160, p3: 158, p4: 133, p5: 153, p6: 144 };
const LEFT_EYE = { p1: 362, p2: 385, p3: 387, p4: 263, p5: 373, p6: 380 };

// Electron 통신 설정
const electron = window.require ? window.require('electron') : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

// 데이터 수집용 외부 변수 (리렌더링 방지)
let earBuffer = [];
let blinkCount = 0;
let isWasClosed = false; 

// 졸음 감지용 변수
let earBelowThresholdStartTime = null; 
let maxEarBelowThresholdTime = 0;      
let isDrowsyWindowOpen = false;        // 팝업 중복 방지
const DROWSY_THRESHOLD_TIME = 1500;    // 1.5초 기준

const FaceMeshManager = ({ isActive }) => {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const requestRef = useRef(null);

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

  // 1. MediaPipe 초기화
  useEffect(() => {
    const initMediaPipe = async () => {
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
      console.log("✅ MediaPipe Face Landmarker 로드 완료");
    };
    initMediaPipe();
  }, []);

  // 2. 2초 주기 데이터 요약 및 졸음 판단 (백엔드 전송 포맷)
  useEffect(() => {
    if (!isActive) return;

    const logAndCheckDrowsy = () => {
      if (earBuffer.length === 0) return;

      const avg = earBuffer.reduce((a, b) => a + b, 0) / earBuffer.length;
      const isDrowsyNow = maxEarBelowThresholdTime >= DROWSY_THRESHOLD_TIME;

      const payload = {
        userId: 'test',
        windowDuration: 2,
        ear: { 
            avg: Number(avg.toFixed(4)), 
            min: Number(Math.min(...earBuffer).toFixed(4)), 
            max: Number(Math.max(...earBuffer).toFixed(4)) 
        },
        blink: { count: blinkCount },
        drowsiness: {
          earBelowThresholdTime: Math.round(maxEarBelowThresholdTime),
          isDrowsy: isDrowsyNow,
        },
        timestamp: new Date().toLocaleTimeString()
      };

      console.log("%c📊 2초 요약 데이터", "color: #7B86FF; font-weight: bold;");
      console.table(payload); 

      // 졸음 팝업 트리거
      if (isDrowsyNow && !isDrowsyWindowOpen && ipcRenderer) {
        ipcRenderer.send('open-drowsy-window');
        isDrowsyWindowOpen = true;
      }

      // 버퍼 초기화
      earBuffer = [];
      blinkCount = 0;
      maxEarBelowThresholdTime = 0;
    };

    const intervalId = setInterval(logAndCheckDrowsy, 2000);
    return () => clearInterval(intervalId);
  }, [isActive]);

  // 3. 팝업 닫힘 이벤트 수신
  useEffect(() => {
    if (ipcRenderer) {
      ipcRenderer.on('drowsy-window-closed', () => {
        isDrowsyWindowOpen = false;
      });
    }
    return () => {
      if (ipcRenderer) ipcRenderer.removeAllListeners('drowsy-window-closed');
    };
  }, []);

  // 4. 실시간 웹캠 분석 루프
  useEffect(() => {
    let stream = null;

    const predict = () => {
      if (landmarkerRef.current && videoRef.current && isActive) {
        const startTimeMs = performance.now();
        const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          const leftEAR = calculateEAR(landmarks, LEFT_EYE);
          const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
          const avgEAR = (leftEAR + rightEAR) / 2;

          earBuffer.push(avgEAR);

          // 눈 깜박임 및 졸음(유지 시간) 판정
          if (avgEAR < 0.2) {
            if (!isWasClosed) {
              earBelowThresholdStartTime = performance.now();
              blinkCount++;
              isWasClosed = true;
              console.log("%c✨ Blink!", "color: #FF7B7B; font-weight: bold;");
            } else {
              // 감고 있는 시간 측정
              const duration = performance.now() - earBelowThresholdStartTime;
              if (duration > maxEarBelowThresholdTime) {
                maxEarBelowThresholdTime = duration;
              }
              // 1.5초 넘으면 실시간 경고
              if (duration > DROWSY_THRESHOLD_TIME) {
                console.warn("⚠️ 졸음 감지 중...");
              }
            }
          } else {
            isWasClosed = false;
            earBelowThresholdStartTime = null;
          }
        }
        requestRef.current = requestAnimationFrame(predict);
      }
    };

    const startCamera = async () => {
      if (isActive) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => predict();
          }
        } catch (err) {
          console.error("웹캠 연결 실패:", err);
        }
      } else {
        stopCamera();
      }
    };

    const stopCamera = () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    startCamera();
    return () => stopCamera();
  }, [isActive]);

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {isActive && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: '240px',
            borderRadius: '12px',
            border: '3px solid #7B86FF',
            transform: 'scaleX(-1)',
            background: '#000'
          }}
        />
      )}
    </div>
  );
};

export default FaceMeshManager;