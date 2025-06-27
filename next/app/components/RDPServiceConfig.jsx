import React, { useState } from 'react';
import styled from 'styled-components';
import { ArrowLeft, Save, Plus, Trash2, Eye, EyeOff, Upload, Download, Monitor, User } from 'lucide-react';

export function RDPServiceConfig({ onBack, onSave }) {
  const [config, setConfig] = useState({
    name: '',
    port: 3389,
    maxConnections: 5,
    sessionTimeout: 600,
    enableNLA: false,
    enableSSL: true,
    logLevel: 'info',
    windowsVersion: 'Windows Server 2019',
    computerName: 'SRV-001',
    domain: 'CORPORATE.LOCAL',
    fakeUsers: [
      { username: 'Administrator', password: 'P@ssw0rd123', fullName: 'Administrator', description: 'Built-in account for administering the computer/domain' },
      { username: 'admin', password: 'admin', fullName: 'Admin User', description: 'System Administrator' },
      { username: 'user', password: 'password', fullName: 'Regular User', description: 'Standard User Account' },
      { username: 'guest', password: '', fullName: 'Guest', description: 'Built-in account for guest access' }
    ],
    desktopSettings: {
      wallpaper: 'corporate',
      theme: 'windows10',
      resolution: '1920x1080',
      colorDepth: 32,
      showFakeApps: true,
      fakeApplications: [
        { name: 'Microsoft Excel', path: 'C:\\Program Files\\Microsoft Office\\Excel.exe' },
        { name: 'Notepad', path: 'C:\\Windows\\System32\\notepad.exe' },
        { name: 'Command Prompt', path: 'C:\\Windows\\System32\\cmd.exe' },
        { name: 'File Explorer', path: 'C:\\Windows\\explorer.exe' }
      ]
    },
    honeypotBehavior: {
      allowScreenshots: true,
      recordKeystrokes: true,
      captureClipboard: true,
      simulateNetworkDrives: true,
      showFakeFiles: true
    },
    notifications: {
      telegram: {
        enabled: false,
        botToken: '',
        chatId: '',
        events: ['connection_attempt', 'successful_login', 'file_access', 'application_launch']
      },
      email: {
        enabled: false,
        smtp: '',
        from: '',
        to: '',
        events: ['brute_force_detected', 'suspicious_activity', 'multiple_failed_logins']
      }
    },
    securitySettings: {
      enableBruteForceDetection: true,
      maxFailedAttempts: 5,
      lockoutDuration: 300,
      enableRateLimiting: true,
      maxConnectionsPerIP: 2
    },
    logRetention: 30
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [showPassword, setShowPassword] = useState({});

  const handleInputChange = (path, value) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const addUser = () => {
    setConfig(prev => ({
      ...prev,
      fakeUsers: [...prev.fakeUsers, { username: '', password: '', fullName: '', description: '' }]
    }));
  };

  const removeUser = (index) => {
    setConfig(prev => ({
      ...prev,
      fakeUsers: prev.fakeUsers.filter((_, i) => i !== index)
    }));
  };

  const updateUser = (index, field, value) => {
    setConfig(prev => ({
      ...prev,
      fakeUsers: prev.fakeUsers.map((user, i) => 
        i === index ? { ...user, [field]: value } : user
      )
    }));
  };

  const addApplication = () => {
    setConfig(prev => ({
      ...prev,
      desktopSettings: {
        ...prev.desktopSettings,
        fakeApplications: [...prev.desktopSettings.fakeApplications, { name: '', path: '' }]
      }
    }));
  };

  const removeApplication = (index) => {
    setConfig(prev => ({
      ...prev,
      desktopSettings: {
        ...prev.desktopSettings,
        fakeApplications: prev.desktopSettings.fakeApplications.filter((_, i) => i !== index)
      }
    }));
  };

  const updateApplication = (index, field, value) => {
    setConfig(prev => ({
      ...prev,
      desktopSettings: {
        ...prev.desktopSettings,
        fakeApplications: prev.desktopSettings.fakeApplications.map((app, i) => 
          i === index ? { ...app, [field]: value } : app
        )
      }
    }));
  };

  const handleSave = () => {
    onSave?.(config);
  };

  const renderBasicTab = () => (
    <TabContent>
      <Section>
        <SectionTitle>Basic Configuration</SectionTitle>
        <InputGrid>
          <InputGroup>
            <Label>Service Name</Label>
            <Input
              type="text"
              value={config.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="RDP Honeypot"
            />
          </InputGroup>
          <InputGroup>
            <Label>Port</Label>
            <Input
              type="number"
              value={config.port}
              onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
              min={1}
              max={65535}
            />
          </InputGroup>
          <InputGroup>
            <Label>Max Connections</Label>
            <Input
              type="number"
              value={config.maxConnections}
              onChange={(e) => handleInputChange('maxConnections', parseInt(e.target.value))}
              min={1}
              max={100}
            />
          </InputGroup>
          <InputGroup>
            <Label>Session Timeout (seconds)</Label>
            <Input
              type="number"
              value={config.sessionTimeout}
              onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
              min={30}
              max={3600}
            />
          </InputGroup>
        </InputGrid>
      </Section>

      <Section>
        <SectionTitle>System Information</SectionTitle>
        <InputGrid>
          <InputGroup>
            <Label>Windows Version</Label>
            <Select
              value={config.windowsVersion}
              onChange={(e) => handleInputChange('windowsVersion', e.target.value)}
            >
              <option value="Windows Server 2019">Windows Server 2019</option>
              <option value="Windows Server 2016">Windows Server 2016</option>
              <option value="Windows Server 2012 R2">Windows Server 2012 R2</option>
              <option value="Windows 10 Pro">Windows 10 Pro</option>
              <option value="Windows 11 Pro">Windows 11 Pro</option>
            </Select>
          </InputGroup>
          <InputGroup>
            <Label>Computer Name</Label>
            <Input
              type="text"
              value={config.computerName}
              onChange={(e) => handleInputChange('computerName', e.target.value)}
              placeholder="SRV-001"
            />
          </InputGroup>
          <InputGroup>
            <Label>Domain</Label>
            <Input
              type="text"
              value={config.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              placeholder="CORPORATE.LOCAL"
            />
          </InputGroup>
          <InputGroup>
            <Label>Log Level</Label>
            <Select
              value={config.logLevel}
              onChange={(e) => handleInputChange('logLevel', e.target.value)}
            >
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </Select>
          </InputGroup>
        </InputGrid>
      </Section>

      <Section>
        <SectionTitle>Protocol Settings</SectionTitle>
        <CheckboxGrid>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.enableNLA}
              onChange={(e) => handleInputChange('enableNLA', e.target.checked)}
            />
            <CheckboxLabel>Enable Network Level Authentication</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.enableSSL}
              onChange={(e) => handleInputChange('enableSSL', e.target.checked)}
            />
            <CheckboxLabel>Enable SSL/TLS Encryption</CheckboxLabel>
          </CheckboxGroup>
        </CheckboxGrid>
      </Section>
    </TabContent>
  );

  const renderUsersTab = () => (
    <TabContent>
      <Section>
        <SectionHeader>
          <SectionTitle>Fake User Accounts</SectionTitle>
          <Button onClick={addUser}>
            <Plus size={16} />
            Add User
          </Button>
        </SectionHeader>
        
        <UsersList>
          {config.fakeUsers.map((user, index) => (
            <UserCard key={index}>
              <UserHeader>
                <UserIcon>
                  <User size={20} />
                </UserIcon>
                <UserTitle>User {index + 1}</UserTitle>
                <DeleteButton onClick={() => removeUser(index)}>
                  <Trash2 size={16} />
                </DeleteButton>
              </UserHeader>
              
              <UserInputGrid>
                <InputGroup>
                  <Label>Username</Label>
                  <Input
                    type="text"
                    value={user.username}
                    onChange={(e) => updateUser(index, 'username', e.target.value)}
                    placeholder="Enter username"
                  />
                </InputGroup>
                <InputGroup>
                  <Label>Password</Label>
                  <PasswordContainer>
                    <Input
                      type={showPassword[index] ? 'text' : 'password'}
                      value={user.password}
                      onChange={(e) => updateUser(index, 'password', e.target.value)}
                      placeholder="Enter password"
                    />
                    <PasswordToggle
                      onClick={() => setShowPassword(prev => ({ ...prev, [index]: !prev[index] }))}
                    >
                      {showPassword[index] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </PasswordToggle>
                  </PasswordContainer>
                </InputGroup>
                <InputGroup>
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    value={user.fullName}
                    onChange={(e) => updateUser(index, 'fullName', e.target.value)}
                    placeholder="Enter full name"
                  />
                </InputGroup>
                <InputGroup>
                  <Label>Description</Label>
                  <Input
                    type="text"
                    value={user.description}
                    onChange={(e) => updateUser(index, 'description', e.target.value)}
                    placeholder="Account description"
                  />
                </InputGroup>
              </UserInputGrid>
            </UserCard>
          ))}
        </UsersList>
      </Section>
    </TabContent>
  );

  const renderDesktopTab = () => (
    <TabContent>
      <Section>
        <SectionTitle>Desktop Settings</SectionTitle>
        <InputGrid>
          <InputGroup>
            <Label>Wallpaper Theme</Label>
            <Select
              value={config.desktopSettings.wallpaper}
              onChange={(e) => handleInputChange('desktopSettings.wallpaper', e.target.value)}
            >
              <option value="corporate">Corporate</option>
              <option value="default">Windows Default</option>
              <option value="nature">Nature</option>
              <option value="abstract">Abstract</option>
            </Select>
          </InputGroup>
          <InputGroup>
            <Label>Theme</Label>
            <Select
              value={config.desktopSettings.theme}
              onChange={(e) => handleInputChange('desktopSettings.theme', e.target.value)}
            >
              <option value="windows10">Windows 10</option>
              <option value="windows11">Windows 11</option>
              <option value="classic">Windows Classic</option>
            </Select>
          </InputGroup>
          <InputGroup>
            <Label>Resolution</Label>
            <Select
              value={config.desktopSettings.resolution}
              onChange={(e) => handleInputChange('desktopSettings.resolution', e.target.value)}
            >
              <option value="1920x1080">1920x1080</option>
              <option value="1366x768">1366x768</option>
              <option value="1280x720">1280x720</option>
              <option value="1024x768">1024x768</option>
            </Select>
          </InputGroup>
          <InputGroup>
            <Label>Color Depth</Label>
            <Select
              value={config.desktopSettings.colorDepth}
              onChange={(e) => handleInputChange('desktopSettings.colorDepth', parseInt(e.target.value))}
            >
              <option value={32}>32-bit</option>
              <option value={24}>24-bit</option>
              <option value={16}>16-bit</option>
            </Select>
          </InputGroup>
        </InputGrid>
      </Section>

      <Section>
        <SectionTitle>Behavior Settings</SectionTitle>
        <CheckboxGrid>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.honeypotBehavior.allowScreenshots}
              onChange={(e) => handleInputChange('honeypotBehavior.allowScreenshots', e.target.checked)}
            />
            <CheckboxLabel>Allow Screenshots</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.honeypotBehavior.recordKeystrokes}
              onChange={(e) => handleInputChange('honeypotBehavior.recordKeystrokes', e.target.checked)}
            />
            <CheckboxLabel>Record Keystrokes</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.honeypotBehavior.captureClipboard}
              onChange={(e) => handleInputChange('honeypotBehavior.captureClipboard', e.target.checked)}
            />
            <CheckboxLabel>Capture Clipboard</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.honeypotBehavior.simulateNetworkDrives}
              onChange={(e) => handleInputChange('honeypotBehavior.simulateNetworkDrives', e.target.checked)}
            />
            <CheckboxLabel>Simulate Network Drives</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.honeypotBehavior.showFakeFiles}
              onChange={(e) => handleInputChange('honeypotBehavior.showFakeFiles', e.target.checked)}
            />
            <CheckboxLabel>Show Fake Files</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.desktopSettings.showFakeApps}
              onChange={(e) => handleInputChange('desktopSettings.showFakeApps', e.target.checked)}
            />
            <CheckboxLabel>Show Fake Applications</CheckboxLabel>
          </CheckboxGroup>
        </CheckboxGrid>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>Fake Applications</SectionTitle>
          <Button onClick={addApplication}>
            <Plus size={16} />
            Add Application
          </Button>
        </SectionHeader>
        
        <ApplicationsList>
          {config.desktopSettings.fakeApplications.map((app, index) => (
            <ApplicationCard key={index}>
              <ApplicationHeader>
                <ApplicationIcon>
                  <Monitor size={20} />
                </ApplicationIcon>
                <ApplicationTitle>Application {index + 1}</ApplicationTitle>
                <DeleteButton onClick={() => removeApplication(index)}>
                  <Trash2 size={16} />
                </DeleteButton>
              </ApplicationHeader>
              
              <ApplicationInputGrid>
                <InputGroup>
                  <Label>Application Name</Label>
                  <Input
                    type="text"
                    value={app.name}
                    onChange={(e) => updateApplication(index, 'name', e.target.value)}
                    placeholder="Microsoft Word"
                  />
                </InputGroup>
                <InputGroup>
                  <Label>Executable Path</Label>
                  <Input
                    type="text"
                    value={app.path}
                    onChange={(e) => updateApplication(index, 'path', e.target.value)}
                    placeholder="C:\\Program Files\\Microsoft Office\\WINWORD.EXE"
                  />
                </InputGroup>
              </ApplicationInputGrid>
            </ApplicationCard>
          ))}
        </ApplicationsList>
      </Section>
    </TabContent>
  );

  const renderSecurityTab = () => (
    <TabContent>
      <Section>
        <SectionTitle>Security Settings</SectionTitle>
        <CheckboxGrid>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.securitySettings.enableBruteForceDetection}
              onChange={(e) => handleInputChange('securitySettings.enableBruteForceDetection', e.target.checked)}
            />
            <CheckboxLabel>Enable Brute Force Detection</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.securitySettings.enableRateLimiting}
              onChange={(e) => handleInputChange('securitySettings.enableRateLimiting', e.target.checked)}
            />
            <CheckboxLabel>Enable Rate Limiting</CheckboxLabel>
          </CheckboxGroup>
        </CheckboxGrid>

        <InputGrid>
          <InputGroup>
            <Label>Max Failed Attempts</Label>
            <Input
              type="number"
              value={config.securitySettings.maxFailedAttempts}
              onChange={(e) => handleInputChange('securitySettings.maxFailedAttempts', parseInt(e.target.value))}
              min={1}
              max={20}
            />
          </InputGroup>
          <InputGroup>
            <Label>Lockout Duration (seconds)</Label>
            <Input
              type="number"
              value={config.securitySettings.lockoutDuration}
              onChange={(e) => handleInputChange('securitySettings.lockoutDuration', parseInt(e.target.value))}
              min={60}
              max={3600}
            />
          </InputGroup>
          <InputGroup>
            <Label>Max Connections per IP</Label>
            <Input
              type="number"
              value={config.securitySettings.maxConnectionsPerIP}
              onChange={(e) => handleInputChange('securitySettings.maxConnectionsPerIP', parseInt(e.target.value))}
              min={1}
              max={10}
            />
          </InputGroup>
          <InputGroup>
            <Label>Log Retention (days)</Label>
            <Input
              type="number"
              value={config.logRetention}
              onChange={(e) => handleInputChange('logRetention', parseInt(e.target.value))}
              min={1}
              max={365}
            />
          </InputGroup>
        </InputGrid>
      </Section>

      <Section>
        <SectionTitle>Notifications</SectionTitle>
        
        <NotificationGroup>
          <NotificationHeader>
            <NotificationTitle>Telegram</NotificationTitle>
            <Checkbox
              type="checkbox"
              checked={config.notifications.telegram.enabled}
              onChange={(e) => handleInputChange('notifications.telegram.enabled', e.target.checked)}
            />
          </NotificationHeader>
          
          {config.notifications.telegram.enabled && (
            <NotificationSettings>
              <InputGroup>
                <Label>Bot Token</Label>
                <Input
                  type="text"
                  value={config.notifications.telegram.botToken}
                  onChange={(e) => handleInputChange('notifications.telegram.botToken', e.target.value)}
                  placeholder="Your Telegram bot token"
                />
              </InputGroup>
              <InputGroup>
                <Label>Chat ID</Label>
                <Input
                  type="text"
                  value={config.notifications.telegram.chatId}
                  onChange={(e) => handleInputChange('notifications.telegram.chatId', e.target.value)}
                  placeholder="Your chat ID"
                />
              </InputGroup>
            </NotificationSettings>
          )}
        </NotificationGroup>

        <NotificationGroup>
          <NotificationHeader>
            <NotificationTitle>Email</NotificationTitle>
            <Checkbox
              type="checkbox"
              checked={config.notifications.email.enabled}
              onChange={(e) => handleInputChange('notifications.email.enabled', e.target.checked)}
            />
          </NotificationHeader>
          
          {config.notifications.email.enabled && (
            <NotificationSettings>
              <InputGroup>
                <Label>SMTP Server</Label>
                <Input
                  type="text"
                  value={config.notifications.email.smtp}
                  onChange={(e) => handleInputChange('notifications.email.smtp', e.target.value)}
                  placeholder="smtp.gmail.com:587"
                />
              </InputGroup>
              <InputGroup>
                <Label>From Email</Label>
                <Input
                  type="email"
                  value={config.notifications.email.from}
                  onChange={(e) => handleInputChange('notifications.email.from', e.target.value)}
                  placeholder="honeypot@company.com"
                />
              </InputGroup>
              <InputGroup>
                <Label>To Email</Label>
                <Input
                  type="email"
                  value={config.notifications.email.to}
                  onChange={(e) => handleInputChange('notifications.email.to', e.target.value)}
                  placeholder="admin@company.com"
                />
              </InputGroup>
            </NotificationSettings>
          )}
        </NotificationGroup>
      </Section>
    </TabContent>
  );

  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>
          <ArrowLeft size={20} />
          Back to Services
        </BackButton>
        <HeaderTitle>
          <Monitor size={24} />
          RDP Server Configuration
        </HeaderTitle>
        <SaveButton onClick={handleSave}>
          <Save size={16} />
          Save Configuration
        </SaveButton>
      </Header>

      <Content>
        <TabNavigation>
          <Tab $active={activeTab === 'basic'} onClick={() => setActiveTab('basic')}>
            Basic Settings
          </Tab>
          <Tab $active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            User Accounts
          </Tab>
          <Tab $active={activeTab === 'desktop'} onClick={() => setActiveTab('desktop')}>
            Desktop & Apps
          </Tab>
          <Tab $active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
            Security & Notifications
          </Tab>
        </TabNavigation>

        {activeTab === 'basic' && renderBasicTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'desktop' && renderDesktopTab()}
        {activeTab === 'security' && renderSecurityTab()}
      </Content>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
    color: #111827;
  }
`;

const HeaderTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: #047857;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TabNavigation = styled.div`
  display: flex;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 2rem;
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#059669' : 'transparent'};
  color: ${props => props.$active ? '#059669' : '#6b7280'};
  font-weight: ${props => props.$active ? '600' : '500'};
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: #059669;
    background: #f0fdf4;
  }
`;

const TabContent = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: #f9fafb;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
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
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  }
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: #059669;
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: #374151;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  transition: background 0.2s ease;

  &:hover {
    background: #047857;
  }
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const UserCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: #f9fafb;
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const UserIcon = styled.div`
  padding: 0.5rem;
  background: #059669;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
`;

const DeleteButton = styled.button`
  padding: 0.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  transition: background 0.2s ease;

  &:hover {
    background: #b91c1c;
  }
`;

const UserInputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const PasswordContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #6b7280;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #374151;
  }
`;

const ApplicationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ApplicationCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: #f9fafb;
`;

const ApplicationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const ApplicationIcon = styled.div`
  padding: 0.5rem;
  background: #2563eb;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ApplicationTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
`;

const ApplicationInputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
`;

const NotificationGroup = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const NotificationTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const NotificationSettings = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;
