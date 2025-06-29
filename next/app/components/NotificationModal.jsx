'use client'

import { useEffect } from 'react'
import styled from 'styled-components'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const colorMap = {
  success: {
    bg: '#dcfce7',
    border: '#16a34a',
    icon: '#16a34a',
    text: '#166534'
  },
  error: {
    bg: '#fef2f2',
    border: '#dc2626',
    icon: '#dc2626',
    text: '#991b1b'
  },
  warning: {
    bg: '#fef3c7',
    border: '#d97706',
    icon: '#d97706',
    text: '#92400e'
  },
  info: {
    bg: '#dbeafe',
    border: '#2563eb',
    icon: '#2563eb',
    text: '#1e40af'
  }
}

export function NotificationModal({ 
  isOpen, 
  onClose, 
  type = 'info', 
  title, 
  message, 
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel 
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const IconComponent = iconMap[type]
  const colors = colorMap[type]

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      onClose()
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onClose()
    }
  }

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal colors={colors}>
        <Header>
          <IconContainer colors={colors}>
            <IconComponent size={24} />
          </IconContainer>
          <HeaderContent>
            <Title>{title}</Title>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </HeaderContent>
        </Header>

        <Content>
          <Message>{message}</Message>
        </Content>

        <Footer>
          {cancelText && (
            <CancelButton onClick={handleCancel}>
              {cancelText}
            </CancelButton>
          )}
          <ConfirmButton colors={colors} onClick={handleConfirm}>
            {confirmText}
          </ConfirmButton>
        </Footer>
      </Modal>
    </Overlay>
  )
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
  backdrop-filter: blur(2px);
`

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  min-width: 400px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  border: 2px solid ${props => props.colors.border};
  animation: modalEnter 0.2s ease-out;

  @keyframes modalEnter {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @media (max-width: 480px) {
    min-width: unset;
    margin: 1rem;
  }
`

const Header = styled.div`
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.colors.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.colors.icon};
  flex-shrink: 0;
`

const HeaderContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin-left: 1rem;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`

const Content = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;
`

const Message = styled.p`
  color: #374151;
  margin: 0;
  line-height: 1.6;
  font-size: 0.9375rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 500;
`

const Footer = styled.div`
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  border-top: 1px solid #f3f4f6;
`

const Button = styled.button`
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const CancelButton = styled(Button)`
  background: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
`

const ConfirmButton = styled(Button)`
  background: ${props => props.colors.icon};
  color: white;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`
