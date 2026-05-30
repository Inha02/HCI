import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function KakaoCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async (token) => {
      try {
        const res = await fetch('http://localhost:5001/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!res.ok) {
          throw new Error(`서버 응답 에러 (상태코드: ${res.status})`);
        }

        const result = await res.json();
        console.log("📦 백엔드 수신 데이터:", result);

        if (result && result.success && result.data) {
          const userData = result.data;
          
          if (userData.name) {
            localStorage.setItem('userName', userData.name);
          }
          if (userData.email) {
            localStorage.setItem('userEmail', userData.email);
          }
          console.log("이름, 이메일 로컬스토리지 저장 완료!");
        }
      } catch (error) {
        console.error("❌ 유저 정보 로드 실패:", error);
        localStorage.setItem('userName', '카카오 회원');
      } finally {
        window.location.href = '/';
      }
    };

    try {
      const currentUrl = new URL(window.location.href);
      const token = currentUrl.searchParams.get('token');
      const error = currentUrl.searchParams.get('error');

      if (error) {
        alert(`로그인 실패: ${error}`);
        navigate('/login');
        return;
      }

      if (token) {

        localStorage.setItem('token', token);
        fetchUserInfo(token);
      } else {
        console.warn("❌ 주소창에 토큰이 확인되지 않습니다.");
        navigate('/login');
      }
    } catch (err) {
      console.error("토큰 파싱 중 크리티컬 에러:", err);
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div style={{ 
      color: 'white', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#0C0F2F',
      fontFamily: 'sans-serif'
    }}>
      <h2>카카오 로그인 완료 처리 중...</h2>
      <p style={{ color: '#7B86FF', fontSize: '14px', marginTop: '10px' }}>유저 정보를 동기화하고 있습니다.</p>
    </div>
  );
}

export default KakaoCallback;