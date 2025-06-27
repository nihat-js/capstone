'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Shield, Plus, Server, Play, Square, Trash2, Eye, Download, TrendingUp, Activity, MapPin, Clock, Users, Target, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from './components/DashboardLayout'
import { HoneypotCard } from "./components/HoneypotCard"
import { StatsCard } from './components/StatsCard'
import { CreateHoneypotModal } from './components/CreateHoneypotModal'
import { LogsModal } from './components/LogsModal'
import { HoneypotServicesModal } from './components/HoneypotServicesModal'
import { generateFakeHoneypots, generateFakeStats, generateFakeHoneypotTypes } from './utils/fakeData'

export default function Dashboard() {
  const router = useRouter()
  const [honeypots, setHoneypots] = useState([])
  const [runningHoneypots, setRunningHoneypots] = useState({})
  const [stats, setStats] = useState({ total: 0, running: 0, stopped: 0 })
  const [honeypotTypes, setHoneypotTypes] = useState({})
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [showServicesModal, setShowServicesModal] = useState(false)
  const [selectedHoneypot, setSelectedHoneypot] = useState(null)
  const [showAllHoneypots, setShowAllHoneypots] = useState(false)
  const [useFakeData, setUseFakeData] = useState(true) // For demo purposes

  // Fake data for demo
  const fakeHoneypots = generateFakeHoneypots()
  const fakeStats = generateFakeStats(fakeHoneypots)
  const fakeTypes = generateFakeHoneypotTypes()

  useEffect(() => {
    if (useFakeData) {
      // Use fake data for demo
      setHoneypots(fakeHoneypots)
      setStats(fakeStats)
      setHoneypotTypes(fakeTypes)
      setLoading(false)
    } else {
      loadData()
      loadHoneypotTypes()
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadData, 30000)
      return () => clearInterval(interval)
    }
  }, [useFakeData])

  const loadData = async () => {
    try {
      const response = await fetch('/api/honeypots')
      const data = await response.json()
      
      if (data.success) {
        setHoneypots(Object.values(data.data.configs))
        setRunningHoneypots(data.data.running)
        setStats(data.data.statistics)
      }
    } catch (error) {
      toast.error('Failed to load honeypots')
      console.error('Error loading honeypots:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHoneypotTypes = async () => {
    try {
      const response = await fetch('/api/honeypot-types')
      const data = await response.json()
      
      if (data.success) {
        setHoneypotTypes(data.data)
      }
    } catch (error) {
      console.error('Error loading honeypot types:', error)
    }
  }

  const handleStartHoneypot = async (id) => {
    try {
      const response = await fetch(`/api/honeypots/${id}/start`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('Honeypot started successfully!')
        loadData()
      } else {
        toast.error(data.error || 'Failed to start honeypot')
      }
    } catch (error) {
      toast.error('Failed to start honeypot')
      console.error('Error starting honeypot:', error)
    }
  }

  const handleStopHoneypot = async (id) => {
    try {
      const response = await fetch(`/api/honeypots/${id}/stop`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('Honeypot stopped successfully!')
        loadData()
      } else {
        toast.error(data.error || 'Failed to stop honeypot')
      }
    } catch (error) {
      toast.error('Failed to stop honeypot')
      console.error('Error stopping honeypot:', error)
    }
  }

  const handleDeleteHoneypot = async (id) => {
    if (!confirm('Are you sure you want to delete this honeypot? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/honeypots/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('Honeypot deleted successfully!')
        loadData()
      } else {
        toast.error(data.error || 'Failed to delete honeypot')
      }
    } catch (error) {
      toast.error('Failed to delete honeypot')
      console.error('Error deleting honeypot:', error)
    }
  }

  const handleViewLogs = (id) => {
    setSelectedHoneypot(id)
    setShowLogsModal(true)
  }

  const handleCreateHoneypot = () => {
    setShowCreateModal(false)
    loadData()
  }

  const handleServiceSelect = (serviceType) => {
    setShowServicesModal(false)
    router.push(`/config/${serviceType}`)
  }

  const renderDashboard = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      )
    }

    const displayedHoneypots = showAllHoneypots ? honeypots : honeypots.slice(0, 6)

    return (
      <>
        {/* Header */}
        <DashboardHeader>
          <HeaderLeft>
            <HeaderTitle>Dashboard</HeaderTitle>
            <HeaderSubtitle>Monitor and manage your honeypot infrastructure</HeaderSubtitle>
          </HeaderLeft>
          <HeaderActions>
            <DemoToggle onClick={() => setUseFakeData(!useFakeData)} $active={useFakeData}>
              Demo Mode
            </DemoToggle>
            <CreateButton onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              <span>Create Honeypot</span>
            </CreateButton>
          </HeaderActions>
        </DashboardHeader>

        {/* Statistics Overview */}
        <StatsGrid>
          <StatsCard
            title="Total Honeypots"
            value={stats.total}
            icon={Server}
            color="blue"
          />
          <StatsCard
            title="Running"
            value={stats.running}
            icon={Play}
            color="green"
          />
          <StatsCard
            title="Connections Today"
            value={useFakeData ? stats.connectionsToday : stats.stopped}
            icon={Activity}
            color="orange"
          />
          <StatsCard
            title="Attacks Blocked"
            value={useFakeData ? stats.attacksBlocked : Object.keys(honeypotTypes).length}
            icon={Shield}
            color="red"
          />
        </StatsGrid>

        {/* Threat Intelligence Overview */}
        {useFakeData && (
          <ThreatOverview>
            <OverviewSection>
              <SectionHeader>
                <SectionTitle>
                  <Target size={20} />
                  Recent Attack Activity
                </SectionTitle>
                <SectionSubtitle>Live threat detection feed</SectionSubtitle>
              </SectionHeader>
              <RecentAttacks>
                {stats.recentAttacks?.map((attack, index) => (
                  <AttackItem key={index}>
                    <AttackTime>{attack.time}</AttackTime>
                    <AttackType>{attack.type}</AttackType>
                    <AttackSource>from {attack.source}</AttackSource>
                    <AttackTarget>→ {attack.target}</AttackTarget>
                  </AttackItem>
                ))}
              </RecentAttacks>
            </OverviewSection>

            <OverviewSection>
              <SectionHeader>
                <SectionTitle>
                  <TrendingUp size={20} />
                  Top Attack Types
                </SectionTitle>
                <SectionSubtitle>Last 24 hours</SectionSubtitle>
              </SectionHeader>
              <AttackTypesList>
                {stats.topAttackTypes?.map((attackType, index) => (
                  <AttackTypeItem key={index}>
                    <AttackTypeName>{attackType.type}</AttackTypeName>
                    <AttackTypeStats>
                      <AttackTypeCount>{attackType.count}</AttackTypeCount>
                      <AttackTypeBar>
                        <AttackTypeFill $width={attackType.percentage} />
                      </AttackTypeBar>
                      <AttackTypePercent>{attackType.percentage}%</AttackTypePercent>
                    </AttackTypeStats>
                  </AttackTypeItem>
                ))}
              </AttackTypesList>
            </OverviewSection>

            <OverviewSection>
              <SectionHeader>
                <SectionTitle>
                  <MapPin size={20} />
                  Geographic Threats
                </SectionTitle>
                <SectionSubtitle>Attack origins</SectionSubtitle>
              </SectionHeader>
              <GeographicList>
                {stats.geographicData?.map((geo, index) => (
                  <GeoItem key={index}>
                    <GeoCountry>{geo.country}</GeoCountry>
                    <GeoStats>
                      <GeoCount>{geo.attacks} attacks</GeoCount>
                      <GeoBar>
                        <GeoFill $width={geo.percentage} />
                      </GeoBar>
                    </GeoStats>
                  </GeoItem>
                ))}
              </GeographicList>
            </OverviewSection>
          </ThreatOverview>
        )}

        {/* Honeypots Section */}
        <HoneypotsSection>
          <SectionHeader>
            <SectionTitle>
              <Shield size={20} />
              Active Honeypots
            </SectionTitle>
            <SectionSubtitle>
              {showAllHoneypots ? `Showing all ${honeypots.length}` : `Showing ${Math.min(6, honeypots.length)} of ${honeypots.length}`} honeypots
            </SectionSubtitle>
          </SectionHeader>

          <HoneypotsGrid>
            {displayedHoneypots.map((honeypot) => (
              <HoneypotCard
                key={honeypot.id}
                honeypot={{
                  ...honeypot,
                  status: useFakeData ? honeypot.status : (honeypot.id in runningHoneypots ? 'running' : 'stopped'),
                  created_at: honeypot.created_at || honeypot.created
                }}
                honeypotType={honeypotTypes[honeypot.type]}
                onStart={() => handleStartHoneypot(honeypot.id)}
                onStop={() => handleStopHoneypot(honeypot.id)}
                onDelete={() => handleDeleteHoneypot(honeypot.id)}
                onViewLogs={() => handleViewLogs(honeypot.id)}
                onConfigure={() => {}} // TODO: Add configure functionality
              />
            ))}
          </HoneypotsGrid>

          {honeypots.length > 6 && (
            <ShowMoreButton onClick={() => setShowAllHoneypots(!showAllHoneypots)}>
              {showAllHoneypots ? (
                <>
                  <ChevronUp size={16} />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show More ({honeypots.length - 6} more)
                </>
              )}
            </ShowMoreButton>
          )}
        </HoneypotsSection>

        {honeypots.length === 0 && (
          <EmptyState>
            <Shield size={48} />
            <EmptyTitle>No honeypots</EmptyTitle>
            <EmptyDescription>Get started by creating your first honeypot.</EmptyDescription>
            <EmptyButton onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Create Honeypot
            </EmptyButton>
          </EmptyState>
        )}
      </>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Page Content */}
      <PageContent>
        {renderDashboard()}
      </PageContent>

      {/* Modals */}
      {showCreateModal && (
        <CreateHoneypotModal
          honeypotTypes={honeypotTypes}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateHoneypot}
        />
      )}

      {showServicesModal && (
        <HoneypotServicesModal
          onClose={() => setShowServicesModal(false)}
          onServiceSelect={handleServiceSelect}
        />
      )}

      {showLogsModal && selectedHoneypot && (
        <LogsModal
          honeypotId={selectedHoneypot}
          honeypotName={honeypots.find(h => h.id === selectedHoneypot)?.name || ''}
          onClose={() => setShowLogsModal(false)}
        />
      )}
    </DashboardLayout>
  )
}

