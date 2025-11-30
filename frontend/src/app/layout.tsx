import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ThemeProvider } from '@/components/theme-provider'
import DashboardLayoutWrapper from '@/components/dashboard-layout-wrapper'
import AuthGuard from '@/components/auth-guard'
import { ToastProvider } from '@/components/toast-container'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ระบบจัดการข้อมูลการขาย',
  description: 'Sales Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <ToastProvider>
              <AuthGuard>
                <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
              </AuthGuard>
            </ToastProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
