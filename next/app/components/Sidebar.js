import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <SidebarContainer>
      <Logo>
        <ShieldIcon>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10.5V11.5C15.4,11.5 16,12.1 16,12.7V16.7C16,17.4 15.4,18 14.7,18H9.2C8.6,18 8,17.4 8,16.8V12.8C8,12.1 8.4,11.5 9,11.5V10.5C9,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.2,9 10.2,10.5V11.5H13.8V10.5C13.8,9 12.8,8.2 12,8.2Z"/>
          </svg>
        </ShieldIcon>
        <LogoText>Honeywall</LogoText>
      </Logo>
      
      <Nav>
        <NavLink href="/" className={isActive('/') && pathname === '/' ? 'active' : ''}>
          <Icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </Icon>
          <span>Dashboard</span>
        </NavLink>
        <NavLink href="/notifications" className={isActive('/notifications') ? 'active' : ''}>
          <Icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </Icon>
          <span>Notifications</span>
        </NavLink>
        <NavLink href="/analysis" className={isActive('/analysis') ? 'active' : ''}>
          <Icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </Icon>
          <span>Analysis</span>
        </NavLink>
        <NavLink href="/settings" className={isActive('/settings') ? 'active' : ''}>
          <Icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </Icon>
          <span>Settings</span>
        </NavLink>
      </Nav>
      
      <SectionDivider />
      
      <SectionTitle>
        <SectionIcon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10.5V11.5C15.4,11.5 16,12.1 16,12.7V16.7C16,17.4 15.4,18 14.7,18H9.2C8.6,18 8,17.4 8,16.8V12.8C8,12.1 8.4,11.5 9,11.5V10.5C9,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.2,9 10.2,10.5V11.5H13.8V10.5C13.8,9 12.8,8.2 12,8.2Z"/>
          </svg>
        </SectionIcon>
        SECURITY LOGS
      </SectionTitle>
      
      <Nav>
        <NavLink href="/logs/api" className={isActive('/logs/api') ? 'active' : ''}>
          <Icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.5,18L11,15.5L9.5,14L8.5,15L7.5,14L6,15.5L8.5,18M16.5,5.5L15.5,6.5L16.5,7.5L18,6L16.5,5.5M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
            </svg>
          </Icon>
          <span>API Logs</span>
          <Badge>Live</Badge>
        </NavLink>
        <NavLink href="/logs/ssh" className={isActive('/logs/ssh') ? 'active' : ''}>
          <Icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22,18V22H18V19H16V21H8V19H6V22H2V18H4V16H6V14H4V10H6V8H8V10H16V8H18V10H20V14H18V16H20V18H22M16,12H8V14H6V16H8V18H16V16H18V14H16V12Z"/>
            </svg>
          </Icon>
          <span>SSH Logs</span>
          <Badge>Live</Badge>
        </NavLink>
        <NavLink href="/logs/mysql" className={isActive('/logs/mysql') ? 'active' : ''}>
          <Icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z"/>
            </svg>
          </Icon>
          <span>MySQL Logs</span>
          <Badge>Live</Badge>
        </NavLink>
      </Nav>
      
      <Spacer />
      
      <UserSection>
        <UserAvatar>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
          </svg>
        </UserAvatar>
        <UserInfo>
          <UserName>Security Admin</UserName>
          <UserRole>Administrator</UserRole>
        </UserInfo>
        <StatusIndicator />
      </UserSection>
    </SidebarContainer>
  );
}

// Styled Components

const SidebarContainer = styled.div`
  width: 280px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-right: 2px solid rgba(226, 232, 240, 0.8);
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  box-shadow: 
    4px 0 20px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.9) inset;
  position: relative;
  overflow-y: auto;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 24px;
  border-bottom: 2px solid rgba(226, 232, 240, 0.5);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-bottom: 8px;
`;

const ShieldIcon = styled.div`
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  position: relative;
  
  svg {
    width: 20px;
    height: 20px;
    color: #667eea;
  }
`;

const LogoText = styled.span`
  font-weight: 900;
  font-size: 1.6rem;
  letter-spacing: -0.5px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 16px;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 12px;
  text-decoration: none;
  color: #475569;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    color: #334155;
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 
      0 6px 20px rgba(102, 126, 234, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.2) inset;
    transform: translateX(6px);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
      border-radius: 0 4px 4px 0;
    }
  }
`;

const Icon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const Badge = styled.span`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
`;

const SectionDivider = styled.div`
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
  margin: 24px 32px;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #64748b;
  margin: 16px 36px 12px 36px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const SectionIcon = styled.span`
  font-size: 1rem;
`;

const Spacer = styled.div`
  flex: 1;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  margin: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  border: 2px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
`;

const UserRole = styled.div`
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  margin-left: auto;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
  animation: pulse 2s infinite;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    border: 2px solid rgba(16, 185, 129, 0.3);
    animation: ripple 2s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    100% {
      transform: scale(1.4);
      opacity: 0;
    }
  }
`;