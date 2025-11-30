// Helper function to show toast notifications
// This is a temporary solution until we migrate all alert() calls

let toastFunction: ((message: string, type?: 'success' | 'error' | 'info' | 'warning') => void) | null = null

export const setToastFunction = (fn: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void) => {
  toastFunction = fn
}

export const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  if (toastFunction) {
    toastFunction(message, type)
  } else {
    // Fallback to alert if toast is not available
    alert(message)
  }
}

// Convenience functions
export const showSuccess = (message: string) => showToast(message, 'success')
export const showError = (message: string) => showToast(message, 'error')
export const showInfo = (message: string) => showToast(message, 'info')
export const showWarning = (message: string) => showToast(message, 'warning')
