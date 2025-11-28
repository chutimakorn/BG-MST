'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

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

    // อ่าน PDF อัตโนมัติ
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
      
      // ตั้งค่า form data จากข้อมูลที่ดึงได้
      setFormData({
        quotationNumber: data.extracted.quotationNumber || '',
        customerName: data.extracted.customerName || '',
        submissionDate: data.extracted.submissionDate || '',
        deliveryDate: data.extracted.deliveryDate || '',
        deliveryPlace: data.extracted.deliveryPlace || '',
        carModel: data.extracted.carModel || '',
        quantity: data.extracted.quantity || 1,
        bodyColor: data.extracted.bodyColor || '',
        seatColor: data.extracted.seatColor || '',
        canopyColor: data.extracted.canopyColor || '',
        pricePerUnit: data.extracted.pricePerUnit || 0,
        grandTotal: data.extracted.grandTotal || 0,
        additionalOptions: data.extracted.additionalOptions?.join('\n') || '',
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
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

      const response = await fetch('http://localhost:3001/import/pdf/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobOrderData)
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import จาก PDF</h1>
        <p className="text-muted-foreground mt-1">อ่านและนำเข้าข้อมูลจาก Job Order PDF</p>
      </div>

      <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>เลือกไฟล์ PDF (Job Order)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer inline-flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">คลิกเพื่อเลือกไฟล์ PDF</span>
                  </label>
                </div>

                {file && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {loading && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">กำลังอ่านไฟล์ PDF...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Extracted Data Form */}
          {extractedData && !loading && (
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลที่ดึงจาก PDF</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4">
                    <p className="text-sm text-green-800">
                      ✓ อ่านไฟล์ PDF สำเร็จ กรุณาตรวจสอบและแก้ไขข้อมูลก่อนบันทึก
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">เลขที่ใบเสนอราคา *</label>
                      <Input
                        value={formData.quotationNumber}
                        onChange={(e) => handleInputChange('quotationNumber', e.target.value)}
                        placeholder="SAHO68-168000095"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">ชื่อลูกค้า *</label>
                      <Input
                        value={formData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        placeholder="คุณ..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">วันที่ส่งใบเสนอ</label>
                      <Input
                        type="date"
                        value={formData.submissionDate}
                        onChange={(e) => handleInputChange('submissionDate', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">วันส่งรถ</label>
                      <Input
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">สถานที่ส่ง</label>
                      <Input
                        value={formData.deliveryPlace}
                        onChange={(e) => handleInputChange('deliveryPlace', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">รุ่นรถ</label>
                      <Input
                        value={formData.carModel}
                        onChange={(e) => handleInputChange('carModel', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">จำนวน</label>
                      <Input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">ราคาต่อคัน</label>
                      <Input
                        type="number"
                        value={formData.pricePerUnit}
                        onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">สี Body</label>
                      <Input
                        value={formData.bodyColor}
                        onChange={(e) => handleInputChange('bodyColor', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">สี Seat</label>
                      <Input
                        value={formData.seatColor}
                        onChange={(e) => handleInputChange('seatColor', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">สี Canopy</label>
                      <Input
                        value={formData.canopyColor}
                        onChange={(e) => handleInputChange('canopyColor', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">ยอดรวม</label>
                      <Input
                        type="number"
                        value={formData.grandTotal}
                        onChange={(e) => handleInputChange('grandTotal', e.target.value)}
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Options เพิ่มเติม</label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.additionalOptions}
                      onChange={(e) => handleInputChange('additionalOptions', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={() => setExtractedData(null)} className="flex-1">
                      ยกเลิก
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="flex-1">
                      {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Text Preview */}
          {rawText && (
            <Card>
              <CardHeader>
                <CardTitle>ข้อความที่อ่านได้จาก PDF (สำหรับตรวจสอบ)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded-md overflow-auto max-h-64">
                  {rawText}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
    </div>
  )
}
