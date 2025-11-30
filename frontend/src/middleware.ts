import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // หน้าที่ไม่ต้องเช็ค authentication
  const publicPaths = ['/login', '/simple-login']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // ถ้าเป็นหน้า public ให้ผ่านไปได้เลย
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // เช็ค token จาก cookie (ถ้ามี) หรือจะเช็คจาก localStorage ฝั่ง client
  // เนื่องจาก middleware ทำงานฝั่ง server จึงไม่สามารถเข้าถึง localStorage ได้
  // ดังนั้นจะใช้วิธีเช็คที่ client-side แทน
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
