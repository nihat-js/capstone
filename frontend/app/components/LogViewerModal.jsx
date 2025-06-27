import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

export function LogViewerModal({ honeypot, onClose }) {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
    
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [honeypot.id, autoRefresh]);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/logs/${honeypot.id}`);
      if (response.ok) {
        const data = await response.json();
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
      const response = await fetch(`/api/download_logs/${honeypot.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${honeypot.name}_logs_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download logs:', error);
    }
  };

  const clearLogs = async () => {
    if (confirm('Are you sure you want to clear all logs for this honeypot?')) {
      try {
        const response = await fetch(`/api/clear_logs/${honeypot.id}`, {
          method: 'POST',
        });
        if (response.ok) {
          setLogs('Logs cleared');
        }
      } catch (error) {
        console.error('Failed to clear logs:', error);
      }
    }
  };

  const filteredLogs = searchTerm 
    ? logs.split('\n').filter(line => 
        line.toLowerCase().includes(searchTerm.toLowerCase())
      ).join('\n')
    : logs;

  return (
    <ModalOverlay>
      <ModalContainer>
        {/* Header */}
        <ModalHeader>
          <HeaderInfo>
            <ModalTitle>Logs - {honeypot.name}</ModalTitle>
            <ModalSubtitle>Type: {honeypot.type}</ModalSubtitle>
          </HeaderInfo>
          <HeaderActions>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <CheckboxLabel>Auto-refresh</CheckboxLabel>
            </CheckboxContainer>
            <ActionButton onClick={downloadLogs} variant="blue">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </ActionButton>
            <ActionButton onClick={clearLogs} variant="red">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </ActionButton>
            <CloseButton onClick={onClose}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </CloseButton>
          </HeaderActions>
        </ModalHeader>

        {/* Search */}
        <SearchSection>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </SearchIcon>
          </SearchContainer>
        </SearchSection>

        {/* Logs Content */}
        <LogsSection>
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
            </LoadingContainer>
          ) : (
            <LogsContainer>
              <LogsContent>
                {filteredLogs || 'No logs available'}
              </LogsContent>
            </LogsContainer>
          )}
        </LogsSection>

        {/* Footer */}
        <ModalFooter>
          <FooterLeft>
            {searchTerm && (
              <span>
                Showing filtered results for "{searchTerm}"
              </span>
            )}
          </FooterLeft>
          <FooterRight>
            Last updated: {new Date().toLocaleTimeString()}
          </FooterRight>
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
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 72rem;
  width: 100%;
  margin: 1rem;
  height: 83.333333%;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const HeaderInfo = styled.div``;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ModalSubtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Checkbox = styled.input`
  border-radius: 4px;
  border: 1px solid #d1d5db;
  color: #3b82f6;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  &:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.1);
  }
`;

const CheckboxLabel = styled.span`
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border: 1px solid transparent;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;

  ${({ variant }) => {
    switch (variant) {
      case 'blue':
        return `
          color: #1d4ed8;
          background: #dbeafe;
          &:hover { background: #bfdbfe; }
        `;
      case 'red':
        return `
          color: #b91c1c;
          background: #fee2e2;
          &:hover { background: #fecaca; }
        `;
      default:
        return `
          color: #374151;
          background: #f3f4f6;
          &:hover { background: #e5e7eb; }
        `;
    }
  }}

  svg {
    width: 1rem;
    height: 1rem;
    margin-right: 0.25rem;
  }
`;

const CloseButton = styled.button`
  color: #6b7280;
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: #374151;
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const SearchSection = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  inset-y: 0;
  left: 0;
  padding-left: 0.75rem;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const LogsSection = styled.div`
  flex: 1;
  padding: 1rem;
  overflow: hidden;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
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

const LogsContainer = styled.div`
  height: 100%;
  background: #111827;
  border-radius: 8px;
  padding: 1rem;
  overflow: auto;
`;

const LogsContent = styled.pre`
  color: #10b981;
  font-size: 0.875rem;
  font-family: monospace;
  white-space: pre-wrap;
  margin: 0;
`;

const ModalFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
`;

const FooterLeft = styled.div``;

const FooterRight = styled.div``;
