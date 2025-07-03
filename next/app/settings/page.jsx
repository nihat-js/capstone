'use client';

import { useState, useEffect } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

export default function SettingsPage() {
  // Local storage for settings
  const [settings, setSettings] = useState({
    theme: 'dark',
    autoRefresh: true,
    refreshInterval: 5,
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    animations: true,
    soundEffects: true,
    notifications: {
      desktop: true,
      email: false,
      sound: true,
      threats: true,
      deployments: true,
      maintenance: true,
      criticalAlerts: true
    },
    dashboard: {
      showStats: true,
      showCharts: true,
      showRecentLogs: true,
      compactMode: false,
      showWeather: true,
      showClock: true,
      customBackground: false,
      chartType: 'line'
    },
    security: {
      sessionTimeout: 30,
      requireAuth: false,
      twoFactor: false,
      auditLogs: true,
      ipWhitelist: false,
      encryptLogs: true,
      autoLock: false
    },
    advanced: {
      debugMode: false,
      logLevel: 'info',
      maxLogEntries: 1000,
      enableAnalytics: true,
      apiRateLimit: 100,
      cacheTimeout: 300,
      performanceMode: false,
      experimentalFeatures: false
    },
    network: {
      proxyEnabled: false,
      proxyHost: '',
      proxyPort: 8080,
      sslVerification: true,
      timeout: 30,
      retryAttempts: 3
    },
    appearance: {
      primaryColor: '#667eea',
      accentColor: '#764ba2',
      fontSize: 'medium',
      sidebar: 'expanded',
      headerStyle: 'gradient',
      cardStyle: 'glass'
    }
  });

  const [activeSection, setActiveSection] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('honeywall-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings:', error);
        showNotification('Failed to load saved settings', 'error');
      }
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (hasChanges) {
      const timeoutId = setTimeout(() => {
        saveSettings(true); // Auto-save
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [settings, hasChanges]);

  // Save settings to localStorage
  const saveSettings = (autoSave = false) => {
    try {
      localStorage.setItem('honeywall-settings', JSON.stringify(settings));
      setHasChanges(false);
      if (!autoSave) {
        showNotification('Settings saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showNotification('Failed to save settings', 'error');
    }
  };

  // Export settings
  const exportSettings = () => {
    setIsExporting(true);
    setTimeout(() => {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `honeywall-settings-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setIsExporting(false);
      showNotification('Settings exported successfully!', 'success');
    }, 1000);
  };

  // Import settings
  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsImporting(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          setHasChanges(true);
          showNotification('Settings imported successfully!', 'success');
        } catch (error) {
          showNotification('Invalid settings file', 'error');
        }
        setIsImporting(false);
      };
      reader.readAsText(file);
    }
  };

  // Reset to defaults
  const resetSettings = () => {
    const defaultSettings = {
      theme: 'dark',
      autoRefresh: true,
      refreshInterval: 5,
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      animations: true,
      soundEffects: true,
      notifications: {
        desktop: true,
        email: false,
        sound: true,
        threats: true,
        deployments: true,
        maintenance: true,
        criticalAlerts: true
      },
      dashboard: {
        showStats: true,
        showCharts: true,
        showRecentLogs: true,
        compactMode: false,
        showWeather: true,
        showClock: true,
        customBackground: false,
        chartType: 'line'
      },
      security: {
        sessionTimeout: 30,
        requireAuth: false,
        twoFactor: false,
        auditLogs: true,
        ipWhitelist: false,
        encryptLogs: true,
        autoLock: false
      },
      advanced: {
        debugMode: false,
        logLevel: 'info',
        maxLogEntries: 1000,
        enableAnalytics: true,
        apiRateLimit: 100,
        cacheTimeout: 300,
        performanceMode: false,
        experimentalFeatures: false
      },
      network: {
        proxyEnabled: false,
        proxyHost: '',
        proxyPort: 8080,
        sslVerification: true,
        timeout: 30,
        retryAttempts: 3
      },
      appearance: {
        primaryColor: '#667eea',
        accentColor: '#764ba2',
        fontSize: 'medium',
        sidebar: 'expanded',
        headerStyle: 'gradient',
        cardStyle: 'glass'
      }
    };
    setSettings(defaultSettings);
    setHasChanges(true);
    showNotification('Settings reset to defaults', 'success');
  };

  // Update setting helper
  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && !Array.isArray(prev[section])
        ? { ...prev[section], [key]: value }
        : value
    }));
    setHasChanges(true);
  };

  // Show notification
  const showNotification = (message, type) => {
    // Enhanced notification implementation
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 1.2rem;">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
        </span>
        <span>${message}</span>
      </div>
    `;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                   type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 
                   'linear-gradient(135deg, #3b82f6, #2563eb)'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-weight: 500;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const sections = [
    { id: 'general', title: 'General', icon: '⚙️', color: '#667eea' },
    { id: 'appearance', title: 'Appearance', icon: '🎨', color: '#8b5cf6' },
    { id: 'notifications', title: 'Notifications', icon: '🔔', color: '#f59e0b' },
    { id: 'dashboard', title: 'Dashboard', icon: '📊', color: '#10b981' },
    { id: 'security', title: 'Security', icon: '🔒', color: '#ef4444' },
    { id: 'network', title: 'Network', icon: '🌐', color: '#06b6d4' },
    { id: 'advanced', title: 'Advanced', icon: '🔧', color: '#6366f1' }
  ];

  // Filter sections based on search
  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <GlobalStyles />
      <Container>
        <Header>
          <HeaderContent>
            <TitleWrapper>
              <Title>⚙️ Settings</Title>
              <StatusBadge>
                {hasChanges ? (
                  <PulseDot />
                ) : (
                  <CheckMark>✓</CheckMark>
                )}
                {hasChanges ? 'Unsaved Changes' : 'All Saved'}
              </StatusBadge>
            </TitleWrapper>
            <Subtitle>Customize your Honeywall experience with advanced configuration options</Subtitle>
            
            <SearchBar>
              <SearchInput
                type="text"
                placeholder="🔍 Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBar>
          </HeaderContent>
          
          <ActionButtons>
            <ImportButton>
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                style={{ display: 'none' }}
                id="import-settings"
              />
              <label htmlFor="import-settings">
                {isImporting ? '⏳ Importing...' : '📥 Import'}
              </label>
            </ImportButton>
            
            <ExportButton onClick={exportSettings} disabled={isExporting}>
              {isExporting ? '⏳ Exporting...' : '📤 Export'}
            </ExportButton>
            
            <ResetButton onClick={resetSettings}>
              🔄 Reset to Defaults
            </ResetButton>
            
            <SaveButton onClick={() => saveSettings()} disabled={!hasChanges}>
              {hasChanges ? '💾 Save Changes' : '✅ Saved'}
            </SaveButton>
          </ActionButtons>
        </Header>

        <Content>
          <TabNavigation>
            {filteredSections.map(section => (
              <TabItem 
                key={section.id}
                active={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
                color={section.color}
              >
                <SectionIcon>{section.icon}</SectionIcon>
                <SectionTitle>{section.title}</SectionTitle>
              </TabItem>
            ))}
          </TabNavigation>

          <MainContent>
            {activeSection === 'general' && (
              <Section>
                <SectionHeader>
                  <SectionHeaderContent>
                    <SectionHeaderTitle>⚙️ General Settings</SectionHeaderTitle>
                    <SectionDescription>Basic application preferences and behavior configuration</SectionDescription>
                  </SectionHeaderContent>
                  <SectionBadge>Core</SectionBadge>
                </SectionHeader>

                <SettingGroup>
                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🌓 Theme</SettingTitle>
                      <SettingDesc>Choose your preferred color scheme and visual style</SettingDesc>
                    </SettingLabel>
                    <Select 
                      value={settings.theme} 
                      onChange={(e) => updateSetting('theme', null, e.target.value)}
                    >
                      <option value="light">☀️ Light</option>
                      <option value="dark">🌙 Dark</option>
                      <option value="auto">🔄 Auto</option>
                    </Select>
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🌍 Language</SettingTitle>
                      <SettingDesc>Select your preferred interface language</SettingDesc>
                    </SettingLabel>
                    <Select 
                      value={settings.language} 
                      onChange={(e) => updateSetting('language', null, e.target.value)}
                    >
                      <option value="en">🇺🇸 English</option>
                      <option value="es">🇪🇸 Spanish</option>
                      <option value="fr">🇫🇷 French</option>
                      <option value="de">🇩🇪 German</option>
                      <option value="ja">🇯🇵 Japanese</option>
                    </Select>
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🕒 Timezone</SettingTitle>
                      <SettingDesc>Set your local timezone for accurate timestamps</SettingDesc>
                    </SettingLabel>
                    <Select 
                      value={settings.timezone} 
                      onChange={(e) => updateSetting('timezone', null, e.target.value)}
                    >
                      <option value="UTC">🌍 UTC</option>
                      <option value="America/New_York">🇺🇸 Eastern Time</option>
                      <option value="America/Los_Angeles">🇺🇸 Pacific Time</option>
                      <option value="Europe/London">🇬🇧 GMT</option>
                      <option value="Asia/Tokyo">🇯🇵 JST</option>
                    </Select>
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🔄 Auto Refresh</SettingTitle>
                      <SettingDesc>Automatically refresh data and status information</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.autoRefresh}
                      onChange={(e) => updateSetting('autoRefresh', null, e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>⏱️ Refresh Interval</SettingTitle>
                      <SettingDesc>How often to refresh data (seconds)</SettingDesc>
                    </SettingLabel>
                    <NumberInput 
                      value={settings.refreshInterval}
                      onChange={(e) => updateSetting('refreshInterval', null, parseInt(e.target.value))}
                      min="1"
                      max="60"
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>✨ Animations</SettingTitle>
                      <SettingDesc>Enable smooth animations and transitions</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.animations}
                      onChange={(e) => updateSetting('animations', null, e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🔊 Sound Effects</SettingTitle>
                      <SettingDesc>Play sound effects for actions and notifications</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.soundEffects}
                      onChange={(e) => updateSetting('soundEffects', null, e.target.checked)}
                    />
                  </SettingItem>
                </SettingGroup>
              </Section>
            )}

            {activeSection === 'appearance' && (
              <Section>
                <SectionHeader>
                  <SectionHeaderContent>
                    <SectionHeaderTitle>🎨 Appearance Settings</SectionHeaderTitle>
                    <SectionDescription>Customize the visual appearance and layout of your interface</SectionDescription>
                  </SectionHeaderContent>
                  <SectionBadge style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>Visual</SectionBadge>
                </SectionHeader>

                <SettingGroup>
                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🎨 Primary Color</SettingTitle>
                      <SettingDesc>Main accent color for the interface</SettingDesc>
                    </SettingLabel>
                    <ColorInput 
                      type="color"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>✨ Accent Color</SettingTitle>
                      <SettingDesc>Secondary color for highlights and accents</SettingDesc>
                    </SettingLabel>
                    <ColorInput 
                      type="color"
                      value={settings.appearance.accentColor}
                      onChange={(e) => updateSetting('appearance', 'accentColor', e.target.value)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>📏 Font Size</SettingTitle>
                      <SettingDesc>Base font size for better readability</SettingDesc>
                    </SettingLabel>
                    <Select 
                      value={settings.appearance.fontSize}
                      onChange={(e) => updateSetting('appearance', 'fontSize', e.target.value)}
                    >
                      <option value="small">📝 Small</option>
                      <option value="medium">📄 Medium</option>
                      <option value="large">📋 Large</option>
                      <option value="xlarge">📊 Extra Large</option>
                    </Select>
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>📱 Sidebar Style</SettingTitle>
                      <SettingDesc>Choose how the sidebar is displayed</SettingDesc>
                    </SettingLabel>
                    <Select 
                      value={settings.appearance.sidebar}
                      onChange={(e) => updateSetting('appearance', 'sidebar', e.target.value)}
                    >
                      <option value="expanded">📖 Expanded</option>
                      <option value="collapsed">📑 Collapsed</option>
                      <option value="overlay">📄 Overlay</option>
                    </Select>
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🎭 Card Style</SettingTitle>
                      <SettingDesc>Visual style for cards and panels</SettingDesc>
                    </SettingLabel>
                    <Select 
                      value={settings.appearance.cardStyle}
                      onChange={(e) => updateSetting('appearance', 'cardStyle', e.target.value)}
                    >
                      <option value="glass">💎 Glassmorphism</option>
                      <option value="solid">🔲 Solid</option>
                      <option value="outlined">📋 Outlined</option>
                      <option value="elevated">📈 Elevated</option>
                    </Select>
                  </SettingItem>
                </SettingGroup>
              </Section>
            )}

            {activeSection === 'notifications' && (
              <Section>
                <SectionHeader>
                  <SectionHeaderContent>
                    <SectionHeaderTitle>🔔 Notification Settings</SectionHeaderTitle>
                    <SectionDescription>Configure how you receive alerts and updates</SectionDescription>
                  </SectionHeaderContent>
                  <SectionBadge style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Alerts</SectionBadge>
                </SectionHeader>

                <SettingGroup>
                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🖥️ Desktop Notifications</SettingTitle>
                      <SettingDesc>Show browser notifications for important events</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.notifications.desktop}
                      onChange={(e) => updateSetting('notifications', 'desktop', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>📧 Email Notifications</SettingTitle>
                      <SettingDesc>Receive notifications via email</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.notifications.email}
                      onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🔊 Sound Alerts</SettingTitle>
                      <SettingDesc>Play sound when threats are detected</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.notifications.sound}
                      onChange={(e) => updateSetting('notifications', 'sound', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>⚠️ Threat Notifications</SettingTitle>
                      <SettingDesc>Alert when security threats are detected</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.notifications.threats}
                      onChange={(e) => updateSetting('notifications', 'threats', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🚀 Deployment Notifications</SettingTitle>
                      <SettingDesc>Notify when honeypots are deployed or stopped</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.notifications.deployments}
                      onChange={(e) => updateSetting('notifications', 'deployments', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🔧 Maintenance Notifications</SettingTitle>
                      <SettingDesc>Get notified about system maintenance and updates</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.notifications.maintenance}
                      onChange={(e) => updateSetting('notifications', 'maintenance', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🚨 Critical Alerts</SettingTitle>
                      <SettingDesc>High-priority security alerts and system failures</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.notifications.criticalAlerts}
                      onChange={(e) => updateSetting('notifications', 'criticalAlerts', e.target.checked)}
                    />
                  </SettingItem>
                </SettingGroup>
              </Section>
            )}

            {activeSection === 'dashboard' && (
              <Section>
                <SectionHeader>
                  <SectionHeaderContent>
                    <SectionHeaderTitle>📊 Dashboard Settings</SectionHeaderTitle>
                    <SectionDescription>Customize your dashboard layout and display options</SectionDescription>
                  </SectionHeaderContent>
                  <SectionBadge style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>Display</SectionBadge>
                </SectionHeader>

                <SettingGroup>
                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>📈 Show Statistics Cards</SettingTitle>
                      <SettingDesc>Display key metrics at the top of dashboard</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.dashboard.showStats}
                      onChange={(e) => updateSetting('dashboard', 'showStats', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>📊 Show Charts</SettingTitle>
                      <SettingDesc>Display data visualization charts</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.dashboard.showCharts}
                      onChange={(e) => updateSetting('dashboard', 'showCharts', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>📋 Chart Type</SettingTitle>
                      <SettingDesc>Choose the default chart visualization style</SettingDesc>
                    </SettingLabel>
                    <Select 
                      value={settings.dashboard.chartType}
                      onChange={(e) => updateSetting('dashboard', 'chartType', e.target.value)}
                    >
                      <option value="line">📈 Line Chart</option>
                      <option value="bar">📊 Bar Chart</option>
                      <option value="pie">🥧 Pie Chart</option>
                      <option value="area">📉 Area Chart</option>
                    </Select>
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>📜 Show Recent Logs</SettingTitle>
                      <SettingDesc>Display recent log entries on dashboard</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.dashboard.showRecentLogs}
                      onChange={(e) => updateSetting('dashboard', 'showRecentLogs', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🌤️ Show Weather Widget</SettingTitle>
                      <SettingDesc>Display current weather information</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.dashboard.showWeather}
                      onChange={(e) => updateSetting('dashboard', 'showWeather', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🕒 Show Clock Widget</SettingTitle>
                      <SettingDesc>Display current time and date</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.dashboard.showClock}
                      onChange={(e) => updateSetting('dashboard', 'showClock', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>📦 Compact Mode</SettingTitle>
                      <SettingDesc>Use smaller cards and reduced spacing</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.dashboard.compactMode}
                      onChange={(e) => updateSetting('dashboard', 'compactMode', e.target.checked)}
                    />
                  </SettingItem>
                </SettingGroup>
              </Section>
            )}

            {activeSection === 'security' && (
              <Section>
                <SectionHeader>
                  <SectionHeaderContent>
                    <SectionHeaderTitle>🔒 Security Settings</SectionHeaderTitle>
                    <SectionDescription>Configure security and authentication options</SectionDescription>
                  </SectionHeaderContent>
                  <SectionBadge style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>Critical</SectionBadge>
                </SectionHeader>

                <SettingGroup>
                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>⏰ Session Timeout</SettingTitle>
                      <SettingDesc>Auto-logout after inactivity (minutes)</SettingDesc>
                    </SettingLabel>
                    <NumberInput 
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="120"
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🔐 Require Authentication</SettingTitle>
                      <SettingDesc>Require login to access the dashboard</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.security.requireAuth}
                      onChange={(e) => updateSetting('security', 'requireAuth', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>📱 Two-Factor Authentication</SettingTitle>
                      <SettingDesc>Enable 2FA for enhanced security</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.security.twoFactor}
                      onChange={(e) => updateSetting('security', 'twoFactor', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>📝 Audit Logs</SettingTitle>
                      <SettingDesc>Keep detailed logs of user actions</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.security.auditLogs}
                      onChange={(e) => updateSetting('security', 'auditLogs', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🌐 IP Whitelist</SettingTitle>
                      <SettingDesc>Restrict access to specific IP addresses</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.security.ipWhitelist}
                      onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🔒 Encrypt Logs</SettingTitle>
                      <SettingDesc>Encrypt sensitive log data at rest</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.security.encryptLogs}
                      onChange={(e) => updateSetting('security', 'encryptLogs', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🔐 Auto Lock</SettingTitle>
                      <SettingDesc>Automatically lock the interface when idle</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.security.autoLock}
                      onChange={(e) => updateSetting('security', 'autoLock', e.target.checked)}
                    />
                  </SettingItem>
                </SettingGroup>
              </Section>
            )}

            {activeSection === 'network' && (
              <Section>
                <SectionHeader>
                  <SectionHeaderContent>
                    <SectionHeaderTitle>🌐 Network Settings</SectionHeaderTitle>
                    <SectionDescription>Configure network connectivity and proxy settings</SectionDescription>
                  </SectionHeaderContent>
                  <SectionBadge style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>Network</SectionBadge>
                </SectionHeader>

                <SettingGroup>
                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🔄 Proxy Enabled</SettingTitle>
                      <SettingDesc>Use proxy server for outbound connections</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.network.proxyEnabled}
                      onChange={(e) => updateSetting('network', 'proxyEnabled', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🖥️ Proxy Host</SettingTitle>
                      <SettingDesc>Proxy server hostname or IP address</SettingDesc>
                    </SettingLabel>
                    <TextInput 
                      value={settings.network.proxyHost}
                      onChange={(e) => updateSetting('network', 'proxyHost', e.target.value)}
                      placeholder="proxy.example.com"
                      disabled={!settings.network.proxyEnabled}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🔌 Proxy Port</SettingTitle>
                      <SettingDesc>Proxy server port number</SettingDesc>
                    </SettingLabel>
                    <NumberInput 
                      value={settings.network.proxyPort}
                      onChange={(e) => updateSetting('network', 'proxyPort', parseInt(e.target.value))}
                      min="1"
                      max="65535"
                      disabled={!settings.network.proxyEnabled}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🔒 SSL Verification</SettingTitle>
                      <SettingDesc>Verify SSL certificates for secure connections</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.network.sslVerification}
                      onChange={(e) => updateSetting('network', 'sslVerification', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>⏱️ Connection Timeout</SettingTitle>
                      <SettingDesc>Network request timeout (seconds)</SettingDesc>
                    </SettingLabel>
                    <NumberInput 
                      value={settings.network.timeout}
                      onChange={(e) => updateSetting('network', 'timeout', parseInt(e.target.value))}
                      min="5"
                      max="300"
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🔄 Retry Attempts</SettingTitle>
                      <SettingDesc>Number of retry attempts for failed requests</SettingDesc>
                    </SettingLabel>
                    <NumberInput 
                      value={settings.network.retryAttempts}
                      onChange={(e) => updateSetting('network', 'retryAttempts', parseInt(e.target.value))}
                      min="0"
                      max="10"
                    />
                  </SettingItem>
                </SettingGroup>
              </Section>
            )}

            {activeSection === 'advanced' && (
              <Section>
                <SectionHeader>
                  <SectionHeaderContent>
                    <SectionHeaderTitle>🔧 Advanced Settings</SectionHeaderTitle>
                    <SectionDescription>Technical configuration for power users and system optimization</SectionDescription>
                  </SectionHeaderContent>
                  <SectionBadge style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>Expert</SectionBadge>
                </SectionHeader>

                <SettingGroup>
                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🐛 Debug Mode</SettingTitle>
                      <SettingDesc>Enable detailed debugging information and console logs</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.advanced.debugMode}
                      onChange={(e) => updateSetting('advanced', 'debugMode', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>📊 Log Level</SettingTitle>
                      <SettingDesc>Minimum log level to display and store</SettingDesc>
                    </SettingLabel>
                    <Select 
                      value={settings.advanced.logLevel}
                      onChange={(e) => updateSetting('advanced', 'logLevel', e.target.value)}
                    >
                      <option value="debug">🔍 Debug</option>
                      <option value="info">ℹ️ Info</option>
                      <option value="warning">⚠️ Warning</option>
                      <option value="error">❌ Error</option>
                    </Select>
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>📋 Max Log Entries</SettingTitle>
                      <SettingDesc>Maximum number of log entries to keep in memory</SettingDesc>
                    </SettingLabel>
                    <NumberInput 
                      value={settings.advanced.maxLogEntries}
                      onChange={(e) => updateSetting('advanced', 'maxLogEntries', parseInt(e.target.value))}
                      min="100"
                      max="10000"
                      step="100"
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>📈 Enable Analytics</SettingTitle>
                      <SettingDesc>Collect usage analytics for improving the platform</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.advanced.enableAnalytics}
                      onChange={(e) => updateSetting('advanced', 'enableAnalytics', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🌊 API Rate Limit</SettingTitle>
                      <SettingDesc>Maximum API requests per minute</SettingDesc>
                    </SettingLabel>
                    <NumberInput 
                      value={settings.advanced.apiRateLimit}
                      onChange={(e) => updateSetting('advanced', 'apiRateLimit', parseInt(e.target.value))}
                      min="10"
                      max="1000"
                      step="10"
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>💾 Cache Timeout</SettingTitle>
                      <SettingDesc>Cache expiration time (seconds)</SettingDesc>
                    </SettingLabel>
                    <NumberInput 
                      value={settings.advanced.cacheTimeout}
                      onChange={(e) => updateSetting('advanced', 'cacheTimeout', parseInt(e.target.value))}
                      min="60"
                      max="3600"
                      step="60"
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>⚡ Performance Mode</SettingTitle>
                      <SettingDesc>Optimize for performance over visual effects</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.advanced.performanceMode}
                      onChange={(e) => updateSetting('advanced', 'performanceMode', e.target.checked)}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>🧪 Experimental Features</SettingTitle>
                      <SettingDesc>Enable beta features and experimental functionality</SettingDesc>
                    </SettingLabel>
                    <Toggle 
                      checked={settings.advanced.experimentalFeatures}
                      onChange={(e) => updateSetting('advanced', 'experimentalFeatures', e.target.checked)}
                    />
                  </SettingItem>
                </SettingGroup>
              </Section>
            )}
          </MainContent>
        </Content>

        {hasChanges && (
          <FloatingPanel>
            <PanelContent>
              <SaveIcon>💾</SaveIcon>
              <PanelText>
                <PanelTitle>Unsaved Changes</PanelTitle>
                <PanelDesc>Your settings have been modified</PanelDesc>
              </PanelText>
              <PanelActions>
                <DiscardButton onClick={() => window.location.reload()}>
                  Discard
                </DiscardButton>
                <SaveButton onClick={() => saveSettings()}>
                  Save Now
                </SaveButton>
              </PanelActions>
            </PanelContent>
          </FloatingPanel>
        )}
      </Container>
    </>
  );
}

// Enhanced Styled Components with stunning animations and effects
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  padding: 32px;
  position: relative;
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="60" cy="40" r="1.5" fill="rgba(255,255,255,0.15)"/><circle cx="80" cy="70" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="30" cy="80" r="2.5" fill="rgba(255,255,255,0.05)"/></svg>');
    animation: float 20s ease-in-out infinite;
    pointer-events: none;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
    background-size: 200% 100%;
    animation: shimmer 3s linear infinite;
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  background-size: 200% 200%;
  animation: gradientShift 4s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.children[1] === 'Unsaved Changes' 
    ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
    : 'linear-gradient(135deg, #10b981, #059669)'};
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const PulseDot = styled.div`
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 2s ease infinite;
`;

const CheckMark = styled.span`
  font-size: 1rem;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 1.1rem;
  margin: 0 0 24px 0;
  font-weight: 500;
`;

const SearchBar = styled.div`
  position: relative;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const ImportButton = styled.div`
  label {
    display: inline-block;
    padding: 12px 24px;
    border: 2px solid #e2e8f0;
    background: white;
    color: #475569;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
  }
`;

const ExportButton = styled.button`
  padding: 12px 24px;
  border: 2px solid #10b981;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResetButton = styled.button`
  padding: 12px 24px;
  border: 2px solid #ef4444;
  background: white;
  color: #ef4444;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ef4444;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
  }
`;

const SaveButton = styled.button`
  padding: 12px 24px;
  background: ${props => props.disabled 
    ? 'linear-gradient(135deg, #10b981, #059669)' 
    : 'linear-gradient(135deg, #667eea, #764ba2)'};
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:disabled {
    opacity: 0.8;
    cursor: default;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  min-height: calc(100vh - 200px);
`;

const TabNavigation = styled.div`
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-weight: 600;
  font-size: 0.9rem;
  
  ${props => props.active ? `
    background: linear-gradient(135deg, ${props.color || '#667eea'} 0%, ${props.color || '#764ba2'} 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${props.color || '#667eea'}40;
  ` : `
    color: #64748b;
    &:hover {
      background: linear-gradient(135deg, ${props.color || '#667eea'}10, ${props.color || '#764ba2'}10);
      color: #475569;
      transform: translateY(-1px);
    }
  `}
`;

const SectionIcon = styled.span`
  font-size: 1.1rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
`;

const SectionTitle = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
`;

const MainContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  width: 100%;
`;

const Section = styled.div`
  animation: fadeInUp 0.6s ease;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f1f5f9;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 1px;
  }
`;

const SectionHeaderContent = styled.div``;

const SectionHeaderTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionDescription = styled.p`
  color: #64748b;
  font-size: 1rem;
  margin: 8px 0 0 0;
  font-weight: 500;
`;

const SectionBadge = styled.div`
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const SettingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 16px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: #e2e8f0;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const SettingLabel = styled.div`
  flex: 1;
  min-width: 0;
`;

const SettingTitle = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SettingDesc = styled.div`
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
`;

const Toggle = styled.input.attrs({ type: 'checkbox' })`
  width: 56px;
  height: 32px;
  appearance: none;
  background: #cbd5e1;
  border-radius: 16px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:checked {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:checked::after {
    transform: translateX(24px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  &:hover {
    transform: scale(1.05);
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }
  
  &:hover {
    border-color: #cbd5e1;
  }
`;

const NumberInput = styled.input.attrs({ type: 'number' })`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-weight: 500;
  width: 100px;
  transition: all 0.3s ease;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }
  
  &:hover {
    border-color: #cbd5e1;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TextInput = styled.input.attrs({ type: 'text' })`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-weight: 500;
  min-width: 200px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }
  
  &:hover {
    border-color: #cbd5e1;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f8fafc;
  }
`;

const ColorInput = styled.input.attrs({ type: 'color' })`
  width: 60px;
  height: 40px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #cbd5e1;
    transform: scale(1.05);
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 8px;
  }
`;

const FloatingPanel = styled.div`
  position: fixed;
  bottom: 32px;
  right: 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 20px 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideInRight 0.5s ease;
  z-index: 1000;
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const PanelContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SaveIcon = styled.div`
  font-size: 1.5rem;
  animation: bounce 2s ease infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
`;

const PanelText = styled.div``;

const PanelTitle = styled.div`
  font-weight: 700;
  color: #0f172a;
  font-size: 0.95rem;
`;

const PanelDesc = styled.div`
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
`;

const PanelActions = styled.div`
  display: flex;
  gap: 12px;
`;

const DiscardButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  
  &:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }
`;
