'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { 
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

const salesData = [
  { name: 'ม.ค.', sales: 4000, orders: 2400 },
  { name: 'ก.พ.', sales: 3000, orders: 1398 },
  { name: 'มี.ค.', sales: 2000, orders: 9800 },
  { name: 'เม.ย.', sales: 2780, orders: 3908 },
  { name: 'พ.ค.', sales: 1890, orders: 4800 },
  { name: 'มิ.ย.', sales: 2390, orders: 3800 },
  { name: 'ก.ค.', sales: 3490, orders: 4300 },
]

const revenueData = [
  { month: 'ม.ค.', revenue: 4200, profit: 2100 },
  { month: 'ก.พ.', revenue: 3800, profit: 1900 },
  { month: 'มี.ค.', revenue: 5100, profit: 2550 },
  { month: 'เม.ย.', revenue: 4600, profit: 2300 },
  { month: 'พ.ค.', revenue: 5400, profit: 2700 },
  { month: 'มิ.ย.', revenue: 6200, profit: 3100 },
]

const visitorData = [
  { day: 'จ', visitors: 120 },
  { day: 'อ', visitors: 150 },
  { day: 'พ', visitors: 180 },
  { day: 'พฤ', visitors: 200 },
  { day: 'ศ', visitors: 170 },
  { day: 'ส', visitors: 220 },
  { day: 'อา', visitors: 190 },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    if (token) {
      loadStats()
    }
  }, [router])

  const loadStats = async () => {
    try {
      const response = await api.get('/reports/sales-summary')
      setStats(response.data)
    } catch (error: any) {
      console.error('Failed to load stats', error)
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          <p className="mt-4 text-black dark:text-white">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Dashboard
        </h2>
        <nav>
          <p className="font-medium">ยินดีต้อนรับกลับมา, {user.fullName} 👋</p>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {/* Card Item */}
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <DollarSign className="h-5 w-5 text-primary dark:text-white" />
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                ฿3.456M
              </h4>
              <span className="text-sm font-medium">ยอดขายรวม</span>
            </div>

            <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
              0.43%
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>

        {/* Card Item */}
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <TrendingUp className="h-5 w-5 text-primary dark:text-white" />
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                $45.2K
              </h4>
              <span className="text-sm font-medium">ใบเสนอราคา</span>
            </div>

            <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
              4.35%
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>

        {/* Card Item */}
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <ShoppingCart className="h-5 w-5 text-primary dark:text-white" />
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                2.450
              </h4>
              <span className="text-sm font-medium">Job Orders</span>
            </div>

            <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
              2.59%
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>

        {/* Card Item */}
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <Users className="h-5 w-5 text-primary dark:text-white" />
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                3.456
              </h4>
              <span className="text-sm font-medium">ลูกค้าทั้งหมด</span>
            </div>

            <span className="flex items-center gap-1 text-sm font-medium text-meta-1">
              0.95%
              <ArrowDownRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        {/* Sales Overview */}
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
          <div className="mb-3 justify-between gap-4 sm:flex">
            <div>
              <h4 className="text-xl font-semibold text-black dark:text-white">
                ภาพรวมยอดขาย
              </h4>
            </div>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3C50E0" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3C50E0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3C50E0" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-4">
          <div className="mb-3">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              รายได้และกำไร
            </h4>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3C50E0" radius={[4, 4, 0, 0]} name="รายได้" />
                <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} name="กำไร" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        {/* Visitors Chart */}
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-8">
          <div className="mb-3">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              ผู้เข้าชมรายสัปดาห์
            </h4>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#3C50E0" 
                  strokeWidth={2}
                  dot={{ fill: '#3C50E0', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              กิจกรรมล่าสุด
            </h4>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <Activity className="h-5 w-5 text-primary dark:text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-black dark:text-white">ใบเสนอราคาใหม่</p>
                <p className="text-sm text-body">5 นาทีที่แล้ว</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <Activity className="h-5 w-5 text-meta-3 dark:text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-black dark:text-white">Job Order อัพเดท</p>
                <p className="text-sm text-body">15 นาทีที่แล้ว</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <Activity className="h-5 w-5 text-meta-5 dark:text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-black dark:text-white">รายงานสร้างเสร็จ</p>
                <p className="text-sm text-body">1 ชั่วโมงที่แล้ว</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
