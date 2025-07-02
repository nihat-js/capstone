import styled from 'styled-components'

const StatusContainer = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;

  ${props => props.status === 'running' && `
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  `}

  ${props => props.status === 'stopped' && `
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
  `}

  ${props => props.status === 'error' && `
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  `}
`;

const StatusDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  
  ${props => props.status === 'running' && `
    background: #10b981;
  `}

  ${props => props.status === 'stopped' && `
    background: #6b7280;
  `}

  ${props => props.status === 'error' && `
    background: #ef4444;
  `}
`;

export function StatusBadge({ status }) {
  const getStatusText = () => {
    switch (status) {
      case 'running': return 'Running';
      case 'stopped': return 'Stopped';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <StatusContainer status={status}>
      <StatusDot status={status} />
      {getStatusText()}
    </StatusContainer>
  );
}
