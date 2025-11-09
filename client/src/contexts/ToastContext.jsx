// contexts/ToastContext.jsx
import React, { createContext, useContext } from 'react'
import { toast } from 'sonner'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const showSuccess = (message) => toast.success(message)
  const showError = (message) => toast.error(message)
  const showWarning = (message) => toast.warning(message)
  const showInfo = (message) => toast.info(message)

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}