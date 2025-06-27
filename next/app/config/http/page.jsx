'use client'

import { useRouter } from 'next/navigation'
import { HTTPServiceConfig } from '../../components/HTTPServiceConfig'

export default function HTTPConfigPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/')
  }

  const handleSave = (config) => {
    console.log('Saving HTTP config:', config)
    // TODO: Implement API call to save HTTP configuration
    alert('HTTP configuration saved!')
    router.push('/')
  }

  return (
    <HTTPServiceConfig onBack={handleBack} onSave={handleSave} />
  )
}
