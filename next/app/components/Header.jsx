import styled from 'styled-components'
import { Shield } from 'lucide-react'

const HeaderContainer = styled.header`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  margin-bottom: 2rem;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const BrandIcon = styled.div`
  width: 32px;
  height: 32px;
  background: #3b82f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const BrandText = styled.div``;

const BrandTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
`;

const BrandSubtitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  
  ${props => props.status === 'connected' && `
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  `}
  
  ${props => props.status === 'disconnected' && `
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  `}
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  ${props => props.status === 'connected' && `
    background: #10b981;
  `}
  
  ${props => props.status === 'disconnected' && `
    background: #ef4444;
  `}
`;

export function Header({ isConnected = true }) {
  return (
    <HeaderContainer>
      <HeaderContent>
        <Brand>
          <BrandIcon>
            <Shield size={20} />
          </BrandIcon>
          <BrandText>
            <BrandTitle>HoneyNet Control</BrandTitle>
            <BrandSubtitle>Honeypot Management System</BrandSubtitle>
          </BrandText>
        </Brand>
        
        <StatusIndicator status={isConnected ? 'connected' : 'disconnected'}>
          <StatusDot status={isConnected ? 'connected' : 'disconnected'} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </StatusIndicator>
      </HeaderContent>
    </HeaderContainer>
  );
}
