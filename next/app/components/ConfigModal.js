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
  background: #f9fafb;
  border-radius: 16px;
  box-shadow: 0 6px 32px rgba(30,41,59,0.10);
  padding: 36px 44px 32px 44px;
  min-width: 360px;
  max-width: 95vw;
  border: 1px solid #e5e7eb;
`;

const Title = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: #1e293b;
`;

const Field = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
  color: #334155;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #cbd5e1;
  border-radius: 7px;
  font-size: 1rem;
  background: #fff;
  color: #1e293b;
  transition: border 0.2s;
  &:focus {
    border: 1.5px solid #2563eb;
    outline: none;
    background: #f1f5f9;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 18px;
  margin-top: 28px;
`;

const Button = styled.button`
  background: linear-gradient(90deg, #2563eb 60%, #1e40af 100%);
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 11px 28px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(37,99,235,0.07);
  transition: background 0.2s;
  &:hover { background: linear-gradient(90deg, #1e40af 60%, #2563eb 100%); }
`;

const CancelButton = styled(Button)`
  background: #f1f5f9;
  color: #334155;
  box-shadow: none;
  border: 1.5px solid #cbd5e1;
  &:hover { background: #e2e8f0; color: #1e293b; }
`;

export default function ConfigModal({ type, open, onClose, onSubmit }) {
  // Config fields for each honeypot type
  const defaultConfigs = {
    api: { port: 8080, username: 'james', password: 'james' },
    mysql: { port: 3307, root_password: 'root', user: 'testuser', user_password: 'testpass' },
    ssh: { port: 2222, users: '', banner: '', passwd_chmod: '644', shadow_chmod: '640' },
  };
  const [config, setConfig] = useState(defaultConfigs[type] || {});

  // Reset config when type changes
  useEffect(() => {
    setConfig(defaultConfigs[type] || {});
  }, [type, open]);

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
          <Label>Users (JSON array)</Label>
          <Input value={config.users} onChange={e => setConfig({ ...config, users: e.target.value })} placeholder='[{"username":"james","password":"james","sudo":true}]' />
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
        <Title>Configure {type && type.toUpperCase()} Honeypot</Title>
        {fields}
        <Actions>
          <Button onClick={() => onSubmit(config)}>Deploy</Button>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
        </Actions>
      </ModalBox>
    </Overlay>
  );
}
