'use client'

import { useRouter } from 'next/navigation'
import { TelnetServiceConfig } from '../../components/TelnetServiceConfig'

export default function TelnetConfigPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/')
  }

  const handleSave = (config) => {
    console.log('Saving Telnet config:', config)
    // TODO: Implement API call to save Telnet configuration
    alert('Telnet configuration saved!')
    router.push('/')
  }

  return (
    <TelnetServiceConfig onBack={handleBack} onSave={handleSave} />
  )
}
