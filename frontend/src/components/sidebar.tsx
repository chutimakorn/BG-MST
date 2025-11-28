'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart3,
  Database,
  Upload,
  FileUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'ใบเสนอราคา',
    href: '/quotations',
    icon: FileText,
  },
  {
    title: 'Job Orders',
    href: '/job-orders',
    icon: ClipboardList,
  },
  {
    title: 'รายงาน',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Import Excel',
    href: '/import',
    icon: Upload,
  },
  {
    title: 'Import PDF',
    href: '/import-pdf',
    icon: FileUp,
  },
  {
    title: 'Master Data',
    href: '/master-data',
    icon: Database,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r border-stroke bg-white dark:bg-boxdark dark:border-strokedark',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-stroke dark:border-strokedark px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-black dark:text-white">BG-MST</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-meta-4"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white dark:bg-meta-4'
                    : 'text-bodydark1 hover:bg-gray-100 dark:hover:bg-meta-4',
                  collapsed && 'justify-center'
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-stroke dark:border-strokedark p-4">
          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-bodydark1 transition-colors hover:bg-gray-100 dark:hover:bg-meta-4',
              collapsed && 'justify-center'
            )}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>ออกจากระบบ</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
