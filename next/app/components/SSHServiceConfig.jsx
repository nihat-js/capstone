import React, { useState } from 'react';
import styled from 'styled-components';
import { ArrowLeft, Save, Plus, Trash2, Eye, EyeOff, Upload, Download } from 'lucide-react';

export function SSHServiceConfig({ onBack, onSave }) {
  const [config, setConfig] = useState({
    name: '',
    port: 2222,
    banner: 'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.1',
    maxConnections: 10,
    sessionTimeout: 300,
    enablePasswordAuth: true,
    enableKeyAuth: false,
    logLevel: 'info',
    fakeUsers: [
      { username: 'admin', password: 'admin123', shell: '/bin/bash' },
      { username: 'root', password: 'password', shell: '/bin/bash' },
      { username: 'user', password: '123456', shell: '/bin/sh' }
    ],
    fakeFiles: [
      { path: '/etc/passwd', content: 'Fake passwd file content' },
      { path: '/home/admin/documents/confidential.txt', content: 'Secret company data' },
      { path: '/var/log/system.log', content: 'System log entries' }
    ],
    commands: {
      ls: 'List directory contents',
      cat: 'Display file contents',
      pwd: 'Print working directory',
      whoami: 'Display current user',
      ps: 'List running processes',
      netstat: 'Display network connections'
    },
    notifications: {
      telegram: {
        enabled: false,
        botToken: '',
        chatId: '',
        events: ['login_attempt', 'successful_login', 'command_execution']
      },
      email: {
        enabled: false,
        smtp: '',
        from: '',
        to: '',
        events: ['brute_force_detected', 'suspicious_activity']
      }
    },
    logRetention: 30
  });

  const [showPassword, setShowPassword] = useState({});
  const [newUser, setNewUser] = useState({ username: '', password: '', shell: '/bin/bash' });
  const [newFile, setNewFile] = useState({ path: '', content: '' });

  const handleConfigChange = (section, field, value) => {
    if (section) {
      setConfig(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addUser = () => {
    if (newUser.username && newUser.password) {
      setConfig(prev => ({
        ...prev,
        fakeUsers: [...prev.fakeUsers, { ...newUser }]
      }));
      setNewUser({ username: '', password: '', shell: '/bin/bash' });
    }
  };

  const removeUser = (index) => {
    setConfig(prev => ({
      ...prev,
      fakeUsers: prev.fakeUsers.filter((_, i) => i !== index)
    }));
  };

  const addFile = () => {
    if (newFile.path && newFile.content) {
      setConfig(prev => ({
        ...prev,
        fakeFiles: [...prev.fakeFiles, { ...newFile }]
      }));
      setNewFile({ path: '', content: '' });
    }
  };

  const removeFile = (index) => {
    setConfig(prev => ({
      ...prev,
      fakeFiles: prev.fakeFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave({
      type: 'ssh',
      config
    });
  };

  return (
    <ConfigContainer>
      <ConfigHeader>
        <BackButton onClick={onBack}>
          <ArrowLeft size={20} />
          Back to Services
        </BackButton>
        <HeaderContent>
          <ServiceTitle>SSH Server Configuration</ServiceTitle>
          <ServiceDescription>Configure your SSH honeypot with fake users, files, and advanced settings</ServiceDescription>
        </HeaderContent>
        <SaveButton onClick={handleSave}>
          <Save size={16} />
          Save Configuration
        </SaveButton>
      </ConfigHeader>

      <ConfigContent>
        {/* Basic Settings */}
        <ConfigSection>
          <SectionTitle>Basic Settings</SectionTitle>
          <FormGrid>
            <FormField>
              <Label>Honeypot Name</Label>
              <Input
                type="text"
                value={config.name}
                onChange={(e) => handleConfigChange(null, 'name', e.target.value)}
                placeholder="e.g., Production SSH Server"
              />
            </FormField>
            <FormField>
              <Label>Port</Label>
              <Input
                type="number"
                value={config.port}
                onChange={(e) => handleConfigChange(null, 'port', parseInt(e.target.value))}
                min="1"
                max="65535"
              />
            </FormField>
            <FormField>
              <Label>Max Connections</Label>
              <Input
                type="number"
                value={config.maxConnections}
                onChange={(e) => handleConfigChange(null, 'maxConnections', parseInt(e.target.value))}
                min="1"
                max="100"
              />
            </FormField>
            <FormField>
              <Label>Session Timeout (seconds)</Label>
              <Input
                type="number"
                value={config.sessionTimeout}
                onChange={(e) => handleConfigChange(null, 'sessionTimeout', parseInt(e.target.value))}
                min="30"
                max="3600"
              />
            </FormField>
          </FormGrid>
          
          <FormField>
            <Label>SSH Banner</Label>
            <Input
              type="text"
              value={config.banner}
              onChange={(e) => handleConfigChange(null, 'banner', e.target.value)}
              placeholder="SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.1"
            />
          </FormField>
        </ConfigSection>

        {/* Authentication Settings */}
        <ConfigSection>
          <SectionTitle>Authentication</SectionTitle>
          <CheckboxGroup>
            <CheckboxField>
              <Checkbox
                type="checkbox"
                checked={config.enablePasswordAuth}
                onChange={(e) => handleConfigChange(null, 'enablePasswordAuth', e.target.checked)}
              />
              <CheckboxLabel>Enable Password Authentication</CheckboxLabel>
            </CheckboxField>
            <CheckboxField>
              <Checkbox
                type="checkbox"
                checked={config.enableKeyAuth}
                onChange={(e) => handleConfigChange(null, 'enableKeyAuth', e.target.checked)}
              />
              <CheckboxLabel>Enable Key Authentication</CheckboxLabel>
            </CheckboxField>
          </CheckboxGroup>
        </ConfigSection>

        {/* Fake Users */}
        <ConfigSection>
          <SectionTitle>Fake User Accounts</SectionTitle>
          <UsersTable>
            <TableHeader>
              <HeaderCell>Username</HeaderCell>
              <HeaderCell>Password</HeaderCell>
              <HeaderCell>Shell</HeaderCell>
              <HeaderCell>Actions</HeaderCell>
            </TableHeader>
            <TableBody>
              {config.fakeUsers.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <PasswordCell>
                      {showPassword[index] ? user.password : '••••••••'}
                      <PasswordToggle
                        onClick={() => setShowPassword(prev => ({ ...prev, [index]: !prev[index] }))}
                      >
                        {showPassword[index] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </PasswordToggle>
                    </PasswordCell>
                  </TableCell>
                  <TableCell>{user.shell}</TableCell>
                  <TableCell>
                    <DeleteButton onClick={() => removeUser(index)}>
                      <Trash2 size={16} />
                    </DeleteButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </UsersTable>

          <AddUserForm>
            <AddUserInputs>
              <Input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
              />
              <Input
                type="text"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              />
              <Select
                value={newUser.shell}
                onChange={(e) => setNewUser(prev => ({ ...prev, shell: e.target.value }))}
              >
                <option value="/bin/bash">bash</option>
                <option value="/bin/sh">sh</option>
                <option value="/bin/zsh">zsh</option>
                <option value="/bin/fish">fish</option>
              </Select>
            </AddUserInputs>
            <AddButton onClick={addUser}>
              <Plus size={16} />
              Add User
            </AddButton>
          </AddUserForm>
        </ConfigSection>

        {/* Fake Files */}
        <ConfigSection>
          <SectionTitle>Fake File System</SectionTitle>
          <FilesTable>
            <TableHeader>
              <HeaderCell>File Path</HeaderCell>
              <HeaderCell>Content Preview</HeaderCell>
              <HeaderCell>Actions</HeaderCell>
            </TableHeader>
            <TableBody>
              {config.fakeFiles.map((file, index) => (
                <TableRow key={index}>
                  <TableCell>{file.path}</TableCell>
                  <TableCell>{file.content.substring(0, 50)}...</TableCell>
                  <TableCell>
                    <DeleteButton onClick={() => removeFile(index)}>
                      <Trash2 size={16} />
                    </DeleteButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </FilesTable>

          <AddFileForm>
            <FormField>
              <Label>File Path</Label>
              <Input
                type="text"
                placeholder="/path/to/file.txt"
                value={newFile.path}
                onChange={(e) => setNewFile(prev => ({ ...prev, path: e.target.value }))}
              />
            </FormField>
            <FormField>
              <Label>Content</Label>
              <TextArea
                placeholder="File content..."
                value={newFile.content}
                onChange={(e) => setNewFile(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
            </FormField>
            <AddButton onClick={addFile}>
              <Plus size={16} />
              Add File
            </AddButton>
          </AddFileForm>
        </ConfigSection>

        {/* Notifications */}
        <ConfigSection>
          <SectionTitle>Notifications</SectionTitle>
          
          <NotificationGroup>
            <SubSectionTitle>Telegram Notifications</SubSectionTitle>
            <CheckboxField>
              <Checkbox
                type="checkbox"
                checked={config.notifications.telegram.enabled}
                onChange={(e) => handleConfigChange('notifications', 'telegram', {
                  ...config.notifications.telegram,
                  enabled: e.target.checked
                })}
              />
              <CheckboxLabel>Enable Telegram Notifications</CheckboxLabel>
            </CheckboxField>
            
            {config.notifications.telegram.enabled && (
              <NotificationFields>
                <FormField>
                  <Label>Bot Token</Label>
                  <Input
                    type="text"
                    placeholder="Bot token from BotFather"
                    value={config.notifications.telegram.botToken}
                    onChange={(e) => handleConfigChange('notifications', 'telegram', {
                      ...config.notifications.telegram,
                      botToken: e.target.value
                    })}
                  />
                </FormField>
                <FormField>
                  <Label>Chat ID</Label>
                  <Input
                    type="text"
                    placeholder="Telegram chat ID"
                    value={config.notifications.telegram.chatId}
                    onChange={(e) => handleConfigChange('notifications', 'telegram', {
                      ...config.notifications.telegram,
                      chatId: e.target.value
                    })}
                  />
                </FormField>
              </NotificationFields>
            )}
          </NotificationGroup>
        </ConfigSection>

        {/* Advanced Settings */}
        <ConfigSection>
          <SectionTitle>Advanced Settings</SectionTitle>
          <FormGrid>
            <FormField>
              <Label>Log Level</Label>
              <Select
                value={config.logLevel}
                onChange={(e) => handleConfigChange(null, 'logLevel', e.target.value)}
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </Select>
            </FormField>
            <FormField>
              <Label>Log Retention (days)</Label>
              <Input
                type="number"
                value={config.logRetention}
                onChange={(e) => handleConfigChange(null, 'logRetention', parseInt(e.target.value))}
                min="1"
                max="365"
              />
            </FormField>
          </FormGrid>
        </ConfigSection>
      </ConfigContent>
    </ConfigContainer>
  );
}

// Styled Components
const ConfigContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const ConfigHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 1rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const ServiceTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const ServiceDescription = styled.p`
  color: #6b7280;
  margin: 0;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: #1d4ed8;
  }
`;

const ConfigContent = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ConfigSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const SubSectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CheckboxField = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
`;

const CheckboxLabel = styled.span`
  font-size: 0.875rem;
  color: #374151;
`;

const UsersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
`;

const FilesTable = styled(UsersTable)``;

const TableHeader = styled.thead`
  background: #f9fafb;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const HeaderCell = styled.th`
  padding: 0.75rem;
  text-align: left;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

const TableCell = styled.td`
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #111827;
`;

const PasswordCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PasswordToggle = styled.button`
  padding: 0.25rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;

  &:hover {
    color: #374151;
  }
`;

const DeleteButton = styled.button`
  padding: 0.25rem;
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background: #fee2e2;
  }
`;

const AddUserForm = styled.div`
  display: flex;
  gap: 1rem;
  align-items: end;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
`;

const AddFileForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
`;

const AddUserInputs = styled.div`
  display: flex;
  gap: 0.5rem;
  flex: 1;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.2s ease;

  &:hover {
    background: #1d4ed8;
  }
`;

const NotificationGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
`;

const NotificationFields = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;
