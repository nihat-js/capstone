'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Plus, RefreshCw } from 'lucide-react'

// Import our cleaner components
import { Header } from './components/Header'
import { Button } from './components/ui/Button'
import { SearchBar } from './components/ui/SearchBar'
import { StatsCards } from './components/StatsCards'
import { ServicesList } from './components/ServicesList'
import { HoneypotsList } from './components/HoneypotsList'

// Keep existing modals
import { CreateHoneypotModal } from './components/CreateHoneypotModal'
import { LogsViewerModal } from './components/LogsViewerModal'
import { ConfigurationModal } from './components/ConfigurationModal'
import { NotificationModal } from './components/NotificationModal'
import { apiService } from './services/api'
import { availableServices } from './config/availableServices'

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ControlsLeft = styled.div`
  flex: 1;
`;

const ControlsRight = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export default function Dashboard() {
  // State management
  const [honeypots, setHoneypots] = useState([])
  const [stats, setStats] = useState({ total: 0, running: 0, stopped: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [apiError, setApiError] = useState(null)
  const [notification, setNotification] = useState(null)
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showLogsViewer, setShowLogsViewer] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedHoneypot, setSelectedHoneypot] = useState(null)

  // Fetch data from API
  const fetchServices = async () => {
    try {
      setApiError(null)
      const services = await apiService.getServices()
      
      // Transform API data
      const transformedHoneypots = services.map((service, index) => ({
        id: service.container_id || service.process_id || `service-${index}`,
        name: `${service.name}-${service.config?.port || 'unknown'}`,
        type: service.name?.toLowerCase(),
        status: 'running',
        created_at: new Date().toISOString(),
        config: service.config,
        container_id: service.container_id,
        process_id: service.process_id
      }))
      
      setHoneypots(transformedHoneypots)
      
      // Calculate stats
      const realStats = {
        total: transformedHoneypots.length,
        running: transformedHoneypots.filter(h => h.status === 'running').length,
        stopped: transformedHoneypots.filter(h => h.status === 'stopped').length
      }
      setStats(realStats)
      
    } catch (error) {
      console.error('Failed to fetch services:', error)
      setApiError('Failed to connect to API')
      setHoneypots([])
      setStats({ total: 0, running: 0, stopped: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
    const interval = setInterval(fetchServices, 5000)
    return () => clearInterval(interval)
  }, [])

  // Event handlers
  const handleServiceClick = (service) => {
    setSelectedService(service)
    setShowConfigModal(true)
  }

  const handleStopHoneypot = async (honeypot) => {
    try {
      if (honeypot.container_id) {
        await apiService.stopService({
          type: 'docker',
          container_id: honeypot.container_id
        })
      } else if (honeypot.process_id) {
        await apiService.stopService({
          type: 'process',
          process_id: honeypot.process_id
        })
      }
      await fetchServices()
    } catch (error) {
      console.error('Failed to stop honeypot:', error)
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to stop honeypot'
      })
    }
  }

  const handleViewLogs = (honeypot) => {
    setSelectedHoneypot(honeypot)
    setShowLogsViewer(true)
  }

  // Filter honeypots based on search
  const filteredHoneypots = honeypots.filter(honeypot =>
    honeypot.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    honeypot.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <PageContainer>
        <Header isConnected={!apiError} />
        <MainContent>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <h3 style={{ margin: 0, color: '#6b7280' }}>Loading...</h3>
          </div>
        </MainContent>
      </PageContainer>
    )
  }

  return (
    <>
      <PageContainer>
        <Header isConnected={!apiError} />
        <MainContent>
          {/* Stats Overview */}
          <Section>
            <StatsCards stats={stats} />
          </Section>

          {/* Controls */}
          <Section>
            <Controls>
              <ControlsLeft>
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search honeypots..."
                />
              </ControlsLeft>
              <ControlsRight>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchServices}
                >
                  <RefreshCw size={16} />
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={16} />
                  Deploy
                </Button>
              </ControlsRight>
            </Controls>
          </Section>

          {/* Deploy New Services */}
          <Section>
            <SectionHeader>
              <SectionTitle>Deploy New Honeypot</SectionTitle>
            </SectionHeader>
            <ServicesList onServiceClick={handleServiceClick} />
          </Section>

          {/* Active Honeypots */}
          <Section>
            <SectionHeader>
              <SectionTitle>
                Active Honeypots ({filteredHoneypots.length})
              </SectionTitle>
            </SectionHeader>
            <HoneypotsList
              honeypots={filteredHoneypots}
              onStart={() => {}} // Not implemented yet
              onStop={handleStopHoneypot}
              onDelete={handleStopHoneypot} // Same as stop for now
              onViewLogs={handleViewLogs}
            />
          </Section>

          {/* Error State */}
          {apiError && (
            <Section>
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #fee2e2',
                backgroundColor: '#fef2f2'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#dc2626' }}>Connection Failed</h3>
                <p style={{ margin: '0 0 1rem 0', color: '#6b7280' }}>{apiError}</p>
                <Button variant="primary" onClick={fetchServices}>
                  Retry Connection
                </Button>
              </div>
            </Section>
          )}
        </MainContent>
      </PageContainer>

      {/* Modals */}
      {showCreateModal && (
        <CreateHoneypotModal
          availableServices={availableServices}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchServices()
          }}
          apiService={apiService}
        />
      )}

      {showConfigModal && selectedService && (
        <ConfigurationModal
          service={selectedService}
          onClose={() => setShowConfigModal(false)}
          onSave={async (config) => {
            try {
              await apiService.startService(config)
              await fetchServices()
              setShowConfigModal(false)
              setNotification({
                type: 'success',
                title: 'Success',
                message: 'Honeypot deployed successfully!'
              })
            } catch (error) {
              console.error('Failed to start service:', error)
              setNotification({
                type: 'error',
                title: 'Failed to Deploy',
                message: error.message || 'An error occurred while deploying the honeypot.'
              })
            }
          }}
        />
      )}

      {showLogsViewer && selectedHoneypot && (
        <LogsViewerModal
          service={selectedHoneypot}
          onClose={() => setShowLogsViewer(false)}
        />
      )}

      <NotificationModal
        isOpen={!!notification}
        onClose={() => setNotification(null)}
        type={notification?.type}
        title={notification?.title}
        message={notification?.message}
        onConfirm={notification?.onConfirm}
      />
    </>
  )
}


