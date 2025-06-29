'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import {
  Shield,
  Plus,
  Server,
  Play,
  Activity,
  Target,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { HoneypotCard } from "./components/HoneypotCard"
import { StatsCard } from './components/StatsCard'
import { CreateHoneypotModal } from './components/CreateHoneypotModal'
import { LogsModal } from './components/LogsModal'
import { ConfigurationModal } from './components/ConfigurationModal'
import { NotificationModal } from './components/NotificationModal'
import { apiService } from './services/api'
// Temporarily commenting out fake data - will use real API data
// import { generateFakeHoneypots, generateFakeStats, generateFakeHoneypotTypes } from './utils/fakeData'
import { availableServices } from './config/availableServices'
export default function Dashboard() {
  const router = useRouter()
  const [honeypots, setHoneypots] = useState([])
  const [runningHoneypots, setRunningHoneypots] = useState({})
  const [stats, setStats] = useState({ total: 0, running: 0, stopped: 0, connectionsToday: 0, attacksBlocked: 0 })
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedHoneypot, setSelectedHoneypot] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [showAllServices, setShowAllServices] = useState(false)
  const [showAllHoneypots, setShowAllHoneypots] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [apiError, setApiError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [notification, setNotification] = useState(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Fetch real data from API
  const fetchServices = async () => {
    try {
      setApiError(null)
      
      const services = await apiService.getServices()
      
      // Transform API data to match our honeypot format
      const transformedHoneypots = services.map((service, index) => ({
        id: service.container_id || `service-${index}`,
        name: `${service.name}-${service.config?.port || 'unknown'}`,
        type: service.name?.toLowerCase(),
        status: 'running', // All services from API are running
        created_at: new Date().toISOString(),
        config: service.config,
        container_id: service.container_id
      }))
      
      setHoneypots(transformedHoneypots)
      
      // Calculate real stats
      const realStats = {
        total: transformedHoneypots.length,
        running: transformedHoneypots.filter(h => h.status === 'running').length,
        stopped: transformedHoneypots.filter(h => h.status === 'stopped').length,
        connectionsToday: 0, // Will need additional API endpoint for this
        attacksBlocked: 0    // Will need additional API endpoint for this
      }
      setStats(realStats)
      setLastRefresh(new Date())
      
    } catch (error) {
      console.error('Failed to fetch services:', error)
      setApiError('Failed to connect to API. Make sure the Flask server is running on localhost:5000')
      // Set empty data on error
      setHoneypots([])
      setStats({ total: 0, running: 0, stopped: 0, connectionsToday: 0, attacksBlocked: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial load with loading state
    setLoading(true)
    fetchServices()
    // Refresh data every 4 seconds for auto-refresh (without loading state)
    const interval = setInterval(() => fetchServices(), 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Mark as hydrated to avoid hydration mismatch with dynamic content
    setIsHydrated(true)
  }, [])

  // Event handlers
  const handleServiceClick = (service) => {
    setSelectedService(service)
    setShowConfigModal(true)
  }

  const handleHoneypotCreated = async () => {
    setShowCreateModal(false)
    // Refresh the services list
    await fetchServices()
  }

  const handleStartHoneypot = async (honeypot) => {
    try {
      console.log('Starting honeypot:', honeypot.id)
      // API call would go here when start functionality is implemented
    } catch (error) {
      console.error('Failed to start honeypot:', error)
    }
  }

  const handleStopHoneypot = async (honeypot) => {
    try {
      await apiService.stopService({
        type: 'docker',
        container_id: honeypot.container_id
      })
      // Refresh the services list
      await fetchServices()
    } catch (error) {
      console.error('Failed to stop honeypot:', error)
    }
  }

  const handleDeleteHoneypot = async (honeypot) => {
    try {
      // First stop the service, then it will be removed from the list
      await handleStopHoneypot(honeypot)
    } catch (error) {
      console.error('Failed to delete honeypot:', error)
    }
  }

  // Filter functions
  const filteredServices = availableServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredHoneypots = honeypots.filter(honeypot =>
    honeypot.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    honeypot.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Component render functions
  const renderHeader = () => (
    <DashboardHeader>
      <HeaderLeft>
        <HeaderTitle>Honeypot Dashboard</HeaderTitle>
        <HeaderSubtitle>
          Monitor and manage your honeypot infrastructure
          {apiError && <ErrorMessage>⚠️ {apiError}</ErrorMessage>}
          {!apiError && isHydrated && (
            <RefreshIndicator>
              🔄 Auto-refresh every 4s | Last: {lastRefresh.toLocaleTimeString()}
            </RefreshIndicator>
          )}
        </HeaderSubtitle>
      </HeaderLeft>
    </DashboardHeader>
  )

  const renderSearchBar = () => (
    <SearchContainer>
      <SearchWrapper>
        <Search size={20} />
        <SearchInput
          type="text"
          placeholder="Search services and honeypots..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchWrapper>
    </SearchContainer>
  )

  const renderStatsGrid = () => (
    <StatsGrid>
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          <StatsCard title="Total Honeypots" value={stats.total} icon={Server} color="blue" />
          <StatsCard title="Running" value={stats.running} icon={Play} color="green" />
          <StatsCard title="Connections Today" value={stats.connectionsToday} icon={Activity} color="orange" />
          <StatsCard title="Attacks Blocked" value={stats.attacksBlocked} icon={Shield} color="red" />
        </>
      )}
    </StatsGrid>
  )

  const renderServiceCard = (service) => (
    <ServiceCard key={service.id} onClick={() => handleServiceClick(service)}>
      <ServiceHeader>
        <ServiceIcon>
          <service.icon size={24} />
        </ServiceIcon>
        <ServiceInfo>
          <ServiceName>{service.name}</ServiceName>
          <ServiceDescription>{service.description}</ServiceDescription>
        </ServiceInfo>
      </ServiceHeader>
      <ServiceDetails>
        <ServiceFeature>
          <Shield size={16} />
          {service.security}
        </ServiceFeature>
        <ServiceFeature>
          <Activity size={16} />
          {service.monitoring}
        </ServiceFeature>
        <ServiceFeature>
          <Target size={16} />
          {service.attackTypes}
        </ServiceFeature>
      </ServiceDetails>
    </ServiceCard>
  )

  const renderServicesSection = () => {
    const displayedServices = showAllServices ? filteredServices : filteredServices.slice(0, 3)
    
    return (
      <ServicesSection>
        <SectionHeader>
          <SectionTitle>
            <Server size={20} />
            Create Honeypot
          </SectionTitle>
          <SectionSubtitle>
            Choose a service to configure and deploy your honeypot
          </SectionSubtitle>
        </SectionHeader>

        <ServicesGrid>
          {displayedServices.map(renderServiceCard)}
        </ServicesGrid>

        {filteredServices.length > 3 && (
          <ShowMoreButton onClick={() => setShowAllServices(!showAllServices)}>
            {showAllServices ? (
              <>
                <ChevronUp size={16} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Show All ({filteredServices.length - 3} more)
              </>
            )}
          </ShowMoreButton>
        )}
      </ServicesSection>
    )
  }

  const renderHoneypotCard = (honeypot) => {
    const serviceType = availableServices.find(s => s.type === honeypot.type)
    
    return (
      <HoneypotCard
        key={honeypot.id}
        honeypot={{
          ...honeypot,
          status: honeypot.status,
          created_at: honeypot.created_at || honeypot.created
        }}
        honeypotType={serviceType}
        onStart={() => handleStartHoneypot(honeypot)}
        onStop={() => handleStopHoneypot(honeypot)}
        onDelete={() => handleDeleteHoneypot(honeypot)}
        onViewLogs={() => {
          setSelectedHoneypot(honeypot)
          setShowLogsModal(true)
        }}
        onConfigure={() => handleServiceClick(availableServices.find(s => s.type === honeypot.type))}
      />
    )
  }

  const renderHoneypotsSection = () => {
    if (loading) {
      return (
        <HoneypotsSection>
          <SectionHeader>
            <SectionTitle>
              <Shield size={20} />
              Active Honeypots
            </SectionTitle>
            <SectionSubtitle>Loading honeypots...</SectionSubtitle>
          </SectionHeader>
          <HoneypotsGrid>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </HoneypotsGrid>
        </HoneypotsSection>
      )
    }

    if (filteredHoneypots.length === 0) return null

    const displayedHoneypots = showAllHoneypots ? filteredHoneypots : filteredHoneypots.slice(0, 6)
    
    return (
      <HoneypotsSection>
        <SectionHeader>
          <SectionTitle>
            <Shield size={20} />
            Active Honeypots
          </SectionTitle>
          <SectionSubtitle>
            {showAllHoneypots 
              ? `Showing all ${filteredHoneypots.length}` 
              : `Showing ${Math.min(6, filteredHoneypots.length)} of ${filteredHoneypots.length}`} honeypots
          </SectionSubtitle>
        </SectionHeader>

        <HoneypotsGrid>
          {displayedHoneypots.map(renderHoneypotCard)}
        </HoneypotsGrid>

        {filteredHoneypots.length > 6 && (
          <ShowMoreButton onClick={() => setShowAllHoneypots(!showAllHoneypots)}>
            {showAllHoneypots ? (
              <>
                <ChevronUp size={16} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Show More ({filteredHoneypots.length - 6} more)
              </>
            )}
          </ShowMoreButton>
        )}
      </HoneypotsSection>
    )
  }

  const renderEmptyStates = () => {
    if (apiError) {
      return (
        <EmptyState>
          <Shield size={48} />
          <EmptyTitle>API Connection Failed</EmptyTitle>
          <EmptyDescription>{apiError}</EmptyDescription>
          <EmptyButton onClick={fetchServices}>
            Retry Connection
          </EmptyButton>
        </EmptyState>
      )
    }

    if (filteredHoneypots.length === 0 && honeypots.length > 0) {
      return (
        <EmptyState>
          <Search size={48} />
          <EmptyTitle>No honeypots found</EmptyTitle>
          <EmptyDescription>Try adjusting your search terms.</EmptyDescription>
        </EmptyState>
      )
    }

    if (honeypots.length === 0 && !loading) {
      return (
        <EmptyState>
          <Shield size={48} />
          <EmptyTitle>No active honeypots</EmptyTitle>
          <EmptyDescription>Get started by creating your first honeypot.</EmptyDescription>
      
        </EmptyState>
      )
    }

    return null
  }

  const renderModals = () => (
    <>
      {showCreateModal && (
        <CreateHoneypotModal
          availableServices={availableServices}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleHoneypotCreated}
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
            } catch (error) {
              console.error('Failed to start service:', error)
              
              // Check for port conflict error
              if (error.message && error.message.includes('port is already allocated')) {
                setNotification({
                  type: 'error',
                  title: 'Port Conflict',
                  message: `Port ${config.port} is already in use. Please choose a different port.`
                })
              } else if (error.message && error.message.includes('Bind for')) {
                const portMatch = error.message.match(/Bind for .*:(\d+) failed/)
                const port = portMatch ? portMatch[1] : config.port
                setNotification({
                  type: 'error',
                  title: 'Port Conflict',
                  message: `Port ${port} is already allocated. Please choose a different port.`
                })
              } else {
                setNotification({
                  type: 'error',
                  title: 'Failed to Start Service',
                  message: error.message || 'An unknown error occurred while starting the service.'
                })
              }
            }
          }}
        />
      )}

      {showLogsModal && selectedHoneypot && (
        <LogsModal
          honeypot={selectedHoneypot}
          onClose={() => setShowLogsModal(false)}
        />
      )}
    </>
  )

  if (loading) {
    return (
      <PageContent>
        {renderHeader()}
        {renderSearchBar()}
        {renderStatsGrid()}
        {renderServicesSection()}
        {renderHoneypotsSection()}
      </PageContent>
    )
  }

  return (
    <>
      <PageContent>
        {renderHeader()}
        {renderSearchBar()}
        {renderStatsGrid()}
        {renderServicesSection()}
        {renderHoneypotsSection()}
        {renderEmptyStates()}
      </PageContent>
      {renderModals()}
      
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

// Styled Components for Dashboard
const PageContent = styled.div`
  padding: 1rem;
  min-height: calc(100vh - 4rem);
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 30vh;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const HeaderTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const HeaderSubtitle = styled.div`
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-weight: 500;
`;

const RefreshIndicator = styled.div`
  color: #10b981;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-weight: 500;
`;

const SkeletonCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  height: 120px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  &::before {
    content: '';
    height: 20px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
  }
  
  &::after {
    content: '';
    height: 40px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
    animation-delay: 0.2s;
  }
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 1.25rem;
`;

const SearchWrapper = styled.div`
  position: relative;
  max-width: 350px;
  
  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.625rem 0.625rem 0.625rem 2.25rem;
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
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ThreatOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  margin-bottom: 0.75rem;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;

  svg {
    color: #2563eb;
  }
`;

const SectionSubtitle = styled.p`
  color: #6b7280;
  font-size: 0.8rem;
  margin: 0;
`;

const HoneypotsSection = styled.div`
  margin-bottom: 1.5rem;
`;

const HoneypotsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ShowMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #2563eb;
    color: #2563eb;
    background: #f9fafb;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;

  svg {
    color: #d1d5db;
    margin-bottom: 0.75rem;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const EmptyDescription = styled.p`
  color: #6b7280;
  text-align: center;
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
`;

const EmptyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    background: #1d4ed8;
  }
`;

// Services Section Styles
const ServicesSection = styled.div`
  margin-bottom: 1.5rem;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ServiceCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ServiceHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const ServiceIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const ServiceInfo = styled.div`
  flex: 1;
`;

const ServiceName = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
`;

const ServiceDescription = styled.p`
  color: #6b7280;
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.4;
`;

const ServiceDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
`;

const ServiceFeature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  color: #374151;

  svg {
    color: #6b7280;
    flex-shrink: 0;
  }
`;
