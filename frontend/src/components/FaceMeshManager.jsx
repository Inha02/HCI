import React, { useEffect, useRef } from 'react';

const FaceMeshManager = ({ isActive }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      if (isActive) {
        try {
          // 웹캠 스트림만 
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("웹캠 접근 실패:", err);
          alert("카메라를 찾을 수 없거나 권한이 거부되었습니다.");
        }
      } else {
        stopCamera();
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
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
              transform: 'scaleX(-1)', // 셀카 모드 반전
              background: '#000'
            }}
          />
          <p style={{ color: '#7B86FF', fontSize: '12px', marginTop: '5px' }}>웹캠 연결 확인됨</p>
        </div>
      )}
    </div>
  );
};

export default FaceMeshManager;