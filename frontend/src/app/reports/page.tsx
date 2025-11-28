'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Search, FileText } from 'lucide-react'

const COLORS = ['#3C50E0', '#10B981', '#FFA70B', '#D34053', '#259AE6', '#FFBA00']

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

  const fillMissingMonths = (data: any[]) => {
    if (data.length === 0) return []

    const months = data.map(d => d.month).filter(m => m && m !== '[object').sort()
    if (months.length === 0) return data

    const startMonth = months[0]
    const endMonth = months[months.length - 1]

    const allMonths: string[] = []
    let current = new Date(startMonth + '-01')
    const end = new Date(endMonth + '-01')

    while (current <= end) {
      allMonths.push(current.toISOString().slice(0, 7))
      current.setMonth(current.getMonth() + 1)
    }

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
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          รายงานและสถิติ
        </h2>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            ตัวกรองข้อมูล
          </h3>
        </div>
        <div className="p-6.5">
          <div className="mb-4.5 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                ผู้ขาย
              </label>
              <select
                value={filters.saleMemberId}
                onChange={(e) => handleFilterChange('saleMemberId', e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="">ทั้งหมด</option>
                {masterData.saleMembers?.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleApplyFilters}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-3 font-medium text-white hover:bg-opacity-90"
              >
                <Search className="h-5 w-5" />
                ค้นหา
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-sm border border-stroke bg-white p-12 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="text-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-black dark:text-white">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      ) : reportData.length === 0 ? (
        <div className="rounded-sm border border-stroke bg-white p-12 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col items-center justify-center space-y-4">
            <FileText className="h-16 w-16 text-body" />
            <div className="text-center">
              <p className="text-lg font-medium text-black dark:text-white">ไม่พบข้อมูล</p>
              <p className="mt-1 text-sm text-body">ลองปรับเปลี่ยนตัวกรองหรือ import ข้อมูลใหม่</p>
            </div>
            <Link
              href="/import"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90"
            >
              Import ข้อมูล
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-black dark:text-white">
                  ยอดขายรายเดือน
                </h4>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="totalSales" fill="#3C50E0" name="ยอดขาย" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-black dark:text-white">
                  ยอดขายตามผู้ขาย
                </h4>
              </div>
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
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-semibold text-black dark:text-white">
                สรุปรายเดือน
              </h3>
            </div>
            <div className="p-6.5">
              <div className="space-y-6">
                {reportData.map((month, idx) => (
                  <div key={idx} className="border-b border-stroke pb-6 last:border-0 dark:border-strokedark">
                    <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">{month.month}</h3>
                    
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-3 font-medium text-black dark:text-white">ยอดขายตามผู้ขาย</h4>
                        <div className="space-y-2">
                          {Object.entries(month.salesByMember).map(([name, data]: [string, any]) => (
                            <div key={name} className="flex justify-between text-sm">
                              <span className="text-body">{name}</span>
                              <span className="font-medium text-black dark:text-white">
                                {formatCurrency(data.totalAmount)} ({data.totalCars} คัน)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-3 font-medium text-black dark:text-white">สถานะงาน (Status Job)</h4>
                        <div className="space-y-2">
                          {Object.entries(month.carsByStatusJob).map(([status, count]: [string, any]) => (
                            <div key={status} className="flex justify-between text-sm">
                              <span className="text-body">{status}</span>
                              <span className="font-medium text-black dark:text-white">{count} คัน</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-3 font-medium text-black dark:text-white">สถานะการขาย (Status Sale)</h4>
                        <div className="space-y-2">
                          {Object.entries(month.carsByStatusSale).map(([status, count]: [string, any]) => (
                            <div key={status} className="flex justify-between text-sm">
                              <span className="text-body">{status}</span>
                              <span className="font-medium text-black dark:text-white">{count} คัน</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-3 font-medium text-black dark:text-white">สถานะเอกสาร (Status Job Document)</h4>
                        <div className="space-y-2">
                          {Object.entries(month.carsByStatusJobDocument).map(([status, count]: [string, any]) => (
                            <div key={status} className="flex justify-between text-sm">
                              <span className="text-body">{status}</span>
                              <span className="font-medium text-black dark:text-white">{count} คัน</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-stroke pt-4 dark:border-strokedark">
                      <div className="flex justify-between">
                        <span className="font-semibold text-black dark:text-white">ยอดขายรวมเดือนนี้</span>
                        <span className="font-semibold text-meta-3">{formatCurrency(month.totalSales)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
