'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Shield, Menu, X, FileText, BarChart3, Settings, Home, Plus, Server, Bell, BellRing, Activity, Database, Terminal, Code, Wifi } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import StyledComponentsRegistry from '@/lib/registry'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export default function RootLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'SSH Honeypot started on port 2222', time: '2 min ago', type: 'success' },
    { id: 2, message: 'Login attempt detected from 192.168.1.100', time: '5 min ago', type: 'warning' },
    { id: 3, message: 'HTTP honeypot configuration saved', time: '10 min ago', type: 'info' }
  ])

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, current: pathname === '/' },
    { name: 'Notifications', href: '/notifications', icon: Bell, current: pathname === '/notifications' },
    { name: 'Analysis', href: '/analysis', icon: BarChart3, current: pathname === '/analysis' },
    { name: 'Settings', href: '/settings', icon: Settings, current: pathname === '/settings' },
  ]

  const [logStatus, setLogStatus] = useState({
    api: 'active',
    ssh: 'warning', 
    mysql: 'active'
  })

  const logNavigation = [
    { name: 'API Logs', href: '/logs/api', icon: Code, current: pathname === '/logs/api', status: logStatus.api },
    { name: 'SSH Logs', href: '/logs/ssh', icon: Terminal, current: pathname === '/logs/ssh', status: logStatus.ssh },
    { name: 'MySQL Logs', href: '/logs/mysql', icon: Database, current: pathname === '/logs/mysql', status: logStatus.mysql },
  ]

  const handleNavigate = (href) => {
    router.push(href)
    setSidebarOpen(false)
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <AppContainer>
            {/* Sidebar */}
            <Sidebar $isOpen={sidebarOpen}>
              <SidebarHeader>
                <SidebarLogo>
                  <Shield size={24} />
                  <SidebarTitle>HoneyShield</SidebarTitle>
                </SidebarLogo>
                <SidebarCloseButton onClick={() => setSidebarOpen(false)}>
                  <X size={20} />
                </SidebarCloseButton>
              </SidebarHeader>

              <SidebarNav>
                {navigation.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <SidebarNavItem
                      key={item.name}
                      $active={item.current}
                      onClick={() => handleNavigate(item.href)}
                    >
                      <IconComponent size={20} />
                      {item.name}
                    </SidebarNavItem>
                  )
                })}
              </SidebarNav>

              {/* Logs Section */}
              <SidebarSection>
                <SidebarSectionTitle>Security Logs</SidebarSectionTitle>
                <LogNav>
                  {logNavigation.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <LogNavItem
                        key={item.name}
                        $active={item.current}
                        onClick={() => handleNavigate(item.href)}
                      >
                        <IconComponent size={16} />
                        {item.name}
                        <LogStatusBadge $status={item.status} />
                      </LogNavItem>
                    )
                  })}
                </LogNav>
              </SidebarSection>

              <SidebarSection>
                <SidebarSectionTitle>Quick Actions</SidebarSectionTitle>
                {/* <QuickActionButton onClick={() => handleNavigate('/')}>
                  <Plus size={16} />
                  New Honeypot
                </QuickActionButton> */}
                {/* <QuickActionButton onClick={() => handleNavigate('/analysis')}>
                  <Activity size={16} />
                  View Analysis
                </QuickActionButton> */}
              </SidebarSection>

              {/* Notifications Section */}
              <SidebarSection>
                {/* <NotificationHeader>
                  <SidebarSectionTitle>Notifications</SidebarSectionTitle>
                  <NotificationBadge $hasNotifications={notifications.length > 0}>
                    {notifications.length > 0 ? <BellRing size={16} /> : <Bell size={16} />}
                    {notifications.length > 0 && <NotificationCount>{notifications.length}</NotificationCount>}
                  </NotificationBadge>
                </NotificationHeader> */}
                
                {/* <NotificationsList>
                  {notifications.length === 0 ? (
                    <NoNotifications>No new notifications</NoNotifications>
                  ) : (
                    notifications.slice(0, 3).map((notification) => (
                      <NotificationItem key={notification.id} $type={notification.type}>
                        <NotificationMessage>{notification.message}</NotificationMessage>
                        <NotificationTime>{notification.time}</NotificationTime>
                      </NotificationItem>
                    ))
                  }
                  {notifications.length > 0 && (
                    <ClearNotificationsButton onClick={clearNotifications}>
                      Clear All
                    </ClearNotificationsButton>
                  )}
                </NotificationsList> */}
              </SidebarSection>
            </Sidebar>

            {/* Main Content Area */}
            <MainArea>
              {/* Mobile Menu Button */}
              <MobileHeader>
                <MenuButton onClick={() => setSidebarOpen(true)}>
                  <Menu size={20} />
                </MenuButton>
                <HeaderTitle>HoneyShield</HeaderTitle>
              </MobileHeader>

              {/* Page Content */}
              <PageContainer>
                {children}
              </PageContainer>
            </MainArea>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && <SidebarOverlay onClick={() => setSidebarOpen(false)} />}
          </AppContainer>
        </StyledComponentsRegistry>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

