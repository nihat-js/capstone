import './globals.css'
import { Toaster } from 'react-hot-toast'


export const metadata = {
  title: 'Honeypot Management Dashboard',
  description: 'Comprehensive honeypot management and monitoring platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
