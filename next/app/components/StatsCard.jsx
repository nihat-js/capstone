import React from 'react';
import styled from 'styled-components';

export function StatsCard({ title, value, icon: Icon, color }) {
  return (
    <StatsCardContainer>
      <StatsCardContent>
        <IconContainer color={color}>
          <Icon size={24} />
        </IconContainer>
        <StatsInfo>
          <StatsTitle>{title}</StatsTitle>
          <StatsValue>{value}</StatsValue>
        </StatsInfo>
      </StatsCardContent>
    </StatsCardContainer>
  );
}

// Styled Components
const StatsCardContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const StatsCardContent = styled.div`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconContainer = styled.div`
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${({ color }) => {
    switch (color) {
      case 'blue':
        return `
          background-color: #dbeafe;
          color: #2563eb;
        `;
      case 'green':
        return `
          background-color: #dcfce7;
          color: #16a34a;
        `;
      case 'gray':
        return `
          background-color: #f3f4f6;
          color: #6b7280;
        `;
      case 'purple':
        return `
          background-color: #f3e8ff;
          color: #9333ea;
        `;
      case 'red':
        return `
          background-color: #fee2e2;
          color: #dc2626;
        `;
      default:
        return `
          background-color: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const StatsInfo = styled.div`
  flex: 1;
`;

const StatsTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
`;

const StatsValue = styled.p`
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;
