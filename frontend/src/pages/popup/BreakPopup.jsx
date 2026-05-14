import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Electron 통신 설정
const electron = window.require ? window.require('electron') : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

const BreakPopup = () => {
  const [count, setCount] = useState(20);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 닫기 버튼 핸들러
  const handleClose = () => {
    if (ipcRenderer) {
      ipcRenderer.send('close-rest-window');
    }
  };

  return (
    <Overlay>
      {/* 오른쪽 상단 X 버튼 */}
      <CloseIcon onClick={handleClose}>&times;</CloseIcon>
      
      <Content>
        <Emoji>👀</Emoji>
        <Title>눈 휴식 시간</Title>
        <Timer>{count}s</Timer>
        <Message>20초 동안 먼 곳을 바라보세요!</Message>
      </Content>
    </Overlay>
  );
};

// --- 스타일 컴포넌트 ---

const Overlay = styled.div`
  width: 100vw;
  height: 100vh;
  background: #161B40; /* 배경색을 약간 더 밝게 조정 */
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  position: relative; /* 버튼 위치 조절용 */
  border: 2px solid #7B86FF; /* 테두리 추가로 팝업 느낌 강조 */
  box-sizing: border-box;
`;

const CloseIcon = styled.div`
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 30px;
  font-weight: bold;
  color: #A0A0A0;
  cursor: pointer;
  line-height: 1;
  
  &:hover {
    color: #7B86FF;
  }
`;

const Content = styled.div`
  text-align: center;
`;

const Emoji = styled.div` font-size: 3rem; margin-bottom: 10px; `;
const Title = styled.h1` font-size: 1.8rem; color: #7B86FF; margin-bottom: 5px; `;
const Timer = styled.div` font-size: 5rem; font-weight: 900; margin-bottom: 10px; `;
const Message = styled.p` font-size: 1.1rem; opacity: 0.8; padding: 0 20px; `;

export default BreakPopup;