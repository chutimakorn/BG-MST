'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Eye, Edit2, Search, ChevronUp, ChevronDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'

export default function JobOrdersPage() {
  const router = useRouter()
  const [jobOrders, setJobOrders] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(50)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadJobOrders()
  }, [router, page, sortBy, sortOrder])

  const loadJobOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      })
      if (search) {
        // ส่งแค่ search term เดียว backend จะค้นหาทั้งเลขที่และชื่อลูกค้า
        params.append('quotationNumber', search)
      }
      if (filterStartDate) {
        params.append('startDate', filterStartDate)
      }
      if (filterEndDate) {
        params.append('endDate', filterEndDate)
      }
      const response = await api.get(`/job-orders?${params}`)
      setJobOrders(response.data.data || [])
      setTotal(response.data.pagination?.total || 0)
      setTotalPages(response.data.pagination?.totalPages || 0)
    } catch (error) {
      console.error('Failed to load job orders', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(field)
      setSortOrder('DESC')
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadJobOrders()
  }

  const handleClearFilters = () => {
    setSearch('')
    setFilterStartDate('')
    setFilterEndDate('')
    setPage(1)
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy === field) {
      return sortOrder === 'ASC' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
    }
    return <div className="flex flex-col opacity-30"><ChevronUp className="h-3 w-3 -mb-1" /><ChevronDown className="h-3 w-3" /></div>
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          จัดการ Job Order
        </h2>
      </div>

      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="px-4 py-6 md:px-6 xl:px-7.5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="ค้นหาเลขที่ Job Order หรือชื่อลูกค้า..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-12 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-primary p-2.5 text-white hover:bg-opacity-90"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  วันที่เริ่มต้น
                </label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  วันที่สิ้นสุด
                </label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleSearch}
                className="rounded-md bg-primary px-6 py-2 font-medium text-white hover:bg-opacity-90"
              >
                ค้นหา
              </button>
              <button
                onClick={handleClearFilters}
                className="rounded-md border border-stroke px-6 py-2 font-medium text-black hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>

          {loading ? (
            <div className="border-t border-stroke px-4 py-12 text-center dark:border-strokedark">
              กำลังโหลดข้อมูล...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      <th 
                        className="cursor-pointer px-4 py-4 font-medium text-black dark:text-white xl:pl-11"
                        onClick={() => handleSort('quotationNumber')}
                      >
                        <div className="flex items-center gap-2">
                          เลขที่ Job Order
                          <SortIcon field="quotationNumber" />
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer px-4 py-4 font-medium text-black dark:text-white"
                        onClick={() => handleSort('customerName')}
                      >
                        <div className="flex items-center gap-2">
                          ลูกค้า
                          <SortIcon field="customerName" />
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer px-4 py-4 font-medium text-black dark:text-white"
                        onClick={() => handleSort('car')}
                      >
                        <div className="flex items-center gap-2">
                          รถ
                          <SortIcon field="car" />
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer px-4 py-4 font-medium text-black dark:text-white"
                        onClick={() => handleSort('submissionDate')}
                      >
                        <div className="flex items-center gap-2">
                          วันที่ส่งใบเสนอ
                          <SortIcon field="submissionDate" />
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer px-4 py-4 font-medium text-black dark:text-white"
                        onClick={() => handleSort('deliveryDate')}
                      >
                        <div className="flex items-center gap-2">
                          วันส่งรถ
                          <SortIcon field="deliveryDate" />
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer px-4 py-4 font-medium text-black dark:text-white"
                        onClick={() => handleSort('statusJob')}
                      >
                        <div className="flex items-center gap-2">
                          สถานะงาน
                          <SortIcon field="statusJob" />
                        </div>
                      </th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-body">
                          ไม่พบข้อมูล Job Order
                        </td>
                      </tr>
                    ) : (
                      jobOrders.map((jobOrder) => (
                        <tr key={jobOrder.id} className="border-b border-stroke dark:border-strokedark">
                          <td className="px-4 py-5 pl-9 xl:pl-11">
                            <p className="font-medium text-black dark:text-white">
                              {jobOrder.quotationNumber}
                            </p>
                          </td>
                          <td className="px-4 py-5">
                            <p className="text-black dark:text-white">{jobOrder.customerName}</p>
                          </td>
                          <td className="px-4 py-5">
                            <p className="text-sm text-black dark:text-white">
                              {jobOrder.car?.name || '-'}
                            </p>
                          </td>
                          <td className="px-4 py-5">
                            <p className="text-sm text-black dark:text-white">
                              {jobOrder.submissionDate ? formatDate(jobOrder.submissionDate) : '-'}
                            </p>
                          </td>
                          <td className="px-4 py-5">
                            <p className="text-sm text-black dark:text-white">
                              {jobOrder.deliveryDate ? formatDate(jobOrder.deliveryDate) : '-'}
                            </p>
                          </td>
                          <td className="px-4 py-5">
                            <span className="inline-flex rounded-full bg-opacity-10 bg-success px-3 py-1 text-sm font-medium text-success">
                              {jobOrder.statusJob?.name || 'ไม่ระบุ'}
                            </span>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/job-orders/${jobOrder.id}/edit`}
                                className="hover:text-primary"
                                title="แก้ไข"
                              >
                                <Edit2 className="h-5 w-5" />
                              </Link>
                              <Link
                                href={`/job-orders/${jobOrder.id}`}
                                className="hover:text-meta-3"
                                title="ดูรายละเอียด"
                              >
                                <Eye className="h-5 w-5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-stroke px-4 py-4 dark:border-strokedark">
                <div className="text-sm text-body">
                  แสดง {jobOrders.length > 0 ? ((page - 1) * limit + 1) : 0} - {Math.min(page * limit, total)} จากทั้งหมด {total} รายการ
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="rounded border border-stroke p-2 hover:bg-gray-2 disabled:opacity-50 dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="rounded border border-stroke p-2 hover:bg-gray-2 disabled:opacity-50 dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-4 text-sm text-black dark:text-white">
                    หน้า {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="rounded border border-stroke p-2 hover:bg-gray-2 disabled:opacity-50 dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="rounded border border-stroke p-2 hover:bg-gray-2 disabled:opacity-50 dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
