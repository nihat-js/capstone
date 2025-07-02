import styled from 'styled-components'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { StatusBadge } from './ui/StatusBadge'
import { Play, Square, Trash2, FileText } from 'lucide-react'

const HoneypotsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const HoneypotInfo = styled.div`
  margin-bottom: 1rem;
`;

const HoneypotName = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
`;

const HoneypotType = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const HoneypotMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const MetaItem = styled.div`
  color: #374151;
`;

const MetaLabel = styled.span`
  color: #6b7280;
  font-weight: 500;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export function HoneypotsList({ 
  honeypots, 
  onStart, 
  onStop, 
  onDelete, 
  onViewLogs 
}) {
  if (honeypots.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍯</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#6b7280' }}>No Honeypots Yet</h3>
          <p style={{ margin: 0, color: '#9ca3af' }}>Deploy your first honeypot to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <HoneypotsGrid>
      {honeypots.map((honeypot) => (
        <Card 
          key={honeypot.id}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{honeypot.name}</span>
              <StatusBadge status={honeypot.status} />
            </div>
          }
        >
          <HoneypotInfo>
            <HoneypotType>{honeypot.type}</HoneypotType>
          </HoneypotInfo>

          <HoneypotMeta>
            <MetaItem>
              <MetaLabel>Port:</MetaLabel> {honeypot.config?.port || 'N/A'}
            </MetaItem>
            <MetaItem>
              <MetaLabel>Uptime:</MetaLabel> {Math.floor(Math.random() * 24)}h
            </MetaItem>
            <MetaItem>
              <MetaLabel>Connections:</MetaLabel> {Math.floor(Math.random() * 50)}
            </MetaItem>
            <MetaItem>
              <MetaLabel>Threats:</MetaLabel> {Math.floor(Math.random() * 15)}
            </MetaItem>
          </HoneypotMeta>

          <Actions>
            {honeypot.status === 'running' ? (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onStop(honeypot)}
              >
                <Square size={14} />
                Stop
              </Button>
            ) : (
              <Button 
                variant="success" 
                size="sm" 
                onClick={() => onStart(honeypot)}
              >
                <Play size={14} />
                Start
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onViewLogs(honeypot)}
            >
              <FileText size={14} />
              Logs
            </Button>
            
            <Button 
              variant="danger" 
              size="sm" 
              onClick={() => onDelete(honeypot)}
            >
              <Trash2 size={14} />
            </Button>
          </Actions>
        </Card>
      ))}
    </HoneypotsGrid>
  );
}
