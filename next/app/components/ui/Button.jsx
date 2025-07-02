import styled from 'styled-components'

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: ${props => props.size === 'sm' ? '0.5rem 0.75rem' : '0.75rem 1rem'};
  border-radius: 6px;
  border: none;
  font-size: ${props => props.size === 'sm' ? '0.75rem' : '0.875rem'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.variant === 'primary' && `
    background: #3b82f6;
    color: white;
    &:hover {
      background: #2563eb;
    }
  `}

  ${props => props.variant === 'secondary' && `
    background: #f3f4f6;
    color: #374151;
    &:hover {
      background: #e5e7eb;
    }
  `}

  ${props => props.variant === 'success' && `
    background: #10b981;
    color: white;
    &:hover {
      background: #059669;
    }
  `}

  ${props => props.variant === 'danger' && `
    background: #ef4444;
    color: white;
    &:hover {
      background: #dc2626;
    }
  `}

  ${props => props.variant === 'ghost' && `
    background: transparent;
    color: #6b7280;
    &:hover {
      background: #f9fafb;
      color: #374151;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  onClick,
  ...props 
}) {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </StyledButton>
  );
}
