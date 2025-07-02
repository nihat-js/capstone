import styled from 'styled-components'
import { Card } from './ui/Card'

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 0.75rem;
  
  ${props => props.color === 'blue' && `background: #3b82f6;`}
  ${props => props.color === 'green' && `background: #10b981;`}
  ${props => props.color === 'yellow' && `background: #f59e0b;`}
  ${props => props.color === 'red' && `background: #ef4444;`}
`;

export function StatsCards({ stats }) {
  const statItems = [
    {
      label: 'Total Honeypots',
      value: stats.total,
      icon: '🛡️',
      color: 'blue'
    },
    {
      label: 'Running',
      value: stats.running,
      icon: '✅',
      color: 'green'
    },
    {
      label: 'Threats Today',
      value: Math.floor(Math.random() * 150) + 50,
      icon: '⚠️',
      color: 'yellow'
    },
    {
      label: 'Attacks Blocked',
      value: Math.floor(Math.random() * 89) + 23,
      icon: '🚫',
      color: 'red'
    }
  ];

  return (
    <StatsGrid>
      {statItems.map((stat, index) => (
        <Card key={index}>
          <StatIcon color={stat.color}>
            {stat.icon}
          </StatIcon>
          <StatValue>{stat.value}</StatValue>
          <StatLabel>{stat.label}</StatLabel>
        </Card>
      ))}
    </StatsGrid>
  );
}
