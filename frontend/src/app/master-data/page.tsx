'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import Link from 'next/link'

const MASTER_DATA_TYPES = [
  { key: 'cars', label: 'รุ่นรถ' },
  { key: 'sale-members', label: 'ผู้ขาย' },
  { key: 'category-cars', label: 'Category รถ' },
  { key: 'body-colors', label: 'สี Body' },
  { key: 'seat-colors', label: 'สี Seat' },
  { key: 'canopy-colors', label: 'สี Canopy' },
  { key: 'provinces', label: 'จังหวัด' },
  { key: 'status-sales', label: 'สถานะการขาย' },
  { key: 'status-job-documents', label: 'สถานะเอกสาร' },
  { key: 'status-jobs', label: 'สถานะงาน' },
]

export default function MasterDataPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState('cars')
  const [data, setData] = useState<any[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadData()
  }, [selectedType, router])

  const loadData = async () => {
    try {
      const response = await api.get(`/master-data/${selectedType}`)
      setData(response.data)
    } catch (error) {
      console.error('Failed to load data', error)
    }
  }

  const handleAdd = async () => {
    if (!newItemName.trim()) return
    setLoading(true)
    try {
      await api.post(`/master-data/${selectedType}`, { name: newItemName })
      setNewItemName('')
      loadData()
    } catch (error: any) {
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (id: number) => {
    if (!editingName.trim()) return
    setLoading(true)
    try {
      await api.put(`/master-data/${selectedType}/${id}`, { name: editingName })
      setEditingId(null)
      setEditingName('')
      loadData()
    } catch (error: any) {
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('คุณต้องการลบรายการนี้หรือไม่?')) return
    setLoading(true)
    try {
      await api.delete(`/master-data/${selectedType}/${id}`)
      loadData()
    } catch (error: any) {
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleInitialize = async () => {
    if (!confirm('คุณต้องการเริ่มต้นข้อมูล Master Data หรือไม่?')) return
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      console.log('Token exists:', !!token)
      
      if (!token) {
        alert('กรุณา login ใหม่')
        router.push('/login')
        return
      }
      
      const response = await fetch('http://localhost:3001/master-data/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to initialize')
      }
      
      alert('เริ่มต้นข้อมูลสำเร็จ')
      loadData()
    } catch (error: any) {
      console.error('Initialize error:', error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">จัดการ Master Data</h1>
          <p className="text-muted-foreground mt-1">จัดการข้อมูลหลักของระบบ</p>
        </div>
        <Button onClick={handleInitialize} variant="outline" disabled={loading}>
          เริ่มต้นข้อมูล
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ประเภทข้อมูล</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {MASTER_DATA_TYPES.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setSelectedType(type.key)}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                      selectedType === type.key
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {MASTER_DATA_TYPES.find(t => t.key === selectedType)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2">
                  <Input
                    placeholder="เพิ่มรายการใหม่..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                  />
                  <Button onClick={handleAdd} disabled={loading || !newItemName.trim()}>
                    เพิ่ม
                  </Button>
                </div>

                <div className="space-y-2">
                  {data.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      {editingId === item.id ? (
                        <>
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={() => handleEdit(item.id)} disabled={loading}>
                            บันทึก
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null)
                              setEditingName('')
                            }}
                          >
                            ยกเลิก
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1">{item.name}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(item.id)
                              setEditingName(item.name)
                            }}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                            disabled={loading}
                          >
                            ลบ
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                  {data.length === 0 && (
                    <p className="text-center text-gray-500 py-8">ไม่มีข้อมูล</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  )
}
