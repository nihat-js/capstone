'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ArrowLeft, BarChart3, TrendingUp, Shield, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AnalysisPage() {
  const router = useRouter()
  const [analysisData, setAnalysisData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Load analysis data from API
    setLoading(false)
  }, [])

  const handleBack = () => {
    router.push('/')
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </BackButton>
        <HeaderTitle>
          <BarChart3 size={24} />
          Security Analysis
        </HeaderTitle>
      </Header>

      <Content>
        <StatsGrid>
          <StatCard>
            <StatIcon>
              <TrendingUp size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>1,234</StatValue>
              <StatLabel>Total Attacks</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon>
              <Shield size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>98.5%</StatValue>
              <StatLabel>Detection Rate</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon>
              <AlertTriangle size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>15</StatValue>
              <StatLabel>Critical Threats</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>

        <AnalysisSection>
          <SectionTitle>Attack Patterns & Insights</SectionTitle>
          <AnalysisContainer>
            <p>Advanced security analysis dashboard coming soon...</p>
            <p>This will include:</p>
            <ul>
              <li>Real-time attack visualization</li>
              <li>Threat intelligence integration</li>
              <li>Behavioral analysis</li>
              <li>Geographic attack mapping</li>
              <li>Automated threat reports</li>
            </ul>
          </AnalysisContainer>
        </AnalysisSection>
      </Content>
    </Container>
  )
}

// Styled Components
const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
    color: #111827;
  }
`;

const HeaderTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  padding: 1rem;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const AnalysisSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
`;

const AnalysisContainer = styled.div`
  padding: 2rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  color: #6b7280;

  ul {
    text-align: left;
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.5rem;
  }
`;
