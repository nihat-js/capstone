'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { ArrowLeft, Settings, Save, Bell, Shield, Database, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      telegram: false,
      slack: false,
      webhook: false
    },
    security: {
      autoBackup: true,
      encryptLogs: true,
      retentionDays: 30,
      maxConcurrentConnections: 100
    },
    general: {
      timezone: 'UTC',
      language: 'en',
      theme: 'light',
      autoUpdate: true
    }
  })

  const handleBack = () => {
    router.push('/')
  }

  const handleSave = () => {
    // TODO: Save settings to API
    alert('Settings saved successfully!')
  }

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </BackButton>
        <HeaderTitle>
          <Settings size={24} />
          Settings
        </HeaderTitle>
        <SaveButton onClick={handleSave}>
          <Save size={16} />
          Save Changes
        </SaveButton>
      </Header>

      <Content>
        <SettingsGrid>
          <SettingsSection>
            <SectionHeader>
              <SectionIcon>
                <Bell size={20} />
              </SectionIcon>
              <SectionTitle>Notifications</SectionTitle>
            </SectionHeader>
            
            <SettingsList>
              <SettingItem>
                <SettingLabel>
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                  />
                  Email Notifications
                </SettingLabel>
                <SettingDescription>Receive alerts via email</SettingDescription>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel>
                  <input
                    type="checkbox"
                    checked={settings.notifications.telegram}
                    onChange={(e) => handleSettingChange('notifications', 'telegram', e.target.checked)}
                  />
                  Telegram Notifications
                </SettingLabel>
                <SettingDescription>Receive alerts via Telegram bot</SettingDescription>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel>
                  <input
                    type="checkbox"
                    checked={settings.notifications.slack}
                    onChange={(e) => handleSettingChange('notifications', 'slack', e.target.checked)}
                  />
                  Slack Integration
                </SettingLabel>
                <SettingDescription>Send alerts to Slack channels</SettingDescription>
              </SettingItem>
            </SettingsList>
          </SettingsSection>

          <SettingsSection>
            <SectionHeader>
              <SectionIcon>
                <Shield size={20} />
              </SectionIcon>
              <SectionTitle>Security</SectionTitle>
            </SectionHeader>
            
            <SettingsList>
              <SettingItem>
                <SettingLabel>
                  <input
                    type="checkbox"
                    checked={settings.security.autoBackup}
                    onChange={(e) => handleSettingChange('security', 'autoBackup', e.target.checked)}
                  />
                  Automatic Backup
                </SettingLabel>
                <SettingDescription>Automatically backup configurations and logs</SettingDescription>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel>
                  <input
                    type="checkbox"
                    checked={settings.security.encryptLogs}
                    onChange={(e) => handleSettingChange('security', 'encryptLogs', e.target.checked)}
                  />
                  Encrypt Logs
                </SettingLabel>
                <SettingDescription>Encrypt stored log files for security</SettingDescription>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel>Log Retention Period</SettingLabel>
                <SettingInput>
                  <input
                    type="number"
                    value={settings.security.retentionDays}
                    onChange={(e) => handleSettingChange('security', 'retentionDays', parseInt(e.target.value))}
                    min={1}
                    max={365}
                  />
                  <span>days</span>
                </SettingInput>
              </SettingItem>
            </SettingsList>
          </SettingsSection>

          <SettingsSection>
            <SectionHeader>
              <SectionIcon>
                <Globe size={20} />
              </SectionIcon>
              <SectionTitle>General</SectionTitle>
            </SectionHeader>
            
            <SettingsList>
              <SettingItem>
                <SettingLabel>Timezone</SettingLabel>
                <SettingSelect>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </SettingSelect>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel>Theme</SettingLabel>
                <SettingSelect>
                  <select
                    value={settings.general.theme}
                    onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </SettingSelect>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel>
                  <input
                    type="checkbox"
                    checked={settings.general.autoUpdate}
                    onChange={(e) => handleSettingChange('general', 'autoUpdate', e.target.checked)}
                  />
                  Automatic Updates
                </SettingLabel>
                <SettingDescription>Automatically update honeypot configurations</SettingDescription>
              </SettingItem>
            </SettingsList>
          </SettingsSection>
        </SettingsGrid>
      </Content>
    </Container>
  )
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
  padding: 2rem;
  overflow-y: auto;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
`;

const SettingsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const SectionIcon = styled.div`
  padding: 0.5rem;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SettingItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SettingLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;

  input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    accent-color: #2563eb;
  }
`;

const SettingDescription = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  margin-left: 1.5rem;
`;

const SettingInput = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    width: 80px;

    &:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  }

  span {
    font-size: 0.875rem;
    color: #6b7280;
  }
`;

const SettingSelect = styled.div`
  select {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    background: white;
    min-width: 150px;

    &:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  }
`;
