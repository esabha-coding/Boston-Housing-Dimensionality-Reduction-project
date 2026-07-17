import React from 'react'
import { motion } from 'framer-motion'
import PredictionForm from '../components/forms/PredictionForm'
import { Brain, CheckCircle } from 'lucide-react'

const steps = [
  { icon: '①', label: 'Enter Features', desc: 'Fill in 13 housing characteristics' },
  { icon: '②', label: 'Polynomial Expansion', desc: '13 → 104 features automatically' },
  { icon: '③', label: 'Ridge Regression', desc: 'Best model (R²=0.81) predicts MEDV' },
]

export default function Predict({ toast }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-3xl">Live Price Prediction</h1>
        <p className="section-subtitle text-base">Predict Boston housing prices using our best Ridge + Polynomial model</p>
      </motion.div>

      {/* Process steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-5 flex items-start gap-4"
          >
            <span className="text-2xl font-extrabold text-primary">{step.icon}</span>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{step.label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <PredictionForm toast={toast} />
      </motion.div>

      {/* Model info */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-gray-900 dark:text-white">Model Details</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {[
            { label: 'Algorithm',   value: 'Ridge Regression' },
            { label: 'Features',    value: '104 (Poly Deg-2)' },
            { label: 'R² Score',    value: '0.81 (test)' },
            { label: 'MSE',         value: '14.14' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
              <p className="font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
