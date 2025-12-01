'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { ArrowLeft, Save, Upload, FileText, Eye, Trash2, X, Download } from 'lucide-react'
import Link from 'next/link'
import { showSuccess, showError, showInfo } from '@/lib/toast-helper'

export default function EditJobOrderPage() {
  const router = useRouter()
  const params = useParams()
  const jobOrderId = params.id
  
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [uploadingFile, setUploadingFile] = useState<string | null>(null)
  const [masterData, setMasterData] = useState<any>({})
  const [linkedQuotation, setLinkedQuotation] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    quotationNumber: '',
    customerName: '',
    customerCode: '',
    submissionDate: '',
    deliveryDate: '',
    deliveryPlace: '',
    carId: '',
    quantity: 1,
    pricePerUnit: 0,
    bodyColorId: '',
    seatColorId: '',
    canopyColorId: '',
    additionalOptions: '',
    statusJobDocumentId: '',
    statusJobId: '',
    jobPdfFileName: '',
    poFileName: '',
    ivFileName: '',
    ivDate: '',
    ivAmount: 0,
    itFileName: '',
    itDate: '',
    itAmount: 0,
    dvFileName: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadData()
  }, [jobOrderId])

  const loadData = async () => {
    try {
      const [jobOrder, cars, bodyColors, seatColors, canopyColors, statusJobDocs, statusJobs] = await Promise.all([
        api.get(`/job-orders/${jobOrderId}`),
        api.get('/master-data/cars'),
        api.get('/master-data/body-colors'),
        api.get('/master-data/seat-colors'),
        api.get('/master-data/canopy-colors'),
        api.get('/master-data/status-job-documents'),
        api.get('/master-data/status-jobs'),
      ])

      setMasterData({
        cars: cars.data,
        bodyColors: bodyColors.data,
        seatColors: seatColors.data,
        canopyColors: canopyColors.data,
        statusJobDocuments: statusJobDocs.data,
        statusJobs: statusJobs.data,
      })

      const jo = jobOrder.data
      
      // เช็คว่ามี quotation ที่เชื่อมโยงหรือไม่
      if (jo.id) {
        try {
          const quotationsRes = await api.get('/quotations')
          const quotations = quotationsRes.data.data || quotationsRes.data || []
          const linkedQuot = quotations.find((q: any) => q.jobOrder?.id === jo.id)
          if (linkedQuot) {
            setLinkedQuotation(linkedQuot)
          }
        } catch (error) {
          console.error('Failed to load linked quotation', error)
        }
      }
      
      setFormData({
        quotationNumber: jo.quotationNumber || '',
        customerName: jo.customerName || '',
        customerCode: jo.customerCode || '',
        submissionDate: jo.submissionDate || '',
        deliveryDate: jo.deliveryDate || '',
        deliveryPlace: jo.deliveryPlace || '',
        carId: jo.car?.id || '',
        quantity: jo.quantity || 1,
        pricePerUnit: jo.pricePerUnit || 0,
        bodyColorId: jo.bodyColor?.id || '',
        seatColorId: jo.seatColor?.id || '',
        canopyColorId: jo.canopyColor?.id || '',
        additionalOptions: jo.additionalOptions || '',
        statusJobDocumentId: jo.statusJobDocument?.id || '',
        statusJobId: jo.statusJob?.id || '',
        jobPdfFileName: jo.jobPdfFileName || '',
        poFileName: jo.poFileName || '',
        ivFileName: jo.ivFileName || '',
        ivDate: jo.ivDate || '',
        ivAmount: jo.ivAmount || 0,
        itFileName: jo.itFileName || '',
        itDate: jo.itDate || '',
        itAmount: jo.itAmount || 0,
        dvFileName: jo.dvFileName || '',
      })
    } catch (error) {
      console.error('Failed to load data', error)
      showError('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setDataLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔵 handleSubmit called')
    setLoading(true)

    try {
      const submitData = {
        quotationNumber: formData.quotationNumber,
        customerName: formData.customerName,
        customerCode: formData.customerCode,
        submissionDate: formData.submissionDate,
        deliveryDate: formData.deliveryDate || null,
        deliveryPlace: formData.deliveryPlace,
        car: formData.carId || null,
        quantity: parseInt(formData.quantity as any),
        pricePerUnit: parseFloat(formData.pricePerUnit as any),
        bodyColor: formData.bodyColorId || null,
        seatColor: formData.seatColorId || null,
        canopyColor: formData.canopyColorId || null,
        additionalOptions: formData.additionalOptions,
        statusJobDocument: formData.statusJobDocumentId || null,
        statusJob: formData.statusJobId || null,
        poFileName: formData.poFileName,
        ivFileName: formData.ivFileName,
        ivDate: formData.ivDate || null,
        ivAmount: formData.ivAmount ? parseFloat(formData.ivAmount as any) : null,
        itFileName: formData.itFileName,
        itDate: formData.itDate || null,
        itAmount: formData.itAmount ? parseFloat(formData.itAmount as any) : null,
        dvFileName: formData.dvFileName,
      }

      console.log('📤 Submitting data:', submitData)
      const response = await api.put(`/job-orders/${jobOrderId}`, submitData)
      console.log('✅ Response:', response.data)
      showSuccess('แก้ไข Job Order สำเร็จ')
      router.push('/job-orders')
    } catch (error: any) {
      console.error('❌ Error:', error)
      showError('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (fileType: 'po' | 'iv' | 'it' | 'dv' | 'job', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingFile(fileType)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post(`/job-orders/${jobOrderId}/upload/${fileType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const result = response.data
      
      // Update form data with new file name
      if (fileType === 'po') handleChange('poFileName', result.fileName)
      if (fileType === 'iv') handleChange('ivFileName', result.fileName)
      if (fileType === 'it') handleChange('itFileName', result.fileName)
      if (fileType === 'dv') handleChange('dvFileName', result.fileName)
      if (fileType === 'job') handleChange('jobPdfFileName', result.fileName)

      showSuccess('อัพโหลดไฟล์สำเร็จ')
      await loadData() // Reload data
    } catch (error: any) {
      showError('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setUploadingFile(null)
    }
  }

  const handleDeleteFile = async (fileType: 'po' | 'iv' | 'it' | 'dv' | 'job') => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบไฟล์ ${fileType.toUpperCase()}?`)) {
      return
    }

    setUploadingFile(fileType)
    try {
      await api.delete(`/job-orders/${jobOrderId}/file/${fileType}`)
      
      // Update form data
      if (fileType === 'po') handleChange('poFileName', '')
      if (fileType === 'iv') handleChange('ivFileName', '')
      if (fileType === 'it') handleChange('itFileName', '')
      if (fileType === 'dv') handleChange('dvFileName', '')
      if (fileType === 'job') handleChange('jobPdfFileName', '')

      showSuccess('ลบไฟล์สำเร็จ')
      await loadData() // Reload data
    } catch (error: any) {
      showError('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploadingFile(null)
    }
  }

  const getDisplayFileName = (fileName: string): string => {
    if (!fileName) return ''
    
    try {
      const fileInfo = JSON.parse(fileName)
      return fileInfo.originalName || fileName
    } catch {
      return fileName
    }
  }

  const handleDeleteJobOrder = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Job Order นี้?\n\nการลบจะไม่สามารถกู้คืนได้')) {
      return
    }

    if (!confirm('ยืนยันอีกครั้ง: คุณต้องการลบ Job Order นี้จริงหรือไม่?')) {
      return
    }

    setLoading(true)
    try {
      await api.delete(`/job-orders/${jobOrderId}`)
      showSuccess('ลบ Job Order สำเร็จ')
      router.push('/job-orders')
    } catch (error: any) {
      showError('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewFileName, setPreviewFileName] = useState<string>('')

  const handleViewFile = async (fileName: string) => {
    if (!fileName) {
      showInfo('ไม่มีไฟล์')
      return
    }
    
    let fileUrl = ''
    
    try {
      // Try to parse as JSON (Cloudinary format with metadata)
      const fileInfo = JSON.parse(fileName)
      if (fileInfo.url) {
        fileUrl = fileInfo.url
      }
    } catch (error) {
      // Not JSON, continue with other methods
    }
    
    // Check if it's already a full URL
    if (!fileUrl && (fileName.startsWith('http://') || fileName.startsWith('https://'))) {
      fileUrl = fileName
    }
    
    // Use backend API to get file URL
    if (!fileUrl) {
      try {
        const response = await api.get(`/job-orders/files/${fileName}`)
        if (response.data.filePath) {
          fileUrl = response.data.filePath
        }
      } catch (error) {
        console.error('Error getting file URL:', error)
        showError('เกิดข้อผิดพลาดในการเปิดไฟล์')
        return
      }
    }
    
    if (fileUrl) {
      // Show preview modal
      setPreviewUrl(fileUrl)
      setPreviewFileName(getDisplayFileName(fileName))
    } else {
      showError('ไม่สามารถเปิดไฟล์ได้')
    }
  }

  const closePreview = () => {
    setPreviewUrl(null)
    setPreviewFileName('')
  }

  const handleDownload = async () => {
    if (!previewUrl || !previewFileName) return
    
    try {
      const response = await fetch(previewUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = previewFileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      // Fallback to direct link
      window.open(previewUrl, '_blank')
    }
  }

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
          แก้ไข Job Order
        </h2>
        <Link
          href="/job-orders"
          className="inline-flex items-center justify-center gap-2.5 rounded-md border border-stroke px-6 py-3 text-center font-medium hover:shadow-1 dark:border-strokedark"
        >
          <ArrowLeft className="h-5 w-5" />
          ย้อนกลับ
        </Link>
      </div>

      {/* Linked Quotation Alert */}
      {linkedQuotation && (
        <div className="mb-6 rounded-lg border-l-4 border-primary bg-primary bg-opacity-10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black dark:text-white">
                Job Order นี้เชื่อมโยงกับใบเสนอราคา
              </p>
              <p className="mt-1 text-sm text-body">
                เลขที่: {linkedQuotation.quotationNumber} | ลูกค้า: {linkedQuotation.customerName}
              </p>
            </div>
            <Link
              href={`/quotations/${linkedQuotation.id}/edit`}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90"
            >
              <FileText className="h-4 w-4" />
              ดูใบเสนอราคา
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ข้อมูลพื้นฐาน */}
        <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              ข้อมูลพื้นฐาน
            </h3>
          </div>
          <div className="p-6.5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  เลขที่ใบเสนอราคา <span className="text-meta-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.quotationNumber}
                  onChange={(e) => handleChange('quotationNumber', e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
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
                  วันส่งรถ
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => handleChange('deliveryDate', e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  สถานที่ส่ง
                </label>
                <input
                  type="text"
                  value={formData.deliveryPlace}
                  onChange={(e) => handleChange('deliveryPlace', e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ข้อมูลรถ */}
        <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              ข้อมูลรถ
            </h3>
          </div>
          <div className="p-6.5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  จำนวน <span className="text-meta-1">*</span>
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
                  ราคาต่อคัน <span className="text-meta-1">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.pricePerUnit}
                  onChange={(e) => handleChange('pricePerUnit', e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  สี Body
                </label>
                <select
                  value={formData.bodyColorId}
                  onChange={(e) => handleChange('bodyColorId', e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">เลือกสี Body</option>
                  {masterData.bodyColors?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  สี Seat
                </label>
                <select
                  value={formData.seatColorId}
                  onChange={(e) => handleChange('seatColorId', e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">เลือกสี Seat</option>
                  {masterData.seatColors?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  สี Canopy
                </label>
                <select
                  value={formData.canopyColorId}
                  onChange={(e) => handleChange('canopyColorId', e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">เลือกสี Canopy</option>
                  {masterData.canopyColors?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Option เพิ่มเติม
                </label>
                <textarea
                  rows={3}
                  value={formData.additionalOptions}
                  onChange={(e) => handleChange('additionalOptions', e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* สถานะ */}
        <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              สถานะ
            </h3>
          </div>
          <div className="p-6.5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Remark (สถานะเอกสาร)
                </label>
                <select
                  value={formData.statusJobDocumentId}
                  onChange={(e) => handleChange('statusJobDocumentId', e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">เลือกสถานะเอกสาร</option>
                  {masterData.statusJobDocuments?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Status (สถานะงาน)
                </label>
                <select
                  value={formData.statusJobId}
                  onChange={(e) => handleChange('statusJobId', e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">เลือกสถานะงาน</option>
                  {masterData.statusJobs?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* PO Section */}
        <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              PO Section
            </h3>
          </div>
          <div className="p-6.5">
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                ไฟล์ PO
              </label>
              {formData.poFileName ? (
                <div className="flex gap-3">
                  <div className="flex flex-1 items-center gap-3 rounded-lg border border-stroke bg-gray-2 px-5 py-3 dark:border-strokedark dark:bg-meta-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="flex-1 text-sm text-black dark:text-white">{getDisplayFileName(formData.poFileName)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleViewFile(formData.poFileName)}
                    className="inline-flex items-center gap-2 rounded-lg border border-stroke px-5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                    title="ดูไฟล์"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFile('po')}
                    disabled={uploadingFile === 'po'}
                    className="inline-flex items-center gap-2 rounded-lg border border-meta-1 px-5 py-3 text-meta-1 hover:bg-meta-1 hover:text-white disabled:opacity-50"
                    title="ลบไฟล์"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stroke px-5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4">
                    <Upload className="h-5 w-5" />
                    {uploadingFile === 'po' ? 'กำลังอัพโหลด...' : 'เปลี่ยนไฟล์'}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload('po', e)}
                      disabled={uploadingFile === 'po'}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-stroke bg-gray-2 p-6 hover:bg-gray dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-4">
                  <Upload className="h-8 w-8 text-body" />
                  <div className="text-center">
                    <span className="block text-base font-medium text-black dark:text-white">
                      {uploadingFile === 'po' ? 'กำลังอัพโหลด...' : 'คลิกเพื่ออัพโหลดไฟล์ PO'}
                    </span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload('po', e)}
                    disabled={uploadingFile === 'po'}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* IV (ใบกำกับภาษี) Section */}
        <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              IV (ใบกำกับภาษี) Section
            </h3>
          </div>
          <div className="p-6.5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  ไฟล์ใบกำกับภาษี
                </label>
                {formData.ivFileName ? (
                  <div className="flex gap-3">
                    <div className="flex flex-1 items-center gap-3 rounded-lg border border-stroke bg-gray-2 px-5 py-3 dark:border-strokedark dark:bg-meta-4">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="flex-1 text-sm text-black dark:text-white">{getDisplayFileName(formData.ivFileName)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleViewFile(formData.ivFileName)}
                      className="inline-flex items-center gap-2 rounded-lg border border-stroke px-5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                      title="ดูไฟล์"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile('iv')}
                      disabled={uploadingFile === 'iv'}
                      className="inline-flex items-center gap-2 rounded-lg border border-meta-1 px-5 py-3 text-meta-1 hover:bg-meta-1 hover:text-white disabled:opacity-50"
                      title="ลบไฟล์"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stroke px-5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4">
                      <Upload className="h-5 w-5" />
                      {uploadingFile === 'iv' ? 'กำลังอัพโหลด...' : 'เปลี่ยนไฟล์'}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload('iv', e)}
                        disabled={uploadingFile === 'iv'}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-stroke bg-gray-2 p-6 hover:bg-gray dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-4">
                    <Upload className="h-8 w-8 text-body" />
                    <div className="text-center">
                      <span className="block text-base font-medium text-black dark:text-white">
                        {uploadingFile === 'iv' ? 'กำลังอัพโหลด...' : 'คลิกเพื่ออัพโหลดไฟล์ใบกำกับภาษี'}
                      </span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload('iv', e)}
                      disabled={uploadingFile === 'iv'}
                    />
                  </label>
                )}
              </div>
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  วันที่ใบกำกับภาษี
                </label>
                <input
                  type="date"
                  value={formData.ivDate}
                  onChange={(e) => handleChange('ivDate', e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  ยอดใบกำกับภาษี
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.ivAmount}
                  onChange={(e) => handleChange('ivAmount', e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* IT Section */}
        <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              IT Section
            </h3>
          </div>
          <div className="p-6.5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  ไฟล์ IT
                </label>
                {formData.itFileName ? (
                  <div className="flex gap-3">
                    <div className="flex flex-1 items-center gap-3 rounded-lg border border-stroke bg-gray-2 px-5 py-3 dark:border-strokedark dark:bg-meta-4">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="flex-1 text-sm text-black dark:text-white">{getDisplayFileName(formData.itFileName)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleViewFile(formData.itFileName)}
                      className="inline-flex items-center gap-2 rounded-lg border border-stroke px-5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                      title="ดูไฟล์"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile('it')}
                      disabled={uploadingFile === 'it'}
                      className="inline-flex items-center gap-2 rounded-lg border border-meta-1 px-5 py-3 text-meta-1 hover:bg-meta-1 hover:text-white disabled:opacity-50"
                      title="ลบไฟล์"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stroke px-5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4">
                      <Upload className="h-5 w-5" />
                      {uploadingFile === 'it' ? 'กำลังอัพโหลด...' : 'เปลี่ยนไฟล์'}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload('it', e)}
                        disabled={uploadingFile === 'it'}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-stroke bg-gray-2 p-6 hover:bg-gray dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-4">
                    <Upload className="h-8 w-8 text-body" />
                    <div className="text-center">
                      <span className="block text-base font-medium text-black dark:text-white">
                        {uploadingFile === 'it' ? 'กำลังอัพโหลด...' : 'คลิกเพื่ออัพโหลดไฟล์ IT'}
                      </span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload('it', e)}
                      disabled={uploadingFile === 'it'}
                    />
                  </label>
                )}
              </div>
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  วันที่ IT
                </label>
                <input
                  type="date"
                  value={formData.itDate}
                  onChange={(e) => handleChange('itDate', e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  ยอด IT
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.itAmount}
                  onChange={(e) => handleChange('itAmount', e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* DV Section */}
        <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              DV Section
            </h3>
          </div>
          <div className="p-6.5">
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                ไฟล์ DV
              </label>
              {formData.dvFileName ? (
                <div className="flex gap-3">
                  <div className="flex flex-1 items-center gap-3 rounded-lg border border-stroke bg-gray-2 px-5 py-3 dark:border-strokedark dark:bg-meta-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="flex-1 text-sm text-black dark:text-white">{getDisplayFileName(formData.dvFileName)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleViewFile(formData.dvFileName)}
                    className="inline-flex items-center gap-2 rounded-lg border border-stroke px-5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                    title="ดูไฟล์"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFile('dv')}
                    disabled={uploadingFile === 'dv'}
                    className="inline-flex items-center gap-2 rounded-lg border border-meta-1 px-5 py-3 text-meta-1 hover:bg-meta-1 hover:text-white disabled:opacity-50"
                    title="ลบไฟล์"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stroke px-5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4">
                    <Upload className="h-5 w-5" />
                    {uploadingFile === 'dv' ? 'กำลังอัพโหลด...' : 'เปลี่ยนไฟล์'}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload('dv', e)}
                      disabled={uploadingFile === 'dv'}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-stroke bg-gray-2 p-6 hover:bg-gray dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-4">
                  <Upload className="h-8 w-8 text-body" />
                  <div className="text-center">
                    <span className="block text-base font-medium text-black dark:text-white">
                      {uploadingFile === 'dv' ? 'กำลังอัพโหลด...' : 'คลิกเพื่ออัพโหลดไฟล์ DV'}
                    </span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload('dv', e)}
                    disabled={uploadingFile === 'dv'}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ไฟล์ Job Order (PDF) - ไม่สามารถลบได้ */}
        {formData.jobPdfFileName && (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                ไฟล์ Job Order (PDF)
              </h3>
            </div>
            <div className="p-6.5">
              <div className="flex gap-3">
                <div className="flex flex-1 items-center gap-3 rounded-lg border border-stroke bg-gray-2 px-5 py-3 dark:border-strokedark dark:bg-meta-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="flex-1 text-sm text-black dark:text-white">
                    {getDisplayFileName(formData.jobPdfFileName)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleViewFile(formData.jobPdfFileName)}
                  className="inline-flex items-center gap-2 rounded-lg border border-stroke px-5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                  title="ดูไฟล์"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stroke px-5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4">
                  <Upload className="h-5 w-5" />
                  {uploadingFile === 'job' ? 'กำลังอัพโหลด...' : 'อัพโหลดใหม่'}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('job', e)}
                    disabled={uploadingFile === 'job'}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Submit and Delete Buttons */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="p-6.5">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
            </div>
          </div>
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="p-6.5">
              <button
                type="button"
                onClick={handleDeleteJobOrder}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-meta-1 p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5" />
                ลบ Job Order
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative h-[85vh] w-full max-w-6xl bg-white dark:bg-boxdark rounded-lg overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
              <h3 className="text-lg font-medium text-black dark:text-white">
                ดูตัวอย่างไฟล์
              </h3>
              <button
                onClick={closePreview}
                className="text-black hover:text-primary dark:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="h-[calc(85vh-140px)] w-full bg-gray-2 dark:bg-meta-4">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`}
                className="h-full w-full"
                title="File Preview"
              />
            </div>
            <div className="border-t border-stroke px-6 py-4 dark:border-strokedark flex justify-end gap-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-lg bg-success px-6 py-3 text-white hover:bg-opacity-90"
              >
                <Upload className="h-5 w-5 rotate-180" />
                ดาวน์โหลด
              </button>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white hover:bg-opacity-90"
              >
                <Eye className="h-5 w-5" />
                เปิดในแท็บใหม่
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
