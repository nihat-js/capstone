import styled from 'styled-components';

const CardsRow = styled.div`
  display: flex;
  gap: 24px;
  margin: 32px 0 24px 0;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  padding: 24px 32px;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const CardTitle = styled.div`
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 8px;
`;

const CardValue = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: #222;
`;

const CardIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 8px;
`;

export default function StatsCards({ stats }) {
  // stats: { total, running, threats, blocked }
  return (
    <CardsRow>
      <Card>
        <CardIcon>🟦</CardIcon>
        <CardTitle>Total Honeypots</CardTitle>
        <CardValue>{stats.total}</CardValue>
      </Card>
      <Card>
        <CardIcon>✅</CardIcon>
        <CardTitle>Running</CardTitle>
        <CardValue>{stats.running}</CardValue>
      </Card>
      <Card>
        <CardIcon>⚠️</CardIcon>
        <CardTitle>Threats Today</CardTitle>
        <CardValue>{stats.threats}</CardValue>
      </Card>
      <Card>
        <CardIcon>⛔</CardIcon>
        <CardTitle>Attacks Blocked</CardTitle>
        <CardValue>{stats.blocked}</CardValue>
      </Card>
    </CardsRow>
  );
}
