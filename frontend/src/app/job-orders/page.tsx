'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Plus, FileUp } from 'lucide-react'

export default function JobOrdersPage() {
  const router = useRouter()
  const [jobOrders, setJobOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobOrders()
  }, [])

  const fetchJobOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setJobOrders(data)
      }
    } catch (error) {
      console.error('Error fetching job orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          <p className="mt-4 text-black dark:text-white">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Job Orders
        </h2>
      </div>

      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="px-4 py-6 md:px-6 xl:px-7.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-semibold text-black dark:text-white">
                รายการ Job Orders ทั้งหมด
              </h4>
              <button
                onClick={() => router.push('/import-pdf')}
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90"
              >
                <FileUp className="h-5 w-5" />
                Import PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                    เลขที่
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    ลูกค้า
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    รุ่นรถ
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    จำนวน
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    ราคา/คัน
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    วันส่งรถ
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    สถานะ
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-body">
                      ไม่มีข้อมูล Job Order
                    </td>
                  </tr>
                ) : (
                  jobOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-stroke dark:border-strokedark">
                      <td className="px-4 py-5 pl-9 xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {order.quotationNumber}
                        </h5>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-black dark:text-white">
                          {order.customerName}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-black dark:text-white">
                          {order.car?.name || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-black dark:text-white">
                          {order.quantity}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-black dark:text-white">
                          {formatCurrency(order.pricePerUnit)}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-black dark:text-white">
                          {formatDate(order.deliveryDate)}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                          order.statusJob?.name === 'เสร็จสิ้น' 
                            ? 'bg-success bg-opacity-10 text-success'
                            : 'bg-warning bg-opacity-10 text-warning'
                        }`}>
                          {order.statusJob?.name || 'รอดำเนินการ'}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <button
                          onClick={() => router.push(`/job-orders/${order.id}`)}
                          className="hover:text-primary"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
