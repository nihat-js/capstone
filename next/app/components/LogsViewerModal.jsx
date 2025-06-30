'use client'

import { useState, useEffect } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { 
  AlertTriangle, 
  Shield, 
  Activity, 
  Terminal, 
  Database, 
  Globe, 
  Filter,
  Download,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  MapPin,
  Command,
  X
} from 'lucide-react'

// Unique animations based on seed "77mz809"
const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(119, 123, 135, 0.3);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 40px rgba(119, 123, 135, 0.6);
    transform: scale(1.02);
  }
`

const slideInFromRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const floatingDots = keyframes`
  0%, 100% { transform: translateY(0px); }
  33% { transform: translateY(-10px); }
  66% { transform: translateY(5px); }
`

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const LogsViewerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${slideInFromRight} 0.3s ease-out;
`

const LogsModal = styled.div`
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-radius: 16px;
  width: 95vw;
  height: 90vh;
  max-width: 1400px;
  border: 2px solid #374151;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${pulseGlow} 3s ease-in-out infinite;
`

const LogsHeader = styled.div`
  background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    animation: ${shimmer} 3s ease-in-out infinite;
  }
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1;
`

const ServiceIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${floatingDots} 2s ease-in-out infinite;
`

const HeaderInfo = styled.div`
  z-index: 1;
`

const ServiceName = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
`

const ServiceStatus = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  margin-top: 0.25rem;
`

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`

const LogsContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`

const LogsSidebar = styled.div`
  width: 320px;
  background: #1f2937;
  border-right: 1px solid #374151;
  display: flex;
  flex-direction: column;
`

const StatsSection = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #374151;
`

const StatsTitle = styled.h3`
  color: #f9fafb;
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`

const StatCard = styled.div`
  background: linear-gradient(135deg, #374151, #4b5563);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`

const StatValue = styled.div`
  color: #fbbf24;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`

const StatLabel = styled.div`
  color: #d1d5db;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 500;
`

const FiltersSection = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #374151;
`

const FilterGroup = styled.div`
  margin-bottom: 1rem;
`

const FilterLabel = styled.label`
  color: #f9fafb;
  font-size: 0.875rem;
  font-weight: 500;
  display: block;
  margin-bottom: 0.5rem;
`

const FilterSelect = styled.select`
  width: 100%;
  background: #374151;
  border: 1px solid #4b5563;
  color: #f9fafb;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`

const ThreatLevelBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${props => {
    switch (props.level) {
      case 'HIGH':
        return css`
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border: 1px solid #dc2626;
        `
      case 'MEDIUM':
        return css`
          background: rgba(245, 158, 11, 0.2);
          color: #fcd34d;
          border: 1px solid #d97706;
        `
      default:
        return css`
          background: rgba(34, 197, 94, 0.2);
          color: #86efac;
          border: 1px solid #16a34a;
        `
    }
  }}
`

const LogsMainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const LogsToolbar = styled.div`
  background: #374151;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #4b5563;
  display: flex;
  justify-content: between;
  align-items: center;
  gap: 1rem;
`

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const ToolbarButton = styled.button`
  background: #4b5563;
  border: none;
  color: #f9fafb;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #6b7280;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const LogsList = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #111827;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1f2937;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`

const LogEntry = styled.div`
  background: ${props => props.expanded ? '#1f2937' : 'transparent'};
  border-bottom: 1px solid #374151;
  transition: all 0.2s ease;
  animation: ${slideInFromRight} 0.3s ease-out;
  animation-delay: ${props => props.index * 0.05}s;
  animation-fill-mode: both;
  
  &:hover {
    background: #1f2937;
  }
`

const LogEntryHeader = styled.div`
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
`

const LogTimestamp = styled.div`
  color: #9ca3af;
  font-size: 0.75rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  min-width: 140px;
`

const LogLevel = styled.div`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
  
  ${props => {
    switch (props.level) {
      case 'AUTH':
        return css`
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
        `
      case 'COMMAND':
        return css`
          background: rgba(168, 85, 247, 0.2);
          color: #c4b5fd;
        `
      case 'SYSTEM':
        return css`
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
        `
      default:
        return css`
          background: rgba(107, 114, 128, 0.2);
          color: #d1d5db;
        `
    }
  }}
`

