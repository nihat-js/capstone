import styled from 'styled-components';
import { useState,useEffect } from 'react';


const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(30, 41, 59, 0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  padding: 48px;
  min-width: 520px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  border: 2px solid rgba(99, 102, 241, 0.1);
  position: relative;
  backdrop-filter: blur(20px);
`;

const Title = styled.div`
  font-size: 1.75rem;
  font-weight: 900;
  margin-bottom: 32px;
  color: #0f172a;
  text-align: center;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Field = styled.div`
  margin-bottom: 28px;
  position: relative;
`;

const Label = styled.label`
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 12px;
  display: block;
  color: #1e293b;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 1.05rem;
  background: rgba(255, 255, 255, 0.8);
  color: #1e293b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  
  &:focus {
    border: 2px solid #6366f1;
    outline: none;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 
      0 0 0 4px rgba(99, 102, 241, 0.1),
      0 8px 25px -8px rgba(99, 102, 241, 0.2);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 2px solid rgba(226, 232, 240, 0.8);
`;

const Button = styled.button`
  background: ${props => props.disabled ? 
    'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' :
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  color: white;
  border: none;
  border-radius: 16px;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 140px;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
  box-shadow: 
    0 8px 25px -8px rgba(102, 126, 234, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.2) inset;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 35px -8px rgba(102, 126, 234, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.3) inset;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const CancelButton = styled(Button)`
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  box-shadow: 
    0 4px 15px -4px rgba(71, 85, 105, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  
  &:hover {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    color: #334155;
    transform: translateY(-1px);
    box-shadow: 
      0 6px 20px -4px rgba(71, 85, 105, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.9) inset;
  }
`;

const DeploymentStatus = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: ${props => props.show ? 1 : 0};
  transform: ${props => props.show ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease;
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const UsersList = styled.div`
  margin-top: 16px;
  max-height: 280px;
  overflow-y: auto;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(248, 250, 252, 0.8);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #6366f1;
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    transform: translateY(-1px);
  }
`;

const UserButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
  
  ${props => props.variant === 'remove' ? `
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    color: #dc2626;
    &:hover { 
      background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%); 
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
    }
  ` : `
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #2563eb;
    &:hover { 
      background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%); 
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }
  `}
`;

const AddUserButton = styled.button`
  width: 100%;
  padding: 16px;
  margin-top: 12px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0284c7;
  border: 2px dashed #0284c7;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  
  &:hover {
    background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
    border-style: solid;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(2, 132, 199, 0.2);
  }
`;

