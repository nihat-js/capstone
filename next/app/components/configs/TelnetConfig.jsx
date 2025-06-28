'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { ArrowLeft, Save, Monitor } from 'lucide-react'

const TELNET_TEMPLATE_CONFIGS = {
  'Basic Telnet': {
    port: 2323,
    banner: 'Welcome to Telnet Server',
    username: 'admin',
    password: 'admin',
    sessionTimeout: 300
  },
  'Router Telnet': {
    port: 23,
    banner: 'Cisco Router Login',
    username: 'cisco',
    password: 'cisco',
    sessionTimeout: 600
  },
  'Custom': {
    port: 2323,
    banner: 'Telnet Server Ready',
    username: 'user',
    password: 'password',
    sessionTimeout: 300
  }
}

export function TelnetConfig({ template, service, onSave, onBack }) {
  const [config, setConfig] = useState({
    name: `${template.name} Telnet Honeypot`,
    ...TELNET_TEMPLATE_CONFIGS[template.name]
  })

  const handleSave = () => {
    onSave(config)
  }

  return (
    <>
      <Header>
        <BackButton onClick={onBack}>
          <ArrowLeft size={20} />
        </BackButton>
        <HeaderContent>
          <ServiceIcon>
            <Monitor size={24} />
          </ServiceIcon>
          <div>
            <Title>Telnet Honeypot Configuration</Title>
            <Subtitle>{template.name}</Subtitle>
          </div>
        </HeaderContent>
      </Header>

      <Content>
        <ConfigSection>
          <SectionTitle>Basic Settings</SectionTitle>
          
          <ConfigField>
            <Label>Honeypot Name</Label>
            <Input
              type="text"
              value={config.name}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
            />
          </ConfigField>

          <ConfigField>
            <Label>Port</Label>
            <Input
              type="number"
              value={config.port}
              onChange={(e) => setConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
            />
            <FieldDescription>Port to listen on (default: 2323)</FieldDescription>
          </ConfigField>
        </ConfigSection>

        <ConfigSection>
          <SectionTitle>Telnet Configuration</SectionTitle>
          
          <ConfigField>
            <Label>Login Banner</Label>
            <TextArea
              value={config.banner}
              onChange={(e) => setConfig(prev => ({ ...prev, banner: e.target.value }))}
              rows={2}
            />
            <FieldDescription>Banner displayed before login prompt</FieldDescription>
          </ConfigField>

          <ConfigField>
            <Label>Username</Label>
            <Input
              type="text"
              value={config.username}
              onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
            />
            <FieldDescription>Default username for login attempts</FieldDescription>
          </ConfigField>

          <ConfigField>
            <Label>Password</Label>
            <Input
              type="password"
              value={config.password}
              onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
            />
            <FieldDescription>Default password for login attempts</FieldDescription>
          </ConfigField>

          <ConfigField>
            <Label>Session Timeout (seconds)</Label>
            <Input
              type="number"
              value={config.sessionTimeout}
              onChange={(e) => setConfig(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
            />
            <FieldDescription>How long to keep sessions active</FieldDescription>
          </ConfigField>
        </ConfigSection>

        <ButtonSection>
          <CancelButton onClick={onBack}>Back</CancelButton>
          <SaveButton onClick={handleSave}>
            <Save size={16} />
            Deploy Telnet Honeypot
          </SaveButton>
        </ButtonSection>
      </Content>
    </>
  )
}

// Styled Components (same as others)
const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
`

const BackButton = styled.button`
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

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const ServiceIcon = styled.div`
  width: 3rem;
  height: 3rem;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
`

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
`

const Content = styled.div`
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
`

const ConfigSection = styled.div`
  margin-bottom: 2rem;
`

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
`

const ConfigField = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`

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
`

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
`

const FieldDescription = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`

const ButtonSection = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1.5rem;
`

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
`

const SaveButton = styled.button`
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #2563eb;
  }
`
