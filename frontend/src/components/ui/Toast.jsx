import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const icons = {
  success: { Icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
  error:   { Icon: XCircle,     color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  warning: { Icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  info:    { Icon: Info,         color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
}

function Toast({ id, message, type = 'info', onRemove }) {
  const { Icon, color, bg } = icons[type] || icons.info
  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${bg}`}
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${color}`} />
      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium flex-1">{message}</p>
      <button onClick={() => onRemove(id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default Toast
