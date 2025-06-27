import React, { useState } from 'react';
import styled from 'styled-components';
import { ArrowLeft, Save, Plus, Trash2, Eye, EyeOff, Upload, Download, Globe, Code, FileText, User } from 'lucide-react';

export function HTTPServiceConfig({ onBack, onSave }) {
  const [config, setConfig] = useState({
    name: '',
    port: 8080,
    enableSSL: false,
    sslPort: 8443,
    maxConnections: 50,
    serverName: 'Apache/2.4.41 (Ubuntu)',
    documentRoot: '/var/www/html',
    logLevel: 'info',
    serverType: 'generic',
    enableDirectoryListing: false,
    enableFileUploads: true,
    maxUploadSize: 10, // MB
    allowedFileTypes: ['txt', 'pdf', 'doc', 'docx', 'jpg', 'png', 'gif'],
    customPages: [
      { path: '/', title: 'Welcome', content: '<h1>Welcome to our Corporate Website</h1><p>Please login to access restricted areas.</p>', contentType: 'text/html' },
      { path: '/login', title: 'Login Portal', content: '<form><input type="text" placeholder="Username"><input type="password" placeholder="Password"><button>Login</button></form>', contentType: 'text/html' },
      { path: '/admin', title: 'Admin Panel', content: '<h1>Administrative Interface</h1><p>Restricted Access Only</p>', contentType: 'text/html' }
    ],
    fakeFiles: [
      { path: '/documents/confidential.pdf', size: '2.4 MB', description: 'Confidential Business Plan' },
      { path: '/backup/database.sql', size: '15.7 MB', description: 'Database Backup File' },
      { path: '/logs/access.log', size: '890 KB', description: 'Server Access Logs' },
      { path: '/config/settings.ini', size: '3.2 KB', description: 'Configuration Settings' }
    ],
    honeypotFeatures: {
      captureFormData: true,
      logUserAgents: true,
      trackIPAddresses: true,
      recordRequestHeaders: true,
      simulateVulnerabilities: false,
      enableSQLInjectionDetection: true,
      enableXSSDetection: true,
      enableDirectoryTraversal: true
    },
    authentication: {
      enableBasicAuth: false,
      realm: 'Restricted Area',
      credentials: [
        { username: 'admin', password: 'password123' },
        { username: 'user', password: '12345' }
      ]
    },
    apiEndpoints: [
      { path: '/api/users', method: 'GET', response: '{"users": [{"id": 1, "name": "John Doe"}, {"id": 2, "name": "Jane Smith"}]}', contentType: 'application/json' },
      { path: '/api/login', method: 'POST', response: '{"status": "success", "token": "fake-jwt-token"}', contentType: 'application/json' },
      { path: '/api/data', method: 'GET', response: '{"data": [{"sensitive": "information"}, {"classified": "data"}]}', contentType: 'application/json' }
    ],
    notifications: {
      telegram: {
        enabled: false,
        botToken: '',
        chatId: '',
        events: ['file_upload', 'login_attempt', 'vulnerability_scan', 'suspicious_request']
      },
      email: {
        enabled: false,
        smtp: '',
        from: '',
        to: '',
        events: ['brute_force_detected', 'sql_injection_attempt', 'xss_attempt']
      }
    },
    securitySettings: {
      enableRateLimiting: true,
      maxRequestsPerMinute: 60,
      enableIPBlacklist: false,
      blockedIPs: [],
      enableRequestLogging: true,
      logSensitiveData: false
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

  const addCustomPage = () => {
    setConfig(prev => ({
      ...prev,
      customPages: [...prev.customPages, { path: '', title: '', content: '', contentType: 'text/html' }]
    }));
  };

  const removeCustomPage = (index) => {
    setConfig(prev => ({
      ...prev,
      customPages: prev.customPages.filter((_, i) => i !== index)
    }));
  };

  const updateCustomPage = (index, field, value) => {
    setConfig(prev => ({
      ...prev,
      customPages: prev.customPages.map((page, i) => 
        i === index ? { ...page, [field]: value } : page
      )
    }));
  };

  const addFakeFile = () => {
    setConfig(prev => ({
      ...prev,
      fakeFiles: [...prev.fakeFiles, { path: '', size: '', description: '' }]
    }));
  };

  const removeFakeFile = (index) => {
    setConfig(prev => ({
      ...prev,
      fakeFiles: prev.fakeFiles.filter((_, i) => i !== index)
    }));
  };

  const updateFakeFile = (index, field, value) => {
    setConfig(prev => ({
      ...prev,
      fakeFiles: prev.fakeFiles.map((file, i) => 
        i === index ? { ...file, [field]: value } : file
      )
    }));
  };

  const addCredential = () => {
    setConfig(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        credentials: [...prev.authentication.credentials, { username: '', password: '' }]
      }
    }));
  };

  const removeCredential = (index) => {
    setConfig(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        credentials: prev.authentication.credentials.filter((_, i) => i !== index)
      }
    }));
  };

  const updateCredential = (index, field, value) => {
    setConfig(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        credentials: prev.authentication.credentials.map((cred, i) => 
          i === index ? { ...cred, [field]: value } : cred
        )
      }
    }));
  };

  const addAPIEndpoint = () => {
    setConfig(prev => ({
      ...prev,
      apiEndpoints: [...prev.apiEndpoints, { path: '', method: 'GET', response: '', contentType: 'application/json' }]
    }));
  };

  const removeAPIEndpoint = (index) => {
    setConfig(prev => ({
      ...prev,
      apiEndpoints: prev.apiEndpoints.filter((_, i) => i !== index)
    }));
  };

  const updateAPIEndpoint = (index, field, value) => {
    setConfig(prev => ({
      ...prev,
      apiEndpoints: prev.apiEndpoints.map((endpoint, i) => 
        i === index ? { ...endpoint, [field]: value } : endpoint
      )
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
              placeholder="HTTP Honeypot"
            />
          </InputGroup>
          <InputGroup>
            <Label>HTTP Port</Label>
            <Input
              type="number"
              value={config.port}
              onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
              min={1}
              max={65535}
            />
          </InputGroup>
          <InputGroup>
            <Label>HTTPS Port</Label>
            <Input
              type="number"
              value={config.sslPort}
              onChange={(e) => handleInputChange('sslPort', parseInt(e.target.value))}
              min={1}
              max={65535}
              disabled={!config.enableSSL}
            />
          </InputGroup>
          <InputGroup>
            <Label>Max Connections</Label>
            <Input
              type="number"
              value={config.maxConnections}
              onChange={(e) => handleInputChange('maxConnections', parseInt(e.target.value))}
              min={1}
              max={1000}
            />
          </InputGroup>
        </InputGrid>
      </Section>

      <Section>
        <SectionTitle>Server Configuration</SectionTitle>
        <InputGrid>
          <InputGroup>
            <Label>Server Name/Banner</Label>
            <Input
              type="text"
              value={config.serverName}
              onChange={(e) => handleInputChange('serverName', e.target.value)}
              placeholder="Apache/2.4.41 (Ubuntu)"
            />
          </InputGroup>
          <InputGroup>
            <Label>Server Type</Label>
            <Select
              value={config.serverType}
              onChange={(e) => handleInputChange('serverType', e.target.value)}
            >
              <option value="generic">Generic Web Server</option>
              <option value="apache">Apache HTTP Server</option>
              <option value="nginx">Nginx</option>
              <option value="iis">Microsoft IIS</option>
              <option value="corporate">Corporate Portal</option>
              <option value="blog">Blog/CMS</option>
            </Select>
          </InputGroup>
          <InputGroup>
            <Label>Document Root</Label>
            <Input
              type="text"
              value={config.documentRoot}
              onChange={(e) => handleInputChange('documentRoot', e.target.value)}
              placeholder="/var/www/html"
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
              checked={config.enableSSL}
              onChange={(e) => handleInputChange('enableSSL', e.target.checked)}
            />
            <CheckboxLabel>Enable HTTPS/SSL</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.enableDirectoryListing}
              onChange={(e) => handleInputChange('enableDirectoryListing', e.target.checked)}
            />
            <CheckboxLabel>Enable Directory Listing</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.enableFileUploads}
              onChange={(e) => handleInputChange('enableFileUploads', e.target.checked)}
            />
            <CheckboxLabel>Enable File Uploads</CheckboxLabel>
          </CheckboxGroup>
        </CheckboxGrid>

        {config.enableFileUploads && (
          <InputGrid>
            <InputGroup>
              <Label>Max Upload Size (MB)</Label>
              <Input
                type="number"
                value={config.maxUploadSize}
                onChange={(e) => handleInputChange('maxUploadSize', parseInt(e.target.value))}
                min={1}
                max={100}
              />
            </InputGroup>
            <InputGroup>
              <Label>Allowed File Types</Label>
              <Input
                type="text"
                value={config.allowedFileTypes.join(', ')}
                onChange={(e) => handleInputChange('allowedFileTypes', e.target.value.split(',').map(t => t.trim()))}
                placeholder="txt, pdf, doc, jpg, png"
              />
            </InputGroup>
          </InputGrid>
        )}
      </Section>
    </TabContent>
  );

  const renderContentTab = () => (
    <TabContent>
      <Section>
        <SectionHeader>
          <SectionTitle>Custom Web Pages</SectionTitle>
          <Button onClick={addCustomPage}>
            <Plus size={16} />
            Add Page
          </Button>
        </SectionHeader>
        
        <PagesList>
          {config.customPages.map((page, index) => (
            <PageCard key={index}>
              <PageHeader>
                <PageIcon>
                  <FileText size={20} />
                </PageIcon>
                <PageTitle>Page {index + 1}</PageTitle>
                <DeleteButton onClick={() => removeCustomPage(index)}>
                  <Trash2 size={16} />
                </DeleteButton>
              </PageHeader>
              
              <PageInputGrid>
                <InputGroup>
                  <Label>URL Path</Label>
                  <Input
                    type="text"
                    value={page.path}
                    onChange={(e) => updateCustomPage(index, 'path', e.target.value)}
                    placeholder="/admin"
                  />
                </InputGroup>
                <InputGroup>
                  <Label>Page Title</Label>
                  <Input
                    type="text"
                    value={page.title}
                    onChange={(e) => updateCustomPage(index, 'title', e.target.value)}
                    placeholder="Admin Panel"
                  />
                </InputGroup>
                <InputGroup>
                  <Label>Content Type</Label>
                  <Select
                    value={page.contentType}
                    onChange={(e) => updateCustomPage(index, 'contentType', e.target.value)}
                  >
                    <option value="text/html">HTML</option>
                    <option value="application/json">JSON</option>
                    <option value="text/plain">Plain Text</option>
                    <option value="text/xml">XML</option>
                  </Select>
                </InputGroup>
                <InputGroup $span={3}>
                  <Label>Content</Label>
                  <TextArea
                    value={page.content}
                    onChange={(e) => updateCustomPage(index, 'content', e.target.value)}
                    placeholder="Enter HTML content, JSON response, or plain text"
                    rows={6}
                  />
                </InputGroup>
              </PageInputGrid>
            </PageCard>
          ))}
        </PagesList>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>Fake Files</SectionTitle>
          <Button onClick={addFakeFile}>
            <Plus size={16} />
            Add File
          </Button>
        </SectionHeader>
        
        <FilesList>
          {config.fakeFiles.map((file, index) => (
            <FileCard key={index}>
              <FileHeader>
                <FileIcon>
                  <FileText size={20} />
                </FileIcon>
                <FileTitle>File {index + 1}</FileTitle>
                <DeleteButton onClick={() => removeFakeFile(index)}>
                  <Trash2 size={16} />
                </DeleteButton>
              </FileHeader>
              
              <FileInputGrid>
                <InputGroup>
                  <Label>File Path</Label>
                  <Input
                    type="text"
                    value={file.path}
                    onChange={(e) => updateFakeFile(index, 'path', e.target.value)}
                    placeholder="/documents/secret.pdf"
                  />
                </InputGroup>
                <InputGroup>
                  <Label>File Size</Label>
                  <Input
                    type="text"
                    value={file.size}
                    onChange={(e) => updateFakeFile(index, 'size', e.target.value)}
                    placeholder="2.4 MB"
                  />
                </InputGroup>
                <InputGroup $span={2}>
                  <Label>Description</Label>
                  <Input
                    type="text"
                    value={file.description}
                    onChange={(e) => updateFakeFile(index, 'description', e.target.value)}
                    placeholder="Confidential document"
                  />
                </InputGroup>
              </FileInputGrid>
            </FileCard>
          ))}
        </FilesList>
      </Section>
    </TabContent>
  );

  const renderAPITab = () => (
    <TabContent>
      <Section>
        <SectionHeader>
          <SectionTitle>API Endpoints</SectionTitle>
          <Button onClick={addAPIEndpoint}>
            <Plus size={16} />
            Add Endpoint
          </Button>
        </SectionHeader>
        
        <EndpointsList>
          {config.apiEndpoints.map((endpoint, index) => (
            <EndpointCard key={index}>
              <EndpointHeader>
                <EndpointIcon>
                  <Code size={20} />
                </EndpointIcon>
                <EndpointTitle>Endpoint {index + 1}</EndpointTitle>
                <DeleteButton onClick={() => removeAPIEndpoint(index)}>
                  <Trash2 size={16} />
                </DeleteButton>
              </EndpointHeader>
              
              <EndpointInputGrid>
                <InputGroup>
                  <Label>Path</Label>
                  <Input
                    type="text"
                    value={endpoint.path}
                    onChange={(e) => updateAPIEndpoint(index, 'path', e.target.value)}
                    placeholder="/api/users"
                  />
                </InputGroup>
                <InputGroup>
                  <Label>Method</Label>
                  <Select
                    value={endpoint.method}
                    onChange={(e) => updateAPIEndpoint(index, 'method', e.target.value)}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </Select>
                </InputGroup>
                <InputGroup>
                  <Label>Content Type</Label>
                  <Select
                    value={endpoint.contentType}
                    onChange={(e) => updateAPIEndpoint(index, 'contentType', e.target.value)}
                  >
                    <option value="application/json">JSON</option>
                    <option value="text/html">HTML</option>
                    <option value="text/plain">Plain Text</option>
                    <option value="application/xml">XML</option>
                  </Select>
                </InputGroup>
                <InputGroup $span={3}>
                  <Label>Response</Label>
                  <TextArea
                    value={endpoint.response}
                    onChange={(e) => updateAPIEndpoint(index, 'response', e.target.value)}
                    placeholder='{"status": "success", "data": []}'
                    rows={4}
                  />
                </InputGroup>
              </EndpointInputGrid>
            </EndpointCard>
          ))}
        </EndpointsList>
      </Section>

      <Section>
        <SectionTitle>Authentication</SectionTitle>
        <CheckboxGroup>
          <Checkbox
            type="checkbox"
            checked={config.authentication.enableBasicAuth}
            onChange={(e) => handleInputChange('authentication.enableBasicAuth', e.target.checked)}
          />
          <CheckboxLabel>Enable HTTP Basic Authentication</CheckboxLabel>
        </CheckboxGroup>

        {config.authentication.enableBasicAuth && (
          <>
            <InputGrid>
              <InputGroup>
                <Label>Realm</Label>
                <Input
                  type="text"
                  value={config.authentication.realm}
                  onChange={(e) => handleInputChange('authentication.realm', e.target.value)}
                  placeholder="Restricted Area"
                />
              </InputGroup>
            </InputGrid>

            <SectionHeader>
              <SectionTitle>Credentials</SectionTitle>
              <Button onClick={addCredential}>
                <Plus size={16} />
                Add Credential
              </Button>
            </SectionHeader>
            
            <CredentialsList>
              {config.authentication.credentials.map((cred, index) => (
                <CredentialCard key={index}>
                  <CredentialHeader>
                    <CredentialIcon>
                      <User size={20} />
                    </CredentialIcon>
                    <CredentialTitle>Credential {index + 1}</CredentialTitle>
                    <DeleteButton onClick={() => removeCredential(index)}>
                      <Trash2 size={16} />
                    </DeleteButton>
                  </CredentialHeader>
                  
                  <CredentialInputGrid>
                    <InputGroup>
                      <Label>Username</Label>
                      <Input
                        type="text"
                        value={cred.username}
                        onChange={(e) => updateCredential(index, 'username', e.target.value)}
                        placeholder="admin"
                      />
                    </InputGroup>
                    <InputGroup>
                      <Label>Password</Label>
                      <PasswordContainer>
                        <Input
                          type={showPassword[index] ? 'text' : 'password'}
                          value={cred.password}
                          onChange={(e) => updateCredential(index, 'password', e.target.value)}
                          placeholder="password"
                        />
                        <PasswordToggle
                          onClick={() => setShowPassword(prev => ({ ...prev, [index]: !prev[index] }))}
                        >
                          {showPassword[index] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </PasswordToggle>
                      </PasswordContainer>
                    </InputGroup>
                  </CredentialInputGrid>
                </CredentialCard>
              ))}
            </CredentialsList>
          </>
        )}
      </Section>
    </TabContent>
  );

  const renderSecurityTab = () => (
    <TabContent>
      <Section>
        <SectionTitle>Honeypot Features</SectionTitle>
        <CheckboxGrid>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.honeypotFeatures.captureFormData}
              onChange={(e) => handleInputChange('honeypotFeatures.captureFormData', e.target.checked)}
            />
            <CheckboxLabel>Capture Form Data</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.honeypotFeatures.logUserAgents}
              onChange={(e) => handleInputChange('honeypotFeatures.logUserAgents', e.target.checked)}
            />
            <CheckboxLabel>Log User Agents</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.honeypotFeatures.trackIPAddresses}
              onChange={(e) => handleInputChange('honeypotFeatures.trackIPAddresses', e.target.checked)}
            />
            <CheckboxLabel>Track IP Addresses</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.honeypotFeatures.recordRequestHeaders}
              onChange={(e) => handleInputChange('honeypotFeatures.recordRequestHeaders', e.target.checked)}
            />
            <CheckboxLabel>Record Request Headers</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.honeypotFeatures.simulateVulnerabilities}
              onChange={(e) => handleInputChange('honeypotFeatures.simulateVulnerabilities', e.target.checked)}
            />
            <CheckboxLabel>Simulate Vulnerabilities</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.honeypotFeatures.enableSQLInjectionDetection}
              onChange={(e) => handleInputChange('honeypotFeatures.enableSQLInjectionDetection', e.target.checked)}
            />
            <CheckboxLabel>SQL Injection Detection</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.honeypotFeatures.enableXSSDetection}
              onChange={(e) => handleInputChange('honeypotFeatures.enableXSSDetection', e.target.checked)}
            />
            <CheckboxLabel>XSS Detection</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.honeypotFeatures.enableDirectoryTraversal}
              onChange={(e) => handleInputChange('honeypotFeatures.enableDirectoryTraversal', e.target.checked)}
            />
            <CheckboxLabel>Directory Traversal Detection</CheckboxLabel>
          </CheckboxGroup>
        </CheckboxGrid>
      </Section>

      <Section>
        <SectionTitle>Security Settings</SectionTitle>
        <CheckboxGrid>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.securitySettings.enableRateLimiting}
              onChange={(e) => handleInputChange('securitySettings.enableRateLimiting', e.target.checked)}
            />
            <CheckboxLabel>Enable Rate Limiting</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.securitySettings.enableIPBlacklist}
              onChange={(e) => handleInputChange('securitySettings.enableIPBlacklist', e.target.checked)}
            />
            <CheckboxLabel>Enable IP Blacklist</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.securitySettings.enableRequestLogging}
              onChange={(e) => handleInputChange('securitySettings.enableRequestLogging', e.target.checked)}
            />
            <CheckboxLabel>Enable Request Logging</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              checked={config.securitySettings.logSensitiveData}
              onChange={(e) => handleInputChange('securitySettings.logSensitiveData', e.target.checked)}
            />
            <CheckboxLabel>Log Sensitive Data</CheckboxLabel>
          </CheckboxGroup>
        </CheckboxGrid>

        <InputGrid>
          <InputGroup>
            <Label>Max Requests per Minute</Label>
            <Input
              type="number"
              value={config.securitySettings.maxRequestsPerMinute}
              onChange={(e) => handleInputChange('securitySettings.maxRequestsPerMinute', parseInt(e.target.value))}
              min={1}
              max={1000}
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
          <Globe size={24} />
          HTTP Server Configuration
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
          <Tab $active={activeTab === 'content'} onClick={() => setActiveTab('content')}>
            Content & Files
          </Tab>
          <Tab $active={activeTab === 'api'} onClick={() => setActiveTab('api')}>
            API & Auth
          </Tab>
          <Tab $active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
            Security & Notifications
          </Tab>
        </TabNavigation>

        {activeTab === 'basic' && renderBasicTab()}
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'api' && renderAPITab()}
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
  grid-column: ${props => props.$span ? `span ${props.$span}` : 'span 1'};
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

  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
  resize: vertical;
  min-height: 100px;
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

const PagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PageCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: #f9fafb;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const PageIcon = styled.div`
  padding: 0.5rem;
  background: #2563eb;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PageTitle = styled.h3`
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

const PageInputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FilesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FileCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: #f9fafb;
`;

const FileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const FileIcon = styled.div`
  padding: 0.5rem;
  background: #7c3aed;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FileTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
`;

const FileInputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 2fr;
  gap: 1rem;
`;

const EndpointsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EndpointCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: #f9fafb;
`;

const EndpointHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const EndpointIcon = styled.div`
  padding: 0.5rem;
  background: #059669;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EndpointTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
`;

const EndpointInputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 180px;
  gap: 1rem;
`;

const CredentialsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CredentialCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: #f9fafb;
`;

const CredentialHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const CredentialIcon = styled.div`
  padding: 0.5rem;
  background: #059669;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CredentialTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
`;

const CredentialInputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
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
