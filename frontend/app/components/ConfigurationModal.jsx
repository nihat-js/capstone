import React, { useState } from 'react';
import styled from 'styled-components';

export function ConfigurationModal({ honeypot, honeypotType, onClose, onSuccess }) {
  const [config, setConfig] = useState(honeypot.config || {});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/configure_honeypot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          honeypot_id: honeypot.id,
          config
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update configuration');
      }
    } catch (error) {
      console.error('Failed to update configuration:', error);
      alert('Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  const renderConfigField = (field) => {
    const value = config[field] || '';
    
    switch (field) {
      case 'username':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => setConfig(prev => ({ ...prev, [field]: e.target.value }))}
            placeholder="admin"
          />
        );
      
      case 'password':
        return (
          <Input
            type="password"
            value={value}
            onChange={(e) => setConfig(prev => ({ ...prev, [field]: e.target.value }))}
            placeholder="password123"
          />
        );
      
      case 'banner':
      case 'ftp_banner':
      case 'smtp_banner':
      case 'rdp_banner':
        return (
          <TextArea
            value={value}
            onChange={(e) => setConfig(prev => ({ ...prev, [field]: e.target.value }))}
            rows={3}
            placeholder="Welcome to the system"
          />
        );
      
      case 'anonymous_login':
      case 'ssl_enabled':
      case 'auth_required':
      case 'relay_allowed':
        return (
          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => setConfig(prev => ({ ...prev, [field]: e.target.checked }))}
            />
            <CheckboxLabel>Enable</CheckboxLabel>
          </CheckboxContainer>
        );
      
      case 'max_connections':
      case 'session_timeout':
      case 'max_message_size':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setConfig(prev => ({ ...prev, [field]: parseInt(e.target.value) || 0 }))}
            min="0"
          />
        );
      
      case 'database_names':
      case 'fake_files':
      case 'fake_users':
      case 'user_accounts':
        return (
          <TextArea
            value={Array.isArray(value) ? value.join('\n') : value}
            onChange={(e) => setConfig(prev => ({ 
              ...prev, 
              [field]: e.target.value.split('\n').filter(Boolean) 
            }))}
            rows={4}
            placeholder="One item per line"
          />
        );
      
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => setConfig(prev => ({ ...prev, [field]: e.target.value }))}
          />
        );
    }
  };

  const getFieldDescription = (field) => {
    const descriptions = {
      username: 'Default username for login attempts',
      password: 'Default password for login attempts',
      banner: 'Welcome banner displayed to connecting users',
      ftp_banner: 'FTP server welcome message',
      smtp_banner: 'SMTP server identification banner',
      rdp_banner: 'RDP connection banner',
      anonymous_login: 'Allow anonymous FTP access',
      ssl_enabled: 'Enable SSL/TLS encryption',
      auth_required: 'Require authentication',
      relay_allowed: 'Allow email relay (SMTP)',
      max_connections: 'Maximum concurrent connections',
      session_timeout: 'Session timeout in seconds',
      max_message_size: 'Maximum message size in bytes',
      database_names: 'List of fake database names (one per line)',
      fake_files: 'List of fake files to display (one per line)',
      fake_users: 'List of fake user accounts (one per line)',
      user_accounts: 'List of user accounts (one per line)'
    };
    return descriptions[field] || 'Configuration option';
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <HeaderContent>
            <div>
              <ModalTitle>Configure Honeypot</ModalTitle>
              <ModalSubtitle>{honeypot.name} ({honeypotType?.name || honeypot.type})</ModalSubtitle>
            </div>
            <CloseButton onClick={onClose}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </CloseButton>
          </HeaderContent>
        </ModalHeader>

        <ModalContent>
          <ConfigSection>
            {honeypotType?.config_fields?.map(field => (
              <ConfigField key={field}>
                <Label>
                  {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
                {renderConfigField(field)}
                <FieldDescription>{getFieldDescription(field)}</FieldDescription>
              </ConfigField>
            )) || (
              <EmptyState>
                No configuration options available for this honeypot type.
              </EmptyState>
            )}
          </ConfigSection>

          <ButtonSection>
            <CancelButton onClick={onClose}>
              Cancel
            </CancelButton>
            <SaveButton
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </SaveButton>
          </ButtonSection>
        </ModalContent>
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
  max-width: 48rem;
  width: 100%;
  margin: 1rem;
  max-height: 100vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  position: sticky;
  top: 0;
  background: white;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

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

const ModalContent = styled.div`
  padding: 1.5rem;
`;

const ConfigSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ConfigField = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
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

const FieldDescription = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
`;

const ButtonSection = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1.5rem;
`;

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  color: #374151;
  background: white;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
  }
`;

const SaveButton = styled.button`
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
