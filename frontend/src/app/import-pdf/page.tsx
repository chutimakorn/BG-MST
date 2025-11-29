'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Upload, Save, X, AlertCircle } from 'lucide-react'

export default function ImportPdfPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [rawText, setRawText] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<any>({})

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.match(/\.pdf$/i)) {
      setError('กรุณาเลือกไฟล์ PDF เท่านั้น')
      return
    }

    setFile(selectedFile)
    setError('')
    setExtractedData(null)
    setRawText('')

    await handleParsePdf(selectedFile)
  }

  const handleParsePdf = async (pdfFile: File) => {
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', pdfFile)

      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/import/pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        let errorMessage = 'ไม่สามารถอ่านไฟล์ PDF ได้'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setExtractedData(data.extracted)
      setRawText(data.rawText)
      
      // คำนวณยอดรวมจากข้อมูลที่ได้
      const quantity = parseFloat(data.extracted.quantity) || 1
      const pricePerUnit = parseFloat(data.extracted.pricePerUnit) || 0
      const calculatedTotal = quantity * pricePerUnit
      
      setFormData({
        quotationNumber: data.extracted.quotationNumber || '',
        customerName: data.extracted.customerName || '',
        submissionDate: data.extracted.submissionDate || '',
        deliveryDate: data.extracted.deliveryDate || '',
        deliveryPlace: data.extracted.deliveryPlace || '',
        carModel: data.extracted.carModel || '',
        quantity: quantity,
        bodyColor: data.extracted.bodyColor || '',
        seatColor: data.extracted.seatColor || '',
        canopyColor: data.extracted.canopyColor || '',
        pricePerUnit: pricePerUnit,
        grandTotal: calculatedTotal,
        additionalOptions: data.extracted.additionalOptions?.join('\n') || '',
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const updated = { ...prev, [field]: value }
      
      // คำนวณยอดรวมอัตโนมัติเมื่อเปลี่ยนจำนวนหรือราคาต่อคัน
      if (field === 'quantity' || field === 'pricePerUnit') {
        const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(prev.quantity) || 0
        const pricePerUnit = field === 'pricePerUnit' ? parseFloat(value) || 0 : parseFloat(prev.pricePerUnit) || 0
        updated.grandTotal = quantity * pricePerUnit
      }
      
      return updated
    })
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const jobOrderData = {
        quotationNumber: formData.quotationNumber,
        customerName: formData.customerName,
        submissionDate: formData.submissionDate,
        deliveryDate: formData.deliveryDate,
        deliveryPlace: formData.deliveryPlace,
        carModel: formData.carModel,
        quantity: parseInt(formData.quantity) || 1,
        pricePerUnit: parseFloat(formData.pricePerUnit) || 0,
        bodyColor: formData.bodyColor,
        seatColor: formData.seatColor,
        canopyColor: formData.canopyColor,
        additionalOptions: formData.additionalOptions,
      }

      // Create FormData to send both JSON data and file
      const formDataToSend = new FormData()
      formDataToSend.append('data', JSON.stringify(jobOrderData))
      if (file) {
        formDataToSend.append('file', file)
      }

      const response = await fetch('http://localhost:3001/import/pdf/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formDataToSend
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'ไม่สามารถบันทึกข้อมูลได้')
      }

      const result = await response.json()
      if (result.success) {
        alert('บันทึก Job Order สำเร็จ!')
        router.push('/job-orders')
      } else {
        throw new Error(result.message)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Import จาก PDF
        </h2>
      </div>

      <div className="flex flex-col gap-6">
        {/* Upload Section */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              เลือกไฟล์ PDF (Job Order)
            </h3>
          </div>
          <div className="p-6.5">
            <div className="mb-4">
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stroke bg-gray-2 p-12 hover:bg-gray dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-4"
                >
                  <Upload className="mb-4 h-12 w-12 text-body" />
                  <span className="mb-2 text-base font-medium text-black dark:text-white">
                    คลิกเพื่อเลือกไฟล์ PDF
                  </span>
                  <span className="text-sm text-body">
                    รองรับไฟล์ .pdf เท่านั้น
                  </span>
                </label>
              </div>
            </div>

            {file && (
              <div className="mb-4 flex items-center justify-between rounded-lg border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-meta-1" />
                  <div>
                    <p className="font-medium text-black dark:text-white">{file.name}</p>
                    <p className="text-sm text-body">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-meta-1 bg-meta-1 bg-opacity-10 p-4">
                <AlertCircle className="h-5 w-5 text-meta-1" />
                <p className="text-sm text-meta-1">{error}</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                <p className="mt-4 text-black dark:text-white">กำลังอ่านไฟล์ PDF...</p>
              </div>
            )}
          </div>
        </div>

        {/* Extracted Data Form */}
        {extractedData && !loading && (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                ข้อมูลที่ดึงจาก PDF
              </h3>
            </div>
            <div className="p-6.5">
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-success bg-success bg-opacity-10 p-4">
                <svg className="h-5 w-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-success">
                  อ่านไฟล์ PDF สำเร็จ กรุณาตรวจสอบและแก้ไขข้อมูลก่อนบันทึก
                </p>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    เลขที่ใบเสนอราคา <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.quotationNumber}
                    onChange={(e) => handleInputChange('quotationNumber', e.target.value)}
                    placeholder="SAHO68-168000095"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    ชื่อลูกค้า <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="คุณ..."
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    วันที่ส่งใบเสนอ
                  </label>
                  <input
                    type="date"
                    value={formData.submissionDate}
                    onChange={(e) => handleInputChange('submissionDate', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    วันส่งรถ
                  </label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    สถานที่ส่ง
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryPlace}
                    onChange={(e) => handleInputChange('deliveryPlace', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    รุ่นรถ
                  </label>
                  <input
                    type="text"
                    value={formData.carModel}
                    onChange={(e) => handleInputChange('carModel', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    จำนวน
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    ราคาต่อคัน
                  </label>
                  <input
                    type="number"
                    value={formData.pricePerUnit}
                    onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    สี Body
                  </label>
                  <input
                    type="text"
                    value={formData.bodyColor}
                    onChange={(e) => handleInputChange('bodyColor', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    สี Seat
                  </label>
                  <input
                    type="text"
                    value={formData.seatColor}
                    onChange={(e) => handleInputChange('seatColor', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    สี Canopy
                  </label>
                  <input
                    type="text"
                    value={formData.canopyColor}
                    onChange={(e) => handleInputChange('canopyColor', e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    ยอดรวม
                  </label>
                  <input
                    type="number"
                    value={formData.grandTotal}
                    onChange={(e) => handleInputChange('grandTotal', e.target.value)}
                    disabled
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-whiter px-5 py-3 text-black outline-none transition disabled:cursor-default dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Options เพิ่มเติม
                </label>
                <textarea
                  value={formData.additionalOptions}
                  onChange={(e) => handleInputChange('additionalOptions', e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setExtractedData(null)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-stroke px-6 py-3 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  <X className="h-5 w-5" />
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Raw Text Preview */}
        {rawText && (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                ข้อความที่อ่านได้จาก PDF (สำหรับตรวจสอบ)
              </h3>
            </div>
            <div className="p-6.5">
              <pre className="max-h-64 overflow-auto rounded-lg bg-gray-2 p-4 text-xs text-black dark:bg-meta-4 dark:text-white">
                {rawText}
              </pre>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
