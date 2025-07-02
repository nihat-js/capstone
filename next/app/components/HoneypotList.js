import styled from 'styled-components';


const ListContainer = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(30,41,59,0.04);
  padding: 38px 38px 32px 38px;
  margin-top: 18px;
  border: 1.5px solid #e5e7eb;
`;

const Title = styled.div`
  font-size: 1.18rem;
  font-weight: 800;
  margin-bottom: 18px;
  color: #1e293b;
  letter-spacing: 0.01em;
`;

const DeployButton = styled.button`
  background: linear-gradient(90deg, #2563eb 60%, #1e40af 100%);
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 12px 28px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 16px;
  margin-right: 16px;
  box-shadow: 0 2px 8px rgba(37,99,235,0.07);
  transition: background 0.2s;
  &:hover {
    background: linear-gradient(90deg, #1e40af 60%, #2563eb 100%);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #64748b;
  margin-top: 32px;
`;

const ActiveHoneypot = styled.div`
  margin: 18px 0;
  padding: 14px 18px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 1.04rem;
`;

const Status = styled.span`
  color: #22c55e;
  font-weight: 600;
  font-size: 1.01rem;
`;


export default function HoneypotList({ honeypots, onDeploy }) {
  return (
    <ListContainer>
      <Title>Deploy New Honeypot</Title>
      <div style={{marginBottom:24}}>
        <DeployButton onClick={() => onDeploy('api')}>Deploy API Honeypot</DeployButton>
        <DeployButton onClick={() => onDeploy('mysql')}>Deploy MySQL Honeypot</DeployButton>
        <DeployButton onClick={() => onDeploy('ssh')}>Deploy SSH Honeypot</DeployButton>
      </div>
      <Title style={{marginTop:32}}>Active Honeypots ({honeypots.length})</Title>
      {honeypots.length === 0 ? (
        <EmptyState>
          <div style={{fontSize:'2.5rem'}}>🍯</div>
          <div style={{fontWeight:700, marginTop:8, color:'#1e293b'}}>No Honeypots Yet</div>
          <div style={{marginTop:4}}>Deploy your first honeypot to get started</div>
        </EmptyState>
      ) : (
        honeypots.map(h => (
          <ActiveHoneypot key={h.id}>
            <b style={{color:'#2563eb'}}>{h.type.toUpperCase()}</b> on port <b>{h.port}</b> <Status>{h.status}</Status>
          </ActiveHoneypot>
        ))
      )}
    </ListContainer>
  );
}
