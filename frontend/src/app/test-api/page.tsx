'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
      })
      const data = await response.json()
      setResult({ success: true, data })
      
      if (data.access_token) {
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testMasterData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/master-data/initialize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setResult({ success: response.ok, data, status: response.status })
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testGetCars = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/master-data/cars', {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setResult({ success: response.ok, data, count: data.length, status: response.status })
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>ทดสอบ API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testLogin} disabled={loading}>
              1. ทดสอบ Login
            </Button>
            <Button onClick={testMasterData} disabled={loading}>
              2. เริ่มต้นข้อมูล Master Data
            </Button>
            <Button onClick={testGetCars} disabled={loading}>
              3. ดูข้อมูลรถ
            </Button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="font-bold mb-2">ผลลัพธ์:</h3>
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <h3 className="font-bold mb-2">คำแนะนำ:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>กดปุ่ม "1. ทดสอบ Login" ก่อน</li>
              <li>ถ้า login สำเร็จ จะเห็น access_token</li>
              <li>กดปุ่ม "2. เริ่มต้นข้อมูล Master Data"</li>
              <li>กดปุ่ม "3. ดูข้อมูลรถ" เพื่อเช็คว่ามีข้อมูลแล้ว</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
