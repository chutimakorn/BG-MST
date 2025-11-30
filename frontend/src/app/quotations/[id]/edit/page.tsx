'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { ArrowLeft, Save, Search, X, Plus, Edit, FileUp } from 'lucide-react'
import Link from 'next/link'
import { showSuccess, showError } from '@/lib/toast-helper'

export default function EditQuotationPage() {
  const router = useRouter()
  const params = useParams()
  const quotationId = params.id
  
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [masterData, setMasterData] = useState<any>({})
  const [jobOrders, setJobOrders] = useState<any[]>([])
  const [selectedJobOrder, setSelectedJobOrder] = useState<any>(null)
  const [jobOrderSearch, setJobOrderSearch] = useState('')
  const [showJobOrderDropdown, setShowJobOrderDropdown] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUploading, setPdfUploading] = useState(false)
  const [pdfData, setPdfData] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    jobOrderId: '',
    requestDate: '',
    submissionDate: '',
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
    postDeliveryNote: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadData()
  }, [quotationId])

  const loadData = async () => {
    try {
      const [quotation, cars, saleMembers, provinces, jobOrdersRes] = await Promise.all([
        api.get(`/quotations/${quotationId}`),
        api.get('/master-data/cars'),
        api.get('/master-data/sale-members'),
        api.get('/master-data/provinces'),
        api.get('/job-orders'),
      ])

      setMasterData({
        cars: cars.data,
        saleMembers: saleMembers.data,
        provinces: provinces.data,
      })
      // API ตอนนี้ return { data: [], pagination: {} }
      setJobOrders(jobOrdersRes.data.data || jobOrdersRes.data || [])

      const q = quotation.data
      setFormData({
        jobOrderId: q.jobOrder?.id || '',
        requestDate: q.requestDate || '',
        submissionDate: q.submissionDate || '',
        quotationNumber: q.quotationNumber || '',
        customerGroup: q.customerGroup || 'G',
        saleMemberId: q.saleMember?.id || '',
        customerName: q.customerName || '',
        customerCode: q.customerCode || '',
        carId: q.car?.id || '',
        additionalOptions: q.additionalOptions || '',
        quantity: q.quantity || 1,
        pricePerUnitWithVat: q.pricePerUnitWithVat || 0,
        provinceId: q.province?.id || '',
        transportTrips: q.transportTrips || 0,
        pricePerTrip: q.pricePerTrip || 0,
        paymentTerms: q.paymentTerms || '',
        contactName: q.contactName || '',
        contactPhone: q.contactPhone || '',
        contactEmail: q.contactEmail || '',
        stockStatus: q.stockStatus || 'รอ 7 - 30',
        customerNotification: q.customerNotification || '',
        preDeliveryInspection: q.preDeliveryInspection || '',
        serialCode: q.serialCode || '',
        status: q.status || 'processing',
        postDeliveryNote: q.postDeliveryNote || '',
      })

      if (q.jobOrder) {
        setSelectedJobOrder(q.jobOrder)
        setJobOrderSearch(q.jobOrder.quotationNumber || '')
      }
    } catch (error) {
      console.error('Failed to load data', error)
      showError('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setDataLoading(false)
    }
  }

  const calculateTotals = (data: any) => {
    const totalSalesPrice = data.quantity * data.pricePerUnitWithVat
    const totalTransportCost = data.transportTrips * data.pricePerTrip
    const grandTotal = totalSalesPrice + totalTransportCost
    
    return {
      totalSalesPrice,
      totalSalesPriceWithOptions: totalSalesPrice,
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
        requestDate: formData.requestDate,
        submissionDate: formData.submissionDate,
        quotationNumber: formData.quotationNumber,
        customerGroup: formData.customerGroup,
        saleMember: formData.saleMemberId || null,
        customerName: formData.customerName,
        customerCode: formData.customerCode,
        car: formData.carId || null,
        additionalOptions: formData.additionalOptions,
        quantity: parseInt(formData.quantity as any),
        pricePerUnitWithVat: parseFloat(formData.pricePerUnitWithVat as any),
        province: formData.provinceId || null,
        transportTrips: parseInt(formData.transportTrips as any),
        pricePerTrip: parseFloat(formData.pricePerTrip as any),
        paymentTerms: formData.paymentTerms,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        jobOrder: formData.jobOrderId || null,
        stockStatus: formData.stockStatus,
        customerNotification: formData.customerNotification,
        preDeliveryInspection: formData.preDeliveryInspection,
        serialCode: formData.serialCode,
        status: formData.status,
        postDeliveryNote: formData.postDeliveryNote,
        ...totals,
      }

      await api.put(`/quotations/${quotationId}`, submitData)
      showSuccess('แก้ไขใบเสนอราคาสำเร็จ')
      router.push('/quotations')
    } catch (error: any) {
      showError('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectJobOrder = (jobOrder: any) => {
    setSelectedJobOrder(jobOrder)
    setJobOrderSearch(jobOrder.quotationNumber)
    setShowJobOrderDropdown(false)
    setFormData(prev => ({ ...prev, jobOrderId: jobOrder.id }))
  }

  const handleClearJobOrder = () => {
    setSelectedJobOrder(null)
    setJobOrderSearch('')
    setFormData(prev => ({ ...prev, jobOrderId: '' }))
  }

  const filteredJobOrders = jobOrders.filter(jo => 
    jo.quotationNumber?.toLowerCase().includes(jobOrderSearch.toLowerCase()) ||
    jo.customerName?.toLowerCase().includes(jobOrderSearch.toLowerCase())
  )

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPdfFile(file)
    setPdfUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/import/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setPdfData(response.data)
      setShowPdfModal(true)
    } catch (error: any) {
      showError('เกิดข้อผิดพลาดในการอ่านไฟล์ PDF: ' + (error.response?.data?.message || error.message))
    } finally {
      setPdfUploading(false)
    }
  }

  const handleCreateJobOrder = async () => {
    if (!pdfData) return

    setPdfUploading(true)
    try {
      // สร้าง Job Order จากข้อมูล PDF
      const jobOrderData = {
        ...pdfData,
        quotationId: quotationId, // เชื่อมโยงกับใบเสนอราคานี้
      }

      const response = await api.post('/import/pdf/save', jobOrderData)
      const newJobOrder = response.data

      // อัพเดทใบเสนอราคาให้เชื่อมโยงกับ Job Order ใหม่
      await api.put(`/quotations/${quotationId}`, {
        ...formData,
        jobOrder: newJobOrder.id,
      })

      showSuccess('สร้าง Job Order สำเร็จ!')
      setShowPdfModal(false)
      setPdfData(null)
      setPdfFile(null)
      
      // Reload data
      await loadData()
      
      // ไปหน้าแก้ไข Job Order ที่สร้างใหม่
      router.push(`/job-orders/${newJobOrder.id}/edit`)
    } catch (error: any) {
      showError('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message))
    } finally {
      setPdfUploading(false)
    }
  }

  const totals = calculateTotals(formData)

  if (dataLoading) {
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
          แก้ไขใบเสนอราคา
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
            {/* ฟอร์มเหมือนหน้า new - ข้ามรายละเอียด */}
            <div className="mb-6">
              <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">ข้อมูลพื้นฐาน</h4>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">วันที่ได้รับต้องการ</label>
                  <input type="date" value={formData.requestDate} onChange={(e) => handleChange('requestDate', e.target.value)} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white" />
                </div>
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">วันที่ส่งใบเสนอ <span className="text-meta-1">*</span></label>
                  <input type="date" required value={formData.submissionDate} onChange={(e) => handleChange('submissionDate', e.target.value)} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white" />
                </div>
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">เลขที่ใบเสนอราคา</label>
                  <input type="text" value={formData.quotationNumber} onChange={(e) => handleChange('quotationNumber', e.target.value)} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white" />
                </div>
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">กลุ่มลูกค้า <span className="text-meta-1">*</span></label>
                  <select required value={formData.customerGroup} onChange={(e) => handleChange('customerGroup', e.target.value)} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white">
                    <option value="G">G (Government)</option>
                    <option value="NG">NG (Non-Government)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">ผู้ขาย</label>
                  <select value={formData.saleMemberId} onChange={(e) => handleChange('saleMemberId', e.target.value)} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white">
                    <option value="">เลือกผู้ขาย</option>
                    {masterData.saleMembers?.map((m: any) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">ชื่อลูกค้า <span className="text-meta-1">*</span></label>
                  <input type="text" required value={formData.customerName} onChange={(e) => handleChange('customerName', e.target.value)} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white" />
                </div>
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">รหัสลูกค้า <span className="text-meta-1">*</span></label>
                  <input type="text" required value={formData.customerCode} onChange={(e) => handleChange('customerCode', e.target.value)} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white" />
                </div>
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">รุ่นรถ</label>
                  <select value={formData.carId} onChange={(e) => handleChange('carId', e.target.value)} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white">
                    <option value="">เลือกรุ่นรถ</option>
                    {masterData.cars?.map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">Option (เสนอเพิ่มเติม)</label>
              <textarea rows={3} value={formData.additionalOptions} onChange={(e) => handleChange('additionalOptions', e.target.value)} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white" />
            </div>

            <div className="mb-6">
              <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">ราคาและจำนวน</h4>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">จำนวน/คัน <span className="text-meta-1">*</span></label>
                  <input type="number" min="1" required value={formData.quantity} onChange={(e) => handleChange('quantity', e.target.value)} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white" />
                </div>
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">ราคาขาย รวม VAT (ต่อคัน) <span className="text-meta-1">*</span></label>
                  <input type="number" min="0" step="0.01" required value={formData.pricePerUnitWithVat} onChange={(e) => handleChange('pricePerUnitWithVat', e.target.value)} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                    <p className="text-sm text-body">รวมราคาขาย: <span className="font-semibold text-black dark:text-white">฿{totals.totalSalesPrice.toLocaleString()}</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">ข้อมูลการขนส่ง</h4>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">จังหวัดขนส่ง</label>
                  <select value={formData.provinceId} onChange={(e) => handleChange('provinceId', e.target.value)} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white">
                    <option value="">เลือกจังหวัด</option>
                    {masterData.provinces?.map((p: any) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">เที่ยวขนส่ง</label>
                  <input type="number" min="0" value={formData.transportTrips} onChange={(e) => handleChange('transportTrips', e.target.value)} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white" />
                </div>
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">ราคา/เที่ยว</label>
                  <input type="number" min="0" step="0.01" value={formData.pricePerTrip} onChange={(e) => handleChange('pricePerTrip', e.target.value)} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                    <p className="text-sm text-body">รวมค่าขนส่ง: <span className="font-semibold text-black dark:text-white">฿{totals.totalTransportCost.toLocaleString()}</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="rounded-lg border-2 border-primary bg-primary bg-opacity-10 p-6">
                <p className="text-xl font-bold text-black dark:text-white">
                  ราคาขายรวมค่าขนส่ง: <span className="text-primary">฿{totals.grandTotal.toLocaleString()}</span>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Job Order Selection Section - ด้านล่าง */}
      <div className="mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-black dark:text-white">
              เชื่อมโยงกับ Job Order (ถ้ามี)
            </h3>
            {!selectedJobOrder && (
              <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90">
                <Plus className="h-5 w-5" />
                <span>สร้าง Job Order จาก PDF</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                  disabled={pdfUploading}
                />
              </label>
            )}
          </div>
        </div>
        <div className="p-6.5">
          <div className="relative">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              ค้นหา Job Order ที่มีอยู่แล้ว
            </label>
            <div className="relative">
              <input
                type="text"
                value={jobOrderSearch}
                onChange={(e) => {
                  setJobOrderSearch(e.target.value)
                  setShowJobOrderDropdown(true)
                }}
                onFocus={() => setShowJobOrderDropdown(true)}
                placeholder="พิมพ์เลขที่ Job Order หรือชื่อลูกค้า..."
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 pr-12 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-body" />
            </div>

            {showJobOrderDropdown && filteredJobOrders.length > 0 && (
              <div className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark">
                {filteredJobOrders.map((jo) => (
                  <button
                    key={jo.id}
                    type="button"
                    onClick={() => handleSelectJobOrder(jo)}
                    className="w-full border-b border-stroke px-5 py-3 text-left hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    <p className="font-medium text-black dark:text-white">{jo.quotationNumber}</p>
                    <p className="text-sm text-body">{jo.customerName} - {jo.car?.name || 'ไม่ระบุรุ่นรถ'} ({jo.quantity} คัน)</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Order Preview Section */}
      {selectedJobOrder && (
        <div className="mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-black dark:text-white">
                ข้อมูล Job Order ที่เชื่อมโยง
              </h3>
              <div className="flex items-center gap-2">
                <Link
                  href={`/job-orders/${selectedJobOrder.id}/edit`}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                >
                  <Edit className="h-4 w-4" />
                  แก้ไข Job Order
                </Link>
                <button
                  type="button"
                  onClick={handleClearJobOrder}
                  className="text-meta-1 hover:text-meta-1/80"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6.5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                <p className="mb-1 text-sm text-body">เลขที่ Job Order</p>
                <p className="font-semibold text-black dark:text-white">{selectedJobOrder.quotationNumber || '-'}</p>
              </div>
              <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                <p className="mb-1 text-sm text-body">ชื่อลูกค้า</p>
                <p className="font-semibold text-black dark:text-white">{selectedJobOrder.customerName || '-'}</p>
              </div>
              <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                <p className="mb-1 text-sm text-body">รหัสลูกค้า</p>
                <p className="font-semibold text-black dark:text-white">{selectedJobOrder.customerCode || '-'}</p>
              </div>
              <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                <p className="mb-1 text-sm text-body">รุ่นรถ</p>
                <p className="font-semibold text-black dark:text-white">{selectedJobOrder.car?.name || '-'}</p>
              </div>
              <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                <p className="mb-1 text-sm text-body">จำนวน</p>
                <p className="font-semibold text-black dark:text-white">{selectedJobOrder.quantity || 0} คัน</p>
              </div>
              <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                <p className="mb-1 text-sm text-body">ราคาต่อคัน</p>
                <p className="font-semibold text-black dark:text-white">฿{(selectedJobOrder.pricePerUnit || 0).toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                <p className="mb-1 text-sm text-body">วันส่งรถ</p>
                <p className="font-semibold text-black dark:text-white">{selectedJobOrder.deliveryDate ? new Date(selectedJobOrder.deliveryDate).toLocaleDateString('th-TH') : '-'}</p>
              </div>
              <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                <p className="mb-1 text-sm text-body">สถานที่ส่ง</p>
                <p className="font-semibold text-black dark:text-white">{selectedJobOrder.deliveryPlace || '-'}</p>
              </div>
              <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                <p className="mb-1 text-sm text-body">สถานะ</p>
                <p className="font-semibold text-black dark:text-white">{selectedJobOrder.statusJob?.name || 'รอดำเนินการ'}</p>
              </div>
            </div>
            {selectedJobOrder.additionalOptions && (
              <div className="mt-4 rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                <p className="mb-2 text-sm text-body">Options เพิ่มเติม</p>
                <p className="whitespace-pre-wrap text-sm text-black dark:text-white">{selectedJobOrder.additionalOptions}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Button - ปุ่มบันทึกด้านล่างสุด */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-4 text-lg font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
        >
          <Save className="h-6 w-6" />
          {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
        </button>
      </div>

      {/* PDF Upload Modal */}
      {showPdfModal && pdfData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-black dark:text-white">
                ตรวจสอบข้อมูลจาก PDF
              </h3>
              <button
                onClick={() => {
                  setShowPdfModal(false)
                  setPdfData(null)
                  setPdfFile(null)
                }}
                className="text-body hover:text-black dark:hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                <p className="mb-1 text-sm text-body">เลขที่ใบสั่งงาน</p>
                <p className="font-semibold text-black dark:text-white">{pdfData.quotationNumber || '-'}</p>
              </div>
              <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                <p className="mb-1 text-sm text-body">ชื่อลูกค้า</p>
                <p className="font-semibold text-black dark:text-white">{pdfData.customerName || '-'}</p>
              </div>
              <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                <p className="mb-1 text-sm text-body">รหัสลูกค้า</p>
                <p className="font-semibold text-black dark:text-white">{pdfData.customerCode || '-'}</p>
              </div>
              <div className="rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                <p className="mb-1 text-sm text-body">จำนวน</p>
                <p className="font-semibold text-black dark:text-white">{pdfData.quantity || 0} คัน</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowPdfModal(false)
                  setPdfData(null)
                  setPdfFile(null)
                }}
                className="flex-1 rounded-lg border border-stroke px-6 py-3 font-medium hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreateJobOrder}
                disabled={pdfUploading}
                className="flex-1 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                {pdfUploading ? 'กำลังสร้าง...' : 'สร้าง Job Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
