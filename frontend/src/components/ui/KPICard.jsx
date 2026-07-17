import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3)
}

function useCountUp(target, duration = 1500) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start = null
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setValue(Math.floor(easeOut(progress) * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return value
}

export default function KPICard({ icon: Icon, label, value, suffix = '', description, color = 'primary', delay = 0 }) {
  const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, ''))
  const animated = useCountUp(numericValue, 1200)

  const colorMap = {
    primary: 'from-blue-500 to-blue-600 shadow-blue-200 dark:shadow-blue-900/30',
    success: 'from-emerald-500 to-emerald-600 shadow-emerald-200 dark:shadow-emerald-900/30',
    warning: 'from-amber-500 to-amber-600 shadow-amber-200 dark:shadow-amber-900/30',
    purple:  'from-purple-500 to-purple-600 shadow-purple-200 dark:shadow-purple-900/30',
  }

  const bgMap = {
    primary: 'bg-blue-50 dark:bg-blue-900/10',
    success: 'bg-emerald-50 dark:bg-emerald-900/10',
    warning: 'bg-amber-50 dark:bg-amber-900/10',
    purple:  'bg-purple-50 dark:bg-purple-900/10',
  }

  const textMap = {
    primary: 'text-blue-600 dark:text-blue-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    purple:  'text-purple-600 dark:text-purple-400',
  }

  // Format displayed value
  const displayValue = suffix === '%' || String(value).includes('.')
    ? (animated / (suffix === '%' ? 1 : Math.pow(10, String(numericValue).split('.')[1]?.length || 0))).toFixed(
        String(numericValue).split('.')[1]?.length || 0
      )
    : animated.toLocaleString()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="card p-6 hover:shadow-card-hover group cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[color]} shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`${bgMap[color]} px-2.5 py-1 rounded-lg`}>
          <span className={`text-xs font-semibold ${textMap[color]}`}>Live</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white tabular-nums">
            {displayValue}
          </span>
          {suffix && <span className={`text-lg font-bold ${textMap[color]}`}>{suffix}</span>}
        </div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>
        )}
      </div>
    </motion.div>
  )
}
