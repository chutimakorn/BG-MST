'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Record {
  rowNumber: number
  rawData: any
  mappedData: any
  status: 'pending' | 'approved' | 'rejected'
}

interface ColumnMapping {
  excelColumn: string
  systemField: string
  required: boolean
}

const SYSTEM_FIELDS = [
  { value: 'quotationNumber', label: 'เลขที่ใบเสนอราคา', required: true },
  { value: 'customerName', label: 'ชื่อลูกค้า', required: true },
  { value: 'submissionDate', label: 'วันที่ส่งใบเสนอ', required: false },
  { value: 'customerGroup', label: 'กลุ่มลูกค้า', required: false },
  { value: 'saleMemberName', label: 'ผู้ขาย', required: false },
  { value: 'customerCode', label: 'รหัสลูกค้า', required: false },
  { value: 'categoryName', label: 'Category', required: false },
  { value: 'carName', label: 'รุ่นรถ', required: false },
  { value: 'bodyColor', label: 'สี Body', required: false },
  { value: 'seatColor', label: 'สี Seat', required: false },
  { value: 'canopyColor', label: 'สี Canopy', required: false },
  { value: 'additionalOptions', label: 'Option เพิ่มเติม', required: false },
  { value: 'quantity', label: 'จำนวนคัน', required: false },
  { value: 'pricePerUnit', label: 'ราคาต่อคัน', required: false },
  { value: 'salesNote', label: 'หมายเหตุ', required: false },
  { value: 'provinceName', label: 'จังหวัด', required: false },
  { value: 'transportTrips', label: 'จำนวนเที่ยวขนส่ง', required: false },
  { value: 'pricePerTrip', label: 'ราคาต่อเที่ยว', required: false },
  { value: 'statusSaleName', label: 'สถานะการขาย', required: false },
  { value: 'statusJobName', label: 'สถานะงาน', required: false },
  { value: 'deliveryDate', label: 'วันส่งรถ', required: false },
  { value: 'location', label: 'Location', required: false },
  { value: 'coordinatorContact', label: 'ผู้ติดต่อประสานงาน', required: false },
  { value: 'vehicleRecipient', label: 'ผู้ติดต่อรับรถ', required: false },
]

