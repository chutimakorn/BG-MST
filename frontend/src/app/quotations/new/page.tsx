'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewQuotationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [masterData, setMasterData] = useState<any>({})
  const [formData, setFormData] = useState({
    requestDate: '',
    submissionDate: new Date().toISOString().split('T')[0],
    quotationNumber: '',
    customerGroup: 'G',
    saleMemberId: '',
    customerName: '',
    customerCode: '',
    carId: '',
    additionalOptions: '',
    quantity: 1,
    pricePerUnitWithVat: 0,
    provinceId: '',
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
      const [cars, saleMembers, provinces] = await Promise.all([
        api.get('/master-data/cars'),
        api.get('/master-data/sale-members'),
        api.get('/master-data/provinces'),
      ])

      setMasterData({
        cars: cars.data,
        saleMembers: saleMembers.data,
        provinces: provinces.data,
      })
    } catch (error) {
      console.error('Failed to load master data', error)
    }
  }

  const calculateTotals = (data: any) => {
    const totalSalesPrice = data.quantity * data.pricePerUnitWithVat
    const totalTransportCost = data.transportTrips * data.pricePerTrip
    const grandTotal = totalSalesPrice + totalTransportCost
    
    return {
      totalSalesPrice,
      totalSalesPriceWithOptions: totalSalesPrice, // ถ้ามี option ต้องคำนวณเพิ่ม
      totalTransportCost,
      grandTotal,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const totals = calculateTotals(formData)
      const submitData = {
        ...formData,
        ...totals,
        quantity: parseInt(formData.quantity as any),
        pricePerUnitWithVat: parseFloat(formData.pricePerUnitWithVat as any),
        transportTrips: parseInt(formData.transportTrips as any),
        pricePerTrip: parseFloat(formData.pricePerTrip as any),
      }

      await api.post('/quotations', submitData)
      alert('สร้างใบเสนอราคาสำเร็จ')
      router.push('/quotations')
    } catch (error: any) {
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const totals = calculateTotals(formData)

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          สร้างใบเสนอราคาใหม่
        </h2>
        <Link
          href="/quotations"
          className="inline-flex items-center justify-center gap-2.5 rounded-md border border-stroke px-6 py-3 text-center font-medium hover:shadow-1 dark:border-strokedark"
        >
          <ArrowLeft className="h-5 w-5" />
          ย้อนกลับ
        </Link>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            ข้อมูลใบเสนอราคา
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6.5">
            {/* ข้อมูลพื้นฐาน */}
            <div className="mb-6">
              <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">ข้อมูลพื้นฐาน</h4>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    วันที่ได้รับต้องการ
                  </label>
                  <input
                    type="date"
                    value={formData.requestDate}
                    onChange={(e) => handleChange('requestDate', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    วันที่ส่งใบเสนอ <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.submissionDate}
                    onChange={(e) => handleChange('submissionDate', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    เลขที่ใบเสนอราคา
                  </label>
                  <input
                    type="text"
                    value={formData.quotationNumber}
                    onChange={(e) => handleChange('quotationNumber', e.target.value)}
                    placeholder="เว้นว่างไว้เพื่อสร้างอัตโนมัติ"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    กลุ่มลูกค้า <span className="text-meta-1">*</span>
                  </label>
                  <select
                    required
                    value={formData.customerGroup}
                    onChange={(e) => handleChange('customerGroup', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="G">G (Government)</option>
                    <option value="NG">NG (Non-Government)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    ผู้ขาย
                  </label>
                  <select
                    value={formData.saleMemberId}
                    onChange={(e) => handleChange('saleMemberId', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="">เลือกผู้ขาย</option>
                    {masterData.saleMembers?.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    ชื่อลูกค้า <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => handleChange('customerName', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    รหัสลูกค้า <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerCode}
                    onChange={(e) => handleChange('customerCode', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    รุ่นรถ
                  </label>
                  <select
                    value={formData.carId}
                    onChange={(e) => handleChange('carId', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="">เลือกรุ่นรถ</option>
                    {masterData.cars?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Option เพิ่มเติม */}
            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Option (เสนอเพิ่มเติม)
              </label>
              <textarea
                rows={3}
                value={formData.additionalOptions}
                onChange={(e) => handleChange('additionalOptions', e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>

            {/* ราคาและจำนวน */}
            <div className="mb-6">
              <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">ราคาและจำนวน</h4>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    จำนวน/คัน <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    ราคาขาย รวม VAT (ต่อคัน) <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.pricePerUnitWithVat}
                    onChange={(e) => handleChange('pricePerUnitWithVat', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                    <p className="text-sm text-body">รวมราคาขาย: <span className="font-semibold text-black dark:text-white">฿{totals.totalSalesPrice.toLocaleString()}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* ข้อมูลการขนส่ง */}
            <div className="mb-6">
              <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">ข้อมูลการขนส่ง</h4>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    จังหวัดขนส่ง
                  </label>
                  <select
                    value={formData.provinceId}
                    onChange={(e) => handleChange('provinceId', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="">เลือกจังหวัด</option>
                    {masterData.provinces?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    เที่ยวขนส่ง
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.transportTrips}
                    onChange={(e) => handleChange('transportTrips', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    ราคา/เที่ยว
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricePerTrip}
                    onChange={(e) => handleChange('pricePerTrip', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                    <p className="text-sm text-body">รวมค่าขนส่ง: <span className="font-semibold text-black dark:text-white">฿{totals.totalTransportCost.toLocaleString()}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* ยอดรวมทั้งหมด */}
            <div className="mb-6">
              <div className="rounded-lg border-2 border-primary bg-primary bg-opacity-10 p-6">
                <p className="text-xl font-bold text-black dark:text-white">
                  ราคาขายรวมค่าขนส่ง: <span className="text-primary">฿{totals.grandTotal.toLocaleString()}</span>
                </p>
              </div>
            </div>

            {/* ข้อมูลการติดต่อ */}
            <div className="mb-6">
              <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">ข้อมูลการติดต่อ</h4>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    ชื่อผู้ติดต่อ
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleChange('contactName', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    เบอร์ติดต่อ
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    สถานะสต็อก
                  </label>
                  <select
                    value={formData.stockStatus}
                    onChange={(e) => handleChange('stockStatus', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="พร้อมส่ง">พร้อมส่ง</option>
                    <option value="รอ 7 - 30">รอ 7 - 30</option>
                    <option value="รอ 31-60">รอ 31-60</option>
                  </select>
                </div>
              </div>
            </div>

            {/* เงื่อนไขการชำระ */}
            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                เงื่อนไขการชำระ
              </label>
              <textarea
                rows={3}
                value={formData.paymentTerms}
                onChange={(e) => handleChange('paymentTerms', e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>

            {/* ข้อมูลเพิ่มเติม */}
            <div className="mb-6">
              <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">ข้อมูลเพิ่มเติม</h4>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    แจ้ง/นัดหมายลูกค้าก่อนส่งมอบ
                  </label>
                  <textarea
                    rows={2}
                    value={formData.customerNotification}
                    onChange={(e) => handleChange('customerNotification', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    ผลตรวจเช็คก่อนส่งมอบ
                  </label>
                  <textarea
                    rows={2}
                    value={formData.preDeliveryInspection}
                    onChange={(e) => handleChange('preDeliveryInspection', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Serial / Code
                  </label>
                  <input
                    type="text"
                    value={formData.serialCode}
                    onChange={(e) => handleChange('serialCode', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    หมายเหตุ / สถานะหลังส่งมอบ
                  </label>
                  <textarea
                    rows={2}
                    value={formData.postDeliveryNote}
                    onChange={(e) => handleChange('postDeliveryNote', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {loading ? 'กำลังบันทึก...' : 'บันทึกใบเสนอราคา'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
