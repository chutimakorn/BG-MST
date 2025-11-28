'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './sidebar'
import Header from './header'

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Don't show sidebar/header on login pages
  const isAuthPage = pathname === '/login' || pathname === '/simple-login'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#f1f5f9] dark:bg-[#1c2434] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
