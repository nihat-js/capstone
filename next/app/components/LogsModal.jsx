import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Download, RefreshCw, Search, Container, FileText } from 'lucide-react';
import { apiService } from '../services/api';
import { NotificationModal } from './NotificationModal';

export function LogsModal({ honeypot, onClose }) {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [logType, setLogType] = useState('container'); // 'container' or 'real'
  const [realLogType, setRealLogType] = useState('auth'); // 'auth', 'commands', 'messages'
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (logType === 'container') {
      fetchContainerLogs();
    } else {
      fetchRealLogs();
    }
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        if (logType === 'container') {
          fetchContainerLogs();
        } else {
          fetchRealLogs();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [honeypot, autoRefresh, logType, realLogType]);

  const fetchContainerLogs = async () => {
    if (!honeypot?.container_id) {
      setLogs('No container ID available for this honeypot');
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.getContainerLogs(honeypot.container_id);
      
      if (!data.error) {
        setLogs(data.logs || 'No container logs available');
      } else {
        setLogs(`Failed to load container logs: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to fetch container logs:', error);
      setLogs(`Error loading container logs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealLogs = async () => {
    if (!honeypot?.container_id) {
      setLogs('No container ID available for this honeypot');
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.getRealLogs(honeypot.container_id, realLogType);
      
      if (!data.error) {
        setLogs(data.logs || `No ${realLogType} logs available yet`);
      } else {
        setLogs(`Failed to load ${realLogType} logs: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to fetch real logs:', error);
      setLogs(`Error loading ${realLogType} logs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadLogs = async () => {
    try {
      if (!logs || logs.trim() === '') {
        setNotification({
          type: 'warning',
          title: 'No Logs to Download',
          message: 'There are no logs available to download.'
        });
        return;
      }

      const blob = new Blob([logs], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${honeypot.name}_${logType}_logs_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setNotification({
        type: 'success',
        title: 'Logs Downloaded',
        message: `${logType === 'container' ? 'Container' : 'Real'} logs have been downloaded successfully.`
      });
    } catch (error) {
      console.error('Failed to download logs:', error);
      setNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download logs. Please try again.'
      });
    }
  };

  const refreshLogs = () => {
    if (logType === 'container') {
      fetchContainerLogs();
    } else {
      fetchRealLogs();
    }
  };

  const filteredLogs = searchTerm 
    ? logs.split('\n').filter(line => 
        line.toLowerCase().includes(searchTerm.toLowerCase())
      ).join('\n')
    : logs;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderContent>
            <ModalTitle>Logs - {honeypot.name}</ModalTitle>
            <HoneypotId>Container: {honeypot.container_id}</HoneypotId>
          </HeaderContent>
          <HeaderActions>
            <ActionButton onClick={() => setAutoRefresh(!autoRefresh)}>
              <RefreshCw size={16} />
              Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
            </ActionButton>
            <ActionButton onClick={refreshLogs} disabled={loading}>
              <RefreshCw size={16} />
              Refresh
            </ActionButton>
            <ActionButton onClick={downloadLogs}>
              <Download size={16} />
              Download
            </ActionButton>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </HeaderActions>
        </ModalHeader>

        <LogTypeSelector>
          <LogTypeButton 
            active={logType === 'container'} 
            onClick={() => setLogType('container')}
          >
            <Container size={16} />
            Container Logs
          </LogTypeButton>
          <LogTypeButton 
            active={logType === 'real'} 
            onClick={() => setLogType('real')}
          >
            <FileText size={16} />
            Real Logs
          </LogTypeButton>
        </LogTypeSelector>

        {logType === 'real' && honeypot?.type === 'ssh' && (
          <RealLogTypeSelector>
            <RealLogTypeButton 
              active={realLogType === 'auth'} 
              onClick={() => setRealLogType('auth')}
            >
              🔐 Auth Logs
            </RealLogTypeButton>
            <RealLogTypeButton 
              active={realLogType === 'commands'} 
              onClick={() => setRealLogType('commands')}
            >
              💻 Commands
            </RealLogTypeButton>
            <RealLogTypeButton 
              active={realLogType === 'messages'} 
              onClick={() => setRealLogType('messages')}
            >
              📝 Messages
            </RealLogTypeButton>
          </RealLogTypeSelector>
        )}

        <SearchContainer>
          <SearchInputWrapper>
            <Search size={20} />
            <SearchInput
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInputWrapper>
        </SearchContainer>

        <LogsContainer>
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <span>Loading logs...</span>
            </LoadingContainer>
          ) : (
            <LogsContent>
              {filteredLogs || 'No logs available'}
            </LogsContent>
          )}
        </LogsContainer>

        <ModalFooter>
          <FooterInfo>
            {searchTerm && `Showing filtered results for "${searchTerm}"`}
          </FooterInfo>
          <FooterInfo>
            Last updated: {new Date().toLocaleTimeString()}
          </FooterInfo>
        </ModalFooter>
      </ModalContainer>

      <NotificationModal
        isOpen={!!notification}
        onClose={() => setNotification(null)}
        type={notification?.type}
        title={notification?.title}
        message={notification?.message}
        onConfirm={notification?.onConfirm}
      />
    </ModalOverlay>
  );
}

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 90vw;
  width: 1200px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  margin: 1rem;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
`;

const HoneypotId = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  color: #6b7280;
  background: none;
  border: none;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: #374151;
    background: #f3f4f6;
  }
`;

const LogTypeSelector = styled.div`
  display: flex;
  padding: 1rem 1.5rem 0 1.5rem;
  gap: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 0;
`;

const LogTypeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#2563eb' : '#d1d5db'};
  background: ${props => props.active ? '#2563eb' : 'white'};
  color: ${props => props.active ? 'white' : '#374151'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#1d4ed8' : '#f9fafb'};
    border-color: ${props => props.active ? '#1d4ed8' : '#9ca3af'};
  }

  svg {
    color: inherit;
  }
`;

const RealLogTypeSelector = styled.div`
  display: flex;
  padding: 0.5rem 1.5rem;
  gap: 0.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
`;

const RealLogTypeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid ${props => props.active ? '#059669' : '#d1d5db'};
  background: ${props => props.active ? '#059669' : 'white'};
  color: ${props => props.active ? 'white' : '#374151'};
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#047857' : '#f9fafb'};
    border-color: ${props => props.active ? '#047857' : '#9ca3af'};
  }
`;

const SearchContainer = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  svg {
    position: absolute;
    left: 0.75rem;
    color: #9ca3af;
    pointer-events: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const LogsContainer = styled.div`
  flex: 1;
  padding: 1rem 1.5rem;
  overflow: hidden;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  color: #6b7280;
`;

const LoadingSpinner = styled.div`
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LogsContent = styled.pre`
  height: 100%;
  background: #1f2937;
  color: #10b981;
  padding: 1rem;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow: auto;
  margin: 0;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
`;

const FooterInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;
