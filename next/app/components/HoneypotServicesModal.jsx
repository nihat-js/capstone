import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Server, Database, Globe, Lock, Folder, MessageSquare, Terminal, Wifi, HardDrive } from 'lucide-react';

export function HoneypotServicesModal({ onClose, onServiceSelect }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const serviceCategories = {
    'Remote Access': {
      icon: Lock,
      color: '#dc2626',
      services: [
        {
          id: 'ssh',
          name: 'SSH Server',
          description: 'Secure Shell honeypot with customizable banners and user credentials',
          icon: Terminal,
          features: ['Fake user accounts', 'Custom banners', 'Brute force detection', 'Session recording']
        },
        {
          id: 'telnet',
          name: 'Telnet Server',
          description: 'Network switch/router telnet interface simulation',
          icon: Terminal,
          features: ['Router simulation', 'Custom prompts', 'Command logging', 'Fake device info']
        },
        {
          id: 'rdp',
          name: 'RDP Server',
          description: 'Remote Desktop Protocol honeypot',
          icon: Server,
          features: ['Windows simulation', 'Credential harvesting', 'Screen capture', 'Session tracking']
        }
      ]
    },
    'Web Applications': {
      icon: Globe,
      color: '#2563eb',
      services: [
        {
          id: 'http',
          name: 'HTTP Server',
          description: 'Generic web server with customizable content',
          icon: Globe,
          features: ['Custom web pages', 'File uploads', 'Form submissions', 'API endpoints']
        },
        {
          id: 'phpmyadmin',
          name: 'phpMyAdmin',
          description: 'Database administration interface honeypot',
          icon: Database,
          features: ['Login simulation', 'Fake database structure', 'SQL injection detection', 'Admin panels']
        },
        {
          id: 'wordpress',
          name: 'WordPress',
          description: 'Content management system honeypot',
          icon: Globe,
          features: ['Login forms', 'Plugin vulnerabilities', 'Comment spam', 'File uploads']
        }
      ]
    },
    'Database Services': {
      icon: Database,
      color: '#059669',
      services: [
        {
          id: 'mysql',
          name: 'MySQL Server',
          description: 'Database server with fake banking/financial data',
          icon: Database,
          features: ['Fake customer data', 'Banking records', 'Credit card info', 'Transaction logs']
        },
        {
          id: 'postgresql',
          name: 'PostgreSQL',
          description: 'Advanced database honeypot with enterprise data',
          icon: Database,
          features: ['Employee records', 'Financial data', 'Custom schemas', 'Query logging']
        },
        {
          id: 'mongodb',
          name: 'MongoDB',
          description: 'NoSQL database with JSON document simulation',
          icon: Database,
          features: ['User profiles', 'Product catalogs', 'Analytics data', 'API logs']
        }
      ]
    },
    'File Services': {
      icon: Folder,
      color: '#7c3aed',
      services: [
        {
          id: 'ftp',
          name: 'FTP Server',
          description: 'File transfer protocol with fake file systems',
          icon: Folder,
          features: ['Fake files/folders', 'Anonymous access', 'Upload tracking', 'Directory listings']
        },
        {
          id: 'sftp',
          name: 'SFTP Server',
          description: 'Secure file transfer with SSH authentication',
          icon: Folder,
          features: ['SSH key auth', 'Encrypted transfers', 'File integrity', 'Access logs']
        },
        {
          id: 'smb',
          name: 'SMB/CIFS',
          description: 'Windows file sharing protocol',
          icon: Folder,
          features: ['Network shares', 'Domain auth', 'File permissions', 'Print services']
        }
      ]
    },
    'Network Services': {
      icon: Wifi,
      color: '#ea580c',
      services: [
        {
          id: 'dns',
          name: 'DNS Server',
          description: 'Domain name resolution with custom records',
          icon: Wifi,
          features: ['Custom zones', 'Malicious domains', 'Query logging', 'DNS tunneling']
        },
        {
          id: 'ldap',
          name: 'LDAP Server',
          description: 'Directory service with organizational data',
          icon: HardDrive,
          features: ['User directory', 'Group policies', 'Authentication', 'Schema browsing']
        },
        {
          id: 'smtp',
          name: 'SMTP Server',
          description: 'Email server for spam and phishing detection',
          icon: MessageSquare,
          features: ['Email relay', 'Spam detection', 'Attachment analysis', 'Header inspection']
        }
      ]
    }
  };

  const allServices = Object.values(serviceCategories).flatMap(cat => cat.services);
  const filteredServices = selectedCategory === 'all' 
    ? allServices 
    : serviceCategories[selectedCategory]?.services || [];

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderContent>
            <ModalTitle>Honeypot Services</ModalTitle>
            <ModalSubtitle>Choose from our comprehensive collection of honeypot services</ModalSubtitle>
          </HeaderContent>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          {/* Category Filter */}
          <CategoryFilter>
            <CategoryButton 
              $active={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            >
              All Services ({allServices.length})
            </CategoryButton>
            {Object.entries(serviceCategories).map(([category, data]) => {
              const IconComponent = data.icon;
              return (
                <CategoryButton
                  key={category}
                  $active={selectedCategory === category}
                  $color={data.color}
                  onClick={() => setSelectedCategory(category)}
                >
                  <IconComponent size={16} />
                  {category} ({data.services.length})
                </CategoryButton>
              );
            })}
          </CategoryFilter>

          {/* Services Grid */}
          <ServicesGrid>
            {filteredServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <ServiceCard key={service.id}>
                  <ServiceHeader>
                    <ServiceIcon>
                      <IconComponent size={24} />
                    </ServiceIcon>
                    <ServiceInfo>
                      <ServiceName>{service.name}</ServiceName>
                      <ServiceDescription>{service.description}</ServiceDescription>
                    </ServiceInfo>
                  </ServiceHeader>

                  <ServiceFeatures>
                    {service.features.map((feature, index) => (
                      <FeatureBadge key={index}>
                        {feature}
                      </FeatureBadge>
                    ))}
                  </ServiceFeatures>

                  <ServiceActions>
                    <ConfigureButton onClick={(e) => {
                      e.stopPropagation();
                      onServiceSelect(service.id);
                    }}>
                      Configure Service
                    </ConfigureButton>
                  </ServiceActions>
                </ServiceCard>
              );
            })}
          </ServicesGrid>
        </ModalContent>
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
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 80rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const ModalTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const ModalSubtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

const CloseButton = styled.button`
  color: #6b7280;
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: #374151;
    background: #f3f4f6;
  }
`;

const ModalContent = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const CategoryFilter = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
`;

const CategoryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid ${({ $active, $color }) => $active ? ($color || '#2563eb') : '#e5e7eb'};
  background: ${({ $active, $color }) => $active ? ($color ? `${$color}10` : '#eff6ff') : 'white'};
  color: ${({ $active, $color }) => $active ? ($color || '#2563eb') : '#6b7280'};
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ $color }) => $color || '#2563eb'};
    background: ${({ $color }) => $color ? `${$color}10` : '#eff6ff'};
    color: ${({ $color }) => $color || '#2563eb'};
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const ServiceCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #2563eb;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    transform: translateY(-2px);
  }
`;

const ServiceHeader = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ServiceIcon = styled.div`
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
`;

const ServiceInfo = styled.div`
  flex: 1;
`;

const ServiceName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const ServiceDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
`;

const ServiceFeatures = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const FeatureBadge = styled.span`
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ServiceActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ConfigureButton = styled.button`
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  transition: background 0.2s ease;

  &:hover {
    background: #1d4ed8;
  }
`;
