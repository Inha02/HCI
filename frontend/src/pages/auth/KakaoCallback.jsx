import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function KakaoCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
     
      console.log("=========================================");
      console.log("🚨 [현재 브라우저 URL 전체]:", window.location.href);
      console.log("🚨 [현재 쿼리스트링 (? 뒷부분)]:", window.location.search);
      console.log("=========================================");


      const params = new URLSearchParams(window.location.search);
      
      const token = params.get('token');
      const accessToken = params.get('accessToken');
      const error = params.get('error');

      console.log("👉 추출된 token:", token);
      console.log("👉 추출된 accessToken:", accessToken);
      console.log("👉 추출된 error:", error);

      if (error) {
        console.error("❌ 백엔드에서 카카오 인증 중 에러를 보냈습니다:", error);
        alert(`로그인 실패 (서버 에러: ${error})`);
        navigate('/login');
        return;
      }

      const finalToken = token || accessToken;

      if (finalToken) {
        console.log("🟢 토큰 발견! 로그인을 성공적으로 마칩니다.");
        localStorage.setItem('token', finalToken);
        window.location.href = '/';
      } else {
        console.warn("주소창에 토큰이 존재하지 않습니다. 실패 처리합니다.");
        alert('카카오 로그인 실패: 서버로부터 토큰을 받지 못했습니다.');
        navigate('/login');
      }

    } catch (err) {
      console.error("KakaoCallback 컴포넌트 내부에서 크리티컬 에러 발생:", err);
      alert('로그인 처리 중 알 수 없는 오류가 발생했습니다.');
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
      backgroundColor: '#1a1a1a',
      fontFamily: 'sans-serif'
    }}>
      <h2 style={{ marginBottom: '10px' }}>카카오 로그인 처리 중...</h2>
      <p style={{ color: '#aaa', fontSize: '14px' }}>잠시만 기다려주세요.</p>
    </div>
  );
}

export default KakaoCallback;