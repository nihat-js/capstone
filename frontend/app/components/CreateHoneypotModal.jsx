import React, { useState } from 'react';
import styled from 'styled-components';

export function CreateHoneypotModal({ honeypotTypes, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    port: '',
    tags: '',
    config: {}
  });
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const handleTypeChange = (type) => {
    const typeData = honeypotTypes[type];
    setFormData(prev => ({
      ...prev,
      type,
      port: typeData?.default_port?.toString() || '',
      config: {}
    }));
    setSelectedType(typeData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/create_honeypot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          port: parseInt(formData.port),
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create honeypot');
      }
    } catch (error) {
      console.error('Failed to create honeypot:', error);
      alert('Failed to create honeypot');
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(
    Object.values(honeypotTypes).map((type) => type.category)
  ));

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <HeaderContent>
            <ModalTitle>Create New Honeypot</ModalTitle>
            <CloseButton onClick={onClose}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </CloseButton>
          </HeaderContent>
        </ModalHeader>

        <ModalForm onSubmit={handleSubmit}>
          {/* Basic Information */}
          <FormSection>
            <SectionTitle>Basic Information</SectionTitle>
            
            <FormField>
              <Label>
                Honeypot Name <RequiredAsterisk>*</RequiredAsterisk>
              </Label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Production SSH Honeypot"
              />
            </FormField>

            <FormField>
              <Label>
                Port <RequiredAsterisk>*</RequiredAsterisk>
              </Label>
              <Input
                type="number"
                required
                min="1"
                max="65535"
                value={formData.port}
                onChange={(e) => setFormData(prev => ({ ...prev, port: e.target.value }))}
                placeholder="e.g., 2222"
              />
            </FormField>

            <FormField>
              <Label>
                Tags (comma-separated)
              </Label>
              <Input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., production, ssh, critical"
              />
            </FormField>
          </FormSection>

          {/* Honeypot Type Selection */}
          <FormSection>
            <SectionTitle>Honeypot Type</SectionTitle>
            
            {categories.map(category => (
              <CategorySection key={category}>
                <CategoryTitle>{category}</CategoryTitle>
                <TypeGrid>
                  {Object.entries(honeypotTypes)
                    .filter(([_, type]) => type.category === category)
                    .map(([key, type]) => (
                      <TypeOption key={key}>
                        <HiddenRadio
                          type="radio"
                          name="honeypotType"
                          value={key}
                          checked={formData.type === key}
                          onChange={(e) => handleTypeChange(e.target.value)}
                        />
                        <TypeCard $isSelected={formData.type === key}>
                          <TypeName>{type.name}</TypeName>
                          <TypeDescription>{type.description}</TypeDescription>
                          <TypePort>
                            Default port: {type.default_port}
                          </TypePort>
                        </TypeCard>
                      </TypeOption>
                    ))}
                </TypeGrid>
              </CategorySection>
            ))}
          </FormSection>

          {/* Type-specific Configuration */}
          {selectedType && (
            <FormSection>
              <SectionTitle>Configuration</SectionTitle>
              <ConfigCard>
                <ConfigTitle>{selectedType.name}</ConfigTitle>
                <ConfigDescription>{selectedType.description}</ConfigDescription>
                <ConfigDetails>
                  <strong>Features:</strong> {selectedType.features?.join(', ')}
                </ConfigDetails>
                <ConfigDetails>
                  <strong>Supported Ports:</strong> {selectedType.supported_ports?.join(', ')}
                </ConfigDetails>
              </ConfigCard>
            </FormSection>
          )}

          {/* Submit Buttons */}
          <ButtonSection>
            <CancelButton
              type="button"
              onClick={onClose}
            >
              Cancel
            </CancelButton>
            <SubmitButton
              type="submit"
              disabled={loading || !formData.name || !formData.type || !formData.port}
            >
              {loading ? 'Creating...' : 'Create Honeypot'}
            </SubmitButton>
          </ButtonSection>
        </ModalForm>
      </ModalContainer>
    </ModalOverlay>
  );
}

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 48rem;
  width: 100%;
  margin: 1rem;
  max-height: 100vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  position: sticky;
  top: 0;
  background: white;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CloseButton = styled.button`
  color: #6b7280;
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: #374151;
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const ModalForm = styled.form`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const RequiredAsterisk = styled.span`
  color: #dc2626;
`;

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

  &::placeholder {
    color: #9ca3af;
  }
`;

const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CategoryTitle = styled.h4`
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const TypeOption = styled.label`
  position: relative;
  cursor: pointer;
`;

const HiddenRadio = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const TypeCard = styled.div`
  padding: 0.75rem;
  border: 1px solid ${({ $isSelected }) => $isSelected ? '#3b82f6' : '#d1d5db'};
  border-radius: 8px;
  background: ${({ $isSelected }) => $isSelected ? '#eff6ff' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ $isSelected }) => $isSelected ? '#3b82f6' : '#9ca3af'};
  }
`;

const TypeName = styled.div`
  font-weight: 500;
  font-size: 0.875rem;
  color: #111827;
`;

const TypeDescription = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const TypePort = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
`;

const ConfigCard = styled.div`
  background: #eff6ff;
  padding: 1rem;
  border-radius: 8px;
`;

const ConfigTitle = styled.div`
  font-weight: 500;
  color: #1e40af;
  margin-bottom: 0.25rem;
`;

const ConfigDescription = styled.div`
  font-size: 0.875rem;
  color: #1d4ed8;
  margin-bottom: 0.5rem;
`;

const ConfigDetails = styled.div`
  font-size: 0.875rem;
  color: #2563eb;
  margin-bottom: 0.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ButtonSection = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  color: #374151;
  background: white;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
  }
`;

const SubmitButton = styled.button`
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
