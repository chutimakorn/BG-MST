'use client'

import Sidebar from '@/components/sidebar'
import Header from '@/components/header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
