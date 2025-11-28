'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { Plus, Edit, Trash2, Database } from 'lucide-react'

const TYPE_LABELS: { [key: string]: string } = {
  'cars': 'รุ่นรถ',
  'sale-members': 'ผู้ขาย',
  'category-cars': 'Category รถ',
  'body-colors': 'สี Body',
  'seat-colors': 'สี Seat',
  'canopy-colors': 'สี Canopy',
  'provinces': 'จังหวัด',
  'status-sales': 'สถานะการขาย',
  'status-job-documents': 'สถานะเอกสาร',
  'status-jobs': 'สถานะงาน',
}

export default function MasterDataTypePage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as string
  
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
  }, [type, router])

  const loadData = async () => {
    try {
      const response = await api.get(`/master-data/${type}`)
      setData(response.data)
    } catch (error) {
      console.error('Failed to load data', error)
    }
  }

  const handleAdd = async () => {
    if (!newItemName.trim()) return
    setLoading(true)
    try {
      await api.post(`/master-data/${type}`, { name: newItemName })
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
      await api.put(`/master-data/${type}/${id}`, { name: editingName })
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
      await api.delete(`/master-data/${type}/${id}`)
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
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          {TYPE_LABELS[type] || 'Master Data'}
        </h2>
        <button
          onClick={handleInitialize}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2.5 rounded-md border border-primary px-6 py-3 text-center font-medium text-primary hover:bg-opacity-90 disabled:opacity-50"
        >
          <Database className="h-5 w-5" />
          เริ่มต้นข้อมูล
        </button>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-semibold text-black dark:text-white">
            จัดการ{TYPE_LABELS[type]}
          </h3>
        </div>
        <div className="p-6.5">
          {/* Add New Item */}
          <div className="mb-6 flex gap-3">
            <input
              type="text"
              placeholder="เพิ่มรายการใหม่..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            <button
              onClick={handleAdd}
              disabled={loading || !newItemName.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              เพิ่ม
            </button>
          </div>

          {/* Data List */}
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                {editingId === item.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 rounded-lg border-[1.5px] border-stroke bg-white px-4 py-2 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    <button
                      onClick={() => handleEdit(item.id)}
                      disabled={loading}
                      className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90 disabled:opacity-50"
                    >
                      บันทึก
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditingName('')
                      }}
                      className="rounded-lg border border-stroke px-4 py-2 hover:bg-gray-3 dark:border-strokedark"
                    >
                      ยกเลิก
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-black dark:text-white">{item.name}</span>
                    <button
                      onClick={() => {
                        setEditingId(item.id)
                        setEditingName(item.name)
                      }}
                      className="flex items-center gap-2 rounded-lg border border-stroke px-4 py-2 hover:bg-gray-3 dark:border-strokedark"
                    >
                      <Edit className="h-4 w-4" />
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={loading}
                      className="flex items-center gap-2 rounded-lg bg-meta-1 px-4 py-2 text-white hover:bg-opacity-90 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      ลบ
                    </button>
                  </>
                )}
              </div>
            ))}
            {data.length === 0 && (
              <p className="py-12 text-center text-body">ไม่มีข้อมูล</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
