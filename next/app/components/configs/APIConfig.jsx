import { useState } from 'react'
import styled from 'styled-components'

const ConfigForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
`

const Input = styled.input`
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`

const Textarea = styled.textarea`
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`

const HelpText = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`

export function APIConfig({ config, onChange }) {
  const [formData, setFormData] = useState({
    name: 'api',
    port: 8080,
    username: 'james',
    password: 'james',
    ...config
  })

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onChange(newData)
  }

  return (
    <ConfigForm>
      <FormGroup>
        <Label>Service Name</Label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="api"
        />
        <HelpText>Unique identifier for this API honeypot instance</HelpText>
      </FormGroup>

      <FormGroup>
        <Label>Port</Label>
        <Input
          type="number"
          value={formData.port}
          onChange={(e) => handleChange('port', parseInt(e.target.value))}
          placeholder="8080"
          min="1"
          max="65535"
        />
        <HelpText>Port number for the API server (1-65535)</HelpText>
      </FormGroup>

      <FormGroup>
        <Label>Username</Label>
        <Input
          type="text"
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          placeholder="james"
        />
        <HelpText>Default username that will be exposed in API responses</HelpText>
      </FormGroup>

      <FormGroup>
        <Label>Password</Label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="james"
        />
        <HelpText>Default password that will be exposed in API responses</HelpText>
      </FormGroup>
    </ConfigForm>
  )
}
