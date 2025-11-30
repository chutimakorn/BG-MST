'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import { showSuccess, showError } from '@/lib/toast-helper'

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'user',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadUsers()
  }, [router])

  const loadUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to load users', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        username: user.username,
        password: '',
        fullName: user.fullName,
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setFormData({
        username: '',
        password: '',
        fullName: '',
        role: 'user',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({
      username: '',
      password: '',
      fullName: '',
      role: 'user',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        // Update user
        const updateData: any = {
          fullName: formData.fullName,
          role: formData.role,
        }
        if (formData.password) {
          updateData.password = formData.password
        }
        await api.put(`/users/${editingUser.id}`, updateData)
      } else {
        // Create user
        await api.post('/auth/register', formData)
      }
      handleCloseModal()
      loadUsers()
      showSuccess(editingUser ? 'แก้ไขผู้ใช้สำเร็จ' : 'สร้างผู้ใช้สำเร็จ')
    } catch (error: any) {
      showError(error.response?.data?.message || 'เกิดข้อผิดพลาด')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) return
    
    try {
      await api.delete(`/users/${id}`)
      loadUsers()
      showSuccess('ลบผู้ใช้สำเร็จ')
    } catch (error) {
      showError('ไม่สามารถลบผู้ใช้ได้')
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          จัดการผู้ใช้งาน
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90"
        >
          <Plus className="h-5 w-5" />
          เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {loading ? (
          <div className="px-4 py-12 text-center">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                    ชื่อผู้ใช้
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    บทบาท
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    วันที่สร้าง
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-body">
                      ไม่พบข้อมูลผู้ใช้
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-stroke dark:border-strokedark">
                      <td className="px-4 py-5 pl-9 xl:pl-11">
                        <p className="font-medium text-black dark:text-white">
                          {user.username}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-black dark:text-white">{user.fullName}</p>
                      </td>
                      <td className="px-4 py-5">
                        <span className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                          user.role === 'admin' ? 'bg-success text-success' : 'bg-primary text-primary'
                        }`}>
                          {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-sm text-black dark:text-white">
                          {new Date(user.createdAt).toLocaleDateString('th-TH')}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="hover:text-primary"
                            title="แก้ไข"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="hover:text-meta-1"
                            title="ลบ"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-black dark:text-white">
                {editingUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
              </h3>
              <button onClick={handleCloseModal} className="hover:text-primary">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  ชื่อผู้ใช้ <span className="text-meta-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!!editingUser}
                  required
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  รหัสผ่าน {!editingUser && <span className="text-meta-1">*</span>}
                  {editingUser && <span className="text-sm text-body">(เว้นว่างถ้าไม่ต้องการเปลี่ยน)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  ชื่อ-นามสกุล <span className="text-meta-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  บทบาท <span className="text-meta-1">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="user">ผู้ใช้งาน</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-stroke px-6 py-3 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
                >
                  {editingUser ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
