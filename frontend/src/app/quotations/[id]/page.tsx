'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function QuotationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const quotationId = params.id
  
  const [loading, setLoading] = useState(true)
  const [quotation, setQuotation] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadQuotation()
  }, [quotationId])

  const loadQuotation = async () => {
    try {
      const response = await api.get(`/quotations/${quotationId}`)
      console.log('Quotation data:', response.data)
      console.log('Job Order:', response.data.jobOrder)
      setQuotation(response.data)
    } catch (error) {
      console.error('Failed to load quotation', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">กำลังโหลดข้อมูล...</div>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">ไม่พบข้อมูลใบเสนอราคา</div>
      </div>
    )
  }

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="border-b border-stroke py-3 dark:border-strokedark">
      <div className="grid grid-cols-3 gap-4">
        <div className="font-medium text-black dark:text-white">{label}</div>
        <div className="col-span-2 text-body">{value || '-'}</div>
      </div>
    </div>
  )

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          รายละเอียดใบเสนอราคา
        </h2>
        <Link
          href="/quotations"
          className="inline-flex items-center justify-center gap-2.5 rounded-md border border-stroke px-6 py-3 text-center font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          ย้อนกลับ
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* ข้อมูลพื้นฐาน */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              ข้อมูลพื้นฐาน
            </h3>
          </div>
          <div className="px-6.5 py-4">
            <InfoRow label="เลขที่ใบเสนอราคา" value={quotation.quotationNumber} />
            <InfoRow label="วันที่ได้รับต้องการ" value={quotation.requestDate ? formatDate(quotation.requestDate) : '-'} />
            <InfoRow label="วันที่ส่งใบเสนอ" value={formatDate(quotation.submissionDate)} />
            <InfoRow label="กลุ่มลูกค้า (G/NG)" value={quotation.customerGroup} />
            {quotation.customerGroupName && (
              <InfoRow label="ชื่อกลุ่มลูกค้า" value={quotation.customerGroupName} />
            )}
            <InfoRow label="ผู้ขาย/SALE" value={quotation.saleMember?.name} />
            <InfoRow label="ชื่อลูกค้า" value={quotation.customerName} />
            <InfoRow label="รหัสลูกค้า" value={quotation.customerCode} />
            <InfoRow 
              label="สถานะ" 
              value={
                <span className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                  quotation.status === 'close' ? 'bg-success text-success' :
                  quotation.status === 'cancel' ? 'bg-danger text-danger' :
                  'bg-warning text-warning'
                }`}>
                  {quotation.status === 'close' ? 'ปิดการขาย' :
                   quotation.status === 'cancel' ? 'ยกเลิก' :
                   'กำลังดำเนินการ'}
                </span>
              } 
            />
            <InfoRow 
              label="Job Order" 
              value={
                quotation.jobOrder ? (
                  <Link 
                    href={`/job-orders/${quotation.jobOrder.id}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    {quotation.jobOrder.quotationNumber}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="text-body">ยังไม่ได้ผูกกับ Job Order</span>
                )
              } 
            />
          </div>
        </div>

        {/* ข้อมูลรถและราคา */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              ข้อมูลรถและราคา
            </h3>
          </div>
          <div className="px-6.5 py-4">
            <InfoRow label="รุ่นรถ" value={quotation.car?.name} />
            <InfoRow label="Option (เสนอเพิ่มเติม)" value={quotation.additionalOptions} />
            <InfoRow label="จำนวน/คัน" value={quotation.quantity} />
            <InfoRow label="ราคาขาย รวม Vat" value={formatCurrency(quotation.pricePerUnitWithVat)} />
            <InfoRow label="รวมราคาขาย" value={formatCurrency(quotation.totalSalesPrice)} />
            <InfoRow label="รวมราคาขาย + Option" value={formatCurrency(quotation.totalSalesPriceWithOptions)} />
          </div>
        </div>

        {/* ข้อมูลการขนส่ง */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              ข้อมูลการขนส่ง
            </h3>
          </div>
          <div className="px-6.5 py-4">
            <InfoRow label="จังหวัดขนส่ง" value={quotation.province?.name} />
            <InfoRow label="เที่ยวขนส่ง" value={quotation.transportTrips} />
            <InfoRow label="ราคา/เที่ยว" value={formatCurrency(quotation.pricePerTrip)} />
            <InfoRow label="รวมค่าขนส่ง" value={formatCurrency(quotation.totalTransportCost)} />
            <InfoRow label="ราคาขายรวมค่าขนส่ง" value={formatCurrency(quotation.grandTotal)} />
          </div>
        </div>

        {/* ข้อมูลติดต่อ */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              ข้อมูลติดต่อ
            </h3>
          </div>
          <div className="px-6.5 py-4">
            <InfoRow label="เงื่อนไขการชำระ" value={quotation.paymentTerms} />
            <InfoRow label="ชื่อผู้ติดต่อ" value={quotation.contactName} />
            <InfoRow label="เบอร์ติดต่อ" value={quotation.contactPhone} />
            <InfoRow label="E-Mail" value={quotation.contactEmail} />
          </div>
        </div>

        {/* ข้อมูลสถานะและหมายเหตุ */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              ข้อมูลสถานะและหมายเหตุ
            </h3>
          </div>
          <div className="px-6.5 py-4">
            <InfoRow label="สถานะเช็ครถในสต็อก" value={quotation.stockStatus} />
            <InfoRow label="แจ้ง/นัดหมายลูกค้า" value={quotation.customerNotification} />
            <InfoRow label="ผลตรวจเช็คก่อนส่งมอบ" value={quotation.preDeliveryInspection} />
            <InfoRow label="Serial / Code" value={quotation.serialCode} />
            <InfoRow label="หมายเหตุ / เหตุผล" value={quotation.remarkReason} />
            <InfoRow 
              label="สถานะ" 
              value={
                <span className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                  quotation.status === 'close' ? 'bg-success text-success' :
                  quotation.status === 'cancel' ? 'bg-danger text-danger' :
                  'bg-warning text-warning'
                }`}>
                  {quotation.status === 'close' ? 'ปิดการขาย' :
                   quotation.status === 'cancel' ? 'ยกเลิก' :
                   'กำลังดำเนินการ'}
                </span>
              } 
            />
            <InfoRow label="หมายเหตุ/สถานะหลังส่งมอบ" value={quotation.postDeliveryNote} />
          </div>
        </div>
      </div>
    </>
  )
}
