'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { X, Terminal, Globe, Database, Server } from 'lucide-react'

const getServiceIcon = (type) => {
  switch (type) {
    case 'ssh': return <Terminal size={20} />
    case 'mysql': return <Database size={20} />
    case 'postgres': return <Database size={20} />
    case 'redis': return <Server size={20} />
    case 'phpmyadmin': return <Globe size={20} />
    default: return <Server size={20} />
  }
}

export function ConfigurationModal({ service, onClose, onSave }) {
  const [config, setConfig] = useState({
    name: service.type,
    port: getDefaultPort(service.type)
  })
  const [isSaving, setIsSaving] = useState(false)

  function getDefaultPort(serviceType) {
    switch (serviceType) {
      case 'ssh': return 2222
      case 'mysql': return 3306
      case 'postgres': return 5432
      case 'redis': return 6379
      case 'phpmyadmin': return 8080
      default: return 8000
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(config)
    } catch (error) {
      console.error('Failed to save configuration:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderContent>
            <ServiceIcon>
              {getServiceIcon(service.type)}
            </ServiceIcon>
            <div>
              <Title>Configure {service.name}</Title>
              <Subtitle>{service.description}</Subtitle>
            </div>
          </HeaderContent>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          <ConfigSection>
            <Label>Port</Label>
            <Input
              type="number"
              value={config.port}
              onChange={(e) => updateConfig('port', parseInt(e.target.value))}
              placeholder="Enter port number"
            />
            <Description>Port number for the {service.name} service</Description>
          </ConfigSection>

          <ButtonGroup>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
            <SaveButton 
              onClick={handleSave} 
              disabled={!config.port || isSaving}
            >
              {isSaving ? 'Creating...' : 'Create Honeypot'}
            </SaveButton>
          </ButtonGroup>
        </Content>
      </ModalContainer>
    </ModalOverlay>
  )
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
`

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const ServiceIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`

const Content = styled.div`
  padding: 1.5rem;
`

const ConfigSection = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  color: #111827;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`

const Description = styled.p`
  color: #6b7280;
  font-size: 0.75rem;
  margin: 0.5rem 0 0 0;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 2rem;
`

const CancelButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`

const SaveButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
