'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Save, Upload } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [settings, setSettings] = useState<any[]>([])
  const [googleDriveFolderId, setGoogleDriveFolderId] = useState('')
  const [googleDriveCredentials, setGoogleDriveCredentials] = useState('')

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

      const folderIdSetting = response.data.find((s: any) => s.key === 'google_drive_folder_id')
      if (folderIdSetting) {
        setGoogleDriveFolderId(folderIdSetting.value)
      }

      const credentialsSetting = response.data.find((s: any) => s.key === 'google_drive_credentials')
      if (credentialsSetting) {
        setGoogleDriveCredentials(credentialsSetting.value)
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
      if (!googleDriveFolderId || !googleDriveCredentials) {
        alert('กรุณากรอก Folder ID และ Credentials')
        setLoading(false)
        return
      }

      try {
        JSON.parse(googleDriveCredentials)
      } catch {
        alert('Credentials ไม่ใช่ JSON ที่ถูกต้อง')
        setLoading(false)
        return
      }

      await api.post('/settings', {
        key: 'google_drive_folder_id',
        value: googleDriveFolderId,
        description: 'Google Drive Folder ID สำหรับเก็บไฟล์',
      })

      await api.post('/settings', {
        key: 'google_drive_credentials',
        value: googleDriveCredentials,
        description: 'Google Service Account Credentials (JSON)',
      })
      
      alert('บันทึกการตั้งค่าสำเร็จ')
      await loadSettings()
    } catch (error: any) {
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setGoogleDriveCredentials(content)
    }
    reader.readAsText(file)
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
          ตั้งค่า Google Drive
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Google Drive Settings */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <div className="flex items-center gap-3">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.71 3.5L1.15 15l3.42 6.01L11.13 9.5 7.71 3.5M16.29 3.5l-3.42 6h6.84l3.42-6h-6.84M12 10.5L5.44 21h13.12L12 10.5z"/>
              </svg>
              <h3 className="font-medium text-black dark:text-white">
                การจัดเก็บไฟล์บน Google Drive
              </h3>
            </div>
          </div>
          <div className="p-6.5">
            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Google Drive Folder ID <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                value={googleDriveFolderId}
                onChange={(e) => setGoogleDriveFolderId(e.target.value)}
                placeholder="คัดลอกจาก URL: /folders/[FOLDER_ID]"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
              <p className="mt-2 text-sm text-body">
                ตัวอย่าง: 1a2b3c4d5e6f7g8h9i0j (ส่วนหลัง /folders/ ใน URL)
              </p>
            </div>

            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Service Account Credentials (JSON) <span className="text-meta-1">*</span>
              </label>
              <div className="mb-3">
                <label className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-stroke bg-gray-2 p-6 hover:bg-gray dark:border-strokedark dark:bg-meta-4">
                  <Upload className="h-6 w-6 text-body" />
                  <span className="text-sm text-black dark:text-white">
                    คลิกเพื่ออัพโหลดไฟล์ JSON
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                rows={8}
                value={googleDriveCredentials}
                onChange={(e) => setGoogleDriveCredentials(e.target.value)}
                placeholder='{"type": "service_account", "project_id": "...", ...}'
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-mono text-xs text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
              <p className="mt-2 text-sm text-body">
                วางเนื้อหาไฟล์ JSON ที่ดาวน์โหลดจาก Google Cloud Console
              </p>
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
                <p className="mb-3 font-semibold text-black dark:text-white">1. สร้าง Google Cloud Project และ Service Account</p>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-body">
                  <li>ไปที่ <a href="https://console.cloud.google.com/" target="_blank" className="text-primary hover:underline">Google Cloud Console</a></li>
                  <li>สร้าง Project ใหม่ (หรือใช้ที่มีอยู่)</li>
                  <li>เปิดใช้ <strong>Google Drive API</strong></li>
                  <li>ไปที่ <strong>IAM & Admin → Service Accounts</strong></li>
                  <li>คลิก <strong>Create Service Account</strong></li>
                  <li>ตั้งชื่อ เช่น <code className="rounded bg-gray-2 px-2 py-1 dark:bg-meta-4">bg-mst-drive</code></li>
                  <li>คลิก <strong>Create and Continue → Done</strong></li>
                  <li>คลิกที่ Service Account ที่สร้าง</li>
                  <li>ไปที่แท็บ <strong>Keys</strong></li>
                  <li>คลิก <strong>Add Key → Create new key</strong></li>
                  <li>เลือก <strong>JSON</strong> แล้วดาวน์โหลด</li>
                </ol>
              </div>

              <div>
                <p className="mb-3 font-semibold text-black dark:text-white">2. สร้างและ Share Google Drive Folder</p>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-body">
                  <li>เปิด <a href="https://drive.google.com/" target="_blank" className="text-primary hover:underline">Google Drive</a></li>
                  <li>สร้าง folder ใหม่ เช่น <code className="rounded bg-gray-2 px-2 py-1 dark:bg-meta-4">BG-MST-Files</code></li>
                  <li>คลิกขวาที่ folder → <strong>Share</strong></li>
                  <li>เพิ่ม email ของ Service Account (จากไฟล์ JSON: <code className="rounded bg-gray-2 px-2 py-1 dark:bg-meta-4">client_email</code>)</li>
                  <li>ให้สิทธิ์ <strong>Editor</strong></li>
                  <li>คลิก <strong>Share</strong></li>
                  <li>คัดลอก <strong>Folder ID</strong> จาก URL (ส่วนหลัง <code className="rounded bg-gray-2 px-2 py-1 dark:bg-meta-4">/folders/</code>)</li>
                </ol>
              </div>

              <div>
                <p className="mb-3 font-semibold text-black dark:text-white">3. กรอกข้อมูลในหน้านี้</p>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-body">
                  <li>วาง <strong>Folder ID</strong> ในช่องแรก</li>
                  <li>อัพโหลดไฟล์ JSON หรือวางเนื้อหาในช่องที่สอง</li>
                  <li>คลิก <strong>บันทึกการตั้งค่า</strong></li>
                </ol>
              </div>

              <div className="rounded-lg border border-success bg-success bg-opacity-10 p-4">
                <p className="mb-2 text-sm font-semibold text-success">✓ เมื่อตั้งค่าเสร็จ:</p>
                <ul className="ml-4 list-disc space-y-1 text-sm text-body">
                  <li>ไฟล์ที่อัพโหลดจะถูกเก็บใน Google Drive อัตโนมัติ</li>
                  <li>ระบบจะสร้าง subfolder ตามเลขที่ Job Order</li>
                  <li>ทุกคนที่มีสิทธิ์เข้าถึง folder จะเห็นไฟล์</li>
                  <li>ไฟล์จะถูก backup บน cloud อัตโนมัติ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              สถานะการตั้งค่า
            </h3>
          </div>
          <div className="p-6.5">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <span className="text-sm font-medium text-black dark:text-white">Google Drive Folder ID</span>
                <span className={`text-sm font-bold ${googleDriveFolderId ? 'text-success' : 'text-warning'}`}>
                  {googleDriveFolderId ? '✓ ตั้งค่าแล้ว' : '✗ ยังไม่ได้ตั้งค่า'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <span className="text-sm font-medium text-black dark:text-white">Service Account Credentials</span>
                <span className={`text-sm font-bold ${googleDriveCredentials ? 'text-success' : 'text-warning'}`}>
                  {googleDriveCredentials ? '✓ ตั้งค่าแล้ว' : '✗ ยังไม่ได้ตั้งค่า'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <span className="text-sm font-medium text-black dark:text-white">สถานะระบบ</span>
                <span className={`text-sm font-bold ${googleDriveFolderId && googleDriveCredentials ? 'text-success' : 'text-warning'}`}>
                  {googleDriveFolderId && googleDriveCredentials ? '✓ พร้อมใช้งาน' : '⚠ รอการตั้งค่า'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
