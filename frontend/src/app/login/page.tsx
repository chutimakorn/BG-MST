'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // เช็คว่า login แล้วหรือยัง
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.replace('/home')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { username, password })
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      router.push('/home')
    } catch (err: any) {
      setError(err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray dark:bg-boxdark-2">
      <div className="w-full max-w-md">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="text-center text-2xl font-semibold text-black dark:text-white">
              ระบบจัดการข้อมูลการขาย
            </h3>
          </div>
          <form onSubmit={handleLogin}>
            <div className="p-6.5">
              <div className="mb-4.5">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้"
                  required
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  required
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {error && (
                <div className="mb-4.5">
                  <p className="text-sm text-meta-1">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                <LogIn className="h-5 w-5" />
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
