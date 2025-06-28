'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { ArrowLeft, Save, Terminal } from 'lucide-react'

const SSH_TEMPLATE_CONFIGS = {
  'Basic SSH': {
    port: 2222,
    banner: 'SSH-2.0-OpenSSH_7.4',
    username: 'admin',
    password: 'password',
    maxAuthAttempts: 3,
    allowRootLogin: false
  },
  'Hardened SSH': {
    port: 2222,
    banner: 'SSH-2.0-OpenSSH_8.0',
    username: 'root',
    password: 'toor',
    maxAuthAttempts: 1,
    allowRootLogin: true
  },
  'Vulnerable SSH': {
    port: 22,
    banner: 'SSH-1.99-OpenSSH_3.4',
    username: 'admin',
    password: 'admin',
    maxAuthAttempts: 10,
    allowRootLogin: true
  },
  'Custom': {
    port: 2222,
    banner: 'SSH-2.0-OpenSSH_7.4',
    username: 'admin',
    password: 'password',
    maxAuthAttempts: 3,
    allowRootLogin: false
  }
}

export function SSHConfig({ template, service, onSave, onBack }) {
  const [config, setConfig] = useState({
    name: `${template.name} SSH Honeypot`,
    ...SSH_TEMPLATE_CONFIGS[template.name]
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
            <Terminal size={24} />
          </ServiceIcon>
          <div>
            <Title>SSH Honeypot Configuration</Title>
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
            <FieldDescription>Port to listen on (default: 2222)</FieldDescription>
          </ConfigField>
        </ConfigSection>

        <ConfigSection>
          <SectionTitle>SSH Configuration</SectionTitle>
          
          <ConfigField>
            <Label>SSH Banner</Label>
            <Input
              type="text"
              value={config.banner}
              onChange={(e) => setConfig(prev => ({ ...prev, banner: e.target.value }))}
            />
            <FieldDescription>SSH version banner displayed to clients</FieldDescription>
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
            <Label>Max Auth Attempts</Label>
            <Input
              type="number"
              value={config.maxAuthAttempts}
              onChange={(e) => setConfig(prev => ({ ...prev, maxAuthAttempts: parseInt(e.target.value) }))}
            />
            <FieldDescription>Maximum authentication attempts before disconnection</FieldDescription>
          </ConfigField>

          <ConfigField>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={config.allowRootLogin}
                onChange={(e) => setConfig(prev => ({ ...prev, allowRootLogin: e.target.checked }))}
              />
              <CheckboxLabel>Allow Root Login</CheckboxLabel>
            </CheckboxContainer>
            <FieldDescription>Allow root user login attempts</FieldDescription>
          </ConfigField>
        </ConfigSection>

        <ButtonSection>
          <CancelButton onClick={onBack}>Back</CancelButton>
          <SaveButton onClick={handleSave}>
            <Save size={16} />
            Deploy SSH Honeypot
          </SaveButton>
        </ButtonSection>
      </Content>
    </>
  )
}

// Styled Components
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

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`

const Checkbox = styled.input`
  border-radius: 4px;
  border: 1px solid #d1d5db;
  color: #3b82f6;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  &:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.1);
  }
`

const CheckboxLabel = styled.span`
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
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
