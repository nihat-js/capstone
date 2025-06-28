'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { ArrowLeft, Save, Terminal, Plus, Trash2, Upload, FileText } from 'lucide-react'

const SSH_TEMPLATE_CONFIGS = {
  'Basic SSH': {
    port: 2222,
    banner: 'SSH-2.0-OpenSSH_7.4',
    credentials: [
      { username: 'admin', password: 'password', sudoAccess: false },
      { username: 'user', password: '123456', sudoAccess: false }
    ],
    maxAuthAttempts: 3,
    allowRootLogin: false,
    customFiles: [
      { path: '/etc/passwd.bak', source: 'builtin', content: '' },
      { path: '/var/logs/archive/', source: 'builtin', content: '' }
    ],
    motd: 'Welcome to Ubuntu 20.04.3 LTS (GNU/Linux 5.4.0-88-generic x86_64)',
    issueNet: 'Ubuntu 20.04.3 LTS'
  },
  'Hardened SSH': {
    port: 2222,
    banner: 'SSH-2.0-OpenSSH_8.0',
    credentials: [
      { username: 'root', password: 'toor', sudoAccess: true },
      { username: 'admin', password: 'P@ssw0rd123', sudoAccess: true }
    ],
    maxAuthAttempts: 1,
    allowRootLogin: true,
    customFiles: [
      { path: '/home/admin/shadow_old.txt', source: 'builtin', content: '' }
    ],
    motd: 'This is a secure system. All activities are monitored.',
    issueNet: 'Authorized users only'
  },
  'Vulnerable SSH': {
    port: 22,
    banner: 'SSH-1.99-OpenSSH_3.4',
    credentials: [
      { username: 'admin', password: 'admin', sudoAccess: true },
      { username: 'guest', password: 'guest', sudoAccess: false },
      { username: 'test', password: 'test', sudoAccess: false },
      { username: 'root', password: 'root', sudoAccess: true }
    ],
    maxAuthAttempts: 10,
    allowRootLogin: true,
    customFiles: [
      { path: '/home/finance/reports_2024.xlsx', source: 'builtin', content: '' },
      { path: '/var/logs/archive/', source: 'builtin', content: '' },
      { path: '/tmp/leaked_creds.csv', source: 'builtin', content: '' }
    ],
    motd: 'Welcome! Please change default passwords.',
    issueNet: 'Legacy system - handle with care'
  },
  'Custom': {
    port: 2222,
    banner: 'SSH-2.0-OpenSSH_7.4',
    credentials: [
      { username: 'admin', password: 'password', sudoAccess: false }
    ],
    maxAuthAttempts: 3,
    allowRootLogin: false,
    customFiles: [],
    motd: 'Welcome to the system',
    issueNet: 'Custom SSH Server'
  }
}

