'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { Bell, CheckCircle, AlertTriangle, Info, X, Clock } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'SSH Honeypot Started',
      message: 'SSH honeypot successfully started on port 2222',
      type: 'success',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      title: 'Suspicious Login Attempt',
      message: 'Multiple failed login attempts detected from IP 192.168.1.100',
      type: 'warning',
      time: '5 minutes ago',
      read: false
    },
    {
      id: 3,
      title: 'Configuration Saved',
      message: 'HTTP honeypot configuration has been successfully saved',
      type: 'info',
      time: '10 minutes ago',
      read: true
    },
    {
      id: 4,
      title: 'Attack Detected',
      message: 'SQL injection attempt blocked on MySQL honeypot',
      type: 'warning',
      time: '15 minutes ago',
      read: true
    },
    {
      id: 5,
      title: 'System Update',
      message: 'Honeypot system has been updated to version 2.1.0',
      type: 'info',
      time: '1 hour ago',
      read: true
    }
  ])

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'warning':
        return <AlertTriangle size={20} />
      case 'info':
        return <Info size={20} />
      default:
        return <Bell size={20} />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <PageContainer>
      <Header>
        <HeaderLeft>
          <Title>Notifications</Title>
          <Subtitle>Stay updated with your honeypot activities</Subtitle>
        </HeaderLeft>
        <HeaderActions>
          {unreadCount > 0 && (
            <MarkAllReadButton onClick={markAllAsRead}>
              Mark all as read ({unreadCount})
            </MarkAllReadButton>
          )}
        </HeaderActions>
        </Header>

        <NotificationsList>
          {notifications.length === 0 ? (
            <EmptyState>
              <Bell size={48} />
              <EmptyTitle>No notifications</EmptyTitle>
              <EmptyDescription>
                You're all caught up! New notifications will appear here.
              </EmptyDescription>
            </EmptyState>
          ) : (
            notifications.map((notification) => (
              <NotificationItem 
                key={notification.id}
                $read={notification.read}
                $type={notification.type}
              >
                <NotificationIcon $type={notification.type}>
                  {getIcon(notification.type)}
                </NotificationIcon>
                
                <NotificationContent>
                  <NotificationHeader>
                    <NotificationTitle>{notification.title}</NotificationTitle>
                    <NotificationTime>
                      <Clock size={14} />
                      {notification.time}
                    </NotificationTime>
                  </NotificationHeader>
                  <NotificationMessage>{notification.message}</NotificationMessage>
                </NotificationContent>

                <NotificationActions>
                  {!notification.read && (
                    <ActionButton onClick={() => markAsRead(notification.id)}>
                      Mark as read
                    </ActionButton>
                  )}
                  <DeleteButton onClick={() => deleteNotification(notification.id)}>
                    <X size={16} />
                  </DeleteButton>
                </NotificationActions>
              </NotificationItem>
            ))
          )}
        </NotificationsList>
      </PageContainer>
  )
}

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
`

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`

const MarkAllReadButton = styled.button`
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1d4ed8;
  }
`

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: ${props => props.$read ? '#ffffff' : '#f8fafc'};
  border: 1px solid ${props => {
    if (!props.$read) return '#e2e8f0';
    switch (props.$type) {
      case 'success': return '#d1fae5';
      case 'warning': return '#fef3c7';
      case 'info': return '#dbeafe';
      default: return '#e5e7eb';
    }
  }};
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`

const NotificationIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: ${props => {
    switch (props.$type) {
      case 'success': return '#dcfce7';
      case 'warning': return '#fef3c7';
      case 'info': return '#dbeafe';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'success': return '#16a34a';
      case 'warning': return '#d97706';
      case 'info': return '#2563eb';
      default: return '#6b7280';
    }
  }};
`

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`

const NotificationTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`

const NotificationTime = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
`

const NotificationMessage = styled.p`
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
  line-height: 1.4;
`

const NotificationActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const ActionButton = styled.button`
  padding: 0.25rem 0.75rem;
  background: transparent;
  color: #2563eb;
  border: 1px solid #2563eb;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
    color: white;
  }
`

const DeleteButton = styled.button`
  padding: 0.25rem;
  background: transparent;
  color: #6b7280;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fee2e2;
    color: #dc2626;
  }
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #6b7280;
`

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
`

const EmptyDescription = styled.p`
  font-size: 0.875rem;
  margin: 0;
  max-width: 20rem;
`
