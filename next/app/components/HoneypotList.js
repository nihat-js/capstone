import styled from 'styled-components';


const ListContainer = styled.div`
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  box-shadow: 
    0 20px 40px -12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.8);
  padding: 48px;
  margin-top: 32px;
  border: 2px solid rgba(99, 102, 241, 0.1);
`;

const Title = styled.div`
  font-size: 1.5rem;
  font-weight: 900;
  margin-bottom: 32px;
  color: #0f172a;
  letter-spacing: -0.5px;
`;

const DeploySection = styled.div`
  margin-bottom: 48px;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const DeployCard = styled.div`
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 32px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  ${props => {
    if (props.type === 'api') return `
      border-color: rgba(59, 130, 246, 0.2);
      &:hover {
        border-color: #3b82f6;
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.3);
      }
    `;
    if (props.type === 'mysql') return `
      border-color: rgba(245, 158, 11, 0.2);
      &:hover {
        border-color: #f59e0b;
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.3);
      }
    `;
    if (props.type === 'ssh') return `
      border-color: rgba(16, 185, 129, 0.2);
      &:hover {
        border-color: #10b981;
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.3);
      }
    `;
  }}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      if (props.type === 'api') return 'linear-gradient(90deg, #3b82f6, #1d4ed8)';
      if (props.type === 'mysql') return 'linear-gradient(90deg, #f59e0b, #d97706)';
      if (props.type === 'ssh') return 'linear-gradient(90deg, #10b981, #059669)';
    }};
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover::before {
    transform: scaleX(1);
  }
`;

const CardIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 28px;
  background: ${props => {
    if (props.type === 'api') return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    if (props.type === 'mysql') return 'linear-gradient(135deg, #f59e0b, #d97706)';
    if (props.type === 'ssh') return 'linear-gradient(135deg, #10b981, #059669)';
  }};
  color: white;
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.3);
`;

const CardTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 12px 0;
  color: #0f172a;
  letter-spacing: -0.3px;
`;

const CardDescription = styled.p`
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 20px 0;
  font-weight: 500;
`;

const CardFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
`;

const Feature = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 0.9rem;
  margin-bottom: 8px;
  font-weight: 500;
  
  &::before {
    content: '✓';
    color: ${props => {
      if (props.type === 'api') return '#3b82f6';
      if (props.type === 'mysql') return '#f59e0b';
      if (props.type === 'ssh') return '#10b981';
    }};
    font-weight: 700;
    font-size: 1rem;
  }
`;

const DeployButton = styled.button`
  width: 100%;
  background: ${props => {
    if (props.type === 'api') return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    if (props.type === 'mysql') return 'linear-gradient(135deg, #f59e0b, #d97706)';
    if (props.type === 'ssh') return 'linear-gradient(135deg, #10b981, #059669)';
  }};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px -8px rgba(0, 0, 0, 0.3);
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
  margin: 18px 0;
  padding: 24px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  font-size: 1.04rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
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
    if (serviceName === 'api') return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    if (serviceName === 'mysql') return 'linear-gradient(135deg, #f59e0b, #d97706)';
    if (serviceName === 'ssh') return 'linear-gradient(135deg, #10b981, #059669)';
    if (serviceName === 'postgres') return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    if (serviceName === 'redis') return 'linear-gradient(135deg, #ef4444, #dc2626)';
    if (serviceName === 'phpmyadmin') return 'linear-gradient(135deg, #f97316, #ea580c)';
    return 'linear-gradient(135deg, #64748b, #475569)';
  }};
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  
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
    font-size: 1rem;
  }
`;

const ServiceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ServiceDetail = styled.div`
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  
  span {
    font-weight: 600;
    color: #475569;
  }
`;

const PortInfo = styled.div`
  font-weight: 600;
  color: #334155;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '🔌';
    font-size: 1rem;
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
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  
  ${props => props.status === 'running' ? `
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  ` : `
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
  `}
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
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
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
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