export function SSHConfig({ template, service, onSave, onBack }) {
  const [selectedTemplate, setSelectedTemplate] = useState(template.name)
  const [config, setConfig] = useState({
    name: `${template.name} SSH Honeypot`,
    ...SSH_TEMPLATE_CONFIGS[template.name]
  })

  const handleTemplateChange = (templateName) => {
    setSelectedTemplate(templateName)
    setConfig({
      name: `${templateName} SSH Honeypot`,
      ...SSH_TEMPLATE_CONFIGS[templateName]
    })
  }

  const handleSave = () => {
    onSave(config)
  }

  const getTemplateDescription = (templateName) => {
    const descriptions = {
      'Basic SSH': 'Simple SSH honeypot with default settings',
      'Hardened SSH': 'SSH with strict authentication logging',
      'Vulnerable SSH': 'Older SSH version simulation',
      'Custom': 'Create your own custom setup'
    }
    return descriptions[templateName] || ''
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
          <HeaderInfo>
            <Title>SSH Honeypot Configuration</Title>
            <Subtitle>Choose a configuration template to get started</Subtitle>
          </HeaderInfo>
        </HeaderContent>
      </Header>

      <TemplateSection>
        <TemplateGrid>
          {Object.keys(SSH_TEMPLATE_CONFIGS).filter(name => name !== 'Custom').map(templateName => (
            <TemplateButton
              key={templateName}
              isSelected={selectedTemplate === templateName}
              onClick={() => handleTemplateChange(templateName)}
            >
              <TemplateButtonIcon>
                <Terminal size={20} />
              </TemplateButtonIcon>
              <TemplateButtonContent>
                <TemplateButtonTitle>{templateName}</TemplateButtonTitle>
                <TemplateButtonDescription>{getTemplateDescription(templateName)}</TemplateButtonDescription>
              </TemplateButtonContent>
            </TemplateButton>
          ))}
          <CustomTemplateButton
            isSelected={selectedTemplate === 'Custom'}
            onClick={() => handleTemplateChange('Custom')}
          >
            <CustomTemplateIcon>
              <Plus size={20} />
            </CustomTemplateIcon>
            <TemplateButtonContent>
              <TemplateButtonTitle>Custom Configuration</TemplateButtonTitle>
              <TemplateButtonDescription>Create your own custom setup</TemplateButtonDescription>
            </TemplateButtonContent>
          </CustomTemplateButton>
        </TemplateGrid>
      </TemplateSection>

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

        <ConfigSection>
          <SectionTitle>User Credentials</SectionTitle>
          <FieldDescription style={{ marginBottom: '1rem' }}>
            Configure multiple username/password combinations for the honeypot
          </FieldDescription>
          
          {config.credentials.map((cred, index) => (
            <CredentialCard key={index}>
              <CredentialRow>
                <CredentialField>
                  <Label>Username</Label>
                  <Input
                    type="text"
                    value={cred.username}
                    onChange={(e) => {
                      const newCreds = [...config.credentials]
                      newCreds[index].username = e.target.value
                      setConfig(prev => ({ ...prev, credentials: newCreds }))
                    }}
                  />
                </CredentialField>
                <CredentialField>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={cred.password}
                    onChange={(e) => {
                      const newCreds = [...config.credentials]
                      newCreds[index].password = e.target.value
                      setConfig(prev => ({ ...prev, credentials: newCreds }))
                    }}
                  />
                </CredentialField>
                <CredentialActions>
                  <CheckboxContainer>
                    <Checkbox
                      type="checkbox"
                      checked={cred.sudoAccess}
                      onChange={(e) => {
                        const newCreds = [...config.credentials]
                        newCreds[index].sudoAccess = e.target.checked
                        setConfig(prev => ({ ...prev, credentials: newCreds }))
                      }}
                    />
                    <CheckboxLabel>Sudo</CheckboxLabel>
                  </CheckboxContainer>
                  {config.credentials.length > 1 && (
                    <RemoveButton
                      onClick={() => {
                        const newCreds = config.credentials.filter((_, i) => i !== index)
                        setConfig(prev => ({ ...prev, credentials: newCreds }))
                      }}
                    >
                      <Trash2 size={16} />
                    </RemoveButton>
                  )}
                </CredentialActions>
              </CredentialRow>
            </CredentialCard>
          ))}
          
          <AddButton
            onClick={() => {
              const newCreds = [...config.credentials, { username: '', password: '', sudoAccess: false }]
              setConfig(prev => ({ ...prev, credentials: newCreds }))
            }}
          >
            <Plus size={16} />
            Add Credential
          </AddButton>
        </ConfigSection>

        <ConfigSection>
          <SectionTitle>Custom Files</SectionTitle>
          <FieldDescription style={{ marginBottom: '1rem' }}>
            Add files that will be available in the honeypot filesystem
          </FieldDescription>
          
          {config.customFiles.map((file, index) => (
            <FileCard key={index}>
              <FileRow>
                <FileField>
                  <Label>File Path</Label>
                  <Input
                    type="text"
                    placeholder="/path/to/file"
                    value={file.path}
                    onChange={(e) => {
                      const newFiles = [...config.customFiles]
                      newFiles[index].path = e.target.value
                      setConfig(prev => ({ ...prev, customFiles: newFiles }))
                    }}
                  />
                </FileField>
                <FileSourceField>
                  <Label>Source</Label>
                  <Select
                    value={file.source}
                    onChange={(e) => {
                      const newFiles = [...config.customFiles]
                      newFiles[index].source = e.target.value
                      setConfig(prev => ({ ...prev, customFiles: newFiles }))
                    }}
                  >
                    <option value="builtin">Built-in</option>
                    <option value="upload">Upload</option>
                  </Select>
                </FileSourceField>
                <FileActions>
                  {file.source === 'upload' && (
                    <UploadButton>
                      <Upload size={16} />
                      Upload
                    </UploadButton>
                  )}
                  <RemoveButton
                    onClick={() => {
                      const newFiles = config.customFiles.filter((_, i) => i !== index)
                      setConfig(prev => ({ ...prev, customFiles: newFiles }))
                    }}
                  >
                    <Trash2 size={16} />
                  </RemoveButton>
                </FileActions>
              </FileRow>
            </FileCard>
          ))}
          
          <AddButton
            onClick={() => {
              const newFiles = [...config.customFiles, { path: '', source: 'builtin', content: '' }]
              setConfig(prev => ({ ...prev, customFiles: newFiles }))
            }}
          >
            <Plus size={16} />
            Add File
          </AddButton>

          <PresetFilesSection>
            <Label>Quick Add Preset Files</Label>
            <PresetButtons>
              <PresetButton
                onClick={() => {
                  const presetFiles = [
                    { path: '/etc/passwd.bak', source: 'builtin', content: '' },
                    { path: '/var/logs/archive/', source: 'builtin', content: '' },
                    { path: '/home/finance/reports_2024.xlsx', source: 'builtin', content: '' }
                  ]
                  setConfig(prev => ({ ...prev, customFiles: [...prev.customFiles, ...presetFiles] }))
                }}
              >
                System Files
              </PresetButton>
              <PresetButton
                onClick={() => {
                  const presetFiles = [
                    { path: '/tmp/shadow_old.txt', source: 'builtin', content: '' },
                    { path: '/home/user/leaked_creds.csv', source: 'builtin', content: '' }
                  ]
                  setConfig(prev => ({ ...prev, customFiles: [...prev.customFiles, ...presetFiles] }))
                }}
              >
                Password Dumps
              </PresetButton>
            </PresetButtons>
          </PresetFilesSection>
        </ConfigSection>

        <ConfigSection>
          <SectionTitle>System Messages</SectionTitle>
          
          <ConfigField>
            <Label>MOTD (Message of the Day)</Label>
            <TextArea
              placeholder="Welcome message displayed after login..."
              value={config.motd}
              onChange={(e) => setConfig(prev => ({ ...prev, motd: e.target.value }))}
              rows={3}
            />
            <FieldDescription>Message shown to users after successful login</FieldDescription>
          </ConfigField>

          <ConfigField>
            <Label>Issue.net (Login Banner)</Label>
            <TextArea
              placeholder="Banner displayed before login..."
              value={config.issueNet}
              onChange={(e) => setConfig(prev => ({ ...prev, issueNet: e.target.value }))}
              rows={2}
            />
            <FieldDescription>Banner shown before authentication prompt</FieldDescription>
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

// New styled components for enhanced configuration
const CredentialCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f9fafb;
`

const CredentialRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
`

const CredentialField = styled.div`
  display: flex;
  flex-direction: column;
`

const CredentialActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const FileCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f9fafb;
`

const FileRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 1rem;
  align-items: end;
`

const FileField = styled.div`
  display: flex;
  flex-direction: column;
`

const FileSourceField = styled.div`
  display: flex;
  flex-direction: column;
`

const FileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px dashed #d1d5db;
  background: white;
  color: #6b7280;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #f9fafb;
  }
`

const RemoveButton = styled.button`
  padding: 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #dc2626;
  }