export default function ImportPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [preview, setPreview] = useState<any>(null)
  const [records, setRecords] = useState<Record[]>([])
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'upload' | 'sheet' | 'mapping' | 'preview' | 'result'>('upload')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError('')
    setPreview(null)
    setResult(null)
    setRecords([])

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/import/sheets', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'ไม่สามารถอ่านไฟล์ได้')
      }

      const data = await response.json()
      setAvailableSheets(data.sheets)
      setSelectedSheet(data.sheets[0])
      setStep('sheet')
    } catch (err: any) {
      setError(err.message)
      setFile(null)
    }
  }

  const handleSheetSelect = async () => {
    if (!file || !selectedSheet) return
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/import/preview?sheetName=${encodeURIComponent(selectedSheet)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'ไม่สามารถอ่านไฟล์ได้')
      }

      const data = await response.json()
      setPreview(data)
      
      // โหลด saved mappings จาก localStorage
      const savedMappings = loadSavedMappings()
      
      // สร้าง column mappings โดยใช้ saved mappings ถ้ามี
      const mappings: ColumnMapping[] = data.columns.map((col: string) => {
        const savedMapping = savedMappings[col]
        return {
          excelColumn: col,
          systemField: savedMapping || autoMapColumn(col),
          required: false
        }
      })
      setColumnMappings(mappings)
      setStep('mapping')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const loadSavedMappings = (): { [key: string]: string } => {
    try {
      const saved = localStorage.getItem('columnMappings')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }

  const saveMappings = (mappings: ColumnMapping[]) => {
    try {
      const mappingObj: { [key: string]: string } = {}
      mappings.forEach(m => {
        if (m.systemField) {
          mappingObj[m.excelColumn] = m.systemField
        }
      })
      localStorage.setItem('columnMappings', JSON.stringify(mappingObj))
    } catch (error) {
      console.error('Failed to save mappings:', error)
    }
  }

  const autoMapColumn = (excelColumn: string): string => {
    const col = excelColumn.toLowerCase().trim()
    
    // เลขที่
    if (col.includes('เลขที่') || col.includes('quotation') || col.includes('job no') || col === 'no.' || col === 'no') return 'quotationNumber'
    
    // ชื่อลูกค้า - เพิ่มกรณีสะกดผิด
    if (col.includes('ลูกค้า') || col.includes('customer') || col.includes('cutomer') || col.includes('custmer') || 
        col.includes('บริษัท') || col.includes('company') || col.includes('client')) return 'customerName'
    
    // วันที่
    if (col.includes('วันที่') || col.includes('date') || col.includes('job date')) return 'submissionDate'
    
    // กลุ่ม
    if (col.includes('กลุ่ม') || col.includes('group')) return 'customerGroup'
    
    // ผู้ขาย - ระวัง "Sale" อาจเป็นชื่อลูกค้าได้
    if (col.includes('ผู้ขาย') || col === 'sale' || col === 'sales' || col.includes('salesperson')) return 'saleMemberName'
    
    // รหัส
    if (col.includes('รหัส') || col.includes('code')) return 'customerCode'
    
    // Category
    if (col.includes('category') || col.includes('ประเภท')) return 'categoryName'
    
    // รุ่นรถ
    if (col.includes('รุ่น') || col === 'model' || col.includes('รถ') || col.includes('car')) return 'carName'
    
    // สี
    if (col.includes('body') || col.includes('ตัวรถ')) return 'bodyColor'
    if (col.includes('seat') || col.includes('เบาะ')) return 'seatColor'
    if (col.includes('canopy') || col.includes('หลังคา')) return 'canopyColor'
    if (col === 'color' || col === 'colour') return 'bodyColor'
    
    // Option
    if (col.includes('option') || col.includes('ออฟชั่น') || col.includes('special')) return 'additionalOptions'
    
    // จำนวน
    if (col.includes('จำนวน') || col === 'qty' || col === 'unit' || col === 'quantity') return 'quantity'
    
    // ราคา
    if (col.includes('ราคา') || col.includes('price') || col.includes('amount')) return 'pricePerUnit'
    
    // หมายเหตุ
    if (col.includes('หมายเหตุ') || col.includes('remark') || col.includes('note')) return 'salesNote'
    
    // จังหวัด
    if (col.includes('จังหวัด') || col.includes('province')) return 'provinceName'
    
    // เที่ยว
    if (col.includes('เที่ยว') || col.includes('trip')) return 'transportTrips'
    
    // สถานะ
    if (col.includes('สถานะ') || col === 'status' || col === 'state') return 'statusSaleName'
    
    // วันส่งรถ
    if (col.includes('ส่งรถ') || col.includes('delivery')) return 'deliveryDate'
    
    // Location
    if (col === 'location' || col.includes('สถานที่') || col.includes('ที่ตั้ง') || col.includes('พื้นที่')) return 'location'
    
    // ผู้ติดต่อประสานงาน
    if (col.includes('ประสานงาน') || col.includes('coordinator') || col.includes('contact person')) return 'coordinatorContact'
    
    // ผู้ติดต่อรับรถ
    if (col.includes('รับรถ') || col.includes('recipient') || col.includes('receiver')) return 'vehicleRecipient'
    
    return ''
  }

  const handleMappingChange = (excelColumn: string, systemField: string) => {
    setColumnMappings(mappings =>
      mappings.map(m =>
        m.excelColumn === excelColumn ? { ...m, systemField } : m
      )
    )
  }

  const handleConfirmMapping = () => {
    // ตรวจสอบว่ามี required fields ครบหรือไม่
    const hasCustomerName = columnMappings.some(m => m.systemField === 'customerName')
    
    if (!hasCustomerName) {
      setError('⚠️ กรุณา map column "ชื่อลูกค้า" (จำเป็น) - ลองเลือก column ที่มีชื่อบริษัทหรือชื่อลูกค้า')
      return
    }

    // บันทึก mappings ลง localStorage
    saveMappings(columnMappings)

    // สร้าง records จาก preview data โดยใช้ custom mapping
    const records = preview.records.map((record: any) => {
      const mappedData: any = {}
      
      columnMappings.forEach(mapping => {
        if (mapping.systemField) {
          const value = record.rawData[mapping.excelColumn]
          // แปลงค่าตัวเลขถ้าเป็นฟิลด์ที่ต้องการตัวเลข
          if (['quantity', 'pricePerUnit', 'transportTrips', 'pricePerTrip'].includes(mapping.systemField)) {
            mappedData[mapping.systemField] = parseFloat(String(value || 0).replace(/,/g, '')) || 0
          } else {
            mappedData[mapping.systemField] = value
          }
        }
      })

      return {
        ...record,
        mappedData
      }
    })

    setRecords(records)
    setError('')
    setStep('preview')
  }

  const handleClearSavedMappings = () => {
    try {
      localStorage.removeItem('columnMappings')
      // รีเซ็ต mappings เป็น auto-map
      const mappings: ColumnMapping[] = columnMappings.map(m => ({
        ...m,
        systemField: autoMapColumn(m.excelColumn)
      }))
      setColumnMappings(mappings)
      alert('ล้างการบันทึก mapping สำเร็จ')
    } catch (error) {
      console.error('Failed to clear mappings:', error)
    }
  }

  const handleApproveAll = () => {
    setRecords(records.map(r => ({ ...r, status: 'approved' })))
  }

  const handleRejectAll = () => {
    setRecords(records.map(r => ({ ...r, status: 'rejected' })))
  }

  const handleToggleRecord = (rowNumber: number) => {
    setRecords(records.map(r => 
      r.rowNumber === rowNumber 
        ? { ...r, status: r.status === 'approved' ? 'rejected' : 'approved' }
        : r
    ))
  }

  const handleImport = async () => {
    const approvedRecords = records.filter(r => r.status === 'approved')
    
    if (approvedRecords.length === 0) {
      setError('กรุณาเลือกอย่างน้อย 1 record เพื่อ import')
      return
    }

    setImporting(true)
    setError('')
    setResult(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/import/import-selected', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: approvedRecords,
          fileType: preview.fileType,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'การ import ล้มเหลว')
      }

      const data = await response.json()
      setResult(data)
      setStep('result')
      
      if (data.success > 0 && data.failed === 0) {
        setTimeout(() => {
          router.push('/quotations')
        }, 5000)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setImporting(false)
    }
  }

  const handleReset = () => {
    setStep('upload')
    setFile(null)
    setPreview(null)
    setRecords([])
    setResult(null)
    setAvailableSheets([])
    setColumnMappings([])
    setError('')
  }

  const approvedCount = records.filter(r => r.status === 'approved').length
  const rejectedCount = records.filter(r => r.status === 'rejected').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import ข้อมูลจาก Excel</h1>
        <p className="text-muted-foreground mt-1">นำเข้าข้อมูลใบเสนอราคาจากไฟล์ Excel</p>
      </div>

      <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs md:text-sm">
            <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
              <span className="hidden md:inline">อัพโหลด</span>
            </div>
            <div className="w-8 md:w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step === 'sheet' ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'sheet' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
              <span className="hidden md:inline">Sheet</span>
            </div>
            <div className="w-8 md:w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step === 'mapping' ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'mapping' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
              <span className="hidden md:inline">Mapping</span>
            </div>
            <div className="w-8 md:w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>4</div>
              <span className="hidden md:inline">ตรวจสอบ</span>
            </div>
            <div className="w-8 md:w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step === 'result' ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'result' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>5</div>
              <span className="hidden md:inline">ผลลัพธ์</span>
            </div>
          </div>

          {/* Upload Section */}
          {step === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle>เลือกไฟล์ Excel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer inline-flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-gray-600">คลิกเพื่อเลือกไฟล์ Excel (.xlsx, .xls)</span>
                    </label>
                  </div>
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sheet Selection */}
          {step === 'sheet' && (
            <Card>
              <CardHeader>
                <CardTitle>เลือก Sheet ที่ต้องการ Import</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-md">
                    <p className="text-sm text-gray-600 mb-2">ไฟล์: <span className="font-medium">{file?.name}</span></p>
                    <p className="text-sm text-gray-600">พบ {availableSheets.length} sheets</p>
                  </div>

                  <div className="space-y-2">
                    {availableSheets.map((sheet, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedSheet(sheet)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedSheet === sheet ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedSheet === sheet ? 'border-blue-500' : 'border-gray-300'
                            }`}>
                              {selectedSheet === sheet && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                            </div>
                            <span className="font-medium">{sheet}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={handleReset} className="flex-1">ย้อนกลับ</Button>
                    <Button onClick={handleSheetSelect} disabled={!selectedSheet} className="flex-1">ถัดไป</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Column Mapping */}
          {step === 'mapping' && preview && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Mapping Column จาก Excel กับฟิลด์ในระบบ</CardTitle>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleClearSavedMappings}
                    className="text-xs"
                  >
                    🔄 รีเซ็ต Mapping
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-md">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Sheet:</span> {preview.sheetName} | 
                      <span className="font-medium ml-2">จำนวนแถว:</span> {preview.totalRows} |
                      <span className="font-medium ml-2">Column ทั้งหมด:</span> {columnMappings.length}
                    </p>
                    <p className="text-xs text-blue-700 mb-2">
                      💡 ระบบจะจำ mapping ที่คุณเลือกไว้สำหรับครั้งถัดไป
                    </p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-green-700">
                        ✓ Mapped: {columnMappings.filter(m => m.systemField).length}
                      </span>
                      <span className="text-gray-600">
                        ○ ไม่ใช้: {columnMappings.filter(m => !m.systemField).length}
                      </span>
                      <span className={columnMappings.some(m => m.systemField === 'customerName') ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                        {columnMappings.some(m => m.systemField === 'customerName') ? '✓' : '✗'} ชื่อลูกค้า (จำเป็น)
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b grid grid-cols-3 gap-4 font-medium text-sm">
                      <div>Column ใน Excel</div>
                      <div>ตัวอย่างข้อมูล</div>
                      <div>ฟิลด์ในระบบ</div>
                    </div>
                    <div className="divide-y max-h-96 overflow-y-auto">
                      {columnMappings.map((mapping, idx) => (
                        <div key={idx} className="px-4 py-3 grid grid-cols-3 gap-4 items-center hover:bg-gray-50">
                          <div className="font-medium text-sm">{mapping.excelColumn}</div>
                          <div className="text-xs text-gray-600 truncate">
                            {preview.records[0]?.rawData[mapping.excelColumn] || '-'}
                          </div>
                          <div>
                            <select
                              value={mapping.systemField}
                              onChange={(e) => handleMappingChange(mapping.excelColumn, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">-- ไม่ใช้ --</option>
                              {SYSTEM_FIELDS.map(field => (
                                <option key={field.value} value={field.value}>
                                  {field.label} {field.required ? '(จำเป็น)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm font-medium text-yellow-800 mb-2">💡 คำแนะนำ:</p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• <span className="font-medium">ชื่อลูกค้า</span> - จำเป็นต้องมี (ลองหา column ที่มีชื่อบริษัท/ลูกค้า)</li>
                      <li>• <span className="font-medium">เลขที่ใบเสนอราคา</span> - ถ้าไม่มีจะสร้างอัตโนมัติ</li>
                      <li>• Column ที่ไม่ต้องการใช้ สามารถเลือก "-- ไม่ใช้ --" ได้</li>
                      <li>• ถ้า column ชื่อ "Sale" หรือ "Model" มีข้อมูลลูกค้า ให้ map เป็น "ชื่อลูกค้า"</li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep('sheet')} className="flex-1">ย้อนกลับ</Button>
                    <Button onClick={handleConfirmMapping} className="flex-1">ยืนยัน Mapping</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Section */}
          {step === 'preview' && preview && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>ตรวจสอบข้อมูล</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleRejectAll}>ยกเลิกทั้งหมด</Button>
                      <Button size="sm" onClick={handleApproveAll}>เลือกทั้งหมด</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-gray-600">Sheet</p>
                        <p className="font-medium">{preview.sheetName}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-md">
                        <p className="text-sm text-gray-600">เลือกแล้ว</p>
                        <p className="font-medium text-green-600">{approvedCount} แถว</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-md">
                        <p className="text-sm text-gray-600">ยกเลิก</p>
                        <p className="font-medium text-red-600">{rejectedCount} แถว</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-md">
                        <p className="text-sm text-gray-600">ทั้งหมด</p>
                        <p className="font-medium">{records.length} แถว</p>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {records.map((record) => (
                  <Card
                    key={record.rowNumber}
                    className={`transition-all ${
                      record.status === 'approved' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white opacity-60'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={record.status === 'approved'}
                            onChange={() => handleToggleRecord(record.rowNumber)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium text-gray-500">แถวที่ {record.rowNumber}</span>
                            {record.status === 'approved' && (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">✓ เลือกแล้ว</span>
                            )}
                            {!record.mappedData.quotationNumber && (
                              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">⚠ ไม่มีเลขที่</span>
                            )}
                            {!record.mappedData.customerName && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">⚠ ไม่มีชื่อลูกค้า</span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">เลขที่:</span>
                              <span className={`ml-2 font-medium ${!record.mappedData.quotationNumber ? 'text-yellow-600' : ''}`}>
                                {record.mappedData.quotationNumber || '(จะสร้างอัตโนมัติ)'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">ลูกค้า:</span>
                              <span className={`ml-2 font-medium ${!record.mappedData.customerName ? 'text-red-600' : ''}`}>
                                {record.mappedData.customerName || '(ไม่พบข้อมูล)'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">รุ่นรถ:</span>
                              <span className="ml-2">{record.mappedData.carName || '-'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">จำนวน:</span>
                              <span className="ml-2">{record.mappedData.quantity || 0} คัน</span>
                            </div>
                            <div>
                              <span className="text-gray-500">ราคา:</span>
                              <span className="ml-2">฿{(record.mappedData.pricePerUnit || 0).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">ผู้ขาย:</span>
                              <span className="ml-2">{record.mappedData.saleMemberName || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep('mapping')} className="flex-1">ย้อนกลับ</Button>
                    <Button onClick={handleImport} disabled={importing || approvedCount === 0} className="flex-1">
                      {importing ? 'กำลัง Import...' : `Import ${approvedCount} รายการ`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Result Section */}
          {step === 'result' && result && (
            <Card>
              <CardHeader>
                <CardTitle>ผลการ Import</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-gray-600">สำเร็จ</p>
                      <p className="text-2xl font-bold text-green-600">{result.success}</p>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-gray-600">ล้มเหลว</p>
                      <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                      <p className="text-sm text-gray-600">ข้าม</p>
                      <p className="text-2xl font-bold text-gray-600">{result.skipped || 0}</p>
                    </div>
                  </div>

                  {result.success > 0 && result.failed === 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm font-medium text-green-800 mb-2">
                        ✓ Import สำเร็จทั้งหมด {result.success} รายการ
                      </p>
                      <p className="text-xs text-green-700 mb-2">กำลังนำคุณไปยังหน้ารายการใบเสนอราคาใน 5 วินาที...</p>
                      <Link href="/quotations">
                        <Button size="sm">ไปที่หน้ารายการเลย</Button>
                      </Link>
                    </div>
                  )}

                  {result.errors && result.errors.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-red-600">รายการที่ล้มเหลว:</p>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {result.errors.map((err: any, idx: number) => (
                          <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                            <p className="font-medium text-red-800">แถวที่ {err.rowNumber}</p>
                            <p className="text-red-700">{err.error}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.imported && result.imported.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-green-600">รายการที่ Import สำเร็จ:</p>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {result.imported.map((item: any, idx: number) => (
                          <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                            <p className="font-medium">{item.quotationNumber}</p>
                            <p className="text-gray-600">{item.customerName}</p>
                            <p className="text-green-700">฿{item.grandTotal?.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={handleReset}>Import ไฟล์ใหม่</Button>
                    <Link href="/quotations" className="flex-1">
                      <Button className="w-full">ไปที่หน้ารายการ</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
    </div>
  )
}
