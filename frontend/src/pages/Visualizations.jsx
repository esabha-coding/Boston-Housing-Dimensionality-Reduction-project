import React from 'react'
import { motion } from 'framer-motion'
import PCAScatter from '../components/charts/PCAScatter'
import TSNEScatter from '../components/charts/TSNEScatter'
import { Info } from 'lucide-react'

const comparison = [
  { label: 'PCA', pros: 'Fast, deterministic, variance-maximizing', cons: 'Linear only, may miss clusters', r2: 'R² = 0.25 (regression)' },
  { label: 't-SNE', pros: 'Reveals non-linear clusters', cons: 'Slow, stochastic, no coordinates', r2: 'Visualization only' },
]

export default function Visualizations() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-3xl">Dimensionality Reduction</h1>
        <p className="section-subtitle text-base">PCA and t-SNE applied to 404 training samples — colored by MEDV (house price)</p>
      </motion.div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> Both plots use the viridis colormap. Yellow = high MEDV (expensive), Purple = low MEDV (affordable).
          If the backend is offline, <strong>mock data</strong> is displayed for visual reference.
        </div>
      </div>

      {/* Scatter plots */}
      <div className="grid gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <PCAScatter />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <TSNEScatter />
        </motion.div>
      </div>

      {/* Comparison table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-dark-border">
          <h3 className="font-bold text-gray-900 dark:text-white">Method Comparison</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-dark-border/50">
              {['Method','Strengths','Limitations','Predictive Use'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
            {comparison.map(row => (
              <tr key={row.label} className="hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors">
                <td className="px-4 py-3 font-bold text-primary">{row.label}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.pros}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.cons}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.r2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
