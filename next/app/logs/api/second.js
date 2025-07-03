// Dashboard.jsx
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

import styled from 'styled-components';


const COLORS = ['#00b894', '#d63031'];

// data.js
const countryData = [
  { country: 'Unknown', requests: 14 },
  { country: 'Azerbaijan', requests: 1 },
];

const threatLevelData = [
  { name: 'Low', value: 6 },
  { name: 'Medium', value: 9 },
];

const timeSeriesData = [
  { time: '05:03', requests: 2 },
  { time: '05:04', requests: 5 },
  { time: '05:05', requests: 3 },
  { time: '05:07', requests: 3 },
  { time: '05:09', requests: 2 },
  { time: '05:11', requests: 1 },
];



const Dashboard = () => (
  <DashboardContainer>
    <Title>📈 API Request Insights</Title>
    <ChartGrid>
      <Card>
        <Title>Requests by Country</Title>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={countryData}>
            <XAxis dataKey="country" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="requests" fill="#0984e3" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <Title>Threat Levels</Title>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={threatLevelData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {threatLevelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <Title>Requests Over Time</Title>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="requests" stroke="#6c5ce7" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </ChartGrid>
  </DashboardContainer>
);

export default Dashboard;




export const DashboardContainer = styled.div`
  padding: 2rem;
  background: #f9fafc;
  font-family: 'Segoe UI', sans-serif;
`;

export const ChartGrid = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
`;

export const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
`;

export const Title = styled.h3`
  margin-bottom: 1rem;
  color: #2d3436;
`;
