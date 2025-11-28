'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Eye, Edit, Plus, Search } from 'lucide-react'

export default function QuotationsPage() {
  const router = useRouter()
  const [quotations, setQuotations] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadQuotations()
  }, [router])

  const loadQuotations = async () => {
    try {
      const response = await api.get('/quotations')
      setQuotations(response.data)
    } catch (error) {
      console.error('Failed to load quotations', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuotations = quotations.filter(q =>
    q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
    q.customerName.toLowerCase().includes(search.toLowerCase())
  )

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
            <div className="flex items-center justify-between">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-body" />
                <input
                  type="text"
                  placeholder="ค้นหาเลขที่ใบเสนอราคา หรือชื่อลูกค้า..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-12 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <Link
                href="/quotations/new"
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90"
              >
                <Plus className="h-5 w-5" />
                เพิ่มใบเสนอราคาใหม่
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="border-t border-stroke px-4 py-12 text-center dark:border-strokedark">
              กำลังโหลดข้อมูล...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                      เลขที่ใบเสนอราคา
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      ลูกค้า
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      กลุ่มลูกค้า
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      ผู้ขาย
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      รถ
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      วันที่ส่งใบเสนอ
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      ยอดรวม
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotations.map((quotation, key) => (
                    <tr key={quotation.id} className="border-b border-stroke dark:border-strokedark">
                      <td className="px-4 py-5 pl-9 xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {quotation.quotationNumber}
                        </h5>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-black dark:text-white">
                          {quotation.customerName}
                        </p>
                        <p className="text-sm text-body">
                          {quotation.customerCode}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <span className="inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">
                          {quotation.customerGroup}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-black dark:text-white">
                          {quotation.saleMember?.name || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-black dark:text-white">
                          {quotation.car?.name || '-'}
                        </p>
                        <p className="text-sm text-body">
                          {quotation.quantity} คัน
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-black dark:text-white">
                          {formatDate(quotation.submissionDate)}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="font-medium text-meta-3">
                          {formatCurrency(quotation.grandTotal)}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center space-x-3.5">
                          <Link
                            href={`/quotations/${quotation.id}`}
                            className="hover:text-primary"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/quotations/${quotation.id}/edit`}
                            className="hover:text-primary"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredQuotations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-body">
                        ไม่พบข้อมูลใบเสนอราคา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
