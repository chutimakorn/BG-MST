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
    <div className="flex h-screen overflow-hidden bg-whiten dark:bg-boxdark-2">
      {/* Sidebar */}
      <Sidebar />

      {/* Content Area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="bg-whiten dark:bg-boxdark-2">
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
