'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Save, Cloud } from 'lucide-react'
import { showSuccess, showError, showWarning } from '@/lib/toast-helper'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [settings, setSettings] = useState<any[]>([])
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('')
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState('')
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings')
      setSettings(response.data)

      const cloudNameSetting = response.data.find((s: any) => s.key === 'cloudinary_cloud_name')
      if (cloudNameSetting) {
        setCloudinaryCloudName(cloudNameSetting.value)
      }

      const apiKeySetting = response.data.find((s: any) => s.key === 'cloudinary_api_key')
      if (apiKeySetting) {
        setCloudinaryApiKey(apiKeySetting.value)
      }

      const apiSecretSetting = response.data.find((s: any) => s.key === 'cloudinary_api_secret')
      if (apiSecretSetting) {
        setCloudinaryApiSecret(apiSecretSetting.value)
      }
    } catch (error) {
      console.error('Failed to load settings', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
        showWarning('กรุณากรอกข้อมูลให้ครบทุกช่อง')
        setLoading(false)
        return
      }

      await api.post('/settings', {
        key: 'cloudinary_cloud_name',
        value: cloudinaryCloudName,
        description: 'Cloudinary Cloud Name',
      })

      await api.post('/settings', {
        key: 'cloudinary_api_key',
        value: cloudinaryApiKey,
        description: 'Cloudinary API Key',
      })

      await api.post('/settings', {
        key: 'cloudinary_api_secret',
        value: cloudinaryApiSecret,
        description: 'Cloudinary API Secret',
      })
      
      showSuccess('บันทึกการตั้งค่าสำเร็จ')
      await loadSettings()
    } catch (error: any) {
      showError('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
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
          ตั้งค่า Cloudinary
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Cloudinary Settings */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <div className="flex items-center gap-3">
              <Cloud className="h-8 w-8 text-primary" />
              <h3 className="font-medium text-black dark:text-white">
                การจัดเก็บไฟล์บน Cloudinary
              </h3>
            </div>
            <p className="mt-2 text-sm text-body">
              ฟรี 25GB storage + 25GB bandwidth/เดือน
            </p>
          </div>
          <div className="p-6.5">
            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Cloud Name <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                value={cloudinaryCloudName}
                onChange={(e) => setCloudinaryCloudName(e.target.value)}
                placeholder="your-cloud-name"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                API Key <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                value={cloudinaryApiKey}
                onChange={(e) => setCloudinaryApiKey(e.target.value)}
                placeholder="123456789012345"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                API Secret <span className="text-meta-1">*</span>
              </label>
              <input
                type="password"
                value={cloudinaryApiSecret}
                onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                placeholder="••••••••••••••••••••"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </button>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              ขั้นตอนการตั้งค่า
            </h3>
          </div>
          <div className="p-6.5">
            <div className="space-y-6">
              <div>
                <p className="mb-3 font-semibold text-black dark:text-white">1. สร้าง Cloudinary Account (ฟรี)</p>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-body">
                  <li>ไปที่ <a href="https://cloudinary.com/users/register/free" target="_blank" className="text-primary hover:underline">Cloudinary Sign Up</a></li>
                  <li>สมัครสมาชิกฟรี (ได้ 25GB)</li>
                  <li>ยืนยัน email</li>
                  <li>Login เข้าสู่ Dashboard</li>
                </ol>
              </div>

              <div>
                <p className="mb-3 font-semibold text-black dark:text-white">2. คัดลอกข้อมูล API</p>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-body">
                  <li>ที่หน้า Dashboard จะเห็น <strong>Product Environment Credentials</strong></li>
                  <li>คัดลอก <strong>Cloud Name</strong></li>
                  <li>คัดลอก <strong>API Key</strong></li>
                  <li>คัดลอก <strong>API Secret</strong> (คลิก "Reveal" ถ้าซ่อนอยู่)</li>
                </ol>
              </div>

              <div>
                <p className="mb-3 font-semibold text-black dark:text-white">3. กรอกข้อมูลในหน้านี้</p>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-body">
                  <li>วาง <strong>Cloud Name</strong> ในช่องแรก</li>
                  <li>วาง <strong>API Key</strong> ในช่องที่สอง</li>
                  <li>วาง <strong>API Secret</strong> ในช่องที่สาม</li>
                  <li>คลิก <strong>บันทึกการตั้งค่า</strong></li>
                </ol>
              </div>

              <div className="rounded-lg border border-success bg-success bg-opacity-10 p-4">
                <p className="mb-2 text-sm font-semibold text-success">✓ เมื่อตั้งค่าเสร็จ:</p>
                <ul className="ml-4 list-disc space-y-1 text-sm text-body">
                  <li>ไฟล์ที่อัพโหลดจะถูกเก็บใน Cloudinary อัตโนมัติ</li>
                  <li>ระบบจะสร้าง folder ตามเลขที่ Job Order</li>
                  <li>ไฟล์จะมี CDN (เร็วมาก)</li>
                  <li>ฟรี 25GB storage + 25GB bandwidth/เดือน</li>
                  <li>เข้าถึงไฟล์ได้จากทุกที่ผ่าน URL</li>
                </ul>
              </div>

              <div className="rounded-lg border border-primary bg-primary bg-opacity-10 p-4">
                <p className="mb-2 text-sm font-semibold text-primary">📁 โครงสร้างไฟล์:</p>
                <pre className="text-xs text-body">
{`bg-mst-files/
├── SAHO68-168000095/
│   ├── po_1732851234567.pdf
│   ├── iv_1732851234568.pdf
│   └── it_1732851234569.pdf
└── SAHO68-168000096/
    └── po_1732851234570.pdf`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              สถานะการตั้งค่า
            </h3>
          </div>
          <div className="p-6.5">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <span className="text-sm font-medium text-black dark:text-white">Cloud Name</span>
                <span className={`text-sm font-bold ${cloudinaryCloudName ? 'text-success' : 'text-warning'}`}>
                  {cloudinaryCloudName ? '✓ ตั้งค่าแล้ว' : '✗ ยังไม่ได้ตั้งค่า'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <span className="text-sm font-medium text-black dark:text-white">API Key</span>
                <span className={`text-sm font-bold ${cloudinaryApiKey ? 'text-success' : 'text-warning'}`}>
                  {cloudinaryApiKey ? '✓ ตั้งค่าแล้ว' : '✗ ยังไม่ได้ตั้งค่า'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <span className="text-sm font-medium text-black dark:text-white">API Secret</span>
                <span className={`text-sm font-bold ${cloudinaryApiSecret ? 'text-success' : 'text-warning'}`}>
                  {cloudinaryApiSecret ? '✓ ตั้งค่าแล้ว' : '✗ ยังไม่ได้ตั้งค่า'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <span className="text-sm font-medium text-black dark:text-white">สถานะระบบ</span>
                <span className={`text-sm font-bold ${cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret ? 'text-success' : 'text-warning'}`}>
                  {cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret ? '✓ พร้อมใช้งาน' : '⚠ รอการตั้งค่า'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
