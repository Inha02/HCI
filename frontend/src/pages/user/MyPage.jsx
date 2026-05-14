import React from 'react';
import styled from 'styled-components';

const MyPage = () => {
  return (
    <Container>
        <p>마이페이지</p>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  background-color: #0C0F2F;
  color:#D5D5D5;
  font-family: 'Pretendard', sans-serif;
`;

export default MyPage;