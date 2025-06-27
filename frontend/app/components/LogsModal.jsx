import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Download, RefreshCw, Search } from 'lucide-react';

export function LogsModal({ honeypotId, honeypotName, onClose }) {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchLogs();
    
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [honeypotId, autoRefresh]);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/honeypots/${honeypotId}/logs`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs || 'No logs available');
      } else {
        setLogs('Failed to load logs');
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs('Error loading logs');
    } finally {
      setLoading(false);
    }
  };

  const downloadLogs = async () => {
    try {
      const response = await fetch(`/api/honeypots/${honeypotId}/logs/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${honeypotName}_logs_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download logs:', error);
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
            <ModalTitle>Logs - {honeypotName}</ModalTitle>
            <HoneypotId>ID: {honeypotId}</HoneypotId>
          </HeaderContent>
          <HeaderActions>
            <ActionButton onClick={() => setAutoRefresh(!autoRefresh)}>
              <RefreshCw size={16} />
              Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
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
