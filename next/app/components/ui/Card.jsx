import styled from 'styled-components'

const CardContainer = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  ${props => props.hover && `
    cursor: pointer;
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  `}
`;

const CardHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const CardFooter = styled.div`
  padding: 0.75rem 1rem;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export function Card({ 
  children, 
  title, 
  actions, 
  footer, 
  hover = false, 
  onClick, 
  className 
}) {
  return (
    <CardContainer hover={hover} onClick={onClick} className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {actions && <div>{actions}</div>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </CardContainer>
  );
}
