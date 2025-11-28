'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  Upload, 
  Database,
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'ใบเสนอราคา', href: '/quotations', icon: FileText },
    { name: 'Job Orders', href: '/job-orders', icon: ClipboardList },
    { name: 'Import Excel', href: '/import', icon: Upload },
    { name: 'Import PDF', href: '/import-pdf', icon: Upload },
    { name: 'Master Data', href: '/master-data', icon: Database },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ]

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">BG</span>
            </div>
            <span className="hidden font-bold sm:inline-block">
              ระบบจัดการข้อมูลการขาย
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <nav className="flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-16 border-b bg-background md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive(item.href) ? 'default' : 'ghost'}
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm">Theme</span>
                <ThemeToggle />
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                ออกจากระบบ
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