// Styled Components
const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f9fafb;
  gap: 0;
`;

const Sidebar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: white;
  border-right: 1px solid #e5e7eb;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 40;
  transform: ${({ $isOpen }) => $isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 0.3s ease;

  @media (min-width: 1024px) {
    position: static;
    transform: translateX(0);
    z-index: auto;
    flex-shrink: 0;
  }
`;

const SidebarOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 30;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const SidebarLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #2563eb;
  }
`;

const SidebarTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const SidebarCloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  @media (min-width: 1024px) {
    display: none;
  }
`;

const SidebarNav = styled.nav`
  padding: 1rem 0;
`;

const SidebarNavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  background: ${({ $active }) => $active ? '#eff6ff' : 'transparent'};
  color: ${({ $active }) => $active ? '#2563eb' : '#6b7280'};
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  svg {
    color: ${({ $active }) => $active ? '#2563eb' : '#9ca3af'};
  }
`;

const SidebarSection = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
`;

const SidebarSectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const QuickActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 0;

  @media (min-width: 1024px) {
    margin-left: 0;
  }
`;

const MobileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const PageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
  padding: 0;
  width: 100%;

  @media (min-width: 1024px) {
    min-height: 100vh;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const NotificationBadge = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  color: ${props => props.$hasNotifications ? '#dc2626' : '#6b7280'};
  cursor: pointer;
`;

const NotificationCount = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc2626;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
`;

const NotificationsList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  border-left: 3px solid ${props => {
    switch (props.$type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  }};
  background: ${props => {
    switch (props.$type) {
      case 'success': return '#f0fdf4';
      case 'warning': return '#fffbeb';
      case 'error': return '#fef2f2';
      default: return '#eff6ff';
    }
  }};
`;

const NotificationMessage = styled.div`
  font-size: 0.75rem;
  color: #374151;
  margin-bottom: 0.25rem;
`;

const NotificationTime = styled.div`
  font-size: 0.625rem;
  color: #6b7280;
`;

const NoNotifications = styled.div`
  text-align: center;
  color: #9ca3af;
  font-size: 0.75rem;
  padding: 0.5rem;
`;

const ClearNotificationsButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  color: #6b7280;
  font-size: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    color: #374151;
  }
`;

const LogNav = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const LogNavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: ${({ $active }) => $active ? '#eff6ff' : 'transparent'};
  color: ${({ $active }) => $active ? '#2563eb' : '#6b7280'};
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  font-size: 0.875rem;
  text-align: left;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  svg {
    color: ${({ $active }) => $active ? '#2563eb' : '#9ca3af'};
  }
`;

const LogStatusBadge = styled.div`
  margin-left: auto;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $status }) => {
    switch ($status) {
      case 'active': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  box-shadow: 0 0 0 2px white;
`;
