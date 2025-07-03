'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';

export default function MysqlLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000); // Refresh every 4 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/mysql`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch MySQL logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.type?.toLowerCase() === filter;
    const matchesSearch = searchTerm === '' || 
      log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip?.includes(searchTerm) ||
      log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.query?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.database?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'connection_failed': return '#ef4444';
      case 'connection_success': return '#10b981';
      case 'query': return '#3b82f6';
      case 'injection_attempt': return '#dc2626';
      case 'authentication': return '#8b5cf6';
      case 'error': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>MySQL Honeypot Logs</Title>
          <LoadingSpinner />
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>MySQL Honeypot Logs</Title>
        <Controls>
          <SearchInput
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="connection_failed">Failed Connections</option>
            <option value="connection_success">Successful Connections</option>
            <option value="query">Queries</option>
            <option value="injection_attempt">Injection Attempts</option>
            <option value="authentication">Authentication</option>
            <option value="error">Errors</option>
          </FilterSelect>
          <RefreshButton onClick={fetchLogs}>
            <RefreshIcon />
            Refresh
          </RefreshButton>
          {lastRefresh && (
            <LastRefreshTime>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </LastRefreshTime>
          )}
        </Controls>
      </Header>

      <StatsBar>
        <StatItem>
          <StatLabel>Total Logs</StatLabel>
          <StatValue>{logs.length}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Filtered</StatLabel>
          <StatValue>{filteredLogs.length}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Injection Attempts</StatLabel>
          <StatValue color="#dc2626">{logs.filter(l => l.type === 'injection_attempt').length}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Failed Connections</StatLabel>
          <StatValue color="#ef4444">{logs.filter(l => l.type === 'connection_failed').length}</StatValue>
        </StatItem>
      </StatsBar>

      <LogsContainer>
        {filteredLogs.length === 0 ? (
          <EmptyState>
            <EmptyIcon />
            <EmptyText>No logs found</EmptyText>
            <EmptySubtext>
              {logs.length === 0 ? 'No MySQL logs available yet' : 'Try adjusting your search or filter criteria'}
            </EmptySubtext>
          </EmptyState>
        ) : (
          filteredLogs.map((log, index) => (
            <LogEntry key={index} type={log.type}>
              <LogHeader>
                <LogType color={getTypeColor(log.type)}>
                  {log.type?.replace('_', ' ').toUpperCase() || 'MYSQL'}
                </LogType>
                <LogTimestamp>{formatTimestamp(log.timestamp)}</LogTimestamp>
              </LogHeader>
              <LogContent>
                <LogMessage>{log.message || 'No message'}</LogMessage>
                <LogMeta>
                  {log.ip && (
                    <MetaItem>
                      <MetaLabel>IP:</MetaLabel>
                      <MetaValue>{log.ip}</MetaValue>
                    </MetaItem>
                  )}
                  {log.username && (
                    <MetaItem>
                      <MetaLabel>Username:</MetaLabel>
                      <MetaValue>{log.username}</MetaValue>
                    </MetaItem>
                  )}
                  {log.password && (
                    <MetaItem>
                      <MetaLabel>Password:</MetaLabel>
                      <MetaValue>{log.password}</MetaValue>
                    </MetaItem>
                  )}
                  {log.port && (
                    <MetaItem>
                      <MetaLabel>Port:</MetaLabel>
                      <MetaValue>{log.port}</MetaValue>
                    </MetaItem>
                  )}
                  {log.database && (
                    <MetaItem>
                      <MetaLabel>Database:</MetaLabel>
                      <MetaValue>{log.database}</MetaValue>
                    </MetaItem>
                  )}
                </LogMeta>
                {log.query && (
                  <QuerySection>
                    <QueryLabel>SQL Query:</QueryLabel>
                    <QueryValue isInjection={log.type === 'injection_attempt'}>
                      {log.query}
                    </QueryValue>
                  </QuerySection>
                )}
                {log.error && (
                  <ErrorSection>
                    <ErrorLabel>Error Details:</ErrorLabel>
                    <ErrorValue>{log.error}</ErrorValue>
                  </ErrorSection>
                )}
                {log.connection_id && (
                  <ConnectionInfo>
                    <MetaLabel>Connection ID:</MetaLabel>
                    <MetaValue>{log.connection_id}</MetaValue>
                  </ConnectionInfo>
                )}
              </LogContent>
            </LogEntry>
          ))
        )}
      </LogsContainer>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.5px;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  min-width: 200px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #f59e0b;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #f59e0b;
  }
`;

const RefreshButton = styled.button`
  padding: 12px 20px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
  
  &:hover {
    background: #d97706;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LastRefreshTime = styled.div`
  color: #64748b;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

const RefreshIcon = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const StatsBar = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.color || '#1e293b'};
`;

const LogsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LogEntry = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const LogType = styled.span`
  background: ${props => props.color};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const LogTimestamp = styled.span`
  color: #64748b;
  font-size: 0.9rem;
  font-family: 'Monaco', 'Menlo', monospace;
`;

const LogContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LogMessage = styled.div`
  font-size: 1rem;
  color: #334155;
  line-height: 1.5;
  font-family: 'Monaco', 'Menlo', monospace;
`;

const LogMeta = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const MetaLabel = styled.span`
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
`;

const MetaValue = styled.span`
  font-size: 0.85rem;
  color: #1e293b;
  font-family: 'Monaco', 'Menlo', monospace;
`;

const QuerySection = styled.div`
  background: ${props => props.isInjection ? '#fef2f2' : '#f1f5f9'};
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
  border: 1px solid ${props => props.isInjection ? '#fecaca' : '#e2e8f0'};
`;

const QueryLabel = styled.div`
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 4px;
`;

const QueryValue = styled.div`
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
  color: ${props => props.isInjection ? '#dc2626' : '#1e293b'};
  background: white;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${props => props.isInjection ? '#fecaca' : '#e2e8f0'};
  word-break: break-all;
`;

const ErrorSection = styled.div`
  background: #fef2f2;
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
  border: 1px solid #fecaca;
`;

const ErrorLabel = styled.div`
  font-size: 0.85rem;
  color: #dc2626;
  font-weight: 600;
  margin-bottom: 4px;
`;

const ErrorValue = styled.div`
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
  color: #dc2626;
`;

const ConnectionInfo = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #f1f5f9;
  border-radius: 50%;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: '🗄️';
    font-size: 24px;
  }
`;

const EmptyText = styled.h3`
  font-size: 1.25rem;
  color: #334155;
  margin: 0 0 8px 0;
`;

const EmptySubtext = styled.p`
  color: #64748b;
  margin: 0;
`;
