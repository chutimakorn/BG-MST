'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stroke dark:border-strokedark bg-white dark:bg-boxdark px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหา..."
            className="h-9 w-64 rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-meta-4 pl-9 pr-4 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg hover:bg-gray-100 dark:hover:bg-meta-4"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-bodydark1" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="rounded-lg relative hover:bg-gray-100 dark:hover:bg-meta-4">
          <Bell className="h-5 w-5 text-bodydark1" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </Button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 rounded-lg border border-stroke dark:border-strokedark px-3 py-2 bg-white dark:bg-meta-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
            <User className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-black dark:text-white">{user?.fullName || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-bodydark1">{user?.username || 'user'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
