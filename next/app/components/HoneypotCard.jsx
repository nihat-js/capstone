import React from 'react';
import styled from 'styled-components';

export function HoneypotCard({ 
  honeypot, 
  honeypotType, 
  onStart, 
  onStop, 
  onDelete, 
  onViewLogs, 
  onConfigure 
}) {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Remote Access':
        return '🔐';
      case 'Database':
        return '🗄️';
      case 'Web Application':
        return '🌐';
      case 'File Transfer':
        return '📁';
      case 'Network Device':
        return '🔌';
      default:
        return '🍯';
    }
  };

  return (
    <CardContainer>
      <CardContent>
        <CardHeader>
          <HoneypotInfo>
            <IconContainer>
              {honeypotType ? getCategoryIcon(honeypotType.category) : '🍯'}
            </IconContainer>
            <div>
              <HoneypotName>{honeypot.name}</HoneypotName>
              <HoneypotType>{honeypotType?.name || honeypot.type}</HoneypotType>
            </div>
          </HoneypotInfo>
          <StatusBadge status={honeypot.status}>
            <StatusDot status={honeypot.status} />
            {honeypot.status === 'running' ? 'Running' : 'Stopped'}
          </StatusBadge>
        </CardHeader>

        <CardDetails>
          <DetailRow>
            <span>Port:</span>
            <span>{honeypot.port}</span>
          </DetailRow>
          <DetailRow>
            <span>Created:</span>
            <span>{new Date(honeypot.created_at).toLocaleDateString()}</span>
          </DetailRow>
          {honeypot.last_activity && (
            <DetailRow>
              <span>Last Activity:</span>
              <span>{new Date(honeypot.last_activity).toLocaleDateString()}</span>
            </DetailRow>
          )}
        </CardDetails>

        {honeypotType?.features && (
          <FeaturesList>
            {honeypotType.features.slice(0, 3).map(feature => (
              <FeatureBadge key={feature}>
                {feature}
              </FeatureBadge>
            ))}
            {honeypotType.features.length > 3 && (
              <FeatureBadge variant="more">
                +{honeypotType.features.length - 3} more
              </FeatureBadge>
            )}
          </FeaturesList>
        )}

        <ActionButtons>
          <ButtonGroup>
            {honeypot.status === 'stopped' ? (
              <ActionButton variant="start" onClick={onStart}>
                ▶️ Start
              </ActionButton>
            ) : (
              <ActionButton variant="stop" onClick={onStop}>
                ⏹️ Stop
              </ActionButton>
            )}
            
            <ActionButton variant="logs" onClick={onViewLogs}>
              👁️ Logs
            </ActionButton>
          </ButtonGroup>

          <IconButtons>
            <IconButton onClick={onConfigure} title="Configure">
              ⚙️
            </IconButton>
            <IconButton onClick={onDelete} title="Delete" variant="danger">
              🗑️
            </IconButton>
          </IconButtons>
        </ActionButtons>
      </CardContent>
    </CardContainer>
  );
}

// Styled Components
const CardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const HoneypotInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconContainer = styled.div`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: #f3f4f6;
  border-radius: 8px;
`;

const HoneypotName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
`;

const HoneypotType = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  
  ${({ status }) => status === 'running' 
    ? `
      background: #dcfce7;
      color: #16a34a;
    `
    : `
      background: #f3f4f6;
      color: #6b7280;
    `
  }
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  ${({ status }) => status === 'running' 
    ? 'background: #16a34a;'
    : 'background: #6b7280;'
  }
`;

const CardDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  
  span:first-child {
    color: #6b7280;
    font-weight: 500;
  }
  
  span:last-child {
    color: #111827;
  }
`;

const FeaturesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const FeatureBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${({ variant }) => variant === 'more'
    ? `
      background: #f3f4f6;
      color: #6b7280;
    `
    : `
      background: #dbeafe;
      color: #2563eb;
    `
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ variant }) => {
    switch (variant) {
      case 'start':
        return `
          background: #16a34a;
          color: white;
          &:hover { background: #15803d; }
        `;
      case 'stop':
        return `
          background: #dc2626;
          color: white;
          &:hover { background: #b91c1c; }
        `;
      case 'logs':
        return `
          background: #2563eb;
          color: white;
          &:hover { background: #1d4ed8; }
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
          &:hover { background: #e5e7eb; }
        `;
    }
  }}
`;

const IconButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  padding: 0.5rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${({ variant }) => variant === 'danger' ? '#fee2e2' : '#f3f4f6'};
  }
`;
