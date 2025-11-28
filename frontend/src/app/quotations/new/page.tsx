'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import Link from 'next/link'

export default function NewQuotationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [masterData, setMasterData] = useState<any>({})
  const [formData, setFormData] = useState<any>({
    requestDate: '',
    submissionDate: new Date().toISOString().split('T')[0],
    quotationNumber: '',
    customerGroup: 'G',
    customerName: '',
    customerCode: '',
    additionalOptions: '',
    quantity: 1,
    pricePerUnitWithVat: 0,
    transportTrips: 0,
    pricePerTrip: 0,
    paymentTerms: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    stockStatus: 'รอ 7 - 30',
    customerNotification: '',
    preDeliveryInspection: '',
    serialCode: '',
    status: 'processing',
    postDeliveryNote: 'เกินระยะเวลายืนราคา',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadMasterData()
  }, [router])

  const loadMasterData = async () => {
    try {
      const response = await api.get('/master-data')
      setMasterData(response.data)
    } catch (error) {
      console.error('Failed to load master data', error)
    }
  }

  const calculateTotals = (data: any) => {
    const totalSalesPrice = data.quantity * data.pricePerUnitWithVat
    const totalSalesPriceWithOptions = totalSalesPrice
    const totalTransportCost = data.transportTrips * data.pricePerTrip
    const grandTotal = totalSalesPriceWithOptions + totalTransportCost

    return {
      totalSalesPrice,
      totalSalesPriceWithOptions,
      totalTransportCost,
      grandTotal,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const totals = calculateTotals(formData)
      const payload = { ...formData, ...totals }
      await api.post('/quotations', payload)
      alert('บันทึกสำเร็จ')
      router.push('/quotations')
    } catch (error: any) {
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const totals = calculateTotals(formData)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">เพิ่มใบเสนอราคาใหม่</h1>
          <p className="text-muted-foreground mt-1">กรอกข้อมูลใบเสนอราคา</p>
        </div>
        <Link href="/quotations">
          <Button variant="outline">← กลับ</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          {/* ข้อมูลพื้นฐาน */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">วันที่ได้รับต้องการ</label>
                  <Input
                    type="date"
                    value={formData.requestDate}
                    onChange={(e) => handleChange('requestDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">วันที่ส่งใบเสนอ *</label>
                  <Input
                    type="date"
                    value={formData.submissionDate}
                    onChange={(e) => handleChange('submissionDate', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">เลขที่ใบเสนอราคาขาย *</label>
                  <Input
                    value={formData.quotationNumber}
                    onChange={(e) => handleChange('quotationNumber', e.target.value)}
                    placeholder="QT-2025-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">กลุ่มลูกค้า (G/NG) *</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.customerGroup}
                    onChange={(e) => handleChange('customerGroup', e.target.value)}
                  >
                    <option value="G">G</option>
                    <option value="NG">NG</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูลลูกค้า */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลลูกค้า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ชื่อผู้ขาย/SALE</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    onChange={(e) => handleChange('saleMember', e.target.value ? { id: parseInt(e.target.value) } : null)}
                  >
                    <option value="">-- เลือกผู้ขาย --</option>
                    {masterData.saleMembers?.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ชื่อลูกค้า/Customer *</label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => handleChange('customerName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">รหัสลูกค้า *</label>
                <Input
                  value={formData.customerCode}
                  onChange={(e) => handleChange('customerCode', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูลสินค้า */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลสินค้า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">รุ่นรถ</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    onChange={(e) => handleChange('car', e.target.value ? { id: parseInt(e.target.value) } : null)}
                  >
                    <option value="">-- เลือกรุ่นรถ --</option>
                    {masterData.cars?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">จำนวน/คัน *</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Option (เสนอเพิ่มเติม)</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.additionalOptions}
                  onChange={(e) => handleChange('additionalOptions', e.target.value)}
                  placeholder="ระบุ option เพิ่มเติม..."
                />
              </div>
            </CardContent>
          </Card>

          {/* ราคา */}
          <Card>
            <CardHeader>
              <CardTitle>ราคาและค่าขนส่ง</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ราคาขาย รวม Vat (ต่อคัน) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pricePerUnitWithVat}
                    onChange={(e) => handleChange('pricePerUnitWithVat', parseFloat(e.target.value) || 0)}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">รวมราคาขาย</label>
                  <Input
                    type="number"
                    value={totals.totalSalesPrice}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">จังหวัดขนส่ง</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    onChange={(e) => handleChange('province', e.target.value ? { id: parseInt(e.target.value) } : null)}
                  >
                    <option value="">-- เลือกจังหวัด --</option>
                    {masterData.provinces?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">เที่ยวขนส่ง</label>
                  <Input
                    type="number"
                    value={formData.transportTrips}
                    onChange={(e) => handleChange('transportTrips', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ราคา/เที่ยว</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pricePerTrip}
                    onChange={(e) => handleChange('pricePerTrip', parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">รวมค่าขนส่ง:</span>
                  <span className="font-medium">{totals.totalTransportCost.toLocaleString()} บาท</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-700 pt-2 border-t">
                  <span>ราคาขายรวมค่าขนส่ง:</span>
                  <span>{totals.grandTotal.toLocaleString()} บาท</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูลติดต่อ */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลติดต่อ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ชื่อผู้ติดต่อ</label>
                  <Input
                    value={formData.contactName}
                    onChange={(e) => handleChange('contactName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">เบอร์ติดต่อ</label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-Mail</label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">เงื่อนไขการชำระ</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.paymentTerms}
                  onChange={(e) => handleChange('paymentTerms', e.target.value)}
                  placeholder="ระบุเงื่อนไขการชำระเงิน..."
                />
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูลเพิ่มเติม */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลเพิ่มเติม</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">สถานะเช็ครถในสต็อก</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.stockStatus}
                    onChange={(e) => handleChange('stockStatus', e.target.value)}
                  >
                    <option value="พร้อมส่ง">พร้อมส่ง</option>
                    <option value="รอ 7 - 30">รอ 7 - 30</option>
                    <option value="รอ 31-60">รอ 31-60</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Serial / Code</label>
                  <Input
                    value={formData.serialCode}
                    onChange={(e) => handleChange('serialCode', e.target.value)}
                    placeholder="ระบุ Serial หรือ Code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">แจ้ง/นัดหมายลูกค้าก่อนส่งมอบ</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.customerNotification}
                  onChange={(e) => handleChange('customerNotification', e.target.value)}
                  placeholder="ระบุการแจ้งหรือนัดหมายลูกค้า..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ผลตรวจเช็คก่อนส่งมอบ</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.preDeliveryInspection}
                  onChange={(e) => handleChange('preDeliveryInspection', e.target.value)}
                  placeholder="ระบุผลการตรวจเช็ค..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">สถานะ</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="processing">Processing</option>
                    <option value="close">Close</option>
                    <option value="cancel">Cancel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">หมายเหตุ / สถานะหลังส่งมอบ</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.postDeliveryNote}
                  onChange={(e) => handleChange('postDeliveryNote', e.target.value)}
                  placeholder="หมายเหตุหลังส่งมอบ..."
                />
              </div>
            </CardContent>
          </Card>

          {/* ปุ่มบันทึก */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'กำลังบันทึก...' : 'บันทึกใบเสนอราคา'}
            </Button>
            <Link href="/quotations" className="flex-1">
              <Button type="button" variant="outline" className="w-full">ยกเลิก</Button>
            </Link>
          </div>
        </form>
    </div>
  )
}
