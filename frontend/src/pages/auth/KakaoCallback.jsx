import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function KakaoCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token'); 

    if (token) {
     
      localStorage.setItem('token', token);
      
      navigate('/');
    } else {

      alert('카카오 로그인 실패');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      카카오 로그인 처리 중...
    </div>
  );
}

export default KakaoCallback;