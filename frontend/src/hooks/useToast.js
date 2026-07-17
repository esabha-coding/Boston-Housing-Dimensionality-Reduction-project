import { useState, useCallback } from 'react'

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (message, opts) => addToast({ message, type: 'success', ...opts }),
    error: (message, opts) => addToast({ message, type: 'error', ...opts }),
    info: (message, opts) => addToast({ message, type: 'info', ...opts }),
    warning: (message, opts) => addToast({ message, type: 'warning', ...opts }),
  }

  return { toasts, toast, removeToast }
}
