"use client"

import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import StatsCards from './components/StatsCards';
import HoneypotList from './components/HoneypotList';
import ConfigModal from './components/ConfigModal';

const GlobalStyle = createGlobalStyle`
  body {
    background: #f7f9fb;
    font-family: 'Inter', Arial, sans-serif;
  }
`;

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Main = styled.div`
  flex: 1;
  background: #f7f9fb;
  min-height: 100vh;
`;

const Content = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 0 24px;
`;

export default function Home() {
  const [selected, setSelected] = useState('dashboard');
  const [modal, setModal] = useState(null); // 'api' | 'mysql' | 'ssh' | null
  const [honeypots, setHoneypots] = useState([]); // [{id, type, port, status}]
  const [stats, setStats] = useState({ total: 0, running: 0, threats: 0, blocked: 0 });

  // Fetch honeypots and stats from Flask API
  React.useEffect(() => {
    fetch('/services/status')
      .then(r => r.json())
      .then(data => {
        setHoneypots(data.services || []);
        setStats({
          total: data.total || 0,
          running: data.running || 0,
          threats: 51, // TODO: fetch real
          blocked: 64, // TODO: fetch real
        });
      });
  }, [modal]);

  // Deploy handler
  const handleDeploy = (type) => {
    setModal(type);
  };

  // Submit config to Flask API
  const handleSubmitConfig = async (config) => {
    let payload = { config: { ...config, name: modal } };
    // For SSH users, parse JSON
    if (modal === 'ssh' && typeof config.users === 'string') {
      try {
        payload.config.users = JSON.parse(config.users);
      } catch {
        alert('Users must be a valid JSON array');
        return;
      }
    }
    const res = await fetch('/services/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setModal(null);
      // Optionally, refresh honeypots
      fetch('/services/status')
        .then(r => r.json())
        .then(data => setHoneypots(data.services || []));
    } else {
      alert('Failed to deploy honeypot');
    }
  };

  return (
    <>
      <GlobalStyle />
      <Layout>
        <Sidebar onSelect={setSelected} selected={selected} />
        <Main>
          <DashboardHeader />
          <Content>
            {selected === 'dashboard' && (
              <>
                <StatsCards stats={stats} />
                <HoneypotList honeypots={honeypots} onDeploy={handleDeploy} />
              </>
            )}
            {/* TODO: Add log/analysis/notification pages */}
          </Content>
        </Main>
        <ConfigModal
          type={modal}
          open={!!modal}
          onClose={() => setModal(null)}
          onSubmit={handleSubmitConfig}
        />
      </Layout>
    </>
  );
}
