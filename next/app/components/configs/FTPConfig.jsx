'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { ArrowLeft, Save, Database, Plus, Trash2, Upload, Folder, User } from 'lucide-react'

const FTP_TEMPLATE_CONFIGS = {
  'Anonymous FTP': {
    port: 2121,
    ftpBanner: '220 Welcome to Anonymous FTP Server - Please login with USER anonymous',
    allowAnonymous: true,
    maxConnections: 50,
    sessionTimeout: 300,
    passiveMode: true,
    passivePortRange: '50000-51000',
    enableLogging: true,
    userAccounts: [
      { username: 'anonymous', password: '', permissions: 'read', homeDir: '/pub' },
      { username: 'ftp', password: '', permissions: 'read', homeDir: '/pub' }
    ],
    virtualDirectories: [
      { path: '/pub', description: 'Public files' },
      { path: '/incoming', description: 'Upload directory' }
    ],
    fileList: [
      { path: '/pub/readme.txt', size: '1.2 KB', type: 'file' },
      { path: '/pub/software/', size: '-', type: 'directory' },
      { path: '/incoming/', size: '-', type: 'directory' }
    ]
  },
  'Secure FTP': {
    port: 2121,
    ftpBanner: '220 Secure FTP Server Ready - Authentication Required',
    allowAnonymous: false,
    maxConnections: 10,
    sessionTimeout: 600,
    passiveMode: true,
    passivePortRange: '60000-61000',
    enableLogging: true,
    userAccounts: [
      { username: 'admin', password: 'secure123', permissions: 'full', homeDir: '/home/admin' },
      { username: 'user', password: 'user123', permissions: 'read', homeDir: '/home/user' }
    ],
    virtualDirectories: [
      { path: '/home/admin', description: 'Administrator files' },
      { path: '/home/user', description: 'User directory' },
      { path: '/shared', description: 'Shared files' }
    ],
    fileList: [
      { path: '/home/admin/config.ini', size: '0.8 KB', type: 'file' },
      { path: '/home/admin/logs/', size: '-', type: 'directory' },
      { path: '/shared/documents/', size: '-', type: 'directory' }
    ]
  },
  'Vulnerable FTP': {
    port: 21,
    ftpBanner: '220 ProFTPD 1.2.10 Server (ProFTPD Default Installation)',
    allowAnonymous: true,
    maxConnections: 100,
    sessionTimeout: 120,
    passiveMode: false,
    passivePortRange: '1024-65535',
    enableLogging: false,
    userAccounts: [
      { username: 'anonymous', password: '', permissions: 'full', homeDir: '/' },
      { username: 'admin', password: 'admin', permissions: 'full', homeDir: '/admin' },
      { username: 'test', password: 'test', permissions: 'write', homeDir: '/test' },
      { username: 'guest', password: 'guest', permissions: 'read', homeDir: '/guest' }
    ],
    virtualDirectories: [
      { path: '/', description: 'Root directory' },
      { path: '/admin', description: 'Admin files' },
      { path: '/backup', description: 'Backup files' },
      { path: '/temp', description: 'Temporary files' }
    ],
    fileList: [
      { path: '/etc/passwd', size: '2.1 KB', type: 'file' },
      { path: '/backup/database.sql', size: '15.7 MB', type: 'file' },
      { path: '/admin/passwords.txt', size: '0.9 KB', type: 'file' },
      { path: '/temp/', size: '-', type: 'directory' }
    ]
  },
  'Custom': {
    port: 2121,
    ftpBanner: '220 FTP Server Ready',
    allowAnonymous: true,
    maxConnections: 25,
    sessionTimeout: 300,
    passiveMode: true,
    passivePortRange: '50000-51000',
    enableLogging: true,
    userAccounts: [
      { username: 'admin', password: 'password', permissions: 'full', homeDir: '/home/admin' }
    ],
    virtualDirectories: [
      { path: '/home/admin', description: 'Administrator directory' }
    ],
    fileList: []
  }
}

