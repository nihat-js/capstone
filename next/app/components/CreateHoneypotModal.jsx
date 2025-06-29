'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { X, Plus, Server } from 'lucide-react'

export function CreateHoneypotModal({ availableServices, onClose, onSuccess, apiService }) {
  const [selectedService, setSelectedService] = useState('')
  const [port, setPort] = useState('')
  const [users, setUsers] = useState([{ username: 'admin', password: 'admin123', sudo: true }])
  const [rootPassword, setRootPassword] = useState('root')
  const [postgresPassword, setPostgresPassword] = useState('postgres')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!selectedService || !port) {
      alert('Please select a service and enter a port')
      return
    }

    // Validate SSH users if it's SSH service
    if (selectedService === 'ssh' && users.some(u => !u.username || !u.password)) {
      alert('Please fill in all username and password fields for SSH users')
      return
    }

    setIsCreating(true)
    try {
      const config = {
        name: selectedService,
        port: parseInt(port)
      }

      // Add users for SSH service
      if (selectedService === 'ssh') {
        config.users = users
      }

      // Add passwords for database services
      if (selectedService === 'mysql') {
        config.root_password = rootPassword
      }
      if (selectedService === 'postgres') {
        config.password = postgresPassword
      }

      await apiService.startService(config)
      onSuccess()
    } catch (error) {
      alert('Failed to create honeypot: ' + error.message)
    } finally {
      setIsCreating(false)
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
            <ConfigSection>
              <Label>Root Password</Label>
              <Input
                type="password"
                placeholder="MySQL root password"
                value={rootPassword}
                onChange={(e) => setRootPassword(e.target.value)}
              />
            </ConfigSection>
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

          {selectedService === 'ssh' && (
            <ConfigSection>
              <SectionLabel>
                <Label>Users</Label>
                <AddUserButton type="button" onClick={addUser}>
                  + Add User
                </AddUserButton>
              </SectionLabel>
              
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
            </ConfigSection>
          )}

          <ButtonGroup>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
            <CreateButton 
              onClick={handleCreate} 
              disabled={!selectedService || !port || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Honeypot'}
            </CreateButton>
          </ButtonGroup>
        </Content>
      </Modal>
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

  &::placeholder {
    color: #9ca3af;
  }
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

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
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

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const SectionLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
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
