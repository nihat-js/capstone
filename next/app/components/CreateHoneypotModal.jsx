'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { X, Plus, Server } from 'lucide-react'
import { NotificationModal } from './NotificationModal'

export function CreateHoneypotModal({ availableServices, onClose, onSuccess, apiService }) {
  const [selectedService, setSelectedService] = useState('')
  const [port, setPort] = useState('')
  const [users, setUsers] = useState([{ username: 'admin', password: 'admin123', sudo: true }])
  const [rootPassword, setRootPassword] = useState('root')
  const [postgresPassword, setPostgresPassword] = useState('postgres')
  const [redisPassword, setRedisPassword] = useState('')
  const [ftpUser, setFtpUser] = useState('ftpuser')
  const [ftpPassword, setFtpPassword] = useState('ftppass')
  const [sshBanner, setSshBanner] = useState('Welcome to the SSH honeypot server')
  const [passwdChmod, setPasswdChmod] = useState('644')
  const [shadowChmod, setShadowChmod] = useState('640')
  const [mysqlInitSql, setMysqlInitSql] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [creatingProgress, setCreatingProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [notification, setNotification] = useState(null)

  // Convert rwx permissions to octal
  const convertPermissions = (owner, group, other) => {
    const getValue = (rwx) => {
      let value = 0
      if (rwx.includes('r')) value += 4
      if (rwx.includes('w')) value += 2
      if (rwx.includes('x')) value += 1
      return value
    }
    return `${getValue(owner)}${getValue(group)}${getValue(other)}`
  }

  // Parse octal permissions to rwx
  const parsePermissions = (octal) => {
    const getRwx = (digit) => {
      const d = parseInt(digit)
      return {
        r: (d & 4) === 4,
        w: (d & 2) === 2,
        x: (d & 1) === 1
      }
    }
    const digits = octal.toString().padStart(3, '0')
    return {
      owner: getRwx(digits[0]),
      group: getRwx(digits[1]),
      other: getRwx(digits[2])
    }
  }

  const [passwdPerms, setPasswdPerms] = useState(parsePermissions('644'))
  const [shadowPerms, setShadowPerms] = useState(parsePermissions('640'))

  const updatePermission = (type, role, permission, value) => {
    if (type === 'passwd') {
      setPasswdPerms(prev => ({
        ...prev,
        [role]: { ...prev[role], [permission]: value }
      }))
    } else {
      setShadowPerms(prev => ({
        ...prev,
        [role]: { ...prev[role], [permission]: value }
      }))
    }
  }

  // Progress simulation
  const simulateProgress = () => {
    setCreatingProgress(0)
    setElapsedTime(0)
    
    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setElapsedTime(elapsed)
      
      // Progress speeds up initially, then slows down, gets stuck at 95%
      let progress
      if (elapsed < 30) {
        progress = elapsed * 2 // Fast progress for first 30 seconds (0-60%)
      } else if (elapsed < 60) {
        progress = 60 + (elapsed - 30) * 0.8 // Slower progress (60-84%)
      } else if (elapsed < 90) {
        progress = 84 + (elapsed - 60) * 0.3 // Even slower (84-93%)
      } else if (elapsed < 120) {
        progress = 93 + (elapsed - 90) * 0.067 // Very slow (93-95%)
      } else {
        progress = 95 // Stuck at 95%
      }
      
      setCreatingProgress(Math.min(progress, 95))
    }, 100)
    
    return progressInterval
  }

  const getProgressText = () => {
    if (creatingProgress < 20) return 'Pulling container image'
    if (creatingProgress < 40) return 'Setting up environment'
    if (creatingProgress < 60) return 'Configuring services'
    if (creatingProgress < 80) return 'Applying security settings'
    if (creatingProgress < 95) return 'Starting container'
    return 'Finalizing setup'
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getEstimatedTimeRemaining = () => {
    const totalEstimated = 180 // 3 minutes
    const remaining = Math.max(0, totalEstimated - elapsedTime)
    return formatTime(remaining)
  }

  const handleCreate = async () => {
    if (!selectedService || !port) {
      setNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please select a service and enter a port number.'
      })
      return
    }

    // Validate SSH users if it's SSH service
    if (selectedService === 'ssh' && users.some(u => !u.username || !u.password)) {
      setNotification({
        type: 'warning',
        title: 'SSH Configuration Error',
        message: 'Please fill in all username and password fields for SSH users.'
      })
      return
    }

    // Validate FTP credentials
    if (selectedService === 'ftp' && (!ftpUser || !ftpPassword)) {
      setNotification({
        type: 'warning',
        title: 'FTP Configuration Error',
        message: 'Please provide both FTP username and password.'
      })
      return
    }

    setIsCreating(true)
    const progressInterval = simulateProgress()
    
    try {
      const config = {
        name: selectedService,
        port: parseInt(port)
      }

      // Add users for SSH service
      if (selectedService === 'ssh') {
        config.users = users
        config.banner = sshBanner
        config.passwd_chmod = convertPermissions(
          Object.keys(passwdPerms.owner).filter(k => passwdPerms.owner[k]).join(''),
          Object.keys(passwdPerms.group).filter(k => passwdPerms.group[k]).join(''),
          Object.keys(passwdPerms.other).filter(k => passwdPerms.other[k]).join('')
        )
        config.shadow_chmod = convertPermissions(
          Object.keys(shadowPerms.owner).filter(k => shadowPerms.owner[k]).join(''),
          Object.keys(shadowPerms.group).filter(k => shadowPerms.group[k]).join(''),
          Object.keys(shadowPerms.other).filter(k => shadowPerms.other[k]).join('')
        )
      }

      // Add passwords for database services
      if (selectedService === 'mysql') {
        config.root_password = rootPassword
        if (mysqlInitSql.trim()) {
          config.init_sql = mysqlInitSql
        }
      }
      if (selectedService === 'postgres') {
        config.password = postgresPassword
      }
      if (selectedService === 'redis' && redisPassword) {
        config.password = redisPassword
      }

      // Add FTP user credentials
      if (selectedService === 'ftp') {
        config.user = ftpUser
        config.password = ftpPassword
      }

      await apiService.startService(config)
      
      // Complete the progress
      clearInterval(progressInterval)
      setCreatingProgress(100)
      
      // Small delay to show 100% completion
      setTimeout(() => {
        // Show success message
        setNotification({
          type: 'success',
          title: 'Honeypot Created Successfully!',
          message: `${selectedService.toUpperCase()} honeypot has been started on port ${port} and is ready to capture attacks.`,
          onConfirm: () => {
            setNotification(null)
            onSuccess()
          }
        })
      }, 500)
    } catch (error) {
      clearInterval(progressInterval)
      // Check for port conflict error
      if (error.message && error.message.includes('port is already allocated')) {
        setNotification({
          type: 'error',
          title: 'Port Conflict',
          message: `Port ${port} is already in use. Please choose a different port.`
        })
      } else if (error.message && error.message.includes('Bind for')) {
        const portMatch = error.message.match(/Bind for .*:(\d+) failed/)
        const conflictPort = portMatch ? portMatch[1] : port
        setNotification({
          type: 'error',
          title: 'Port Conflict',
          message: `Port ${conflictPort} is already allocated. Please choose a different port.`
        })
      } else {
        setNotification({
          type: 'error',
          title: 'Failed to Create Honeypot',
          message: error.message || 'An unknown error occurred while creating the honeypot.'
        })
      }
    } finally {
      setIsCreating(false)
      setCreatingProgress(0)
      setElapsedTime(0)
    }
  }

  const addUser = () => {
    setUsers(prev => [...prev, { username: '', password: '', sudo: false }])
  }

  const updateUser = (index, field, value) => {
    setUsers(prev => prev.map((user, i) => 
      i === index ? { ...user, [field]: value } : user
    ))
  }

  const removeUser = (index) => {
    setUsers(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderContent>
            <ServiceIcon>
              <Server size={24} />
            </ServiceIcon>
            <div>
              <Title>Create New Honeypot</Title>
              <Subtitle>Configure and deploy a honeypot service</Subtitle>
            </div>
          </HeaderContent>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          <ConfigSection>
            <Label>Service Type</Label>
            <Select 
              value={selectedService} 
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">Select a service...</option>
              {availableServices.map(service => (
                <option key={service.id} value={service.type}>
                  {service.name}
                </option>
              ))}
            </Select>
          </ConfigSection>

          <ConfigSection>
            <Label>Port</Label>
            <Input
              type="number"
              placeholder="e.g., 2222"
              value={port}
              onChange={(e) => setPort(e.target.value)}
            />
          </ConfigSection>

          {selectedService === 'mysql' && (
            <>
              <ConfigSection>
                <Label>Root Password</Label>
                <Input
                  type="password"
                  placeholder="MySQL root password"
                  value={rootPassword}
                  onChange={(e) => setRootPassword(e.target.value)}
                />
              </ConfigSection>
              <ConfigSection>
                <Label>Initial SQL Script (Optional)</Label>
                <TextArea
                  placeholder="CREATE DATABASE honeypot;&#10;USE honeypot;&#10;CREATE TABLE users (id INT PRIMARY KEY, username VARCHAR(50), password VARCHAR(100));"
                  value={mysqlInitSql}
                  onChange={(e) => setMysqlInitSql(e.target.value)}
                  rows={6}
                />
                <Description>SQL commands to execute when the MySQL container starts</Description>
              </ConfigSection>
            </>
          )}

          {selectedService === 'postgres' && (
            <ConfigSection>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="PostgreSQL password"
                value={postgresPassword}
                onChange={(e) => setPostgresPassword(e.target.value)}
              />
            </ConfigSection>
          )}

          {selectedService === 'redis' && (
            <ConfigSection>
              <Label>Password (Optional)</Label>
              <Input
                type="password"
                placeholder="Redis password (leave empty for no auth)"
                value={redisPassword}
                onChange={(e) => setRedisPassword(e.target.value)}
              />
            </ConfigSection>
          )}

          {selectedService === 'ftp' && (
            <>
              <ConfigSection>
                <Label>FTP Username</Label>
                <Input
                  type="text"
                  placeholder="FTP username"
                  value={ftpUser}
                  onChange={(e) => setFtpUser(e.target.value)}
                />
              </ConfigSection>
              <ConfigSection>
                <Label>FTP Password</Label>
                <Input
                  type="password"
                  placeholder="FTP password"
                  value={ftpPassword}
                  onChange={(e) => setFtpPassword(e.target.value)}
                />
              </ConfigSection>
            </>
          )}

          {selectedService === 'ssh' && (
            <>
              <ConfigSection>
                <Label>Users</Label>
                <AddUserButton type="button" onClick={addUser}>
                  + Add User
                </AddUserButton>
              </ConfigSection>
              
              {users.map((user, index) => (
                <UserCard key={index}>
                  <UserRow>
                    <UserInput>
                      <SmallLabel>Username</SmallLabel>
                      <Input
                        type="text"
                        value={user.username}
                        onChange={(e) => updateUser(index, 'username', e.target.value)}
                        placeholder="username"
                      />
                    </UserInput>
                    <UserInput>
                      <SmallLabel>Password</SmallLabel>
                      <Input
                        type="password"
                        value={user.password}
                        onChange={(e) => updateUser(index, 'password', e.target.value)}
                        placeholder="password"
                      />
                    </UserInput>
                  </UserRow>
                  <UserControls>
                    <CheckboxContainer>
                      <Checkbox
                        type="checkbox"
                        checked={user.sudo}
                        onChange={(e) => updateUser(index, 'sudo', e.target.checked)}
                      />
                      <CheckboxLabel>Sudo privileges</CheckboxLabel>
                    </CheckboxContainer>
                    {users.length > 1 && (
                      <RemoveButton 
                        type="button" 
                        onClick={() => removeUser(index)}
                      >
                        Remove
                      </RemoveButton>
                    )}
                  </UserControls>
                </UserCard>
              ))}
              
              <ConfigSection>
                <Label>SSH Banner</Label>
                <TextArea
                  placeholder="Welcome message displayed before login"
                  value={sshBanner}
                  onChange={(e) => setSshBanner(e.target.value)}
                  rows={3}
                />
              </ConfigSection>
              
              <ConfigSection>
                <SectionLabel>
                  <Label>File Permissions</Label>
                  <small style={{color: '#6b7280', fontSize: '0.75rem'}}>
                    Configure system file permissions using visual controls
                  </small>
                </SectionLabel>
                
                <PermissionGroup>
                  <PermissionTitle>/etc/passwd permissions</PermissionTitle>
                  <PermissionMatrix>
                    <PermissionRow>
                      <PermissionLabel>Owner</PermissionLabel>
                      <PermissionButtons>
                        <PermButton 
                          active={passwdPerms.owner.r}
                          onClick={() => updatePermission('passwd', 'owner', 'r', !passwdPerms.owner.r)}
                        >
                          R
                        </PermButton>
                        <PermButton 
                          active={passwdPerms.owner.w}
                          onClick={() => updatePermission('passwd', 'owner', 'w', !passwdPerms.owner.w)}
                        >
                          W
                        </PermButton>
                        <PermButton 
                          active={passwdPerms.owner.x}
                          onClick={() => updatePermission('passwd', 'owner', 'x', !passwdPerms.owner.x)}
                        >
                          X
                        </PermButton>
                      </PermissionButtons>
                    </PermissionRow>
                    <PermissionRow>
                      <PermissionLabel>Group</PermissionLabel>
                      <PermissionButtons>
                        <PermButton 
                          active={passwdPerms.group.r}
                          onClick={() => updatePermission('passwd', 'group', 'r', !passwdPerms.group.r)}
                        >
                          R
                        </PermButton>
                        <PermButton 
                          active={passwdPerms.group.w}
                          onClick={() => updatePermission('passwd', 'group', 'w', !passwdPerms.group.w)}
                        >
                          W
                        </PermButton>
                        <PermButton 
                          active={passwdPerms.group.x}
                          onClick={() => updatePermission('passwd', 'group', 'x', !passwdPerms.group.x)}
                        >
                          X
                        </PermButton>
                      </PermissionButtons>
                    </PermissionRow>
                    <PermissionRow>
                      <PermissionLabel>Other</PermissionLabel>
                      <PermissionButtons>
                        <PermButton 
                          active={passwdPerms.other.r}
                          onClick={() => updatePermission('passwd', 'other', 'r', !passwdPerms.other.r)}
                        >
                          R
                        </PermButton>
                        <PermButton 
                          active={passwdPerms.other.w}
                          onClick={() => updatePermission('passwd', 'other', 'w', !passwdPerms.other.w)}
                        >
                          W
                        </PermButton>
                        <PermButton 
                          active={passwdPerms.other.x}
                          onClick={() => updatePermission('passwd', 'other', 'x', !passwdPerms.other.x)}
                        >
                          X
                        </PermButton>
                      </PermissionButtons>
                    </PermissionRow>
                  </PermissionMatrix>
                  <PermissionOctal>
                    {convertPermissions(
                      Object.keys(passwdPerms.owner).filter(k => passwdPerms.owner[k]).join(''),
                      Object.keys(passwdPerms.group).filter(k => passwdPerms.group[k]).join(''),
                      Object.keys(passwdPerms.other).filter(k => passwdPerms.other[k]).join('')
                    )}
                  </PermissionOctal>
                </PermissionGroup>

                <PermissionGroup>
                  <PermissionTitle>/etc/shadow permissions</PermissionTitle>
                  <PermissionMatrix>
                    <PermissionRow>
                      <PermissionLabel>Owner</PermissionLabel>
                      <PermissionButtons>
                        <PermButton 
                          active={shadowPerms.owner.r}
                          onClick={() => updatePermission('shadow', 'owner', 'r', !shadowPerms.owner.r)}
                        >
                          R
                        </PermButton>
                        <PermButton 
                          active={shadowPerms.owner.w}
                          onClick={() => updatePermission('shadow', 'owner', 'w', !shadowPerms.owner.w)}
                        >
                          W
                        </PermButton>
                        <PermButton 
                          active={shadowPerms.owner.x}
                          onClick={() => updatePermission('shadow', 'owner', 'x', !shadowPerms.owner.x)}
                        >
                          X
                        </PermButton>
                      </PermissionButtons>
                    </PermissionRow>
                    <PermissionRow>
                      <PermissionLabel>Group</PermissionLabel>
                      <PermissionButtons>
                        <PermButton 
                          active={shadowPerms.group.r}
                          onClick={() => updatePermission('shadow', 'group', 'r', !shadowPerms.group.r)}
                        >
                          R
                        </PermButton>
                        <PermButton 
                          active={shadowPerms.group.w}
                          onClick={() => updatePermission('shadow', 'group', 'w', !shadowPerms.group.w)}
                        >
                          W
                        </PermButton>
                        <PermButton 
                          active={shadowPerms.group.x}
                          onClick={() => updatePermission('shadow', 'group', 'x', !shadowPerms.group.x)}
                        >
                          X
                        </PermButton>
                      </PermissionButtons>
                    </PermissionRow>
                    <PermissionRow>
                      <PermissionLabel>Other</PermissionLabel>
                      <PermissionButtons>
                        <PermButton 
                          active={shadowPerms.other.r}
                          onClick={() => updatePermission('shadow', 'other', 'r', !shadowPerms.other.r)}
                        >
                          R
                        </PermButton>
                        <PermButton 
                          active={shadowPerms.other.w}
                          onClick={() => updatePermission('shadow', 'other', 'w', !shadowPerms.other.w)}
                        >
                          W
                        </PermButton>
                        <PermButton 
                          active={shadowPerms.other.x}
                          onClick={() => updatePermission('shadow', 'other', 'x', !shadowPerms.other.x)}
                        >
                          X
                        </PermButton>
                      </PermissionButtons>
                    </PermissionRow>
                  </PermissionMatrix>
                  <PermissionOctal>
                    {convertPermissions(
                      Object.keys(shadowPerms.owner).filter(k => shadowPerms.owner[k]).join(''),
                      Object.keys(shadowPerms.group).filter(k => shadowPerms.group[k]).join(''),
                      Object.keys(shadowPerms.other).filter(k => shadowPerms.other[k]).join('')
                    )}
                  </PermissionOctal>
                </PermissionGroup>
              </ConfigSection>
            </>
          )}

          <ButtonGroup>
            <CancelButton onClick={onClose} disabled={isCreating}>Cancel</CancelButton>
            <CreateButton 
              onClick={handleCreate} 
              disabled={!selectedService || !port || isCreating}
            >
              {isCreating ? (
                <CreatingContainer>
                  <CreatingText>{getProgressText()}</CreatingText>
                  <ProgressInfo>
                    <TimeInfo>
                      <span>Elapsed: {formatTime(elapsedTime)}</span>
                      <span>ETA: {getEstimatedTimeRemaining()}</span>
                    </TimeInfo>
                    <ProgressBarContainer>
                      <ProgressBar progress={creatingProgress} />
                      <ProgressText>{Math.round(creatingProgress)}%</ProgressText>
                    </ProgressBarContainer>
                  </ProgressInfo>
                </CreatingContainer>
              ) : 'Create Honeypot'}
            </CreateButton>
          </ButtonGroup>
        </Content>
      </Modal>

      <NotificationModal
        isOpen={!!notification}
        onClose={() => setNotification(null)}
        type={notification?.type}
        title={notification?.title}
        message={notification?.message}
        onConfirm={notification?.onConfirm}
      />
    </Overlay>
  )
}

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const ServiceIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`

const Content = styled.div`
  padding: 1.5rem;
