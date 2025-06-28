'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { X, Plus, Server } from 'lucide-react'

export function CreateHoneypotModal({ honeypotTypes, onClose, onSuccess }) {
  const [selectedType, setSelectedType] = useState('')
  const [honeypotName, setHoneypotName] = useState('')

  const handleCreate = () => {
    if (!selectedType || !honeypotName) {
      alert('Please select a type and enter a name')
      return
    }
    
    // Simulate honeypot creation
    console.log('Creating honeypot:', { type: selectedType, name: honeypotName })
    onSuccess()
  }

  const serviceTypes = [
    { id: 'ssh', name: 'SSH Server', description: 'Secure Shell honeypot' },
    { id: 'http', name: 'HTTP Server', description: 'Web server honeypot' },
    { id: 'ftp', name: 'FTP Server', description: 'File transfer honeypot' },
    { id: 'telnet', name: 'Telnet Server', description: 'Terminal access honeypot' },
    { id: 'rdp', name: 'RDP Server', description: 'Remote desktop honeypot' },
    { id: 'mysql', name: 'MySQL Database', description: 'Database honeypot' }
  ]

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
            <SectionTitle>Honeypot Details</SectionTitle>
            
            <ConfigField>
              <Label>Honeypot Name</Label>
              <Input
                type="text"
                placeholder="Enter honeypot name..."
                value={honeypotName}
                onChange={(e) => setHoneypotName(e.target.value)}
              />
            </ConfigField>

            <ConfigField>
              <Label>Service Type</Label>
              <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="">Select a service type...</option>
                {serviceTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.description}
                  </option>
                ))}
              </Select>
            </ConfigField>
          </ConfigSection>

          <ButtonSection>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
            <CreateButton onClick={handleCreate}>
              <Plus size={16} />
              Create Honeypot
            </CreateButton>
          </ButtonSection>
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
  overflow: hidden;
  margin: 1rem;
`

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
`

const CloseButton = styled.button`
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

const Content = styled.div`
  padding: 1.5rem;
  max-height: 60vh;
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

const ButtonSection = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
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

const CreateButton = styled.button`
  padding: 0.75rem 1.5rem;
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
