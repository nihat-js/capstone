'use client'

import { useRouter } from 'next/navigation'
import { RDPServiceConfig } from '../../components/RDPServiceConfig'

export default function RDPConfigPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/')
  }

  const handleSave = (config) => {
    console.log('Saving RDP config:', config)
    // TODO: Implement API call to save RDP configuration
    alert('RDP configuration saved!')
    router.push('/')
  }

  return (
    <RDPServiceConfig onBack={handleBack} onSave={handleSave} />
  )
}
