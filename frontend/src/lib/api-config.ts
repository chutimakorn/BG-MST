// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Helper function to get API URL
export function getApiUrl(path: string = ''): string {
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

// Helper function for authenticated fetch
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return fetch(getApiUrl(path), {
    ...options,
    headers,
  })
}
