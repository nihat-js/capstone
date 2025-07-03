'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';

export default function SshLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000); // Refresh every 4 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/ssh`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch SSH logs:', error);
    } finally {
      setLoading(false);
    }
  };
  // test
  const filteredLogs = logs.filter(log => {
    // Use event_type for SSH logs, type for other logs
    const logType = log.event_type || log.type;
    const matchesFilter = filter === 'all' || logType?.toLowerCase() === filter;
    
    // Enhanced search with time filtering
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      log.message?.toLowerCase().includes(searchLower) ||
      log.ip?.includes(searchTerm) ||
      log.username?.toLowerCase().includes(searchLower) ||
      log.command?.toLowerCase().includes(searchLower) ||
      log.session_id?.toLowerCase().includes(searchLower) ||
      log.port?.toString().includes(searchTerm) ||
      // Time-based search
      (log.timestamp && (
        new Date(log.timestamp).toLocaleString().toLowerCase().includes(searchLower) ||
        new Date(log.timestamp).toLocaleDateString().toLowerCase().includes(searchLower) ||
        new Date(log.timestamp).toLocaleTimeString().toLowerCase().includes(searchLower) ||
        log.timestamp.toLowerCase().includes(searchLower)
      ));
    
    return matchesFilter && matchesSearch;
  });

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'failed_login': return '#ef4444';
      case 'successful_login': return '#10b981';
      case 'login': return '#10b981';
      case 'command': return '#3b82f6';
      case 'connection': return '#8b5cf6';
      case 'disconnect': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  // Enhanced statistics calculations
  const totalLogs = logs.length;
  const failedLogins = logs.filter(l => (l.event_type || l.type) === 'failed_login').length;
  const successfulLogins = logs.filter(l => (l.event_type || l.type) === 'successful_login' || (l.event_type || l.type) === 'login').length;
  const commands = logs.filter(l => (l.event_type || l.type) === 'command').length;
  const connections = logs.filter(l => (l.event_type || l.type) === 'connection').length;
  const disconnects = logs.filter(l => (l.event_type || l.type) === 'disconnect').length;
  const uniqueIPs = [...new Set(logs.map(l => l.ip).filter(Boolean))].length;
  const uniqueUsers = [...new Set(logs.map(l => l.username).filter(Boolean))].length;
  const recentLogs = logs.filter(l => {
    if (!l.timestamp) return false;
    const logTime = new Date(l.timestamp);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return logTime > oneHourAgo;
  }).length;

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>SSH Honeypot Logs</Title>
          <LoadingSpinner />
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>SSH Honeypot Logs</Title>
        <Controls>
          <SearchInput
            type="text"
            placeholder="Search logs, IPs, users, commands, or time..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="failed_login">Failed Login</option>
            <option value="login">Successful Login</option>
            <option value="command">Commands</option>
            <option value="connection">Connections</option>
            <option value="disconnect">Disconnects</option>
          </FilterSelect>
          <ViewModeToggle>
            <ViewModeButton 
              active={viewMode === 'list'} 
              onClick={() => setViewMode('list')}
            >
              📋 List
            </ViewModeButton>
            <ViewModeButton 
              active={viewMode === 'grid'} 
              onClick={() => setViewMode('grid')}
            >
              ⊞ Grid
            </ViewModeButton>
          </ViewModeToggle>
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
          <StatValue>{totalLogs}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Filtered</StatLabel>
          <StatValue>{filteredLogs.length}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Failed Logins</StatLabel>
          <StatValue color="#ef4444">{failedLogins}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Commands</StatLabel>
          <StatValue color="#3b82f6">{commands}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Unique IPs</StatLabel>
          <StatValue color="#8b5cf6">{uniqueIPs}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Recent (1h)</StatLabel>
          <StatValue color="#f59e0b">{recentLogs}</StatValue>
        </StatItem>
      </StatsBar>

      <AdvancedStats>
        <AdvancedStatCard>
          <AdvancedStatTitle>Connection Statistics</AdvancedStatTitle>
          <AdvancedStatGrid>
            <AdvancedStatItem>
              <AdvancedStatLabel>Successful Logins</AdvancedStatLabel>
              <AdvancedStatValue color="#10b981">{successfulLogins}</AdvancedStatValue>
            </AdvancedStatItem>
            <AdvancedStatItem>
              <AdvancedStatLabel>Connections</AdvancedStatLabel>
              <AdvancedStatValue color="#3b82f6">{connections}</AdvancedStatValue>
            </AdvancedStatItem>
            <AdvancedStatItem>
              <AdvancedStatLabel>Disconnects</AdvancedStatLabel>
              <AdvancedStatValue color="#f59e0b">{disconnects}</AdvancedStatValue>
            </AdvancedStatItem>
          </AdvancedStatGrid>
        </AdvancedStatCard>
        
        <AdvancedStatCard>
          <AdvancedStatTitle>Security Overview</AdvancedStatTitle>
          <AdvancedStatGrid>
            <AdvancedStatItem>
              <AdvancedStatLabel>Unique Users</AdvancedStatLabel>
              <AdvancedStatValue color="#8b5cf6">{uniqueUsers}</AdvancedStatValue>
            </AdvancedStatItem>
            <AdvancedStatItem>
              <AdvancedStatLabel>Attack Success Rate</AdvancedStatLabel>
              <AdvancedStatValue color="#ef4444">
                {totalLogs > 0 ? ((successfulLogins / totalLogs) * 100).toFixed(1) : 0}%
              </AdvancedStatValue>
            </AdvancedStatItem>
            <AdvancedStatItem>
              <AdvancedStatLabel>Commands/Session</AdvancedStatLabel>
              <AdvancedStatValue color="#06b6d4">
                {successfulLogins > 0 ? (commands / successfulLogins).toFixed(1) : 0}
              </AdvancedStatValue>
            </AdvancedStatItem>
          </AdvancedStatGrid>
        </AdvancedStatCard>
      </AdvancedStats>

      <LogsContainer viewMode={viewMode}>
        {filteredLogs.length === 0 ? (
          <EmptyState>
            <EmptyIcon />
            <EmptyText>No logs found</EmptyText>
            <EmptySubtext>
              {logs.length === 0 ? 'No SSH logs available yet' : 'Try adjusting your search or filter criteria'}
            </EmptySubtext>
          </EmptyState>
        ) : (
          filteredLogs.map((log, index) => (
            <LogEntry key={index} type={log.event_type || log.type} viewMode={viewMode}>
              <LogHeader>
                <LogType color={getTypeColor(log.event_type || log.type)}>
                  {(log.event_type || log.type)?.replace('_', ' ').toUpperCase() || 'SSH'}
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
                  {log.session_id && (
                    <MetaItem>
                      <MetaLabel>Session ID:</MetaLabel>
                      <MetaValue>{log.session_id}</MetaValue>
                    </MetaItem>
                  )}
                  {log.country && (
                    <MetaItem>
                      <MetaLabel>Country:</MetaLabel>
                      <MetaValue>{log.country}</MetaValue>
                    </MetaItem>
                  )}
                  {log.threat_level && (
                    <MetaItem>
                      <MetaLabel>Threat Level:</MetaLabel>
                      <MetaValue style={{ 
                        color: log.threat_level === 'high' ? '#ef4444' : 
                               log.threat_level === 'medium' ? '#f59e0b' : '#10b981'
                      }}>
                        {log.threat_level.toUpperCase()}
                      </MetaValue>
                    </MetaItem>
                  )}
                </LogMeta>
                {log.command && (
                  <CommandSection>
                    <CommandLabel>Command Executed:</CommandLabel>
                    <CommandValue>{log.command}</CommandValue>
                  </CommandSection>
                )}
                {log.details && (
                  <CommandSection>
                    <CommandLabel>Details:</CommandLabel>
                    <CommandValue>{log.details}</CommandValue>
                  </CommandSection>
                )}
                {log.session_id && (
                  <SessionInfo>
                    <MetaLabel>Session ID:</MetaLabel>
                    <MetaValue>{log.session_id}</MetaValue>
                  </SessionInfo>
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
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  min-width: 280px;
  transition: all 0.2s;
  font-weight: 500;
  
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
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
    border-color: #10b981;
  }
`;

const RefreshButton = styled.button`
  padding: 12px 20px;
  background: #10b981;
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
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  
  &:hover {
    background: #059669;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
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
  border-top-color: #10b981;
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
  display: ${props => props.viewMode === 'grid' ? 'grid' : 'flex'};
  ${props => props.viewMode === 'grid' ? `
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 16px;
  ` : `
    flex-direction: column;
    gap: 12px;
  `}
`;

const LogEntry = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: all 0.2s;
  
  ${props => props.viewMode === 'grid' ? `
    min-height: 200px;
    display: flex;
    flex-direction: column;
  ` : ''}
  
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

const CommandSection = styled.div`
  background: #f1f5f9;
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
`;

const CommandLabel = styled.div`
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 4px;
`;

const CommandValue = styled.div`
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
  color: #1e293b;
  background: white;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
`;

const SessionInfo = styled.div`
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
    content: '🔒';
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

// New styled components for enhanced UI
const ViewModeToggle = styled.div`
  display: flex;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

const ViewModeButton = styled.button`
  padding: 10px 16px;
  background: ${props => props.active ? '#10b981' : 'white'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#059669' : '#f8fafc'};
  }
`;

const AdvancedStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const AdvancedStatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

const AdvancedStatTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const AdvancedStatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
`;

const AdvancedStatItem = styled.div`
  text-align: center;
`;

const AdvancedStatLabel = styled.div`
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 6px;
`;

const AdvancedStatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.color || '#1e293b'};
`;