export function FTPConfig({ template, service, onSave, onBack }) {
  const [selectedTemplate, setSelectedTemplate] = useState(template.name)
  const [config, setConfig] = useState({
    name: `${template.name} FTP Honeypot`,
    ...FTP_TEMPLATE_CONFIGS[template.name]
  })

  const handleTemplateChange = (templateName) => {
    setSelectedTemplate(templateName)
    setConfig({
      name: `${templateName} FTP Honeypot`,
      ...FTP_TEMPLATE_CONFIGS[templateName]
    })
  }

  const handleSave = () => {
    onSave(config)
  }

  const getTemplateDescription = (templateName) => {
    const descriptions = {
      'Anonymous FTP': 'Public FTP server allowing anonymous access',
      'Secure FTP': 'FTP with authentication and restricted access',
      'Vulnerable FTP': 'Legacy FTP server with security weaknesses',
      'Custom': 'Create your own custom FTP setup'
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
            <Database size={24} />
          </ServiceIcon>
          <HeaderInfo>
            <Title>FTP Honeypot Configuration</Title>
            <Subtitle>Choose a configuration template to get started</Subtitle>
          </HeaderInfo>
        </HeaderContent>
      </Header>

      <TemplateSection>
        <TemplateGrid>
          {Object.keys(FTP_TEMPLATE_CONFIGS).filter(name => name !== 'Custom').map(templateName => (
            <TemplateButton
              key={templateName}
              isSelected={selectedTemplate === templateName}
              onClick={() => handleTemplateChange(templateName)}
            >
              <TemplateButtonIcon>
                <Database size={20} />
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
              <TemplateButtonDescription>Create your own custom FTP setup</TemplateButtonDescription>
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
            <FieldDescription>Port to listen on (default: 2121, standard: 21)</FieldDescription>
          </ConfigField>

          <ConfigField>
            <Label>FTP Banner</Label>
            <TextArea
              value={config.ftpBanner}
              onChange={(e) => setConfig(prev => ({ ...prev, ftpBanner: e.target.value }))}
              rows={2}
            />
            <FieldDescription>Welcome message displayed to connecting clients</FieldDescription>
          </ConfigField>
        </ConfigSection>

        <ConfigSection>
          <SectionTitle>Connection Settings</SectionTitle>
          
          <ConfigField>
            <Label>Max Connections</Label>
            <Input
              type="number"
              value={config.maxConnections}
              onChange={(e) => setConfig(prev => ({ ...prev, maxConnections: parseInt(e.target.value) }))}
            />
            <FieldDescription>Maximum number of concurrent connections</FieldDescription>
          </ConfigField>

          <ConfigField>
            <Label>Session Timeout (seconds)</Label>
            <Input
              type="number"
              value={config.sessionTimeout}
              onChange={(e) => setConfig(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
            />
            <FieldDescription>How long to keep idle connections open</FieldDescription>
          </ConfigField>

          <ConfigField>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={config.allowAnonymous}
                onChange={(e) => setConfig(prev => ({ ...prev, allowAnonymous: e.target.checked }))}
              />
              <CheckboxLabel>Allow Anonymous Access</CheckboxLabel>
            </CheckboxContainer>
            <FieldDescription>Allow users to connect without authentication</FieldDescription>
          </ConfigField>

          <ConfigField>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={config.passiveMode}
                onChange={(e) => setConfig(prev => ({ ...prev, passiveMode: e.target.checked }))}
              />
              <CheckboxLabel>Enable Passive Mode</CheckboxLabel>
            </CheckboxContainer>
            <FieldDescription>Support passive FTP connections</FieldDescription>
          </ConfigField>

          {config.passiveMode && (
            <ConfigField>
              <Label>Passive Port Range</Label>
              <Input
                type="text"
                value={config.passivePortRange}
                onChange={(e) => setConfig(prev => ({ ...prev, passivePortRange: e.target.value }))}
                placeholder="50000-51000"
              />
              <FieldDescription>Port range for passive mode connections</FieldDescription>
            </ConfigField>
          )}

          <ConfigField>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={config.enableLogging}
                onChange={(e) => setConfig(prev => ({ ...prev, enableLogging: e.target.checked }))}
              />
              <CheckboxLabel>Enable Connection Logging</CheckboxLabel>
            </CheckboxContainer>
            <FieldDescription>Log all FTP commands and responses</FieldDescription>
          </ConfigField>
        </ConfigSection>

        <ConfigSection>
          <SectionTitle>User Accounts</SectionTitle>
          <FieldDescription style={{ marginBottom: '1rem' }}>
            Configure FTP user accounts and their permissions
          </FieldDescription>
          
          {config.userAccounts.map((account, index) => (
            <UserCard key={index}>
              <UserRow>
                <UserField>
                  <Label>Username</Label>
                  <Input
                    type="text"
                    value={account.username}
                    onChange={(e) => {
                      const newAccounts = [...config.userAccounts]
                      newAccounts[index].username = e.target.value
                      setConfig(prev => ({ ...prev, userAccounts: newAccounts }))
                    }}
                  />
                </UserField>
                <UserField>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={account.password}
                    onChange={(e) => {
                      const newAccounts = [...config.userAccounts]
                      newAccounts[index].password = e.target.value
                      setConfig(prev => ({ ...prev, userAccounts: newAccounts }))
                    }}
                    placeholder={account.username === 'anonymous' ? 'No password required' : 'Enter password'}
                    disabled={account.username === 'anonymous'}
                  />
                </UserField>
                <UserField>
                  <Label>Home Directory</Label>
                  <Input
                    type="text"
                    value={account.homeDir}
                    onChange={(e) => {
                      const newAccounts = [...config.userAccounts]
                      newAccounts[index].homeDir = e.target.value
                      setConfig(prev => ({ ...prev, userAccounts: newAccounts }))
                    }}
                  />
                </UserField>
                <UserField>
                  <Label>Permissions</Label>
                  <Select
                    value={account.permissions}
                    onChange={(e) => {
                      const newAccounts = [...config.userAccounts]
                      newAccounts[index].permissions = e.target.value
                      setConfig(prev => ({ ...prev, userAccounts: newAccounts }))
                    }}
                  >
                    <option value="read">Read Only</option>
                    <option value="write">Read + Write</option>
                    <option value="full">Full Access</option>
                  </Select>
                </UserField>
                <UserActions>
                  {config.userAccounts.length > 1 && (
                    <RemoveButton
                      onClick={() => {
                        const newAccounts = config.userAccounts.filter((_, i) => i !== index)
                        setConfig(prev => ({ ...prev, userAccounts: newAccounts }))
                      }}
                    >
                      <Trash2 size={16} />
                    </RemoveButton>
                  )}
                </UserActions>
              </UserRow>
            </UserCard>
          ))}
          
          <AddButton
            onClick={() => {
              const newAccounts = [...config.userAccounts, { username: '', password: '', permissions: 'read', homeDir: '/home/user' }]
              setConfig(prev => ({ ...prev, userAccounts: newAccounts }))
            }}
          >
            <User size={16} />
            Add User Account
          </AddButton>
        </ConfigSection>

        <ConfigSection>
          <SectionTitle>Virtual File System</SectionTitle>
          <FieldDescription style={{ marginBottom: '1rem' }}>
            Configure directories that will be visible to FTP clients
          </FieldDescription>
          
          {config.virtualDirectories.map((dir, index) => (
            <DirectoryCard key={index}>
              <DirectoryRow>
                <DirectoryField>
                  <Label>Directory Path</Label>
                  <Input
                    type="text"
                    placeholder="/path/to/directory"
                    value={dir.path}
                    onChange={(e) => {
                      const newDirs = [...config.virtualDirectories]
                      newDirs[index].path = e.target.value
                      setConfig(prev => ({ ...prev, virtualDirectories: newDirs }))
                    }}
                  />
                </DirectoryField>
                <DirectoryField>
                  <Label>Description</Label>
                  <Input
                    type="text"
                    placeholder="Directory description"
                    value={dir.description}
                    onChange={(e) => {
                      const newDirs = [...config.virtualDirectories]
                      newDirs[index].description = e.target.value
                      setConfig(prev => ({ ...prev, virtualDirectories: newDirs }))
                    }}
                  />
                </DirectoryField>
                <DirectoryActions>
                  <RemoveButton
                    onClick={() => {
                      const newDirs = config.virtualDirectories.filter((_, i) => i !== index)
                      setConfig(prev => ({ ...prev, virtualDirectories: newDirs }))
                    }}
                  >
                    <Trash2 size={16} />
                  </RemoveButton>
                </DirectoryActions>
              </DirectoryRow>
            </DirectoryCard>
          ))}
          
          <AddButton
            onClick={() => {
              const newDirs = [...config.virtualDirectories, { path: '', description: '' }]
              setConfig(prev => ({ ...prev, virtualDirectories: newDirs }))
            }}
          >
            <Folder size={16} />
            Add Directory
          </AddButton>

          <PresetFilesSection>
            <Label>Quick Add Preset Directories</Label>
            <PresetButtons>
              <PresetButton
                onClick={() => {
                  const presetDirs = [
                    { path: '/pub', description: 'Public files' },
                    { path: '/incoming', description: 'Upload directory' },
                    { path: '/software', description: 'Software downloads' }
                  ]
                  setConfig(prev => ({ ...prev, virtualDirectories: [...prev.virtualDirectories, ...presetDirs] }))
                }}
              >
                Public Directories
              </PresetButton>
              <PresetButton
                onClick={() => {
                  const presetDirs = [
                    { path: '/backup', description: 'Backup files' },
                    { path: '/admin', description: 'Admin files' },
                    { path: '/logs', description: 'Log files' }
                  ]
                  setConfig(prev => ({ ...prev, virtualDirectories: [...prev.virtualDirectories, ...presetDirs] }))
                }}
              >
                System Directories
              </PresetButton>
            </PresetButtons>
          </PresetFilesSection>
        </ConfigSection>

        <ConfigSection>
          <SectionTitle>File Listings</SectionTitle>
          <FieldDescription style={{ marginBottom: '1rem' }}>
            Configure files that will appear in directory listings
          </FieldDescription>
          
          {config.fileList.map((file, index) => (
            <FileCard key={index}>
              <FileRow>
                <FileField>
                  <Label>File Path</Label>
                  <Input
                    type="text"
                    placeholder="/path/to/file"
                    value={file.path}
                    onChange={(e) => {
                      const newFiles = [...config.fileList]
                      newFiles[index].path = e.target.value
                      setConfig(prev => ({ ...prev, fileList: newFiles }))
                    }}
                  />
                </FileField>
                <FileField>
                  <Label>Size</Label>
                  <Input
                    type="text"
                    placeholder="1.2 KB"
                    value={file.size}
                    onChange={(e) => {
                      const newFiles = [...config.fileList]
                      newFiles[index].size = e.target.value
                      setConfig(prev => ({ ...prev, fileList: newFiles }))
                    }}
                  />
                </FileField>
                <FileField>
                  <Label>Type</Label>
                  <Select
                    value={file.type}
                    onChange={(e) => {
                      const newFiles = [...config.fileList]
                      newFiles[index].type = e.target.value
                      setConfig(prev => ({ ...prev, fileList: newFiles }))
                    }}
                  >
                    <option value="file">File</option>
                    <option value="directory">Directory</option>
                  </Select>
                </FileField>
                <FileActions>
                  <RemoveButton
                    onClick={() => {
                      const newFiles = config.fileList.filter((_, i) => i !== index)
                      setConfig(prev => ({ ...prev, fileList: newFiles }))
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
              const newFiles = [...config.fileList, { path: '', size: '', type: 'file' }]
              setConfig(prev => ({ ...prev, fileList: newFiles }))
            }}
          >
            <Plus size={16} />
            Add File/Directory
          </AddButton>

          <PresetFilesSection>
            <Label>Quick Add Preset Files</Label>
            <PresetButtons>
              <PresetButton
                onClick={() => {
                  const presetFiles = [
                    { path: '/readme.txt', size: '1.2 KB', type: 'file' },
                    { path: '/index.html', size: '2.5 KB', type: 'file' },
                    { path: '/info.txt', size: '0.8 KB', type: 'file' }
                  ]
                  setConfig(prev => ({ ...prev, fileList: [...prev.fileList, ...presetFiles] }))
                }}
              >
                Common Files
              </PresetButton>
              <PresetButton
                onClick={() => {
                  const presetFiles = [
                    { path: '/etc/passwd', size: '2.1 KB', type: 'file' },
                    { path: '/backup/database.sql', size: '15.7 MB', type: 'file' },
                    { path: '/admin/config.ini', size: '0.9 KB', type: 'file' }
                  ]
                  setConfig(prev => ({ ...prev, fileList: [...prev.fileList, ...presetFiles] }))
                }}
              >
                Sensitive Files
              </PresetButton>
            </PresetButtons>
          </PresetFilesSection>
        </ConfigSection>

        <ButtonSection>
          <CancelButton onClick={onBack}>Back</CancelButton>
          <SaveButton onClick={handleSave}>
            <Save size={16} />
            Deploy FTP Honeypot
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

// New styled components for FTP configuration
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

const UserCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f9fafb;
`

const UserRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 120px auto;
  gap: 1rem;
  align-items: end;
`

const UserField = styled.div`
  display: flex;
  flex-direction: column;
`

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const DirectoryCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f9fafb;
`

const DirectoryRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr auto;
  gap: 1rem;
  align-items: end;
`

const DirectoryField = styled.div`
  display: flex;
  flex-direction: column;
`

const DirectoryActions = styled.div`
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
  grid-template-columns: 2fr 120px 120px auto;
  gap: 1rem;
  align-items: end;
`

const FileField = styled.div`
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
