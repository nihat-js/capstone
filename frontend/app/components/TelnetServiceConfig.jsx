import React, { useState } from 'react';
import styled from 'styled-components';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

export function TelnetServiceConfig({ onBack, onSave }) {
  const [config, setConfig] = useState({
    name: '',
    port: 23,
    banner: 'Cisco IOS Software, Version 15.1(4)M12a\nCopyright (c) 1986-2016 by Cisco Systems, Inc.',
    deviceType: 'cisco_router',
    hostname: 'Router-01',
    domain: 'company.local',
    motd: 'Authorized access only. All activities are monitored.',
    enablePassword: 'enable123',
    consolePassword: 'console123',
    maxConnections: 5,
    sessionTimeout: 600,
    deviceInfo: {
      model: 'CISCO2921/K9',
      serialNumber: 'FCZ1752A0QS',
      ios: '15.1(4)M12a',
      uptime: '2 years, 45 weeks, 3 days, 12 hours, 30 minutes'
    },
    interfaces: [
      { name: 'GigabitEthernet0/0', ip: '192.168.1.1', mask: '255.255.255.0', status: 'up' },
      { name: 'GigabitEthernet0/1', ip: '10.0.0.1', mask: '255.255.255.0', status: 'down' },
      { name: 'Serial0/0/0', ip: '203.0.113.1', mask: '255.255.255.252', status: 'up' }
    ],
    routes: [
      { network: '0.0.0.0', mask: '0.0.0.0', gateway: '192.168.1.254', interface: 'GigabitEthernet0/0' },
      { network: '10.0.0.0', mask: '255.255.255.0', gateway: 'directly connected', interface: 'GigabitEthernet0/1' }
    ],
    users: [
      { username: 'admin', password: 'admin123', privilege: 15 },
      { username: 'operator', password: 'op123', privilege: 1 },
      { username: 'readonly', password: 'read123', privilege: 1 }
    ],
    commands: {
      'show version': 'Display system version',
      'show ip route': 'Display routing table',
      'show interface': 'Display interface status',
      'show running-config': 'Display current configuration',
      'show ip arp': 'Display ARP table',
      'ping': 'Test network connectivity',
      'traceroute': 'Trace route to destination'
    },
    notifications: {
      telegram: {
        enabled: false,
        botToken: '',
        chatId: '',
        events: ['login_attempt', 'privilege_escalation', 'config_change']
      }
    },
    logRetention: 30
  });

  const [newInterface, setNewInterface] = useState({ name: '', ip: '', mask: '', status: 'up' });
  const [newRoute, setNewRoute] = useState({ network: '', mask: '', gateway: '', interface: '' });
  const [newUser, setNewUser] = useState({ username: '', password: '', privilege: 1 });

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

  const addInterface = () => {
    if (newInterface.name && newInterface.ip) {
      setConfig(prev => ({
        ...prev,
        interfaces: [...prev.interfaces, { ...newInterface }]
      }));
      setNewInterface({ name: '', ip: '', mask: '', status: 'up' });
    }
  };

  const removeInterface = (index) => {
    setConfig(prev => ({
      ...prev,
      interfaces: prev.interfaces.filter((_, i) => i !== index)
    }));
  };

  const addRoute = () => {
    if (newRoute.network && newRoute.gateway) {
      setConfig(prev => ({
        ...prev,
        routes: [...prev.routes, { ...newRoute }]
      }));
      setNewRoute({ network: '', mask: '', gateway: '', interface: '' });
    }
  };

  const removeRoute = (index) => {
    setConfig(prev => ({
      ...prev,
      routes: prev.routes.filter((_, i) => i !== index)
    }));
  };

  const addUser = () => {
    if (newUser.username && newUser.password) {
      setConfig(prev => ({
        ...prev,
        users: [...prev.users, { ...newUser }]
      }));
      setNewUser({ username: '', password: '', privilege: 1 });
    }
  };

  const removeUser = (index) => {
    setConfig(prev => ({
      ...prev,
      users: prev.users.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave({
      type: 'telnet',
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
          <ServiceTitle>Telnet Server Configuration</ServiceTitle>
          <ServiceDescription>Configure network device simulation with realistic interfaces and routing tables</ServiceDescription>
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
                placeholder="e.g., Main Router"
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
              <Label>Device Type</Label>
              <Select
                value={config.deviceType}
                onChange={(e) => handleConfigChange(null, 'deviceType', e.target.value)}
              >
                <option value="cisco_router">Cisco Router</option>
                <option value="cisco_switch">Cisco Switch</option>
                <option value="juniper_router">Juniper Router</option>
                <option value="linux_server">Linux Server</option>
                <option value="windows_server">Windows Server</option>
              </Select>
            </FormField>
            <FormField>
              <Label>Hostname</Label>
              <Input
                type="text"
                value={config.hostname}
                onChange={(e) => handleConfigChange(null, 'hostname', e.target.value)}
                placeholder="Router-01"
              />
            </FormField>
          </FormGrid>
        </ConfigSection>

        {/* Device Information */}
        <ConfigSection>
          <SectionTitle>Device Information</SectionTitle>
          <FormGrid>
            <FormField>
              <Label>Model</Label>
              <Input
                type="text"
                value={config.deviceInfo.model}
                onChange={(e) => handleConfigChange('deviceInfo', 'model', e.target.value)}
                placeholder="CISCO2921/K9"
              />
            </FormField>
            <FormField>
              <Label>Serial Number</Label>
              <Input
                type="text"
                value={config.deviceInfo.serialNumber}
                onChange={(e) => handleConfigChange('deviceInfo', 'serialNumber', e.target.value)}
                placeholder="FCZ1752A0QS"
              />
            </FormField>
            <FormField>
              <Label>IOS Version</Label>
              <Input
                type="text"
                value={config.deviceInfo.ios}
                onChange={(e) => handleConfigChange('deviceInfo', 'ios', e.target.value)}
                placeholder="15.1(4)M12a"
              />
            </FormField>
            <FormField>
              <Label>Uptime</Label>
              <Input
                type="text"
                value={config.deviceInfo.uptime}
                onChange={(e) => handleConfigChange('deviceInfo', 'uptime', e.target.value)}
                placeholder="2 years, 45 weeks, 3 days, 12 hours, 30 minutes"
              />
            </FormField>
          </FormGrid>
          
          <FormField>
            <Label>Login Banner</Label>
            <TextArea
              value={config.banner}
              onChange={(e) => handleConfigChange(null, 'banner', e.target.value)}
              rows={3}
              placeholder="Device banner message..."
            />
          </FormField>
          
          <FormField>
            <Label>Message of the Day</Label>
            <TextArea
              value={config.motd}
              onChange={(e) => handleConfigChange(null, 'motd', e.target.value)}
              rows={2}
              placeholder="MOTD message..."
            />
          </FormField>
        </ConfigSection>

        {/* Authentication */}
        <ConfigSection>
          <SectionTitle>Authentication</SectionTitle>
          <FormGrid>
            <FormField>
              <Label>Enable Password</Label>
              <Input
                type="password"
                value={config.enablePassword}
                onChange={(e) => handleConfigChange(null, 'enablePassword', e.target.value)}
                placeholder="enable123"
              />
            </FormField>
            <FormField>
              <Label>Console Password</Label>
              <Input
                type="password"
                value={config.consolePassword}
                onChange={(e) => handleConfigChange(null, 'consolePassword', e.target.value)}
                placeholder="console123"
              />
            </FormField>
          </FormGrid>
        </ConfigSection>

        {/* Network Interfaces */}
        <ConfigSection>
          <SectionTitle>Network Interfaces</SectionTitle>
          <InterfacesTable>
            <TableHeader>
              <HeaderCell>Interface</HeaderCell>
              <HeaderCell>IP Address</HeaderCell>
              <HeaderCell>Subnet Mask</HeaderCell>
              <HeaderCell>Status</HeaderCell>
              <HeaderCell>Actions</HeaderCell>
            </TableHeader>
            <TableBody>
              {config.interfaces.map((iface, index) => (
                <TableRow key={index}>
                  <TableCell>{iface.name}</TableCell>
                  <TableCell>{iface.ip}</TableCell>
                  <TableCell>{iface.mask}</TableCell>
                  <TableCell>
                    <StatusBadge $status={iface.status}>
                      {iface.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <DeleteButton onClick={() => removeInterface(index)}>
                      <Trash2 size={16} />
                    </DeleteButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </InterfacesTable>

          <AddForm>
            <AddInputs>
              <Input
                type="text"
                placeholder="Interface name"
                value={newInterface.name}
                onChange={(e) => setNewInterface(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                type="text"
                placeholder="IP Address"
                value={newInterface.ip}
                onChange={(e) => setNewInterface(prev => ({ ...prev, ip: e.target.value }))}
              />
              <Input
                type="text"
                placeholder="Subnet Mask"
                value={newInterface.mask}
                onChange={(e) => setNewInterface(prev => ({ ...prev, mask: e.target.value }))}
              />
              <Select
                value={newInterface.status}
                onChange={(e) => setNewInterface(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="up">Up</option>
                <option value="down">Down</option>
              </Select>
            </AddInputs>
            <AddButton onClick={addInterface}>
              <Plus size={16} />
              Add Interface
            </AddButton>
          </AddForm>
        </ConfigSection>

        {/* Routing Table */}
        <ConfigSection>
          <SectionTitle>Routing Table</SectionTitle>
          <RoutesTable>
            <TableHeader>
              <HeaderCell>Network</HeaderCell>
              <HeaderCell>Mask</HeaderCell>
              <HeaderCell>Gateway</HeaderCell>
              <HeaderCell>Interface</HeaderCell>
              <HeaderCell>Actions</HeaderCell>
            </TableHeader>
            <TableBody>
              {config.routes.map((route, index) => (
                <TableRow key={index}>
                  <TableCell>{route.network}</TableCell>
                  <TableCell>{route.mask}</TableCell>
                  <TableCell>{route.gateway}</TableCell>
                  <TableCell>{route.interface}</TableCell>
                  <TableCell>
                    <DeleteButton onClick={() => removeRoute(index)}>
                      <Trash2 size={16} />
                    </DeleteButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </RoutesTable>

          <AddForm>
            <AddInputs>
              <Input
                type="text"
                placeholder="Network"
                value={newRoute.network}
                onChange={(e) => setNewRoute(prev => ({ ...prev, network: e.target.value }))}
              />
              <Input
                type="text"
                placeholder="Mask"
                value={newRoute.mask}
                onChange={(e) => setNewRoute(prev => ({ ...prev, mask: e.target.value }))}
              />
              <Input
                type="text"
                placeholder="Gateway"
                value={newRoute.gateway}
                onChange={(e) => setNewRoute(prev => ({ ...prev, gateway: e.target.value }))}
              />
              <Input
                type="text"
                placeholder="Interface"
                value={newRoute.interface}
                onChange={(e) => setNewRoute(prev => ({ ...prev, interface: e.target.value }))}
              />
            </AddInputs>
            <AddButton onClick={addRoute}>
              <Plus size={16} />
              Add Route
            </AddButton>
          </AddForm>
        </ConfigSection>

        {/* User Accounts */}
        <ConfigSection>
          <SectionTitle>User Accounts</SectionTitle>
          <UsersTable>
            <TableHeader>
              <HeaderCell>Username</HeaderCell>
              <HeaderCell>Password</HeaderCell>
              <HeaderCell>Privilege Level</HeaderCell>
              <HeaderCell>Actions</HeaderCell>
            </TableHeader>
            <TableBody>
              {config.users.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>••••••••</TableCell>
                  <TableCell>{user.privilege}</TableCell>
                  <TableCell>
                    <DeleteButton onClick={() => removeUser(index)}>
                      <Trash2 size={16} />
                    </DeleteButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </UsersTable>

          <AddForm>
            <AddInputs>
              <Input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              />
              <Select
                value={newUser.privilege}
                onChange={(e) => setNewUser(prev => ({ ...prev, privilege: parseInt(e.target.value) }))}
              >
                <option value={1}>User (1)</option>
                <option value={15}>Admin (15)</option>
              </Select>
            </AddInputs>
            <AddButton onClick={addUser}>
              <Plus size={16} />
              Add User
            </AddButton>
          </AddForm>
        </ConfigSection>
      </ConfigContent>
    </ConfigContainer>
  );
}

// Reuse most styled components from SSH config with some additions
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

const InterfacesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
`;

const RoutesTable = styled(InterfacesTable)``;
const UsersTable = styled(InterfacesTable)``;

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

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${({ $status }) => $status === 'up' ? '#dcfce7' : '#fee2e2'};
  color: ${({ $status }) => $status === 'up' ? '#16a34a' : '#dc2626'};
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

const AddForm = styled.div`
  display: flex;
  gap: 1rem;
  align-items: end;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
`;

const AddInputs = styled.div`
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
