import React from 'react'
import { motion } from 'framer-motion'
import DatasetExplorer from '../components/panels/DatasetExplorer'

export default function Dataset({ toast }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-3xl">Dataset Explorer</h1>
        <p className="section-subtitle text-base">Browse, filter, and export the Boston Housing dataset (506 samples × 13 features + MEDV target)</p>
      </motion.div>

      {/* Dataset stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Samples',  value: '506',  color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Features', value: '13',   color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Target',   value: 'MEDV', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Split',    value: '80/20',color: 'text-amber-600 dark:text-amber-400' },
        ].map(({ label, value, color }) => (
          <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-4 text-center">
            <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-semibold uppercase tracking-wide">{label}</p>
          </motion.div>
        ))}
      </div>

      <DatasetExplorer toast={toast} />
    </div>
  )
}
