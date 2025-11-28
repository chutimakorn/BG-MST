'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SimpleLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Attempting login...')
      
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()
      console.log('Login successful:', data)

      // เก็บ token และ user
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      console.log('Token saved, redirecting to dashboard...')
      
      // รอ 500ms ก่อน redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
      
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
          ระบบจัดการข้อมูลการขาย
        </h1>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
              required
            />
          </div>
          
          {error && (
            <div style={{ 
              padding: '0.75rem', 
              marginBottom: '1rem', 
              background: '#fee2e2', 
              color: '#991b1b',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              background: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f3f4f6', borderRadius: '0.375rem', fontSize: '0.75rem' }}>
          <strong>ข้อมูลทดสอบ:</strong><br/>
          Username: admin<br/>
          Password: admin123
        </div>
      </div>
    </div>
  )
}