// Styled Components for Dashboard
const PageContent = styled.div`
  padding: 1.5rem;
  min-height: calc(100vh - 4rem);
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #2563eb;
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
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
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
  gap: 0.5rem;
`;

const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const HeaderSubtitle = styled.p`
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
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

const DemoToggle = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.$active ? '#2563eb' : '#d1d5db'};
  background: ${props => props.$active ? '#2563eb' : 'white'};
  color: ${props => props.$active ? 'white' : '#374151'};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    border-color: #2563eb;
    background: ${props => props.$active ? '#1d4ed8' : '#f9fafb'};
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ThreatOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const OverviewSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const SectionHeader = styled.div`
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;

  svg {
    color: #2563eb;
  }
`;

const SectionSubtitle = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
`;

const RecentAttacks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const AttackItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #ef4444;
`;

const AttackTime = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
`;

const AttackType = styled.span`
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
`;

const AttackSource = styled.span`
  font-size: 0.75rem;
  color: #374151;
  font-family: monospace;
`;

const AttackTarget = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
`;

const AttackTypesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AttackTypeItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AttackTypeName = styled.span`
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
`;

const AttackTypeStats = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AttackTypeCount = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  min-width: 3rem;
`;

const AttackTypeBar = styled.div`
  flex: 1;
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
`;

