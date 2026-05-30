import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const electron = window.require ? window.require('electron') : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

const MyPage = () => {
  const navigate = useNavigate();

 
  const [userInfo, setUserInfo] = useState({
    nickname: '카카오 회원',
    email: '이메일 정보 없음',
  });

 
  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    const savedEmail = localStorage.getItem('userEmail');

    setUserInfo({
      nickname: savedName || '카카오 회원',
      email: savedEmail || '이메일 정보 없음',
    });
  }, []);


  const [settings, setSettings] = useState({
    drowsyPopup: JSON.parse(localStorage.getItem('drowsyPopup')) ?? true,
    drowsySound: JSON.parse(localStorage.getItem('drowsySound')) ?? true,
    blinkAlert: JSON.parse(localStorage.getItem('blinkAlert')) ?? true,
    timer202020: JSON.parse(localStorage.getItem('timer202020')) ?? true,
  });

  const handleToggle = (key) => {
    const newValue = !settings[key];
    const newSettings = { ...settings, [key]: newValue };
    
    setSettings(newSettings);
    
    localStorage.setItem(key, JSON.stringify(newValue));

    if (ipcRenderer) {
      ipcRenderer.send('update-notification-setting', { key, value: newValue });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    if (electron && electron.remote) {
      electron.remote.session.defaultSession.clearStorageData();
    }

    window.location.href = '/login';
  };

  return (
    <Container>
      <Wrapper>
        {/* 상단 사용자 정보 섹션 */}
        <UserInfoSection>
          <UserTextGroup>
            {/* 🎯 동적으로 세팅된 카카오 닉네임 표출 */}
            <Nickname>{userInfo.nickname} 님</Nickname>
          </UserTextGroup>
          <UserActionGroup>
            {/* 🚪 로그아웃 버튼 */}
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
            <EditButton onClick={() => navigate('/editinfo')}>수정하기</EditButton>
          </UserActionGroup>
        </UserInfoSection>

        <Divider />

        {/* 하단 알림 설정 섹션 */}
        <SettingsSection>
          <SectionTitle>알림 설정</SectionTitle>
          
          {/* 졸음 경고 팝업 설정 */}
          <SettingItem>
            <SettingText>
              <ItemTitle>졸음 경고 팝업창</ItemTitle>
              <ItemDesc>눈 감김 감지 시 화면에 경고 팝업창을 표시합니다.</ItemDesc>
            </SettingText>
            <ToggleButton 
              active={settings.drowsyPopup} 
              onClick={() => handleToggle('drowsyPopup')}
            />
          </SettingItem>

          {/* 졸음 경고 알림음 설정 */}
          <SettingItem>
            <SettingText>
              <ItemTitle>졸음 경고 알림음</ItemTitle>
              <ItemDesc>눈 감김 감지 시 경고 효과음을 재생합니다.</ItemDesc>
            </SettingText>
            <ToggleButton 
              active={settings.drowsySound} 
              onClick={() => handleToggle('drowsySound')}
            />
          </SettingItem>

          <SettingItem>
            <SettingText>
              <ItemTitle>깜빡임 부족 알림</ItemTitle>
              <ItemDesc>BPM 10 이하 30초 지속 시 알람</ItemDesc>
            </SettingText>
            <ToggleButton 
              active={settings.blinkAlert} 
              onClick={() => handleToggle('blinkAlert')}
            />
          </SettingItem>

          <SettingItem>
            <SettingText>
              <ItemTitle>20-20-20 타이머 팝업</ItemTitle>
              <ItemDesc>20분 간격 휴식 타이머 팝업 활성화</ItemDesc>
            </SettingText>
            <ToggleButton 
              active={settings.timer202020} 
              onClick={() => handleToggle('timer202020')}
            />
          </SettingItem>
        </SettingsSection>
      </Wrapper>
    </Container>
  );
};

// --- 스타일 컴포넌트 ---
const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 100px);
  background-color: #0C0F2F;
  color: #D5D5D5;
  display: flex;
  justify-content: center;
  padding: 60px 0;
`;
const Wrapper = styled.div` width: 85%; max-width: 1200px; `;
const UserInfoSection = styled.div` display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; `;
const UserTextGroup = styled.div``;
const Nickname = styled.h1` font-size: 2.8rem; color: white; margin-bottom: 10px; font-weight: 700; `;
const Email = styled.p` font-size: 1.2rem; color: #A0A0A0; `;
const UserActionGroup = styled.div` display: flex; align-items: center; gap: 15px; `;

const LogoutButton = styled.button`
  background-color: rgba(255, 99, 99, 0.15);
  color: #FF6363;
  border: 1px solid rgba(255, 99, 99, 0.4);
  padding: 10px 25px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background-color: #FF6363;
    color: white;
    border-color: #FF6363;
  }
`;

const EditButton = styled.button` background-color: #7B86FF; color: white; border: none; padding: 10px 25px; border-radius: 20px; font-weight: 600; cursor: pointer; font-size: 1rem; &:hover { background-color: #626ee6; } `;
const Divider = styled.div` width: 100%; height: 1px; background-color: rgba(213, 213, 213, 0.2); margin-bottom: 50px; `;
const SettingsSection = styled.div``;
const SectionTitle = styled.h2` font-size: 1.6rem; color: white; margin-bottom: 40px; font-weight: 600; `;
const SettingItem = styled.div` display: flex; justify-content: space-between; align-items: center; background-color: rgba(255, 255, 255, 0.03); padding: 25px 35px; border-radius: 15px; margin-bottom: 20px; `;
const SettingText = styled.div``;
const ItemTitle = styled.h3` font-size: 1.3rem; color: white; margin-bottom: 8px; `;
const ItemDesc = styled.p` font-size: 0.95rem; color: #808080; `;
const ToggleButton = styled.div`
  width: 60px;
  height: 30px;
  background-color: ${props => props.active ? '#7B86FF' : '#333959'};
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: ${props => props.active ? '33px' : '3px'};
    width: 24px;
    height: 24px;
    background-color: white;
    border-radius: 50%;
    transition: all 0.3s;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
`;

export default MyPage;