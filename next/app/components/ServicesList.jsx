import styled from 'styled-components'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Server, Shield, Database } from 'lucide-react'

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ServiceIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1rem;
  
  ${props => props.color === 'blue' && `background: #3b82f6;`}
  ${props => props.color === 'green' && `background: #10b981;`}
  ${props => props.color === 'orange' && `background: #f59e0b;`}
`;

const ServiceName = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
`;

const ServiceDescription = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
`;

const ServicePorts = styled.div`
  margin-bottom: 1rem;
`;

const PortLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const PortList = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
`;

const PortChip = styled.span`
  background: #f3f4f6;
  color: #374151;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-family: monospace;
`;

export function ServicesList({ onServiceClick }) {
  const services = [
    {
      id: 'api',
      name: 'API Honeypot',
      description: 'REST API endpoint simulation for web application attacks',
      icon: Server,
      color: 'blue',
      ports: ['8080', '9000', '3000']
    },
    {
      id: 'ssh',
      name: 'SSH Honeypot',
      description: 'Secure Shell service simulation for credential harvesting',
      icon: Shield,
      color: 'green',
      ports: ['22', '2222', '2020']
    },
    {
      id: 'mysql',
      name: 'MySQL Database',
      description: 'Database service honeypot for SQL-based attacks',
      icon: Database,
      color: 'orange',
      ports: ['3306', '3307', '33060']
    }
  ];

  return (
    <ServicesGrid>
      {services.map((service) => (
        <Card key={service.id} hover onClick={() => onServiceClick(service)}>
          <ServiceIcon color={service.color}>
            <service.icon size={24} />
          </ServiceIcon>
          
          <ServiceName>{service.name}</ServiceName>
          <ServiceDescription>{service.description}</ServiceDescription>
          
          <ServicePorts>
            <PortLabel>Common Ports:</PortLabel>
            <PortList>
              {service.ports.map((port, index) => (
                <PortChip key={index}>{port}</PortChip>
              ))}
            </PortList>
          </ServicePorts>

          <Button variant="primary" size="sm" style={{ width: '100%' }}>
            Deploy {service.name}
          </Button>
        </Card>
      ))}
    </ServicesGrid>
  );
}
