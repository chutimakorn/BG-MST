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
  Users,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  {
    title: 'Home',
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
    href: '/master-data/cars',
    icon: Database,
    submenu: [
      { title: 'รุ่นรถ', href: '/master-data/cars' },
      { title: 'ผู้ขาย', href: '/master-data/sale-members' },
      { title: 'Category รถ', href: '/master-data/category-cars' },
      { title: 'สี Body', href: '/master-data/body-colors' },
      { title: 'สี Seat', href: '/master-data/seat-colors' },
      { title: 'สี Canopy', href: '/master-data/canopy-colors' },
      { title: 'จังหวัด', href: '/master-data/provinces' },
      { title: 'สถานะการขาย', href: '/master-data/status-sales' },
      { title: 'สถานะเอกสาร', href: '/master-data/status-job-documents' },
      { title: 'สถานะงาน', href: '/master-data/status-jobs' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title)
  }

  return (
    <aside
      className={`flex h-screen flex-col overflow-y-hidden bg-white border-r border-stroke transition-all duration-300 dark:border-strokedark dark:bg-boxdark ${
        sidebarOpen ? 'w-72.5' : 'w-20'
      }`}
    >
      {/* SIDEBAR HEADER */}
      <div className="flex items-center justify-between gap-2 border-b border-stroke px-6 py-5.5 dark:border-strokedark lg:py-6.5">
        {sidebarOpen && (
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-black dark:text-white">BG-MST</h1>
          </Link>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 hover:bg-primary hover:bg-opacity-10 hover:text-primary"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>
      {/* SIDEBAR HEADER */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* Sidebar Menu */}
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          {/* Menu Group */}
          <div>
            {sidebarOpen && (
              <h3 className="mb-4 ml-4 text-sm font-semibold text-body dark:text-bodydark2">MENU</h3>
            )}

            <ul className="mb-6 flex flex-col gap-1.5">
              {menuItems.map((item) => {
                const hasSubmenu = item.submenu && item.submenu.length > 0
                const isActive = item.href ? (pathname === item.href || pathname?.startsWith(item.href + '/')) : false
                const isSubmenuActive = hasSubmenu && item.submenu?.some(sub => pathname === sub.href || pathname?.startsWith(sub.href + '/'))
                const isSubmenuOpen = openSubmenu === item.title || isSubmenuActive

                return (
                  <li key={item.title}>
                    {hasSubmenu ? (
                      <>
                        <button
                          onClick={() => toggleSubmenu(item.title)}
                          className={`group relative flex w-full items-center justify-between gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out ${
                            isSubmenuActive
                              ? 'bg-primary bg-opacity-10 text-primary'
                              : 'text-body hover:bg-primary hover:bg-opacity-10 hover:text-primary dark:text-bodydark1 dark:hover:bg-primary dark:hover:bg-opacity-10 dark:hover:text-primary'
                          }`}
                          title={!sidebarOpen ? item.title : undefined}
                        >
                          <div className="flex items-center gap-2.5">
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {sidebarOpen && item.title}
                          </div>
                          {sidebarOpen && (
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                isSubmenuOpen ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </button>
                        {isSubmenuOpen && sidebarOpen && (
                          <ul className="mt-1 flex flex-col gap-1 pl-6">
                            {item.submenu?.map((subItem) => {
                              const isSubActive = pathname === subItem.href || pathname?.startsWith(subItem.href + '/')
                              return (
                                <li key={subItem.href}>
                                  <Link
                                    href={subItem.href}
                                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out ${
                                      isSubActive
                                        ? 'bg-primary bg-opacity-10 text-primary'
                                        : 'text-body hover:bg-primary hover:bg-opacity-10 hover:text-primary dark:text-bodydark1 dark:hover:bg-primary dark:hover:bg-opacity-10 dark:hover:text-primary'
                                    }`}
                                  >
                                    {subItem.title}
                                  </Link>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href!}
                        className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out ${
                          isActive
                            ? 'bg-primary bg-opacity-10 text-primary'
                            : 'text-body hover:bg-primary hover:bg-opacity-10 hover:text-primary dark:text-bodydark1 dark:hover:bg-primary dark:hover:bg-opacity-10 dark:hover:text-primary'
                        }`}
                        title={!sidebarOpen ? item.title : undefined}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {sidebarOpen && item.title}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Others Group */}
          <div>
            {sidebarOpen && (
              <h3 className="mb-4 ml-4 text-sm font-semibold text-body dark:text-bodydark2">OTHERS</h3>
            )}

            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <Link
                  href="/users"
                  className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out ${
                    pathname === '/users'
                      ? 'bg-primary bg-opacity-10 text-primary'
                      : 'text-body hover:bg-primary hover:bg-opacity-10 hover:text-primary dark:text-bodydark1 dark:hover:bg-primary dark:hover:bg-opacity-10 dark:hover:text-primary'
                  }`}
                  title={!sidebarOpen ? 'จัดการผู้ใช้' : undefined}
                >
                  <Users className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && 'จัดการผู้ใช้'}
                </Link>
              </li>

              <li>
                <Link
                  href="/settings"
                  className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out ${
                    pathname === '/settings'
                      ? 'bg-primary bg-opacity-10 text-primary'
                      : 'text-body hover:bg-primary hover:bg-opacity-10 hover:text-primary dark:text-bodydark1 dark:hover:bg-primary dark:hover:bg-opacity-10 dark:hover:text-primary'
                  }`}
                  title={!sidebarOpen ? 'ตั้งค่า' : undefined}
                >
                  <Settings className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && 'ตั้งค่า'}
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-body duration-300 ease-in-out hover:bg-primary hover:bg-opacity-10 hover:text-primary dark:text-bodydark1 dark:hover:bg-primary dark:hover:bg-opacity-10 dark:hover:text-primary"
                  title={!sidebarOpen ? 'ออกจากระบบ' : undefined}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && 'ออกจากระบบ'}
                </button>
              </li>
            </ul>
          </div>
        </nav>
        {/* Sidebar Menu */}
      </div>
    </aside>
  )
}