`

const ConfigSection = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  color: #111827;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`

const Input = styled.input`
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  color: #111827;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const Description = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
`

const SectionLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
`

const PermissionGroup = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`

const PermissionTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
`

const PermissionMatrix = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`

const PermissionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const PermissionLabel = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  width: 60px;
  text-align: right;
`

const PermissionButtons = styled.div`
  display: flex;
  gap: 0.25rem;
`

const PermButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${props => props.active ? '#3b82f6' : '#d1d5db'};
  background: ${props => props.active ? '#3b82f6' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#6b7280'};
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: ${props => props.active ? '#2563eb' : '#f3f4f6'};
  }
`

const PermissionOctal = styled.div`
  background: #1f2937;
  color: #f3f4f6;
  padding: 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  text-align: center;
  font-weight: 600;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 2rem;
`

const CancelButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const CreateButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: ${props => props.disabled ? '300px' : '140px'};
  height: ${props => props.disabled ? 'auto' : '40px'};

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &:disabled {
    opacity: 0.9;
    cursor: not-allowed;
    background: #2563eb;
  }
`

const AddUserButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
  }
`

const UserCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.75rem;
`

const UserRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`

const UserInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const SmallLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
`

const UserControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
`

const CheckboxLabel = styled.label`
  font-size: 0.75rem;
  color: #374151;
`

const RemoveButton = styled.button`
  padding: 0.25rem 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #dc2626;
  }
`

const CreatingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.25rem 0;
`

const CreatingText = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
`

const ProgressInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

const TimeInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  opacity: 0.9;
`

const ProgressBarContainer = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  height: 8px;
  overflow: hidden;
`

const ProgressBar = styled.div`
  background: rgba(255, 255, 255, 0.9);
  height: 100%;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
  border-radius: 4px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 30px;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4));
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-30px); }
    100% { transform: translateX(100%); }
  }
`

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.6875rem;
  font-weight: 700;
  color: #1f2937;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
`
