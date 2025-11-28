'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { 
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
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

// Sample data for charts
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
      if (error.response?.status !== 401) {
        console.log('Error loading stats:', error.message)
      }
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">ยินดีต้อนรับกลับมา, {user.fullName} 👋</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">ยอดขายรวม</p>
                <p className="text-2xl font-bold">฿3.456M</p>
                <div className="flex items-center text-xs text-green-600">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span>0.43%</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">ใบเสนอราคา</p>
                <p className="text-2xl font-bold">$45.2K</p>
                <div className="flex items-center text-xs text-green-600">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span>4.35%</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Job Orders</p>
                <p className="text-2xl font-bold">2.450</p>
                <div className="flex items-center text-xs text-green-600">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span>2.59%</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">ลูกค้าทั้งหมด</p>
                <p className="text-2xl font-bold">3.456</p>
                <div className="flex items-center text-xs text-red-600">
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                  <span>0.95%</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales Overview */}
        <Card>
          <CardHeader>
            <CardTitle>ภาพรวมยอดขาย</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>รายได้และกำไร</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} name="รายได้" />
                <Bar dataKey="profit" fill="#10b981" radius={[8, 8, 0, 0]} name="กำไร" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Visitors Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>ผู้เข้าชมรายสัปดาห์</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>กิจกรรมล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">ใบเสนอราคาใหม่</p>
                  <p className="text-xs text-muted-foreground">5 นาทีที่แล้ว</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Job Order อัพเดท</p>
                  <p className="text-xs text-muted-foreground">15 นาทีที่แล้ว</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">รายงานสร้างเสร็จ</p>
                  <p className="text-xs text-muted-foreground">1 ชั่วโมงที่แล้ว</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