`

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  background: white;

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
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const PresetFilesSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`

const PresetButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`

const PresetButton = styled.button`
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #5856eb;
  }
`

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`

const TemplateSection = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`

const TemplateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.isSelected ? '#3b82f6' : 'white'};
  color: ${props => props.isSelected ? 'white' : '#374151'};
  border: 2px solid ${props => props.isSelected ? '#3b82f6' : '#e5e7eb'};
  border-radius: 8px;
  text-align: left;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #3b82f6;
    ${props => !props.isSelected && `
      background: #f8fafc;
      transform: translateY(-1px);
    `}
  }
`

const CustomTemplateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.isSelected ? '#6366f1' : 'white'};
  color: ${props => props.isSelected ? 'white' : '#374151'};
  border: 2px dashed ${props => props.isSelected ? '#6366f1' : '#d1d5db'};
  border-radius: 8px;
  text-align: left;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #6366f1;
    ${props => !props.isSelected && `
      background: #f8fafc;
      transform: translateY(-1px);
    `}
  }
`

const TemplateButtonIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.isSelected ? 'rgba(255,255,255,0.2)' : '#f3f4f6'};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const CustomTemplateIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.isSelected ? 'rgba(255,255,255,0.2)' : '#f3f4f6'};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const TemplateButtonContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const TemplateButtonTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`

const TemplateButtonDescription = styled.p`
  font-size: 0.875rem;
  opacity: 0.8;
  margin: 0;
  line-height: 1.3;
`
