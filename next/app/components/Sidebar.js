import styled from 'styled-components';
import { useRouter } from 'next/navigation';

export default function Sidebar({ onSelect, selected }) {
  const router = useRouter();

  const handleSelect = (item) => {
    if (item === 'api-logs') {
      router.push('/logs/api');
    } else if (item === 'ssh-logs') {
      router.push('/logs/ssh');
    } else if (item === 'mysql-logs') {
      router.push('/logs/mysql');
    } else {
      onSelect(item);
    }
  };

  return (
    <SidebarContainer>
      <Logo>
        <Shield />
        Honeywall
      </Logo>
      <Nav>
        <NavItem className={selected==='dashboard' ? 'active' : ''} onClick={() => handleSelect('dashboard')}>Dashboard</NavItem>
        <NavItem className={selected==='notifications' ? 'active' : ''} onClick={() => handleSelect('notifications')}>Notifications</NavItem>
        <NavItem className={selected==='analysis' ? 'active' : ''} onClick={() => handleSelect('analysis')}>Analysis</NavItem>
        <NavItem className={selected==='settings' ? 'active' : ''} onClick={() => handleSelect('settings')}>Settings</NavItem>
      </Nav>
      <SectionTitle>SECURITY LOGS</SectionTitle>
      <Nav>
        <NavItem className={selected==='api-logs' ? 'active' : ''} onClick={() => handleSelect('api-logs')}>API Logs</NavItem>
        <NavItem className={selected==='ssh-logs' ? 'active' : ''} onClick={() => handleSelect('ssh-logs')}>SSH Logs</NavItem>
        <NavItem className={selected==='mysql-logs' ? 'active' : ''} onClick={() => handleSelect('mysql-logs')}>MySQL Logs</NavItem>
      </Nav>
    </SidebarContainer>
  );
}

// Styled Components

const SidebarContainer = styled.div`
  width: 250px;
  background: #f8fafc;
  border-right: 1.5px solid #e5e7eb;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  box-shadow: 2px 0 12px rgba(30,41,59,0.03);
`;

const Logo = styled.div`
  font-weight: 900;
  font-size: 1.45rem;
  letter-spacing: 0.5px;
  color: #2563eb;
  padding: 36px 0 28px 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Shield = styled.span`
  display: inline-block;
  width: 26px;
  height: 26px;
  background: #2563eb;
  border-radius: 7px;
  margin-right: 6px;
  position: relative;
  box-shadow: 0 2px 8px rgba(37,99,235,0.08);
  &::after {
    content: '';
    position: absolute;
    left: 7px; top: 7px;
    width: 12px; height: 12px;
    background: #fff;
    border-radius: 3px;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 0 0 0;
`;

const NavItem = styled.button`
  background: none;
  border: none;
  color: #334155;
  font-size: 1.07rem;
  text-align: left;
  padding: 12px 36px 12px 36px;
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: background 0.15s, color 0.15s, border 0.15s;
  font-weight: 500;
  &:hover, &.active {
    background: #e0e7ef;
    color: #2563eb;
    border-left: 4px solid #2563eb;
  }
`;

const SectionTitle = styled.div`
  font-size: 0.93rem;
  color: #64748b;
  margin: 32px 0 8px 36px;
  font-weight: 700;
  letter-spacing: 0.2px;
`;