const LogMessage = styled.div`
  color: #f9fafb;
  flex: 1;
  font-size: 0.875rem;
`

const LogDetails = styled.div`
  padding: 0 1.5rem 1rem 1.5rem;
  background: #0f172a;
  border-top: 1px solid #374151;
`

const LogDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`

const LogDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #d1d5db;
  font-size: 0.875rem;
`

const LogDetailLabel = styled.span`
  color: #9ca3af;
  font-weight: 500;
  min-width: 80px;
`

const LogDetailValue = styled.span`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  flex: 1;
`

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #9ca3af;
`

const SpinnerIcon = styled.div`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

export function LogsViewerModal({ service, onClose }) {
  const [logs, setLogs] = useState([])
  const [statistics, setStatistics] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedLog, setExpandedLog] = useState(null)
  const [filters, setFilters] = useState({
    type: 'all',
    level: 'all',
    threat: 'all'
  })
  const [autoRefresh, setAutoRefresh] = useState(false)

  const getServiceIcon = (type) => {
    switch (type) {
      case 'ssh': return <Terminal size={24} />
      case 'mysql':
      case 'postgres':
      case 'redis': return <Database size={24} />
      case 'api': return <Globe size={24} />
      default: return <Shield size={24} />
    }
  }

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const serviceId = service.container_id || service.process_id
      
      // Import the API service
      const { apiService } = await import('../services/api')
      
      const data = await apiService.getStructuredLogs(serviceId, {
        type: filters.type,
        limit: 100
      })
      
      if (data.error) {
        setError(data.message)
      } else {
        setLogs(data.logs || [])
        setStatistics(data.statistics || {})
        setError(null)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [service, filters.type])

  useEffect(() => {
    let interval
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000) // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, filters.type])

  const filteredLogs = logs.filter(log => {
    if (filters.level !== 'all' && log.level !== filters.level) return false
    if (filters.threat !== 'all' && log.threat_level !== filters.threat) return false
    return true
  })

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return timestamp
    }
  }

  const getLogMessage = (log) => {
    switch (log.type) {
      case 'FAILED_LOGIN':
        return `Failed login attempt from ${log.ip} for user "${log.user}"`
      case 'SUCCESSFUL_LOGIN':
        return `Successful login from ${log.ip} for user "${log.user}"`
      case 'COMMAND_EXECUTED':
        return `Command executed: ${log.command}`
      case 'API_REQUEST':
        return `${log.method} ${log.path} from ${log.ip}`
      default:
        return log.details?.raw_line || 'Unknown log entry'
    }
  }

  return (
    <LogsViewerContainer onClick={(e) => e.target === e.currentTarget && onClose()}>
      <LogsModal>
        <LogsHeader>
          <HeaderLeft>
            <ServiceIcon>
              {getServiceIcon(service.type)}
            </ServiceIcon>
            <HeaderInfo>
              <ServiceName>{service.name} Logs</ServiceName>
              <ServiceStatus>
                {service.status} • {filteredLogs.length} entries
              </ServiceStatus>
            </HeaderInfo>
          </HeaderLeft>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </LogsHeader>

        <LogsContent>
          <LogsSidebar>
            <StatsSection>
              <StatsTitle>Statistics</StatsTitle>
              <StatsGrid>
                <StatCard>
                  <StatValue>{statistics.total_events || 0}</StatValue>
                  <StatLabel>Total Events</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{statistics.unique_ips || 0}</StatValue>
                  <StatLabel>Unique IPs</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{statistics.failed_logins || 0}</StatValue>
                  <StatLabel>Failed Logins</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{statistics.commands_executed || 0}</StatValue>
                  <StatLabel>Commands</StatLabel>
                </StatCard>
              </StatsGrid>
            </StatsSection>

            <FiltersSection>
              <StatsTitle>Filters</StatsTitle>
              <FilterGroup>
                <FilterLabel>Log Type</FilterLabel>
                <FilterSelect
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="all">All Types</option>
                  <option value="auth">Authentication</option>
                  <option value="commands">Commands</option>
                  <option value="messages">Messages</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Threat Level</FilterLabel>
                <FilterSelect
                  value={filters.threat}
                  onChange={(e) => setFilters(prev => ({ ...prev, threat: e.target.value }))}
                >
                  <option value="all">All Levels</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="LOW">Low Risk</option>
                </FilterSelect>
              </FilterGroup>
            </FiltersSection>
          </LogsSidebar>

          <LogsMainContent>
            <LogsToolbar>
              <ToolbarLeft>
                <span style={{ color: '#f9fafb', fontSize: '0.875rem' }}>
                  Showing {filteredLogs.length} of {logs.length} entries
                </span>
              </ToolbarLeft>
              <ToolbarRight>
                <ToolbarButton onClick={fetchLogs} disabled={loading}>
                  <RefreshCw size={16} />
                  Refresh
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  style={{
                    background: autoRefresh ? '#059669' : '#4b5563'
                  }}
                >
                  <Activity size={16} />
                  Auto Refresh
                </ToolbarButton>
              </ToolbarRight>
            </LogsToolbar>

            <LogsList>
              {loading ? (
                <LoadingSpinner>
                  <SpinnerIcon>
                    <RefreshCw size={24} />
                  </SpinnerIcon>
                </LoadingSpinner>
              ) : error ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                  Error: {error}
                </div>
              ) : filteredLogs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                  No logs found with current filters
                </div>
              ) : (
                filteredLogs.map((log, index) => (
                  <LogEntry
                    key={index}
                    index={index}
                    expanded={expandedLog === index}
                  >
                    <LogEntryHeader
                      onClick={() => setExpandedLog(expandedLog === index ? null : index)}
                    >
                      <LogTimestamp>
                        <Clock size={14} style={{ marginRight: '0.5rem', display: 'inline' }} />
                        {formatTimestamp(log.timestamp)}
                      </LogTimestamp>
                      <LogLevel level={log.level}>{log.level}</LogLevel>
                      <ThreatLevelBadge level={log.threat_level}>
                        <AlertTriangle size={12} />
                        {log.threat_level}
                      </ThreatLevelBadge>
                      <LogMessage>{getLogMessage(log)}</LogMessage>
                      {expandedLog === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </LogEntryHeader>
                    
                    {expandedLog === index && (
                      <LogDetails>
                        <LogDetailsGrid>
                          {log.ip && (
                            <LogDetailItem>
                              <MapPin size={16} />
                              <LogDetailLabel>IP:</LogDetailLabel>
                              <LogDetailValue>{log.ip}</LogDetailValue>
                            </LogDetailItem>
                          )}
                          {log.user && (
                            <LogDetailItem>
                              <User size={16} />
                              <LogDetailLabel>User:</LogDetailLabel>
                              <LogDetailValue>{log.user}</LogDetailValue>
                            </LogDetailItem>
                          )}
                          {log.command && (
                            <LogDetailItem>
                              <Command size={16} />
                              <LogDetailLabel>Command:</LogDetailLabel>
                              <LogDetailValue>{log.command}</LogDetailValue>
                            </LogDetailItem>
                          )}
                          {log.method && (
                            <LogDetailItem>
                              <Globe size={16} />
                              <LogDetailLabel>Method:</LogDetailLabel>
                              <LogDetailValue>{log.method}</LogDetailValue>
                            </LogDetailItem>
                          )}
                        </LogDetailsGrid>
                        {log.details?.raw_line && (
                          <div>
                            <LogDetailLabel>Raw Log:</LogDetailLabel>
                            <LogDetailValue style={{ 
                              display: 'block', 
                              marginTop: '0.5rem',
                              padding: '0.75rem',
                              background: '#0f172a',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              wordBreak: 'break-all'
                            }}>
                              {log.details.raw_line}
                            </LogDetailValue>
                          </div>
                        )}
                      </LogDetails>
                    )}
                  </LogEntry>
                ))
              )}
            </LogsList>
          </LogsMainContent>
        </LogsContent>
      </LogsModal>
    </LogsViewerContainer>
  )
}
