'use client';

import { useState } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';

export default function LogsLayout({ children }) {
  const [selected, setSelected] = useState('logs');

  return (
    <Container>
      <Sidebar onSelect={setSelected} selected={selected} />
      <MainContent>
        {children}
      </MainContent>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: #f8fafc;
`;

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;
