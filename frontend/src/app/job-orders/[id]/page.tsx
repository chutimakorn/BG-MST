'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Eye, X, Upload, Download } from 'lucide-react'
import Link from 'next/link'
import { showError, showInfo } from '@/lib/toast-helper'

export default function JobOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const jobOrderId = params.id
  
  const [loading, setLoading] = useState(true)
  const [jobOrder, setJobOrder] = useState<any>(null)
  const [linkedQuotation, setLinkedQuotation] = useState<any>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewFileName, setPreviewFileName] = useState<string>('')

  const getDisplayFileName = (fileName: string): string => {
    if (!fileName) return ''
    
    try {
      const fileInfo = JSON.parse(fileName)
      return fileInfo.originalName || fileName
    } catch {
      return fileName
    }
  }

  const handleViewFile = async (fileName: string) => {
    if (!fileName) {
      showInfo('ไม่มีไฟล์')
      return
    }
    
    let fileUrl = ''
    
    try {
      const fileInfo = JSON.parse(fileName)
      if (fileInfo.url) {
        fileUrl = fileInfo.url
      }
    } catch (error) {
      // Not JSON
    }
    
    if (!fileUrl && (fileName.startsWith('http://') || fileName.startsWith('https://'))) {
      fileUrl = fileName
    }
    
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

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadJobOrder()
  }, [jobOrderId])

  const loadJobOrder = async () => {
    try {
      const response = await api.get(`/job-orders/${jobOrderId}`)
      setJobOrder(response.data)
      
      // เช็คว่ามี quotation ที่เชื่อมโยงหรือไม่
      if (response.data.id) {
        try {
          const quotationsRes = await api.get('/quotations')
          const quotations = quotationsRes.data.data || quotationsRes.data || []
          const linkedQuot = quotations.find((q: any) => q.jobOrder?.id === response.data.id)
          if (linkedQuot) {
            setLinkedQuotation(linkedQuot)
          }
        } catch (error) {
          console.error('Failed to load linked quotation', error)
        }
      }
    } catch (error) {
      console.error('Failed to load job order', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">กำลังโหลดข้อมูล...</div>
      </div>
    )
  }

  if (!jobOrder) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">ไม่พบข้อมูล Job Order</div>
      </div>
    )
  }

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="border-b border-stroke py-3 dark:border-strokedark">
      <div className="grid grid-cols-3 gap-4">
        <div className="font-medium text-black dark:text-white">{label}</div>
        <div className="col-span-2 text-body">{value || '-'}</div>
      </div>
    </div>
  )

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          รายละเอียด Job Order
        </h2>
        <Link
          href="/job-orders"
          className="inline-flex items-center justify-center gap-2.5 rounded-md border border-stroke px-6 py-3 text-center font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
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
              href={`/quotations/${linkedQuotation.id}`}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90"
            >
              <Eye className="h-4 w-4" />
              ดูใบเสนอราคา
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* ข้อมูลพื้นฐาน */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              ข้อมูลพื้นฐาน
            </h3>
          </div>
          <div className="px-6.5 py-4">
            <InfoRow label="เลขที่ Job Order" value={jobOrder.quotationNumber} />
            <InfoRow label="ชื่อลูกค้า" value={jobOrder.customerName} />
            <InfoRow label="วันที่ส่งใบเสนอ" value={jobOrder.submissionDate ? formatDate(jobOrder.submissionDate) : '-'} />
            <InfoRow label="วันส่งรถ" value={jobOrder.deliveryDate ? formatDate(jobOrder.deliveryDate) : '-'} />
            <InfoRow label="สถานที่ส่งรถ" value={jobOrder.deliveryPlace} />
          </div>
        </div>

        {/* ข้อมูลรถ */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              ข้อมูลรถ
            </h3>
          </div>
          <div className="px-6.5 py-4">
            <InfoRow label="รุ่นรถ" value={jobOrder.car?.name} />
            <InfoRow label="สี Body" value={jobOrder.bodyColor?.name} />
            <InfoRow label="สี Seat" value={jobOrder.seatColor?.name} />
            <InfoRow label="สี Canopy" value={jobOrder.canopyColor?.name} />
            <InfoRow label="Option เพิ่มเติม" value={jobOrder.additionalOptions} />
            <InfoRow label="จำนวนคัน" value={jobOrder.quantity} />
            <InfoRow label="ราคาต่อคัน" value={formatCurrency(jobOrder.pricePerUnit)} />
          </div>
        </div>

        {/* สถานะ */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              สถานะ
            </h3>
          </div>
          <div className="px-6.5 py-4">
            <InfoRow label="สถานะเอกสาร" value={jobOrder.statusJobDocument?.name} />
            <InfoRow label="สถานะงาน" value={jobOrder.statusJob?.name} />
          </div>
        </div>

        {/* เอกสาร DV */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              เอกสาร DV
            </h3>
          </div>
          <div className="px-6.5 py-4">
            <InfoRow 
              label="ไฟล์ DV" 
              value={jobOrder.dvFileName ? (
                <button
                  onClick={() => handleViewFile(jobOrder.dvFileName)}
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Eye className="h-4 w-4" />
                  {getDisplayFileName(jobOrder.dvFileName)}
                </button>
              ) : '-'} 
            />
          </div>
        </div>

        {/* ไฟล์ Job Order (PDF) */}
        {jobOrder.jobPdfFileName && (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                ไฟล์ Job Order (PDF)
              </h3>
            </div>
            <div className="px-6.5 py-4">
              <InfoRow 
                label="ไฟล์ Job" 
                value={
                  <button
                    onClick={() => handleViewFile(jobOrder.jobPdfFileName)}
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Eye className="h-4 w-4" />
                    {getDisplayFileName(jobOrder.jobPdfFileName)}
                  </button>
                } 
              />
            </div>
          </div>
        )}

        {/* เอกสาร PO */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              เอกสาร PO (Purchase Order)
            </h3>
          </div>
          <div className="px-6.5 py-4">
            <InfoRow 
              label="ไฟล์ PO" 
              value={jobOrder.poFileName ? (
                <button
                  onClick={() => handleViewFile(jobOrder.poFileName)}
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Eye className="h-4 w-4" />
                  {getDisplayFileName(jobOrder.poFileName)}
                </button>
              ) : '-'} 
            />
          </div>
        </div>

        {/* เอกสาร IV */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              เอกสาร IV (Invoice)
            </h3>
          </div>
          <div className="px-6.5 py-4">
            <InfoRow 
              label="ไฟล์ IV" 
              value={jobOrder.ivFileName ? (
                <button
                  onClick={() => handleViewFile(jobOrder.ivFileName)}
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Eye className="h-4 w-4" />
                  {getDisplayFileName(jobOrder.ivFileName)}
                </button>
              ) : '-'} 
            />
            <InfoRow label="วันที่ IV" value={jobOrder.ivDate ? formatDate(jobOrder.ivDate) : '-'} />
            <InfoRow label="จำนวนเงิน IV" value={jobOrder.ivAmount ? formatCurrency(jobOrder.ivAmount) : '-'} />
          </div>
        </div>

        {/* เอกสาร IT */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              เอกสาร IT (Tax Invoice)
            </h3>
          </div>
          <div className="px-6.5 py-4">
            <InfoRow 
              label="ไฟล์ IT" 
              value={jobOrder.itFileName ? (
                <button
                  onClick={() => handleViewFile(jobOrder.itFileName)}
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Eye className="h-4 w-4" />
                  {getDisplayFileName(jobOrder.itFileName)}
                </button>
              ) : '-'} 
            />
            <InfoRow label="วันที่ IT" value={jobOrder.itDate ? formatDate(jobOrder.itDate) : '-'} />
            <InfoRow label="จำนวนเงิน IT" value={jobOrder.itAmount ? formatCurrency(jobOrder.itAmount) : '-'} />
          </div>
        </div>

      </div>

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
