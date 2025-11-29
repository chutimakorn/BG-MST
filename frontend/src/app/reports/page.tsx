'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, FileText, Package, Filter } from 'lucide-react'

const COLORS = ['#3C50E0', '#80CAEE', '#0FADCF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

export default function ReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(2567) // Buddhist year
  const [startMonth, setStartMonth] = useState<number | null>(null)
  const [endMonth, setEndMonth] = useState<number | null>(null)
  const [saleMemberId, setSaleMemberId] = useState<number | null>(null) // null = all sales
  const [saleMembers, setSaleMembers] = useState<any[]>([])
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadSaleMembers()
    loadDashboardData()
  }, [year, startMonth, endMonth, saleMemberId])

  const loadSaleMembers = async () => {
    try {
      const response = await api.get('/master-data/sale-members')
      setSaleMembers(response.data)
    } catch (error) {
      console.error('Failed to load sale members', error)
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const params: any = { year }
      if (startMonth) params.startMonth = startMonth
      if (endMonth) params.endMonth = endMonth
      if (saleMemberId) params.saleMemberId = saleMemberId
      
      const response = await api.get('/reports/dashboard', { params })
      setDashboardData(response.data)
    } catch (error) {
      console.error('Failed to load dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  // Process monthly quotations data
  const monthlyQuotationsData = MONTHS.map((month, index) => {
    const monthData = dashboardData?.monthlyQuotations?.filter((d: any) => parseInt(d.month) === index + 1) || []
    return {
      month,
      count: monthData.reduce((sum: number, d: any) => sum + parseInt(d.count), 0),
      quantity: monthData.reduce((sum: number, d: any) => sum + parseInt(d.totalQuantity || 0), 0),
      amount: monthData.reduce((sum: number, d: any) => sum + parseFloat(d.totalAmount || 0), 0),
    }
  })

  // Process monthly job orders data
  const monthlyJobOrdersData = MONTHS.map((month, index) => {
    const monthData = dashboardData?.monthlyJobOrders?.find((d: any) => parseInt(d.month) === index + 1)
    return {
      month,
      count: parseInt(monthData?.count || 0),
      quantity: parseInt(monthData?.totalQuantity || 0),
      amount: parseFloat(monthData?.totalAmount || 0),
    }
  })

  // Calculate totals
  const totalQuotations = monthlyQuotationsData.reduce((sum, d) => sum + d.count, 0)
  const totalQuotationAmount = monthlyQuotationsData.reduce((sum, d) => sum + d.amount, 0)
  const totalJobOrders = monthlyJobOrdersData.reduce((sum, d) => sum + d.count, 0)
  const totalJobOrderAmount = monthlyJobOrdersData.reduce((sum, d) => sum + d.amount, 0)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-black dark:text-white">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            รายงานสรุป
          </h2>
        </div>
        
        {/* Filters */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-black dark:text-white">ตัวกรอง</h3>
            </div>
          </div>
          <div className="p-7">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col">
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                  ปี พ.ศ.
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  {[2567, 2568, 2569].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                  จากเดือน
                </label>
                <select
                  value={startMonth || ''}
                  onChange={(e) => setStartMonth(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">ทั้งหมด</option>
                  {MONTHS.map((m, index) => (
                    <option key={index + 1} value={index + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                  ถึงเดือน
                </label>
                <select
                  value={endMonth || ''}
                  onChange={(e) => setEndMonth(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">ทั้งหมด</option>
                  {MONTHS.map((m, index) => (
                    <option key={index + 1} value={index + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                  พนักงานขาย
                </label>
                <select
                  value={saleMemberId || ''}
                  onChange={(e) => setSaleMemberId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">ทั้งหมด</option>
                  {saleMembers.map((sm) => (
                    <option key={sm.id} value={sm.id}>{sm.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {(startMonth || endMonth || saleMemberId) && (
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => {
                    setStartMonth(null)
                    setEndMonth(null)
                    setSaleMemberId(null)
                  }}
                  className="inline-flex items-center justify-center rounded-md bg-meta-1 px-6 py-3 text-center font-medium text-white hover:bg-opacity-90"
                >
                  ล้างฟิลเตอร์
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {totalQuotations}
              </h4>
              <span className="text-sm font-medium">ใบเสนอราคาทั้งหมด</span>
            </div>
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {formatCurrency(totalQuotationAmount)}
              </h4>
              <span className="text-sm font-medium">มูลค่าใบเสนอราคา</span>
            </div>
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {totalJobOrders}
              </h4>
              <span className="text-sm font-medium">Job Orders ทั้งหมด</span>
            </div>
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {formatCurrency(totalJobOrderAmount)}
              </h4>
              <span className="text-sm font-medium">มูลค่า Job Orders</span>
            </div>
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
        {/* Monthly Quotations Chart */}
        <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
            ใบเสนอราคารายเดือน
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyQuotationsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => value.toLocaleString()} />
              <Legend />
              <Bar dataKey="count" fill="#3C50E0" name="จำนวนใบเสนอ" />
              <Bar dataKey="quantity" fill="#80CAEE" name="จำนวนคัน" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Job Orders Chart */}
        <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
            Job Orders รายเดือน
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyJobOrdersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => value.toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3C50E0" name="จำนวน Job" strokeWidth={2} />
              <Line type="monotone" dataKey="quantity" stroke="#10B981" name="จำนวนคัน" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
        {/* Car Sales Chart */}
        <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
            ยอดขายตามรุ่นรถ
          </h3>
          {dashboardData?.carSales && dashboardData.carSales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.carSales.filter((item: any) => parseInt(item.totalQuantity || item.totalquantity) > 0)}
                  dataKey={(entry) => parseInt(entry.totalQuantity || entry.totalquantity)}
                  nameKey={(entry) => entry.carName || entry.carname}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.carName || entry.carname}: ${parseInt(entry.totalQuantity || entry.totalquantity)} คัน`}
                >
                  {dashboardData.carSales.filter((item: any) => parseInt(item.totalQuantity || item.totalquantity) > 0).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any, name: any, props: any) => [
                  `${value} คัน`,
                  props.payload.carName || props.payload.carname
                ]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-body">
              ไม่มีข้อมูล
            </div>
          )}
        </div>

        {/* Province Sales Chart */}
        <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
            ยอดขายตามจังหวัด (Top 10)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(dashboardData?.provinceSales || []).slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="provinceName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: any) => value.toLocaleString()} />
              <Bar dataKey="totalQuantity" fill="#0FADCF" name="จำนวนคัน" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Details Table */}
      <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
        <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
          รายละเอียดรายเดือน
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="px-4 py-4 font-medium text-black dark:text-white">เดือน</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white text-center">ใบเสนอราคา (ใบ)</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white text-center">รถ (คัน)</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white text-right">มูลค่า (บาท)</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white text-center">Job Orders (ใบ)</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white text-center">รถ (คัน)</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white text-right">มูลค่า (บาท)</th>
              </tr>
            </thead>
            <tbody>
              {(dashboardData?.monthlyDetails || []).map((detail: any, index: number) => (
                <tr key={index} className="border-b border-stroke dark:border-strokedark">
                  <td className="px-4 py-4 text-black dark:text-white">{MONTHS[detail.month - 1]}</td>
                  <td className="px-4 py-4 text-center text-black dark:text-white">{detail.quotations.count}</td>
                  <td className="px-4 py-4 text-center text-black dark:text-white">{detail.quotations.quantity}</td>
                  <td className="px-4 py-4 text-right text-black dark:text-white">{formatCurrency(detail.quotations.amount)}</td>
                  <td className="px-4 py-4 text-center text-black dark:text-white">{detail.jobOrders.count}</td>
                  <td className="px-4 py-4 text-center text-black dark:text-white">{detail.jobOrders.quantity}</td>
                  <td className="px-4 py-4 text-right text-black dark:text-white">{formatCurrency(detail.jobOrders.amount)}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-gray-2 dark:bg-meta-4 font-bold">
                <td className="px-4 py-4 text-black dark:text-white">รวม</td>
                <td className="px-4 py-4 text-center text-black dark:text-white">
                  {(dashboardData?.monthlyDetails || []).reduce((sum: number, d: any) => sum + d.quotations.count, 0)}
                </td>
                <td className="px-4 py-4 text-center text-black dark:text-white">
                  {(dashboardData?.monthlyDetails || []).reduce((sum: number, d: any) => sum + d.quotations.quantity, 0)}
                </td>
                <td className="px-4 py-4 text-right text-black dark:text-white">
                  {formatCurrency((dashboardData?.monthlyDetails || []).reduce((sum: number, d: any) => sum + d.quotations.amount, 0))}
                </td>
                <td className="px-4 py-4 text-center text-black dark:text-white">
                  {(dashboardData?.monthlyDetails || []).reduce((sum: number, d: any) => sum + d.jobOrders.count, 0)}
                </td>
                <td className="px-4 py-4 text-center text-black dark:text-white">
                  {(dashboardData?.monthlyDetails || []).reduce((sum: number, d: any) => sum + d.jobOrders.quantity, 0)}
                </td>
                <td className="px-4 py-4 text-right text-black dark:text-white">
                  {formatCurrency((dashboardData?.monthlyDetails || []).reduce((sum: number, d: any) => sum + d.jobOrders.amount, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Performance Table */}
      <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
          ผลงานพนักงานขาย
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="px-4 py-4 font-medium text-black dark:text-white">พนักงานขาย</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white text-center">เดือน</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white text-center">ใบเสนอราคา (ใบ)</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white text-center">รถ (คัน)</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white text-right">มูลค่า (บาท)</th>
              </tr>
            </thead>
            <tbody>
              {(dashboardData?.salesPerformance?.quotations || []).map((perf: any, index: number) => (
                <tr key={index} className="border-b border-stroke dark:border-strokedark">
                  <td className="px-4 py-4 text-black dark:text-white">{perf.saleMemberName || 'ไม่ระบุ'}</td>
                  <td className="px-4 py-4 text-center text-black dark:text-white">{MONTHS[parseInt(perf.month) - 1]}</td>
                  <td className="px-4 py-4 text-center text-black dark:text-white">{perf.quotationCount}</td>
                  <td className="px-4 py-4 text-center text-black dark:text-white">{perf.quotationQuantity}</td>
                  <td className="px-4 py-4 text-right text-black dark:text-white">{formatCurrency(perf.quotationAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
