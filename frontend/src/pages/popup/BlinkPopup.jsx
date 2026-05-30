import React from 'react';
import styled from 'styled-components';

const BlinkPopup = () => {
  // URL 쿼리 스트링에서전달된 실시간 bpm 값 파싱
  const params = new URLSearchParams(window.location.search);
  const bpm = params.get('bpm') || '14';

  return (
    <ToastContainer>
      <IconWrapper>👁️✨</IconWrapper>
      <TextSection>
        <Title>눈 깜빡임 부족 경고</Title>
        <Description>
          최근 1분간 깜빡임이 <b>{bpm}회</b>로 낮습니다. 의도적으로 눈을 자주 깜빡여주세요!
        </Description>
      </TextSection>
    </ToastContainer>
  );
};

// 모니터 최상단에 뜨므로 투명도와 고급스러운 백그라운드 블러 효과 적용
const ToastContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: rgba(12, 15, 47, 0.94);
  border: 2px solid #FF4B4B;
  border-radius: 0px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 14px;
  color: white;
  font-family: 'Pretendard', -apple-system, sans-serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  user-select: none; /* 텍스트 드래그 차단 */
`;

const IconWrapper = styled.div`
  font-size: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.div`
  font-size: 1.05rem;
  font-weight: 800;
  color: #FF4B4B;
  letter-spacing: -0.3px;
`;

const Description = styled.div`
  font-size: 0.82rem;
  color: #E0E0E0;
  line-height: 1.4;
  letter-spacing: -0.2px;
  b {
    color: #FFFFFF;
    font-weight: 700;
  }
`;

export default BlinkPopup;