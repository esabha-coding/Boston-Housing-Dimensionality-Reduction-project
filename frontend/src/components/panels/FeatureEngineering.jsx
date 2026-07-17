import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'

const ORIGINAL_FEATURES = ['CRIM','ZN','INDUS','CHAS','NOX','RM','AGE','DIS','RAD','TAX','PTRATIO','B','LSTAT']

// n=13 original features → poly degree 2 without bias → 13 + C(13,2) + 13 = 13 + 78 + 13 = 104
const N = 13
const POLY_COUNT = N + N + (N * (N - 1)) / 2 // 13 linear + 13 squared + 78 cross-terms = 104

const sampleFeatures = [
  { name: 'RM', type: 'Original', example: 'RM' },
  { name: 'LSTAT', type: 'Original', example: 'LSTAT' },
  { name: 'RM²', type: 'Squared', example: 'RM × RM' },
  { name: 'LSTAT²', type: 'Squared', example: 'LSTAT × LSTAT' },
  { name: 'RM × LSTAT', type: 'Interaction', example: 'RM × LSTAT' },
  { name: 'RM × NOX', type: 'Interaction', example: 'RM × NOX' },
  { name: 'CRIM × TAX', type: 'Interaction', example: 'CRIM × TAX' },
  { name: 'AGE × DIS', type: 'Interaction', example: 'AGE × DIS' },
]

const typeColors = {
  Original:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Squared:     'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Interaction: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
}

export default function FeatureEngineering() {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          <div>
            <h2 className="section-title text-xl">Feature Engineering</h2>
            <p className="section-subtitle">Polynomial expansion: 13 → {POLY_COUNT} features</p>
          </div>
        </div>
        <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">Degree 2</span>
      </div>

      {/* Visual flow */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-dark-surface/50 rounded-xl">
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">13</span>
          </div>
          <span className="text-xs font-semibold text-gray-500">Original</span>
        </div>

        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />

        <div className="flex-1 grid grid-cols-3 gap-2 min-w-[200px]">
          {[
            { label: '13', desc: 'Linear (x)', color: 'blue' },
            { label: '13', desc: 'Squared (x²)', color: 'purple' },
            { label: '78', desc: 'Cross (x·y)', color: 'amber' },
          ].map(({ label, desc, color }) => (
            <div key={desc} className={`text-center p-2 rounded-xl bg-${color}-50 dark:bg-${color}-900/20`}>
              <p className={`text-xl font-extrabold text-${color}-600 dark:text-${color}-400`}>{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{desc}</p>
            </div>
          ))}
        </div>

        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />

        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{POLY_COUNT}</span>
          </div>
          <span className="text-xs font-semibold text-gray-500">Polynomial</span>
        </div>
      </div>

      {/* Formula */}
      <div className="bg-gray-900 dark:bg-black rounded-xl p-4 mb-4 font-mono text-sm overflow-x-auto">
        <p className="text-green-400">{'# PolynomialFeatures(degree=2, include_bias=False)'}</p>
        <p className="text-gray-300 mt-1">
          {'Total = n + n + C(n,2)'}
          <br />
          {'      = 13 + 13 + (13×12÷2)'}
          <br />
          {'      = 13 + 13 + 78 = '}<span className="text-amber-400 font-bold">104</span>
        </p>
      </div>

      {/* Sample features toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-600 transition-colors"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? 'Hide' : 'Show'} sample feature names
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {sampleFeatures.map((f) => (
              <div key={f.name} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-dark-surface/50 rounded-lg">
                <span className="text-sm font-mono text-gray-900 dark:text-white">{f.example}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[f.type]}`}>{f.type}</span>
              </div>
            ))}
            <p className="col-span-full text-xs text-gray-400 dark:text-gray-500 mt-2">
              … and {POLY_COUNT - sampleFeatures.length} more features. R² improved from 0.67 → 0.81 with polynomial features!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Impact note */}
      <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
          🏆 <strong>+20.8% R² improvement</strong> — Polynomial degree-2 expansion captures non-linear relationships
          between features like RM×LSTAT (rooms × poverty) that linear models miss.
        </p>
      </div>
    </motion.div>
  )
}
