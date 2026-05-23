import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const electron = window.require ? window.require('electron') : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

const DrowsinessPopup = () => {


  const handleClose = () => {
    if (ipcRenderer) { 
      ipcRenderer.send('close-drowsy-window'); 
    }
  };

  return (
    <Overlay>
      <CloseIcon onClick={handleClose}>&times;</CloseIcon>
      <Content>
        <WarningIcon>⚠️</WarningIcon>
        <Title>졸음 감지 경고!</Title>
        <Message>
          눈이 오랫동안 감겨 있습니다.<br />
          잠시 스트레칭을 하거나 휴식을 취하세요.
        </Message>
        <ConfirmButton onClick={handleClose}>확인했습니다</ConfirmButton>
      </Content>
    </Overlay>
  );
};

// 애니메이션: 경고 효과를 위한 깜박임
const blink = keyframes`
  0% { border-color: #FF4B4B; box-shadow: 0 0 10px #FF4B4B; }
  50% { border-color: #7B86FF; box-shadow: 0 0 20px #7B86FF; }
  100% { border-color: #FF4B4B; box-shadow: 0 0 10px #FF4B4B; }
`;

const Overlay = styled.div`
  width: 100vw;
  height: 100vh;
  background: #0C0F2F;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  position: relative;
  border: 5px solid #FF4B4B;
  box-sizing: border-box;
  animation: ${blink} 1.5s infinite;
`;

const CloseIcon = styled.div`
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 30px;
  font-weight: bold;
  color: #A0A0A0;
  cursor: pointer;
  &:hover { color: #FF4B4B; }
`;

const Content = styled.div`
  text-align: center;
`;

const WarningIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 10px #FF4B4B);
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #FF4B4B;
  margin-bottom: 15px;
  font-weight: 900;
`;

const Message = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 30px;
  opacity: 0.9;
`;

const ConfirmButton = styled.button`
  background: #FF4B4B;
  color: white;
  border: none;
  padding: 12px 40px;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover { transform: scale(1.05); background: #FF3333; }
`;

export default DrowsinessPopup;