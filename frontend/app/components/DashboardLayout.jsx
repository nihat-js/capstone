'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { Shield, Menu, X, FileText, BarChart3, Settings, Home, Plus, Server } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

export function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, current: pathname === '/' },
    { name: 'Logs', href: '/logs', icon: FileText, current: pathname === '/logs' },
    { name: 'Analysis', href: '/analysis', icon: BarChart3, current: pathname === '/analysis' },
    { name: 'Settings', href: '/settings', icon: Settings, current: pathname === '/settings' },
  ]

  const handleNavigate = (href) => {
    router.push(href)
    setSidebarOpen(false)
  }

  return (
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

        <SidebarSection>
          <SidebarSectionTitle>Quick Actions</SidebarSectionTitle>
          <QuickActionButton onClick={() => handleNavigate('/')}>
            <Plus size={16} />
            New Honeypot
          </QuickActionButton>
          <QuickActionButton onClick={() => handleNavigate('/')}>
            <Server size={16} />
            Honeypot Services
          </QuickActionButton>
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
        {children}
      </MainArea>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <SidebarOverlay onClick={() => setSidebarOpen(false)} />}
    </AppContainer>
  )
}

// Styled Components
const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f9fafb;
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
    position: relative;
    transform: translateX(0);
    z-index: auto;
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
    margin-left: 280px;
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
