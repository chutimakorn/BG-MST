'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { showSuccess } from '@/lib/toast-helper'
import { apiFetch } from '@/lib/api-config'

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
  { value: 'requestDate', label: 'วันที่ได้รับต้องการ', required: false },
  { value: 'submissionDate', label: 'วันที่ส่งใบเสนอ', required: false },
  { value: 'customerGroup', label: 'G/NG', required: false },
  { value: 'customerGroupName', label: 'กลุ่มลูกค้า', required: false },
  { value: 'saleMemberName', label: 'ผู้ขาย/SALE', required: false },
  { value: 'customerCode', label: 'รหัสลูกค้า', required: false },
  { value: 'carName', label: 'รุ่นรถ', required: false },
  { value: 'additionalOptions', label: 'Option (เสนอเพิ่มเติม)', required: false },
  { value: 'quantity', label: 'จำนวน/คัน', required: false },
  { value: 'pricePerUnit', label: 'ราคาขาย รวม Vat', required: false },
  { value: 'provinceName', label: 'จังหวัดขนส่ง', required: false },
  { value: 'transportTrips', label: 'เที่ยวขนส่ง', required: false },
  { value: 'pricePerTrip', label: 'ราคา/เที่ยว', required: false },
  { value: 'paymentTerms', label: 'เงื่อนไขการชำระ', required: false },
  { value: 'contactName', label: 'ชื่อผู้ติดต่อ', required: false },
  { value: 'contactPhone', label: 'เบอร์ติดต่อ', required: false },
  { value: 'contactEmail', label: 'E-Mail', required: false },
  { value: 'stockStatus', label: 'สถานะเช็ครถในสต็อก', required: false },
  { value: 'customerNotification', label: 'แจ้ง/นัดหมายลูกค้า', required: false },
  { value: 'preDeliveryInspection', label: 'ผลตรวจเช็คก่อนส่งมอบ', required: false },
  { value: 'serialCode', label: 'Serial / Code', required: false },
  { value: 'remarkReason', label: 'หมายเหตุ / เหตุผล', required: false },
  { value: 'status', label: 'สถานะ', required: false },
  { value: 'postDeliveryNote', label: 'หมายเหตุ/สถานะหลังส่งมอบ', required: false },
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

  const autoMapColumn = (excelColumn: string): string => {
    const col = excelColumn.toLowerCase().trim()
    
    if (col.includes('เลขที่') || col.includes('quotation') || col.includes('job no') || col === 'no.' || col === 'no') return 'quotationNumber'
    if (col.includes('ลูกค้า') || col.includes('customer') || col.includes('cutomer') || col.includes('บริษัท') || col.includes('company')) return 'customerName'
    if (col.includes('ได้รับต้องการ') || col.includes('request date')) return 'requestDate'
    if (col.includes('วันที่ส่ง') || col.includes('submission') || col.includes('วันที่') || col.includes('date')) return 'submissionDate'
    if (col === 'g/ng' || col === 'gng') return 'customerGroup'
    if (col.includes('กลุ่มลูกค้า') || col.includes('customer group')) return 'customerGroupName'
    if (col.includes('ผู้ขาย') || col === 'sale' || col === 'sales') return 'saleMemberName'
    if (col.includes('รหัสลูกค้า') || col.includes('customer code')) return 'customerCode'
    if (col.includes('รุ่น') || col === 'model' || col.includes('รถ') || col.includes('car')) return 'carName'
    if (col.includes('option') || col.includes('ออฟชั่น') || col.includes('เพิ่มเติม')) return 'additionalOptions'
    if (col.includes('จำนวน') || col === 'qty' || col === 'quantity') return 'quantity'
    if (col.includes('ราคาขาย') || col.includes('ราคา') || col.includes('price') || col.includes('vat')) return 'pricePerUnit'
    if (col.includes('จังหวัด') || col.includes('province')) return 'provinceName'
    if (col.includes('เที่ยวขนส่ง') || col.includes('เที่ยว') || col.includes('trip')) return 'transportTrips'
    if (col.includes('ราคา/เที่ยว') || col.includes('ค่าขนส่ง')) return 'pricePerTrip'
    if (col.includes('เงื่อนไข') || col.includes('payment')) return 'paymentTerms'
    if (col.includes('ผู้ติดต่อ') || col.includes('contact name')) return 'contactName'
    if (col.includes('เบอร์') || col.includes('phone') || col.includes('tel')) return 'contactPhone'
    if (col.includes('email') || col.includes('e-mail') || col.includes('อีเมล')) return 'contactEmail'
    if (col.includes('สต็อก') || col.includes('stock')) return 'stockStatus'
    if (col.includes('นัดหมาย') || col.includes('แจ้ง')) return 'customerNotification'
    if (col.includes('ตรวจเช็ค') || col.includes('inspection')) return 'preDeliveryInspection'
    if (col.includes('serial') || col.includes('code')) return 'serialCode'
    if (col.includes('หมายเหตุ') && (col.includes('เหตุผล') || col.includes('reason'))) return 'remarkReason'
    if (col.includes('สถานะ') || col === 'status') return 'status'
    if (col.includes('หมายเหตุ') || col.includes('note') || col.includes('remark')) return 'postDeliveryNote'
    
    return ''
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

      const response = await apiFetch('/import/sheets', {
        method: 'POST',
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

      const response = await apiFetch(`/import/preview?sheetName=${encodeURIComponent(selectedSheet)}`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'ไม่สามารถอ่านไฟล์ได้')
      }

      const data = await response.json()
      setPreview(data)
      
      const savedMappings = loadSavedMappings()
      
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

  const handleMappingChange = (excelColumn: string, systemField: string) => {
    setColumnMappings(mappings =>
      mappings.map(m =>
        m.excelColumn === excelColumn ? { ...m, systemField } : m
      )
    )
  }

  const handleConfirmMapping = () => {
    const hasCustomerName = columnMappings.some(m => m.systemField === 'customerName')
    
    if (!hasCustomerName) {
      setError('⚠️ กรุณา map column "ชื่อลูกค้า" (จำเป็น)')
      return
    }

    saveMappings(columnMappings)

    const records = preview.records.map((record: any) => {
      const mappedData: any = {}
      
      columnMappings.forEach(mapping => {
        if (mapping.systemField) {
          const value = record.rawData[mapping.excelColumn]
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
      const mappings: ColumnMapping[] = columnMappings.map(m => ({
        ...m,
        systemField: autoMapColumn(m.excelColumn)
      }))
      setColumnMappings(mappings)
      showSuccess('ล้างการบันทึก mapping สำเร็จ')
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
      const response = await apiFetch('/import/import-selected', {
        method: 'POST',
        headers: {
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
        }, 3000)
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
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Import ข้อมูลจาก Excel
        </h2>
      </div>

      <div className="flex flex-col gap-6">
        {/* Step Indicator */}
        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-center gap-2">
            <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-primary' : 'text-body'}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step === 'upload' ? 'bg-primary text-white' : 'bg-gray-2 dark:bg-meta-4'}`}>
                1
              </div>
              <span className="hidden font-medium md:inline">อัพโหลด</span>
            </div>
            <div className="h-0.5 w-12 bg-stroke dark:bg-strokedark"></div>
            <div className={`flex items-center gap-2 ${step === 'sheet' ? 'text-primary' : 'text-body'}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step === 'sheet' ? 'bg-primary text-white' : 'bg-gray-2 dark:bg-meta-4'}`}>
                2
              </div>
              <span className="hidden font-medium md:inline">Sheet</span>
            </div>
            <div className="h-0.5 w-12 bg-stroke dark:bg-strokedark"></div>
            <div className={`flex items-center gap-2 ${step === 'mapping' ? 'text-primary' : 'text-body'}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step === 'mapping' ? 'bg-primary text-white' : 'bg-gray-2 dark:bg-meta-4'}`}>
                3
              </div>
              <span className="hidden font-medium md:inline">Mapping</span>
            </div>
            <div className="h-0.5 w-12 bg-stroke dark:bg-strokedark"></div>
            <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-primary' : 'text-body'}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step === 'preview' ? 'bg-primary text-white' : 'bg-gray-2 dark:bg-meta-4'}`}>
                4
              </div>
              <span className="hidden font-medium md:inline">ตรวจสอบ</span>
            </div>
            <div className="h-0.5 w-12 bg-stroke dark:bg-strokedark"></div>
            <div className={`flex items-center gap-2 ${step === 'result' ? 'text-primary' : 'text-body'}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step === 'result' ? 'bg-primary text-white' : 'bg-gray-2 dark:bg-meta-4'}`}>
                5
              </div>
              <span className="hidden font-medium md:inline">ผลลัพธ์</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {step === 'upload' && (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                เลือกไฟล์ Excel
              </h3>
            </div>
            <div className="p-6.5">
              <div className="mb-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stroke bg-gray-2 p-12 hover:bg-gray dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-4"
                >
                  <Upload className="mb-4 h-12 w-12 text-body" />
                  <span className="mb-2 text-base font-medium text-black dark:text-white">
                    คลิกเพื่อเลือกไฟล์ Excel
                  </span>
                  <span className="text-sm text-body">
                    รองรับไฟล์ .xlsx, .xls
                  </span>
                </label>
              </div>
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-meta-1 bg-meta-1 bg-opacity-10 p-4">
                  <AlertCircle className="h-5 w-5 text-meta-1" />
                  <p className="text-sm text-meta-1">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sheet Selection */}
        {step === 'sheet' && (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                เลือก Sheet ที่ต้องการ Import
              </h3>
            </div>
            <div className="p-6.5">
              <div className="mb-6 rounded-lg border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <p className="mb-2 text-sm text-body">
                  <span className="font-medium text-black dark:text-white">ไฟล์:</span> {file?.name}
                </p>
                <p className="text-sm text-body">
                  <span className="font-medium text-black dark:text-white">พบ:</span> {availableSheets.length} sheets
                </p>
              </div>

              <div className="mb-6 space-y-3">
                {availableSheets.map((sheet, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedSheet(sheet)}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      selectedSheet === sheet 
                        ? 'border-primary bg-primary bg-opacity-10' 
                        : 'border-stroke hover:border-primary dark:border-strokedark'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          selectedSheet === sheet ? 'border-primary' : 'border-stroke dark:border-strokedark'
                        }`}>
                          {selectedSheet === sheet && <div className="h-3 w-3 rounded-full bg-primary"></div>}
                        </div>
                        <span className="font-medium text-black dark:text-white">{sheet}</span>
                      </div>
                      <FileSpreadsheet className="h-5 w-5 text-body" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex flex-1 items-center justify-center rounded-lg border border-stroke px-6 py-3 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={handleSheetSelect}
                  disabled={!selectedSheet}
                  className="flex flex-1 items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Column Mapping */}
        {step === 'mapping' && preview && (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-black dark:text-white">
                  Mapping Column จาก Excel กับฟิลด์ในระบบ
                </h3>
                <button
                  onClick={handleClearSavedMappings}
                  className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                >
                  🔄 รีเซ็ต Mapping
                </button>
              </div>
            </div>
            <div className="p-6.5">
              <div className="mb-6 rounded-lg border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <p className="mb-2 text-sm text-body">
                  <span className="font-medium text-black dark:text-white">Sheet:</span> {preview.sheetName} | 
                  <span className="font-medium text-black dark:text-white ml-2">จำนวนแถว:</span> {preview.totalRows} |
                  <span className="font-medium text-black dark:text-white ml-2">Column:</span> {columnMappings.length}
                </p>
                <p className="mb-3 text-xs text-body">
                  💡 ระบบจะจำ mapping ที่คุณเลือกไว้สำหรับครั้งถัดไป
                </p>
                <div className="flex gap-4 text-xs">
                  <span className="text-success">
                    ✓ Mapped: {columnMappings.filter(m => m.systemField).length}
                  </span>
                  <span className="text-body">
                    ○ ไม่ใช้: {columnMappings.filter(m => !m.systemField).length}
                  </span>
                  <span className={columnMappings.some(m => m.systemField === 'customerName') ? 'font-medium text-success' : 'font-medium text-meta-1'}>
                    {columnMappings.some(m => m.systemField === 'customerName') ? '✓' : '✗'} ชื่อลูกค้า (จำเป็น)
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-meta-1 bg-meta-1 bg-opacity-10 p-4">
                  <AlertCircle className="h-5 w-5 text-meta-1" />
                  <p className="text-sm text-meta-1">{error}</p>
                </div>
              )}

              <div className="mb-6 overflow-hidden rounded-lg border border-stroke dark:border-strokedark">
                <div className="grid grid-cols-3 gap-4 border-b border-stroke bg-gray-2 px-4 py-3 font-medium dark:border-strokedark dark:bg-meta-4">
                  <div className="text-sm text-black dark:text-white">Column ใน Excel</div>
                  <div className="text-sm text-black dark:text-white">ตัวอย่างข้อมูล</div>
                  <div className="text-sm text-black dark:text-white">ฟิลด์ในระบบ</div>
                </div>
                <div className="max-h-96 divide-y divide-stroke overflow-y-auto dark:divide-strokedark">
                  {columnMappings.map((mapping, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-4 px-4 py-3 hover:bg-gray-2 dark:hover:bg-meta-4">
                      <div className="text-sm font-medium text-black dark:text-white">{mapping.excelColumn}</div>
                      <div className="truncate text-xs text-body">
                        {preview.records[0]?.rawData[mapping.excelColumn] || '-'}
                      </div>
                      <div>
                        <select
                          value={mapping.systemField}
                          onChange={(e) => handleMappingChange(mapping.excelColumn, e.target.value)}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
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

              <div className="mb-6 rounded-lg border border-warning bg-warning bg-opacity-10 p-4">
                <p className="mb-2 text-sm font-medium text-warning">💡 คำแนะนำ:</p>
                <ul className="space-y-1 text-sm text-body">
                  <li>• <span className="font-medium">ชื่อลูกค้า</span> - จำเป็นต้องมี</li>
                  <li>• <span className="font-medium">เลขที่ใบเสนอราคา</span> - ถ้าไม่มีจะสร้างอัตโนมัติ</li>
                  <li>• Column ที่ไม่ต้องการใช้ สามารถเลือก "-- ไม่ใช้ --" ได้</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('sheet')}
                  className="flex flex-1 items-center justify-center rounded-lg border border-stroke px-6 py-3 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={handleConfirmMapping}
                  className="flex flex-1 items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
                >
                  ยืนยัน Mapping
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {step === 'preview' && preview && (
          <>
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-black dark:text-white">
                    ตรวจสอบข้อมูล
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRejectAll}
                      className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                    >
                      ยกเลิกทั้งหมด
                    </button>
                    <button
                      onClick={handleApproveAll}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                    >
                      เลือกทั้งหมด
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6.5">
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                    <p className="text-sm text-body">Sheet</p>
                    <p className="font-medium text-black dark:text-white">{preview.sheetName}</p>
                  </div>
                  <div className="rounded-lg border border-success bg-success bg-opacity-10 p-4">
                    <p className="text-sm text-body">เลือกแล้ว</p>
                    <p className="font-medium text-success">{approvedCount} แถว</p>
                  </div>
                  <div className="rounded-lg border border-meta-1 bg-meta-1 bg-opacity-10 p-4">
                    <p className="text-sm text-body">ยกเลิก</p>
                    <p className="font-medium text-meta-1">{rejectedCount} แถว</p>
                  </div>
                  <div className="rounded-lg border border-primary bg-primary bg-opacity-10 p-4">
                    <p className="text-sm text-body">ทั้งหมด</p>
                    <p className="font-medium text-primary">{records.length} แถว</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-lg border border-meta-1 bg-meta-1 bg-opacity-10 p-4">
                    <AlertCircle className="h-5 w-5 text-meta-1" />
                    <p className="text-sm text-meta-1">{error}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="max-h-[600px] space-y-3 overflow-y-auto">
              {records.map((record) => (
                <div
                  key={record.rowNumber}
                  className={`rounded-sm border shadow-default transition-all ${
                    record.status === 'approved' 
                      ? 'border-success bg-success bg-opacity-10' 
                      : 'border-stroke bg-white opacity-60 dark:border-strokedark dark:bg-boxdark'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={record.status === 'approved'}
                          onChange={() => handleToggleRecord(record.rowNumber)}
                          className="h-5 w-5 rounded border-stroke text-primary focus:ring-primary dark:border-strokedark"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-xs font-medium text-body">แถวที่ {record.rowNumber}</span>
                          {record.status === 'approved' && (
                            <span className="rounded-full bg-success px-2 py-0.5 text-xs text-white">✓ เลือกแล้ว</span>
                          )}
                          {!record.mappedData.quotationNumber && (
                            <span className="rounded-full bg-warning px-2 py-0.5 text-xs text-white">⚠ ไม่มีเลขที่</span>
                          )}
                          {!record.mappedData.customerName && (
                            <span className="rounded-full bg-meta-1 px-2 py-0.5 text-xs text-white">⚠ ไม่มีชื่อลูกค้า</span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <span className="text-body">เลขที่:</span>
                            <span className={`ml-2 font-medium ${!record.mappedData.quotationNumber ? 'text-warning' : 'text-black dark:text-white'}`}>
                              {record.mappedData.quotationNumber || '(จะสร้างอัตโนมัติ)'}
                            </span>
                          </div>
                          <div>
                            <span className="text-body">ลูกค้า:</span>
                            <span className={`ml-2 font-medium ${!record.mappedData.customerName ? 'text-meta-1' : 'text-black dark:text-white'}`}>
                              {record.mappedData.customerName || '(ไม่พบข้อมูล)'}
                            </span>
                          </div>
                          <div>
                            <span className="text-body">รุ่นรถ:</span>
                            <span className="ml-2 text-black dark:text-white">{record.mappedData.carName || '-'}</span>
                          </div>
                          <div>
                            <span className="text-body">จำนวน:</span>
                            <span className="ml-2 text-black dark:text-white">{record.mappedData.quantity || 0} คัน</span>
                          </div>
                          <div>
                            <span className="text-body">ราคา:</span>
                            <span className="ml-2 text-black dark:text-white">฿{(record.mappedData.pricePerUnit || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-body">ผู้ขาย:</span>
                            <span className="ml-2 text-black dark:text-white">{record.mappedData.saleMemberName || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex gap-4">
                <button
                  onClick={() => setStep('mapping')}
                  className="flex flex-1 items-center justify-center rounded-lg border border-stroke px-6 py-3 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || approvedCount === 0}
                  className="flex flex-1 items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {importing ? 'กำลัง Import...' : `Import ${approvedCount} รายการ`}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Result Section */}
        {step === 'result' && result && (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                ผลลัพธ์การ Import
              </h3>
            </div>
            <div className="p-6.5">
              <div className="mb-6 flex flex-col items-center justify-center py-8">
                {result.failed === 0 ? (
                  <>
                    <CheckCircle className="mb-4 h-16 w-16 text-success" />
                    <h4 className="mb-2 text-xl font-semibold text-black dark:text-white">
                      Import สำเร็จ!
                    </h4>
                    <p className="text-body">
                      Import ข้อมูลสำเร็จ {result.success} รายการ
                    </p>
                    <p className="mt-2 text-sm text-body">
                      กำลังนำคุณไปยังหน้าใบเสนอราคา...
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="mb-4 h-16 w-16 text-warning" />
                    <h4 className="mb-2 text-xl font-semibold text-black dark:text-white">
                      Import เสร็จสิ้น (มีข้อผิดพลาดบางส่วน)
                    </h4>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="rounded-lg border border-success bg-success bg-opacity-10 p-4 text-center">
                        <p className="text-2xl font-bold text-success">{result.success}</p>
                        <p className="text-sm text-body">สำเร็จ</p>
                      </div>
                      <div className="rounded-lg border border-meta-1 bg-meta-1 bg-opacity-10 p-4 text-center">
                        <p className="text-2xl font-bold text-meta-1">{result.failed}</p>
                        <p className="text-sm text-body">ล้มเหลว</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="mb-6">
                  <h5 className="mb-3 font-medium text-black dark:text-white">รายการที่ล้มเหลว:</h5>
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {result.errors.map((err: any, idx: number) => (
                      <div key={idx} className="rounded-lg border border-meta-1 bg-meta-1 bg-opacity-10 p-3">
                        <p className="text-sm font-medium text-meta-1">แถวที่ {err.rowNumber}</p>
                        <p className="text-xs text-body">{err.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex flex-1 items-center justify-center rounded-lg border border-stroke px-6 py-3 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  Import ไฟล์ใหม่
                </button>
                <button
                  onClick={() => router.push('/quotations')}
                  className="flex flex-1 items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
                >
                  ไปยังหน้าใบเสนอราคา
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
