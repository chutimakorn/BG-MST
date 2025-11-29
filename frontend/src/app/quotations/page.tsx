'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Eye, Edit2, Plus, Search, ChevronUp, ChevronDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'

export default function QuotationsPage() {
  const router = useRouter()
  const [quotations, setQuotations] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(50)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [sortBy, setSortBy] = useState('submissionDate')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [saleMembers, setSaleMembers] = useState<any[]>([])
  const [filterSaleMember, setFilterSaleMember] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadSaleMembers()
    loadQuotations()
  }, [router, page, sortBy, sortOrder])

  const loadSaleMembers = async () => {
    try {
      const response = await api.get('/master-data/sale-members')
      setSaleMembers(response.data)
    } catch (error) {
      console.error('Failed to load sale members', error)
    }
  }

  const loadQuotations = async () => {
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
      if (filterSaleMember) {
        params.append('saleMemberId', filterSaleMember)
      }
      if (filterStatus) {
        params.append('status', filterStatus)
      }
      if (filterStartDate) {
        params.append('startDate', filterStartDate)
      }
      if (filterEndDate) {
        params.append('endDate', filterEndDate)
      }
      const response = await api.get(`/quotations?${params}`)
      setQuotations(response.data.data || [])
      setTotal(response.data.pagination?.total || 0)
      setTotalPages(response.data.pagination?.totalPages || 0)
    } catch (error) {
      console.error('Failed to load quotations', error)
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
    loadQuotations()
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy === field) {
      return sortOrder === 'ASC' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
    }
    return <div className="flex flex-col opacity-30"><ChevronUp className="h-3 w-3 -mb-1" /><ChevronDown className="h-3 w-3" /></div>
  }

  const handleClearFilters = () => {
    setSearch('')
    setFilterSaleMember('')
    setFilterStatus('')
    setFilterStartDate('')
    setFilterEndDate('')
    setPage(1)
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          จัดการใบเสนอราคา
        </h2>
      </div>

      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="px-4 py-6 md:px-6 xl:px-7.5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="ค้นหาเลขที่ใบเสนอราคา หรือชื่อลูกค้า..."
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
              <Link
                href="/quotations/new"
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90"
              >
                <Plus className="h-5 w-5" />
                เพิ่มใบเสนอราคาใหม่
              </Link>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  ผู้ขาย
                </label>
                <select
                  value={filterSaleMember}
                  onChange={(e) => setFilterSaleMember(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">ทั้งหมด</option>
                  {saleMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  สถานะ
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="processing">กำลังดำเนินการ</option>
                  <option value="close">ปิดการขาย</option>
                  <option value="cancel">ยกเลิก</option>
                </select>
              </div>

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
                          เลขที่ใบเสนอราคา
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
                        onClick={() => handleSort('customerGroup')}
                      >
                        <div className="flex items-center gap-2">
                          กลุ่มลูกค้า
                          <SortIcon field="customerGroup" />
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer px-4 py-4 font-medium text-black dark:text-white"
                        onClick={() => handleSort('saleMember')}
                      >
                        <div className="flex items-center gap-2">
                          ผู้ขาย
                          <SortIcon field="saleMember" />
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
                        onClick={() => handleSort('grandTotal')}
                      >
                        <div className="flex items-center gap-2">
                          ยอดรวม
                          <SortIcon field="grandTotal" />
                        </div>
                      </th>
                      <th 
                        className="cursor-pointer px-4 py-4 font-medium text-black dark:text-white"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          สถานะ
                          <SortIcon field="status" />
                        </div>
                      </th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-body">
                          ไม่พบข้อมูลใบเสนอราคา
                        </td>
                      </tr>
                    ) : (
                      quotations.map((quotation) => (
                        <tr key={quotation.id} className="border-b border-stroke dark:border-strokedark">
                          <td className="px-4 py-5 pl-9 xl:pl-11">
                            <p className="font-medium text-black dark:text-white">
                              {quotation.quotationNumber}
                            </p>
                          </td>
                          <td className="px-4 py-5">
                            <p className="text-black dark:text-white">{quotation.customerName}</p>
                          </td>
                          <td className="px-4 py-5">
                            <p className="text-sm text-black dark:text-white">
                              {quotation.customerGroup}
                              {quotation.customerGroupName && (
                                <span className="block text-xs text-body">{quotation.customerGroupName}</span>
                              )}
                            </p>
                          </td>
                          <td className="px-4 py-5">
                            <p className="text-sm text-black dark:text-white">
                              {quotation.saleMember?.name || '-'}
                            </p>
                          </td>
                          <td className="px-4 py-5">
                            <p className="text-sm text-black dark:text-white">
                              {quotation.car?.name || '-'}
                            </p>
                          </td>
                          <td className="px-4 py-5">
                            <p className="text-sm text-black dark:text-white">
                              {formatDate(quotation.submissionDate)}
                            </p>
                          </td>
                          <td className="px-4 py-5">
                            <p className="font-medium text-black dark:text-white">
                              {formatCurrency(quotation.grandTotal)}
                            </p>
                          </td>
                          <td className="px-4 py-5">
                            <span className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                              quotation.status === 'close' ? 'bg-success text-success' :
                              quotation.status === 'cancel' ? 'bg-danger text-danger' :
                              'bg-warning text-warning'
                            }`}>
                              {quotation.status === 'close' ? 'ปิดการขาย' :
                               quotation.status === 'cancel' ? 'ยกเลิก' :
                               'กำลังดำเนินการ'}
                            </span>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/quotations/${quotation.id}/edit`}
                                className="hover:text-primary"
                                title="แก้ไข"
                              >
                                <Edit2 className="h-5 w-5" />
                              </Link>
                              <Link
                                href={`/quotations/${quotation.id}`}
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
                  แสดง {quotations.length > 0 ? ((page - 1) * limit + 1) : 0} - {Math.min(page * limit, total)} จากทั้งหมด {total} รายการ
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
