import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount)
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return '-'
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // ตรวจสอบว่าเป็น valid date หรือไม่
    if (isNaN(dateObj.getTime())) {
      return '-'
    }
    
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj)
  } catch (error) {
    return '-'
  }
}
