'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function ReportsPage() {
  const router = useRouter()
  const [reportData, setReportData] = useState<any[]>([])
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    saleMemberId: '',
  })
  const [masterData, setMasterData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadMasterData()
    loadReport()
  }, [router])

  const loadMasterData = async () => {
    try {
      const response = await api.get('/master-data/sale-members')
      setMasterData({ saleMembers: response.data })
    } catch (error) {
      console.error('Failed to load master data', error)
    }
  }

  const loadReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.saleMemberId) params.append('saleMemberId', filters.saleMemberId)

      const response = await api.get(`/reports/sales-summary?${params}`)
      setReportData(response.data)
    } catch (error) {
      console.error('Failed to load report', error)
    } finally {
      setLoading(false)
    }
  }

  // สร้างข้อมูลทุกเดือนระหว่างเดือนแรกและเดือนสุดท้ายที่มีข้อมูล
  const fillMissingMonths = (data: any[]) => {
    if (data.length === 0) return []

    // หาเดือนเริ่มต้นและสิ้นสุดจากข้อมูลที่มี (ไม่ใช่จาก filter)
    const months = data.map(d => d.month).filter(m => m && m !== '[object').sort()
    if (months.length === 0) return data

    const startMonth = months[0] // เดือนแรกที่มีข้อมูล
    const endMonth = months[months.length - 1] // เดือนสุดท้ายที่มีข้อมูล

    // สร้าง array ของทุกเดือนระหว่างเดือนแรกถึงเดือนสุดท้าย
    const allMonths: string[] = []
    let current = new Date(startMonth + '-01')
    const end = new Date(endMonth + '-01')

    while (current <= end) {
      allMonths.push(current.toISOString().slice(0, 7))
      current.setMonth(current.getMonth() + 1)
    }

    // เติมข้อมูลเดือนที่ขาด
    return allMonths.map(month => {
      const existing = data.find(d => d.month === month)
      return existing || {
        month,
        salesByMember: {},
        carsByStatusJob: {},
        carsByStatusSale: {},
        carsByStatusJobDocument: {},
        totalSales: 0,
      }
    })
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleApplyFilters = () => {
    loadReport()
  }

  // Prepare chart data with all months
  const filledData = fillMissingMonths(reportData)
  const monthlySalesData = filledData.map(month => ({
    month: month.month,
    totalSales: month.totalSales,
  }))

  const salesByMemberData = reportData.flatMap(month =>
    Object.entries(month.salesByMember).map(([name, data]: [string, any]) => ({
      name,
      amount: data.totalAmount,
      cars: data.totalCars,
    }))
  ).reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.name)
    if (existing) {
      existing.amount += curr.amount
      existing.cars += curr.cars
    } else {
      acc.push(curr)
    }
    return acc
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">รายงานและสถิติ</h1>
        <p className="text-muted-foreground mt-1">ดูรายงานและวิเคราะห์ข้อมูลการขาย</p>
      </div>

      <Card className="mb-6">
          <CardHeader>
            <CardTitle>ตัวกรองข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">วันที่เริ่มต้น</label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">วันที่สิ้นสุด</label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ผู้ขาย</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={filters.saleMemberId}
                  onChange={(e) => handleFilterChange('saleMemberId', e.target.value)}
                >
                  <option value="">ทั้งหมด</option>
                  {masterData.saleMembers?.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleApplyFilters} className="w-full">
                  ค้นหา
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
              </div>
            </CardContent>
          </Card>
        ) : reportData.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900">ไม่พบข้อมูล</p>
                  <p className="text-sm text-gray-500 mt-1">ลองปรับเปลี่ยนตัวกรองหรือ import ข้อมูลใหม่</p>
                </div>
                <Link href="/import">
                  <Button>Import ข้อมูล</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>ยอดขายรายเดือน</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlySalesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="totalSales" fill="#3b82f6" name="ยอดขาย" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ยอดขายตามผู้ขาย</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={salesByMemberData}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.name}: ${formatCurrency(entry.amount)}`}
                      >
                        {salesByMemberData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>สรุปรายเดือน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reportData.map((month, idx) => (
                    <div key={idx} className="border-b pb-4">
                      <h3 className="text-lg font-semibold mb-3">{month.month}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">ยอดขายตามผู้ขาย</h4>
                          <div className="space-y-1">
                            {Object.entries(month.salesByMember).map(([name, data]: [string, any]) => (
                              <div key={name} className="flex justify-between text-sm">
                                <span>{name}</span>
                                <span className="font-medium">
                                  {formatCurrency(data.totalAmount)} ({data.totalCars} คัน)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">สถานะงาน (Status Job)</h4>
                          <div className="space-y-1">
                            {Object.entries(month.carsByStatusJob).map(([status, count]: [string, any]) => (
                              <div key={status} className="flex justify-between text-sm">
                                <span>{status}</span>
                                <span className="font-medium">{count} คัน</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">สถานะการขาย (Status Sale)</h4>
                          <div className="space-y-1">
                            {Object.entries(month.carsByStatusSale).map(([status, count]: [string, any]) => (
                              <div key={status} className="flex justify-between text-sm">
                                <span>{status}</span>
                                <span className="font-medium">{count} คัน</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">สถานะเอกสาร (Status Job Document)</h4>
                          <div className="space-y-1">
                            {Object.entries(month.carsByStatusJobDocument).map(([status, count]: [string, any]) => (
                              <div key={status} className="flex justify-between text-sm">
                                <span>{status}</span>
                                <span className="font-medium">{count} คัน</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>ยอดขายรวมเดือนนี้</span>
                          <span className="text-green-600">{formatCurrency(month.totalSales)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              </CardContent>
            </Card>
          </>
        )}
    </div>
  )
}