export default function ConfigModal({ type, open, onClose, onSubmit }) {
  // Config fields for each honeypot type
  const defaultConfigs = {
    api: { port: 8080, username: 'james', password: 'james' },
    mysql: { port: 3307, root_password: 'root', user: 'testuser', user_password: 'testpass' },
    ssh: { 
      port: 2222, 
      users: [
        { username: 'james', password: 'james', sudo: false },
        { username: 'nihat', password: 'nihat', sudo: false }
      ],
      banner: '', 
      passwd_chmod: '644', 
      shadow_chmod: '640',
      "banner" : `Welcome to SecureBank Production Server
        =======================================

        WARNING: This system is for authorized personnel only.
        All activities are monitored and logged.
        Unauthorized access is strictly prohibited.

        Last login: Mon Dec 20 08:45:32 2024 from 192.168.1.100

        System Information:
        - Hostname: prod-web-01.securebank.internal  
        - OS: Ubuntu 20.04.6 LTS
        - Kernel: Linux 5.4.0-150-generic
        - Uptime: 127 days, 14 hours, 32 minutes
        - Load: 0.15, 0.12, 0.08
      `
    },
  };
  const [config, setConfig] = useState(defaultConfigs[type] || {});
  const [isDeploying, setIsDeploying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Reset config when type changes
  useEffect(() => {
    setConfig(defaultConfigs[type] || {});
    setIsDeploying(false);
    setElapsedTime(0);
  }, [type, open]);

  // Elapsed time counter
  useEffect(() => {
    let interval;
    if (isDeploying) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isDeploying]);

  // User management functions for SSH
  const addUser = () => {
    const newUsers = [...(config.users || []), { username: '', password: '', sudo: false }];
    setConfig({ ...config, users: newUsers });
  };

  const removeUser = (index) => {
    const newUsers = config.users.filter((_, i) => i !== index);
    setConfig({ ...config, users: newUsers });
  };

  const updateUser = (index, field, value) => {
    const newUsers = [...config.users];
    newUsers[index] = { ...newUsers[index], [field]: value };
    setConfig({ ...config, users: newUsers });
  };

  const handleSubmit = async () => {
    setIsDeploying(true);
    setElapsedTime(0);
    
    try {
      if (type === 'ssh') {
        // Convert users array to JSON string for API
        const configWithJsonUsers = {
          ...config,
          users: JSON.stringify(config.users)
        };
        await onSubmit(configWithJsonUsers);
      } else {
        await onSubmit(config);
      }
    } catch (error) {
      console.error('Deploy error:', error);
    } finally {
      setIsDeploying(false);
      setElapsedTime(0);
    }
  };

  if (!open) return null;

  // Render fields based on type
  let fields = null;
  if (type === 'api') {
    fields = (
      <>
        <Field>
          <Label>Port</Label>
          <Input type="number" value={config.port} onChange={e => setConfig({ ...config, port: +e.target.value })} />
        </Field>
        <Field>
          <Label>Username</Label>
          <Input value={config.username} onChange={e => setConfig({ ...config, username: e.target.value })} />
        </Field>
        <Field>
          <Label>Password</Label>
          <Input value={config.password} onChange={e => setConfig({ ...config, password: e.target.value })} />
        </Field>
      </>
    );
  } else if (type === 'mysql') {
    fields = (
      <>
        <Field>
          <Label>Port</Label>
          <Input type="number" value={config.port} onChange={e => setConfig({ ...config, port: +e.target.value })} />
        </Field>
        <Field>
          <Label>Root Password</Label>
          <Input value={config.root_password} onChange={e => setConfig({ ...config, root_password: e.target.value })} />
        </Field>
        <Field>
          <Label>User</Label>
          <Input value={config.user} onChange={e => setConfig({ ...config, user: e.target.value })} />
        </Field>
        <Field>
          <Label>User Password</Label>
          <Input value={config.user_password} onChange={e => setConfig({ ...config, user_password: e.target.value })} />
        </Field>
      </>
    );
  } else if (type === 'ssh') {
    fields = (
      <>
        <Field>
          <Label>Port</Label>
          <Input type="number" value={config.port} onChange={e => setConfig({ ...config, port: +e.target.value })} />
        </Field>
        <Field>
          <Label>SSH Users</Label>
          <UsersList>
            {(config.users || []).map((user, index) => (
              <UserItem key={index}>
                <UserInput
                  placeholder="Username"
                  value={user.username}
                  onChange={e => updateUser(index, 'username', e.target.value)}
                />
                <UserInput
                  placeholder="Password"
                  type="password"
                  value={user.password}
                  onChange={e => updateUser(index, 'password', e.target.value)}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={user.sudo}
                    onChange={e => updateUser(index, 'sudo', e.target.checked)}
                  />
                  Sudo
                </label>
                <UserButton variant="remove" onClick={() => removeUser(index)}>
                  Remove
                </UserButton>
              </UserItem>
            ))}
          </UsersList>
          <AddUserButton onClick={addUser}>+ Add User</AddUserButton>
        </Field>
        <Field>
          <Label>Banner</Label>
          <Input value={config.banner} onChange={e => setConfig({ ...config, banner: e.target.value })} placeholder="Welcome to the SSH honeypot server" />
        </Field>
        <Field>
          <Label>/etc/passwd chmod</Label>
          <Input value={config.passwd_chmod} onChange={e => setConfig({ ...config, passwd_chmod: e.target.value })} />
        </Field>
        <Field>
          <Label>/etc/shadow chmod</Label>
          <Input value={config.shadow_chmod} onChange={e => setConfig({ ...config, shadow_chmod: e.target.value })} />
        </Field>
      </>
    );
  }

  return (
    <Overlay>
      <ModalBox>
        <DeploymentStatus show={isDeploying}>
          <LoadingSpinner />
          Deploying... {elapsedTime}s
        </DeploymentStatus>
        
        <Title>Configure {type && type.toUpperCase()} Honeypot</Title>
        {fields}
        <Actions>
          <CancelButton onClick={onClose} disabled={isDeploying}>
            Cancel
          </CancelButton>
          <Button onClick={handleSubmit} disabled={isDeploying}>
            <ButtonContent>
              {isDeploying && <LoadingSpinner />}
              {isDeploying ? 'Deploying...' : 'Deploy'}
            </ButtonContent>
          </Button>
        </Actions>
      </ModalBox>
    </Overlay>
  );
}
