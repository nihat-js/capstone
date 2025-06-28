'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { X, Plus, Terminal, Globe, Database, Monitor, Wifi, Lock, Server } from 'lucide-react'

// Service configuration components
import { SSHConfig } from './configs/SSHConfig'
import { HTTPConfig } from './configs/HTTPConfig'
import { FTPConfig } from './configs/FTPConfig'
import { TelnetConfig } from './configs/TelnetConfig'
import { RDPConfig } from './configs/RDPConfig'
import { MySQLConfig } from './configs/MySQLConfig'

const getServiceIcon = (type) => {
  switch (type) {
    case 'ssh': return <Terminal size={20} />
    case 'http': return <Globe size={20} />
    case 'ftp': return <Database size={20} />
    case 'telnet': return <Monitor size={20} />
    case 'rdp': return <Wifi size={20} />
    case 'mysql': return <Lock size={20} />
    default: return <Server size={20} />
  }
}

const SERVICE_TEMPLATES = {
  ssh: [
    { name: 'Basic SSH', description: 'Simple SSH honeypot with default settings' },
    { name: 'Hardened SSH', description: 'SSH with strict authentication logging' },
    { name: 'Vulnerable SSH', description: 'Older SSH version simulation' }
  ],
  http: [
    { name: 'Apache Server', description: 'Apache web server simulation' },
    { name: 'Nginx Server', description: 'Nginx web server simulation' },
    { name: 'IIS Server', description: 'Windows IIS server simulation' }
  ],
  ftp: [
    { name: 'Anonymous FTP', description: 'FTP server allowing anonymous access' },
    { name: 'Secure FTP', description: 'FTP with authentication required' },
    { name: 'Legacy FTP', description: 'Older FTP server simulation' }
  ],
  telnet: [
    { name: 'Basic Telnet', description: 'Simple telnet service' },
    { name: 'Router Telnet', description: 'Network device telnet simulation' }
  ],
  rdp: [
    { name: 'Windows RDP', description: 'Windows Remote Desktop simulation' },
    { name: 'Server RDP', description: 'Windows Server RDP simulation' }
  ],
  mysql: [
    { name: 'MySQL 5.7', description: 'MySQL 5.7 database simulation' },
    { name: 'MySQL 8.0', description: 'MySQL 8.0 database simulation' }
  ]
}

export function ConfigurationModal({ service, onClose, onSave }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showConfig, setShowConfig] = useState(false)

  const templates = SERVICE_TEMPLATES[service.type] || []

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setShowConfig(true)
  }

  const handleConfigSave = (config) => {
    onSave({ ...config, template: selectedTemplate })
    onClose()
  }

  const handleBack = () => {
    setShowConfig(false)
    setSelectedTemplate(null)
  }

  const renderConfigComponent = () => {
    if (!selectedTemplate) return null

    const configProps = {
      template: selectedTemplate,
      service,
      onSave: handleConfigSave,
      onBack: handleBack
    }

    switch (service.type) {
      case 'ssh': return <SSHConfig {...configProps} />
      case 'http': return <HTTPConfig {...configProps} />
      case 'ftp': return <FTPConfig {...configProps} />
      case 'telnet': return <TelnetConfig {...configProps} />
      case 'rdp': return <RDPConfig {...configProps} />
      case 'mysql': return <MySQLConfig {...configProps} />
      default: return <div>Configuration not available</div>
    }
  }

  if (showConfig) {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          {renderConfigComponent()}
        </ModalContainer>
      </ModalOverlay>
    )
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderContent>
            <ServiceIconWrapper>
              {getServiceIcon(service.type)}
            </ServiceIconWrapper>
            <div>
              <ModalTitle>{service.name} Honeypot</ModalTitle>
              <ModalSubtitle>Choose a configuration template</ModalSubtitle>
            </div>
          </HeaderContent>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          <TemplatesGrid>
            {templates.map((template, index) => (
              <TemplateCard key={index} onClick={() => handleTemplateSelect(template)}>
                <TemplateIcon>
                  {getServiceIcon(service.type)}
                </TemplateIcon>
                <TemplateInfo>
                  <TemplateName>{template.name}</TemplateName>
                  <TemplateDescription>{template.description}</TemplateDescription>
                </TemplateInfo>
              </TemplateCard>
            ))}
            <CustomTemplateCard onClick={() => handleTemplateSelect({ name: 'Custom', description: 'Create custom configuration' })}>
              <TemplateIcon>
                <Plus size={20} />
              </TemplateIcon>
              <TemplateInfo>
                <TemplateName>Custom Configuration</TemplateName>
                <TemplateDescription>Create your own custom setup</TemplateDescription>
              </TemplateInfo>
            </CustomTemplateCard>
          </TemplatesGrid>
        </ModalContent>
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
  max-width: 48rem;
  width: 100%;
  margin: 1rem;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const ServiceIconWrapper = styled.div`
  width: 3rem;
  height: 3rem;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
`

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`

const ModalSubtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
`

const CloseButton = styled.button`
  color: #6b7280;
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: #374151;
    background: #f9fafb;
  }
`

const ModalContent = styled.div`
  padding: 1.5rem;
`

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
`

const TemplateCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;

  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const CustomTemplateCard = styled(TemplateCard)`
  border-style: dashed;
  border-color: #9ca3af;
  
  &:hover {
    border-color: #3b82f6;
    border-style: solid;
  }
`

const TemplateIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  background: #f3f4f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
`

const TemplateInfo = styled.div`
  flex: 1;
`

const TemplateName = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
`

const TemplateDescription = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
`
