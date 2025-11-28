'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './sidebar'
import Header from './header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Don't show sidebar/header on login page
  const isLoginPage = pathname === '/login' || pathname === '/simple-login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
