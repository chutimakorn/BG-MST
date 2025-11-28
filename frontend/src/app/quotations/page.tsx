'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">จัดการใบเสนอราคา</h1>
        <p className="text-muted-foreground mt-1">ดูและจัดการใบเสนอราคาทั้งหมด</p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <Input
            placeholder="ค้นหาเลขที่ใบเสนอราคา หรือชื่อลูกค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <Link href="/quotations/new">
            <Button>+ เพิ่มใบเสนอราคาใหม่</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="grid gap-4">
            {filteredQuotations.map((quotation) => (
              <Card key={quotation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">{quotation.quotationNumber}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          {quotation.customerGroup}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        ลูกค้า: {quotation.customerName} ({quotation.customerCode})
                      </p>
                      <p className="text-sm text-gray-600">
                        ผู้ขาย: {quotation.saleMember?.name || '-'}
                      </p>
                      <p className="text-sm text-gray-600">
                        รถ: {quotation.car?.name || '-'} x {quotation.quantity} คัน
                      </p>
                      <p className="text-sm text-gray-600">
                        วันที่ส่งใบเสนอ: {formatDate(quotation.submissionDate)}
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        ยอดรวม: {formatCurrency(quotation.grandTotal)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/quotations/${quotation.id}`}>
                        <Button variant="outline" size="sm">ดูรายละเอียด</Button>
                      </Link>
                      <Link href={`/quotations/${quotation.id}/edit`}>
                        <Button size="sm">แก้ไข</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredQuotations.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  ไม่พบข้อมูลใบเสนอราคา
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
