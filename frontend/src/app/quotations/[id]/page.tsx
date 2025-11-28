'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function QuotationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [quotation, setQuotation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadQuotation()
  }, [params.id])

  const loadQuotation = async () => {
    try {
      const response = await api.get(`/quotations/${params.id}`)
      setQuotation(response.data)
    } catch (error) {
      console.error('Failed to load quotation', error)
      alert('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('คุณต้องการลบใบเสนอราคานี้หรือไม่?')) return

    try {
      await api.delete(`/quotations/${params.id}`)
      alert('ลบสำเร็จ')
      router.push('/quotations')
    } catch (error) {
      alert('ไม่สามารถลบได้')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!quotation) {
    return <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">ไม่พบข้อมูล</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">รายละเอียดใบเสนอราคา</h1>
          <p className="text-muted-foreground mt-1">{quotation.quotationNumber}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/quotations">
            <Button variant="outline">← กลับ</Button>
          </Link>
          <Link href={`/quotations/${params.id}/edit`}>
            <Button>แก้ไข</Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>ลบ</Button>
        </div>
      </div>

      <div className="space-y-6">
          {/* Header Info */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{quotation.quotationNumber}</CardTitle>
                  <p className="text-blue-100 mt-1">{quotation.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{formatCurrency(quotation.grandTotal)}</p>
                  <p className="text-blue-100 text-sm">ยอดรวมทั้งหมด</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลลูกค้า</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ชื่อลูกค้า</p>
                  <p className="font-medium">{quotation.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">รหัสลูกค้า</p>
                  <p className="font-medium">{quotation.customerCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">กลุ่มลูกค้า (G/NG)</p>
                  <p className="font-medium">{quotation.customerGroup}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ผู้ขาย/SALE</p>
                  <p className="font-medium">{quotation.saleMember?.name || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลสินค้า</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">รุ่นรถ</p>
                  <p className="font-medium">{quotation.car?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">จำนวน/คัน</p>
                  <p className="font-medium">{quotation.quantity} คัน</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Option (เสนอเพิ่มเติม)</p>
                  <p className="font-medium whitespace-pre-wrap">{quotation.additionalOptions || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>ราคาและจำนวน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">จำนวนคัน</span>
                  <span className="font-medium">{quotation.quantity} คัน</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ราคาต่อคัน (รวม VAT)</span>
                  <span className="font-medium">{formatCurrency(quotation.pricePerUnitWithVat)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ยอดรวมราคาขาย</span>
                  <span className="font-medium">{formatCurrency(quotation.totalSalesPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">จำนวนเที่ยวขนส่ง</span>
                  <span className="font-medium">{quotation.transportTrips} เที่ยว</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ราคาต่อเที่ยว</span>
                  <span className="font-medium">{formatCurrency(quotation.pricePerTrip)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">รวมค่าขนส่ง</span>
                  <span className="font-medium">{formatCurrency(quotation.totalTransportCost)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t-2 border-gray-300">
                  <span className="text-lg font-semibold">ยอดรวมทั้งหมด</span>
                  <span className="text-lg font-bold text-green-600">{formatCurrency(quotation.grandTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Order */}
          {quotation.jobOrder && (
            <Card>
              <CardHeader>
                <CardTitle>Job Order ที่เกี่ยวข้อง</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <p className="text-sm text-gray-600">เลขที่ Job Order</p>
                    <Link href={`/job-orders/${quotation.jobOrder.id}`}>
                      <p className="text-lg font-bold text-purple-600 hover:text-purple-800 cursor-pointer hover:underline">
                        {quotation.jobOrder.quotationNumber}
                      </p>
                    </Link>
                  </div>
                  <Link href={`/job-orders/${quotation.jobOrder.id}`}>
                    <Button variant="outline" size="sm">
                      ดูรายละเอียด Job Order →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dates & Location */}
          <Card>
            <CardHeader>
              <CardTitle>วันที่และสถานที่</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">วันที่ได้รับต้องการ</p>
                  <p className="font-medium">{quotation.requestDate ? formatDate(quotation.requestDate) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">วันที่ส่งใบเสนอ</p>
                  <p className="font-medium">{formatDate(quotation.submissionDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">จังหวัดขนส่ง</p>
                  <p className="font-medium">{quotation.province?.name || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลติดต่อ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ชื่อผู้ติดต่อ</p>
                  <p className="font-medium">{quotation.contactName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">เบอร์ติดต่อ</p>
                  <p className="font-medium">{quotation.contactPhone || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">E-Mail</p>
                  <p className="font-medium">{quotation.contactEmail || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          {quotation.paymentTerms && (
            <Card>
              <CardHeader>
                <CardTitle>เงื่อนไขการชำระ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{quotation.paymentTerms}</p>
              </CardContent>
            </Card>
          )}
        </div>
    </div>
  )
}
