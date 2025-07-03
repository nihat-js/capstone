'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';

export default function ApiLogsPage() {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/api`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch API logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level?.toLowerCase() === filter;
    
    // Enhanced search functionality including time-based search
    const matchesSearch = searchTerm === '' || (() => {
      const searchLower = searchTerm.toLowerCase();
      
      // Basic text search
      const textMatch = 
        log.message?.toLowerCase().includes(searchLower) ||
        log.ip?.toLowerCase().includes(searchLower) ||
        log.method?.toLowerCase().includes(searchLower) ||
        log.endpoint?.toLowerCase().includes(searchLower) ||
        log.user_agent?.toLowerCase().includes(searchLower);
      
      // Time-based search
      const timeMatch = (() => {
        if (!log.timestamp) return false;
        
        const logDate = new Date(log.timestamp);
        const logDateString = logDate.toLocaleString().toLowerCase();
        const logDateOnly = logDate.toLocaleDateString().toLowerCase();
        const logTimeOnly = logDate.toLocaleTimeString().toLowerCase();
        
        // Search in full timestamp, date only, or time only
        return logDateString.includes(searchLower) ||
               logDateOnly.includes(searchLower) ||
               logTimeOnly.includes(searchLower);
      })();
      
      // Date range search (e.g., "today", "yesterday", "last hour")
      const dateRangeMatch = (() => {
        if (!log.timestamp) return false;
        
        const logDate = new Date(log.timestamp);
        const now = new Date();
        
        switch (searchLower) {
          case 'today':
            return logDate.toDateString() === now.toDateString();
          case 'yesterday':
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            return logDate.toDateString() === yesterday.toDateString();
          case 'last hour':
            const lastHour = new Date(now - 60 * 60 * 1000);
            return logDate > lastHour;
          case 'last 24 hours':
            const last24Hours = new Date(now - 24 * 60 * 60 * 1000);
            return logDate > last24Hours;
          case 'this week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            return logDate >= weekStart;
          case 'this month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return logDate >= monthStart;
          default:
            return false;
        }
      })();
      
      return textMatch || timeMatch || dateRangeMatch;
    })();
    
    return matchesFilter && matchesSearch;
  });

  const getLogStats = () => {
    const now = new Date();
    const last24Hours = new Date(now - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now - 60 * 60 * 1000);
    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);
    
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime > last24Hours;
    });
    
    const hourlyLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime > lastHour;
    });

    const weeklyLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime > last7Days;
    });

    const monthlyLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime > last30Days;
    });

    const uniqueIPs = new Set(logs.map(log => log.ip).filter(Boolean));
    const uniqueEndpoints = new Set(logs.map(log => log.endpoint).filter(Boolean));
    const uniqueUserAgents = new Set(logs.map(log => log.user_agent).filter(Boolean));
    
    const topEndpoints = {};
    const topMethods = {};
    const topIPs = {};
    
    logs.forEach(log => {
      if (log.endpoint) {
        topEndpoints[log.endpoint] = (topEndpoints[log.endpoint] || 0) + 1;
      }
      if (log.method) {
        topMethods[log.method] = (topMethods[log.method] || 0) + 1;
      }
      if (log.ip) {
        topIPs[log.ip] = (topIPs[log.ip] || 0) + 1;
      }
    });

    // Calculate attack patterns
    const suspiciousPatterns = logs.filter(log => 
      log.endpoint?.includes('admin') || 
      log.endpoint?.includes('wp-') ||
      log.endpoint?.includes('phpmyadmin') ||
      log.endpoint?.includes('..') ||
      log.endpoint?.includes('sql') ||
      log.method === 'POST' && log.endpoint?.includes('login')
    );

    // Calculate success/failure rates
    const successLogs = logs.filter(log => log.level === 'info' || log.level === 'debug');
    const failureLogs = logs.filter(log => log.level === 'error' || log.level === 'warning');

    return {
      total: logs.length,
      errors: logs.filter(l => l.level === 'error').length,
      warnings: logs.filter(l => l.level === 'warning').length,
      info: logs.filter(l => l.level === 'info').length,
      debug: logs.filter(l => l.level === 'debug').length,
      last24Hours: recentLogs.length,
      lastHour: hourlyLogs.length,
      last7Days: weeklyLogs.length,
      last30Days: monthlyLogs.length,
      uniqueIPs: uniqueIPs.size,
      uniqueEndpoints: uniqueEndpoints.size,
      uniqueUserAgents: uniqueUserAgents.size,
      topEndpoint: Object.keys(topEndpoints).length > 0 ? Object.keys(topEndpoints).sort((a, b) => topEndpoints[b] - topEndpoints[a])[0] : 'N/A',
      topMethod: Object.keys(topMethods).length > 0 ? Object.keys(topMethods).sort((a, b) => topMethods[b] - topMethods[a])[0] : 'N/A',
      topIP: Object.keys(topIPs).length > 0 ? Object.keys(topIPs).sort((a, b) => topIPs[b] - topIPs[a])[0] : 'N/A',
      suspiciousRequests: suspiciousPatterns.length,
      successRate: logs.length > 0 ? ((successLogs.length / logs.length) * 100).toFixed(1) : 0,
      failureRate: logs.length > 0 ? ((failureLogs.length / logs.length) * 100).toFixed(1) : 0,
      filtered: filteredLogs.length
    };
  };

  const stats = getLogStats();

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      case 'debug': return '#6b7280';
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
          <Title>API Honeypot Logs</Title>
          <LoadingSpinner />
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>API Honeypot Logs</Title>
        <Controls>
          <SearchInput
            type="text"
            placeholder="Search logs (try: 'today', 'last hour', IP, method, endpoint...)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </FilterSelect>
          <RefreshButton onClick={fetchLogs}>
            <RefreshIcon />
            Refresh
          </RefreshButton>
          <ViewModeToggle>
            <ViewModeButton 
              active={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <ListIcon />
              List
            </ViewModeButton>
            <ViewModeButton 
              active={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <GridIcon />
              Grid
            </ViewModeButton>
          </ViewModeToggle>
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
          <StatValue>{stats.total}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Filtered</StatLabel>
          <StatValue>{stats.filtered}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Errors</StatLabel>
          <StatValue color="#ef4444">{stats.errors}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Warnings</StatLabel>
          <StatValue color="#f59e0b">{stats.warnings}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Info</StatLabel>
          <StatValue color="#3b82f6">{stats.info}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Debug</StatLabel>
          <StatValue color="#6b7280">{stats.debug}</StatValue>
        </StatItem>
      </StatsBar>

      <AdditionalStats>
        <StatItem>
          <StatLabel>Last 24 Hours</StatLabel>
          <StatValue color="#059669">{stats.last24Hours}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Last Hour</StatLabel>
          <StatValue color="#dc2626">{stats.lastHour}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Unique IPs</StatLabel>
          <StatValue color="#7c3aed">{stats.uniqueIPs}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Top Method</StatLabel>
          <StatValue color="#0891b2">{stats.topMethod}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Top Endpoint</StatLabel>
          <StatValue color="#ea580c" style={{ fontSize: '1.2rem' }}>
            {stats.topEndpoint.length > 15 ? stats.topEndpoint.substring(0, 15) + '...' : stats.topEndpoint}
          </StatValue>
        </StatItem>
      </AdditionalStats>

      <AdvancedStats>
        <StatItem>
          <StatLabel>Last 7 Days</StatLabel>
          <StatValue color="#16a34a">{stats.last7Days}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Last 30 Days</StatLabel>
          <StatValue color="#2563eb">{stats.last30Days}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Unique Endpoints</StatLabel>
          <StatValue color="#9333ea">{stats.uniqueEndpoints}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Unique User Agents</StatLabel>
          <StatValue color="#0369a1">{stats.uniqueUserAgents}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Top IP</StatLabel>
          <StatValue color="#dc2626">{stats.topIP}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Suspicious Requests</StatLabel>
          <StatValue color="#e11d48">{stats.suspiciousRequests}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Success Rate</StatLabel>
          <StatValue color="#059669">{stats.successRate}%</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Failure Rate</StatLabel>
          <StatValue color="#dc2626">{stats.failureRate}%</StatValue>
        </StatItem>
      </AdvancedStats>

      <LogsContainer viewMode={viewMode}>
        {filteredLogs.length === 0 ? (
          <EmptyState>
            <EmptyIcon />
            <EmptyText>No logs found</EmptyText>
            <EmptySubtext>
              {logs.length === 0 ? 'No logs available yet' : 'Try adjusting your search or filter criteria'}
            </EmptySubtext>
          </EmptyState>
        ) : (
          filteredLogs.map((log, index) => (
            <LogEntry key={index} level={log.level} viewMode={viewMode}>
              <LogHeader>
                <LogLevel color={getLevelColor(log.level)}>
                  {log.level?.toUpperCase() || 'INFO'}
                </LogLevel>
                <LogTimestamp>{formatTimestamp(log.timestamp)}</LogTimestamp>
              </LogHeader>
              <LogContent>
                <LogMessage>{log.message || 'No message'}</LogMessage>
                <LogMetaContainer>
                  {log.ip && (
                    <LogMeta>
                      <MetaItem>
                        <MetaLabel>IP:</MetaLabel>
                        <MetaValue>{log.ip}</MetaValue>
                      </MetaItem>
                    </LogMeta>
                  )}
                  {log.method && (
                    <LogMeta>
                      <MetaItem>
                        <MetaLabel>Method:</MetaLabel>
                        <MetaValue>{log.method}</MetaValue>
                      </MetaItem>
                      {log.endpoint && (
                        <MetaItem>
                          <MetaLabel>Endpoint:</MetaLabel>
                          <MetaValue>{log.endpoint}</MetaValue>
                        </MetaItem>
                      )}
                    </LogMeta>
                  )}
                  {log.user_agent && (
                    <LogMeta>
                      <MetaItem>
                        <MetaLabel>User Agent:</MetaLabel>
                        <MetaValue>{log.user_agent}</MetaValue>
                      </MetaItem>
                    </LogMeta>
                  )}
                </LogMetaContainer>
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
  border-radius: 10px;
  font-size: 0.95rem;
  background: white;
  min-width: 300px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
    font-size: 0.9rem;
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
    border-color: #2563eb;
  }
`;

const RefreshButton = styled.button`
  padding: 12px 20px;
  background: #059669;
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
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
  
  &:hover {
    background: #047857;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
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
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const StatsBar = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const AdditionalStats = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const AdvancedStats = styled.div`
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
    gap: 20px;
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
  transition: transform 0.2s, box-shadow 0.2s;
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

const LogLevel = styled.span`
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
  flex: 1;
`;

const LogMessage = styled.div`
  font-size: 1rem;
  color: #334155;
  line-height: 1.5;
  font-family: 'Monaco', 'Menlo', monospace;
`;

const LogMetaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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
    content: '📋';
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

const ViewModeToggle = styled.div`
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
`;

const ViewModeButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  background: ${props => props.active ? '#ffffff' : 'transparent'};
  color: ${props => props.active ? '#2563eb' : '#64748b'};
  box-shadow: ${props => props.active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
  
  &:hover {
    background: ${props => props.active ? '#ffffff' : '#e2e8f0'};
    color: ${props => props.active ? '#2563eb' : '#374151'};
  }
`;

const ListIcon = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  background: currentColor;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cline x1='8' y1='6' x2='21' y2='6'/%3E%3Cline x1='8' y1='12' x2='21' y2='12'/%3E%3Cline x1='8' y1='18' x2='21' y2='18'/%3E%3Cline x1='3' y1='6' x2='3.01' y2='6'/%3E%3Cline x1='3' y1='12' x2='3.01' y2='12'/%3E%3Cline x1='3' y1='18' x2='3.01' y2='18'/%3E%3C/svg%3E") center/contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cline x1='8' y1='6' x2='21' y2='6'/%3E%3Cline x1='8' y1='12' x2='21' y2='12'/%3E%3Cline x1='8' y1='18' x2='21' y2='18'/%3E%3Cline x1='3' y1='6' x2='3.01' y2='6'/%3E%3Cline x1='3' y1='12' x2='3.01' y2='12'/%3E%3Cline x1='3' y1='18' x2='3.01' y2='18'/%3E%3C/svg%3E") center/contain no-repeat;
`;

const GridIcon = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  background: currentColor;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='3' y='3' width='7' height='7'/%3E%3Crect x='14' y='3' width='7' height='7'/%3E%3Crect x='14' y='14' width='7' height='7'/%3E%3Crect x='3' y='14' width='7' height='7'/%3E%3C/svg%3E") center/contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='3' y='3' width='7' height='7'/%3E%3Crect x='14' y='3' width='7' height='7'/%3E%3Crect x='14' y='14' width='7' height='7'/%3E%3Crect x='3' y='14' width='7' height='7'/%3E%3C/svg%3E") center/contain no-repeat;
`;