const AttackTypeFill = styled.div`
  height: 100%;
  width: ${props => props.$width}%;
  background: linear-gradient(90deg, #ef4444, #dc2626);
  transition: width 0.5s ease;
`;

const AttackTypePercent = styled.span`
  font-size: 0.75rem;
  color: #374151;
  font-weight: 600;
  min-width: 2.5rem;
  text-align: right;
`;

const GeographicList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const GeoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const GeoCountry = styled.span`
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
  min-width: 5rem;
`;

const GeoStats = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const GeoCount = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  min-width: 4rem;
`;

const GeoBar = styled.div`
  flex: 1;
  height: 4px;
  background: #f3f4f6;
  border-radius: 2px;
  overflow: hidden;
`;

const GeoFill = styled.div`
  height: 100%;
  width: ${props => props.$width}%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  transition: width 0.5s ease;
`;

const HoneypotsSection = styled.div`
  margin-bottom: 2rem;
`;

const HoneypotsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ShowMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  color: #374151;
  font-weight: 500;
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
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;

  svg {
    color: #d1d5db;
    margin-bottom: 1rem;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const EmptyDescription = styled.p`
  color: #6b7280;
  text-align: center;
  margin: 0 0 1.5rem 0;
`;

const EmptyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: #1d4ed8;
  }
`;
