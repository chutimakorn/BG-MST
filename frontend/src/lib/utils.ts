import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { th } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'dd/MM/yyyy', { locale: th })
  } catch (error) {
    return '-'
  }
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '฿0.00'
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
