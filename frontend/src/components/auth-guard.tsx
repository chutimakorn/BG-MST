'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // หน้าที่ไม่ต้องเช็ค authentication
    const publicPaths = ['/login', '/simple-login', '/']
    const isPublicPath = publicPaths.some(path => pathname === path || pathname?.startsWith(path))

    if (isPublicPath) {
      setIsChecking(false)
      return
    }

    // เช็ค token
    const token = localStorage.getItem('token')
    
    if (!token) {
      // ไม่มี token ให้ redirect ไป login
      router.replace('/login')
      return
    }

    // มี token แล้ว
    setIsChecking(false)
  }, [pathname, router])

  // ขณะกำลังเช็ค ให้แสดง children ไปก่อน (เพื่อป้องกัน hydration mismatch)
  // แต่ถ้าไม่มี token จะ redirect ไป login ทันที
  return <>{children}</>
}
