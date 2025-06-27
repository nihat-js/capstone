'use client'

import { useRouter } from 'next/navigation'
import { SSHServiceConfig } from '../../components/SSHServiceConfig'

export default function SSHConfigPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/')
  }

  const handleSave = (config) => {
    console.log('Saving SSH config:', config)
    // TODO: Implement API call to save SSH configuration
    alert('SSH configuration saved!')
    router.push('/')
  }

  return (
    <SSHServiceConfig onBack={handleBack} onSave={handleSave} />
  )
}
