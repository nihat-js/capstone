import styled from 'styled-components';


const ListContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-top: 24px;
  border: 1px solid #e5e7eb;
`;

const Title = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #111827;
  letter-spacing: -0.025em;
`;

const DeploySection = styled.div`
  margin-bottom: 32px;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const DeployCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    border-color: ${props => {
      if (props.type === 'api') return '#3b82f6';
      if (props.type === 'mysql') return '#f59e0b';
      if (props.type === 'ssh') return '#10b981';
    }};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 20px;
  background: ${props => {
    if (props.type === 'api') return '#3b82f6';
    if (props.type === 'mysql') return '#f59e0b';
    if (props.type === 'ssh') return '#10b981';
  }};
  color: white;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #111827;
`;

const CardDescription = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0 0 16px 0;
`;

const CardFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
`;

const Feature = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.8rem;
  margin-bottom: 6px;
  
  &::before {
    content: '✓';
    color: ${props => {
      if (props.type === 'api') return '#3b82f6';
      if (props.type === 'mysql') return '#f59e0b';
      if (props.type === 'ssh') return '#10b981';
    }};
    font-weight: 600;
    font-size: 0.75rem;
  }
`;

const DeployButton = styled.button`
  width: 100%;
  background: ${props => {
    if (props.type === 'api') return '#3b82f6';
    if (props.type === 'mysql') return '#f59e0b';
    if (props.type === 'ssh') return '#10b981';
  }};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #64748b;
  margin-top: 32px;
`;

const ActiveHoneypot = styled.div`
  margin: 12px 0;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
  
  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const HoneypotInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HoneypotType = styled.div`
  background: ${props => {
    const serviceName = props.service?.toLowerCase();
    if (serviceName === 'api') return '#3b82f6';
    if (serviceName === 'mysql') return '#f59e0b';
    if (serviceName === 'ssh') return '#10b981';
    if (serviceName === 'postgres') return '#8b5cf6';
    if (serviceName === 'redis') return '#ef4444';
    if (serviceName === 'phpmyadmin') return '#f97316';
    return '#6b7280';
  }};
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.75rem;
  letter-spacing: 0.025em;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '${props => {
      const serviceName = props.service?.toLowerCase();
      if (serviceName === 'api') return '💳';
      if (serviceName === 'mysql') return '🗄️';
      if (serviceName === 'ssh') return '🔐';
      if (serviceName === 'postgres') return '🐘';
      if (serviceName === 'redis') return '📦';
      if (serviceName === 'phpmyadmin') return '🔧';
      return '⚙️';
    }}';
    font-size: 0.875rem;
  }
`;

const ServiceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ServiceDetail = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 400;
  
  span {
    font-weight: 500;
    color: #374151;
  }
`;

const PortInfo = styled.div`
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: '🔌';
    font-size: 0.75rem;
  }
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.75rem;
  
  ${props => props.status === 'running' ? `
    background: #10b981;
    color: white;
  ` : `
    background: #ef4444;
    color: white;
  `}
`;

const StatusDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: ${props => props.status === 'running' ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #9ca3af;
    background: #f9fafb;
  }
`;


export default function HoneypotList({ honeypots, onDeploy }) {
  const honeypotCards = [
    {
      type: 'api',
      title: 'API Honeypot',
      description: 'Simulates a financial API service to capture unauthorized access attempts and data breaches.',
      icon: '💳',
      features: ['Database Endpoints', 'Authentication Logging', 'Request Monitoring', 'Real-time Alerts']
    },
    {
      type: 'mysql',
      title: 'MySQL Honeypot',
      description: 'Decoy MySQL database server that logs SQL injection attempts and database intrusions.',
      icon: '🗄️',
      features: ['SQL Injection Detection', 'Connection Logging', 'Query Analysis', 'Brute Force Detection']
    },
    {
      type: 'ssh',
      title: 'SSH Honeypot',
      description: 'Fake SSH server that captures login attempts, commands, and lateral movement activities.',
      icon: '🔐',
      features: ['Command Logging', 'Session Recording', 'Credential Harvesting', 'Behavioral Analysis']
    }
  ];

  return (
    <ListContainer>
      <DeploySection>
        <Title>Deploy New Honeypot</Title>
        <CardsGrid>
          {honeypotCards.map(card => (
            <DeployCard 
              key={card.type} 
              type={card.type} 
              onClick={() => onDeploy(card.type)}
            >
              <CardIcon type={card.type}>{card.icon}</CardIcon>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
              <CardFeatures>
                {card.features.map((feature, index) => (
                  <Feature key={index} type={card.type}>{feature}</Feature>
                ))}
              </CardFeatures>
              <DeployButton type={card.type}>
                Deploy {card.title}
              </DeployButton>
            </DeployCard>
          ))}
        </CardsGrid>
      </DeploySection>
      
      <Title>Active Honeypots ({honeypots.length})</Title>
      {honeypots.length === 0 ? (
        <EmptyState>
          <div style={{fontSize:'2.5rem'}}>🍯</div>
          <div style={{fontWeight:700, marginTop:8, color:'#1e293b'}}>No Honeypots Yet</div>
          <div style={{marginTop:4}}>Deploy your first honeypot to get started</div>
        </EmptyState>
      ) : (
        honeypots.map(h => (
          <ActiveHoneypot key={h.container_id || h.process_id || `${h.name}-${h.config?.port}`}>
            <HoneypotInfo>
              <HoneypotType service={h.name}>{h.name?.toUpperCase() || 'UNKNOWN'}</HoneypotType>
              <ServiceInfo>
                <PortInfo>Port {h.config?.port || 'N/A'}</PortInfo>
                <ServiceDetail>
                  <span>Type:</span> {h.type === 'docker' ? 'Docker Container' : 'Process'}
                </ServiceDetail>
                {h.type === 'docker' && h.container_id && (
                  <ServiceDetail>
                    <span>Container:</span> {h.container_id.slice(0, 12)}...
                  </ServiceDetail>
                )}
                {h.type === 'process' && h.process_id && (
                  <ServiceDetail>
                    <span>PID:</span> {h.process_id}
                  </ServiceDetail>
                )}
              </ServiceInfo>
            </HoneypotInfo>
            <StatusContainer>
              <Status status={h.status === 'running' ? 'running' : 'stopped'}>
                <StatusDot status={h.status === 'running' ? 'running' : 'stopped'} />
                {h.status === 'running' ? 'Running' : 'Stopped'}
              </Status>
              {h.status === 'running' && h.cpu_percent !== undefined && (
                <ServiceDetail style={{ fontSize: '0.8rem', margin: 0 }}>
                  <span>CPU:</span> {h.cpu_percent.toFixed(1)}%
                </ServiceDetail>
              )}
              {h.status === 'running' && h.memory_mb !== undefined && (
                <ServiceDetail style={{ fontSize: '0.8rem', margin: 0 }}>
                  <span>RAM:</span> {h.memory_mb}MB
                </ServiceDetail>
              )}
              <ActionButton>
                {h.status === 'running' ? 'Stop' : 'Start'}
              </ActionButton>
            </StatusContainer>
          </ActiveHoneypot>
        ))
      )}
    </ListContainer>
  );
}
