import styled from 'styled-components';


const HeaderBar = styled.div`
  height: 64px;
  background: #fff;
  border-bottom: 1.5px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 38px;
`;

const Title = styled.div`
  font-size: 1.32rem;
  font-weight: 800;
  color: #1e293b;
`;

const SubTitle = styled.span`
  font-weight: 400;
  font-size: 1.01rem;
  color: #64748b;
  margin-left: 8px;
`;

const Status = styled.div`
  color: #22c55e;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export default function DashboardHeader() {
  return (
    <HeaderBar>
      <Title>
        Honeywall Control<SubTitle>Honeypot Management System</SubTitle>
      </Title>
      <Status>
        <span style={{width:10, height:10, borderRadius:'50%', background:'#22c55e', display:'inline-block'}}></span>
        Connected
      </Status>
    </HeaderBar>
  );
}
