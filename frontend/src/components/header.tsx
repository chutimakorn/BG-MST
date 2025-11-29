'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Bell, Search, User, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

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
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Logo or Title */}
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:bg-gray-2 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-4"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-bodydark1" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Notification */}
          <button className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:bg-gray-2 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-4">
            <span className="absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1">
              <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
            </span>
            <Bell className="h-5 w-5" />
          </button>

          {/* User Area */}
          <div className="relative">
            <Link
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-4"
              href="#"
            >
              <span className="hidden text-right lg:block">
                <span className="block text-sm font-medium text-black dark:text-white">
                  {user?.fullName || 'User'}
                </span>
                <span className="block text-xs">{user?.username || 'user'}</span>
              </span>

              <span className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white">
                <User className="h-6 w-6" />
              </span>

              <ChevronDown className="hidden h-4 w-4 sm:block" />
            </Link>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
                  <li>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                    >
                      <User className="h-5 w-5" />
                      โปรไฟล์
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
