import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, Activity } from 'lucide-react'

const models = [
  { name: 'Ridge\n(No PCA)',      shortName: 'No PCA',   r2: 0.67, mse: 24.48 },
  { name: 'Ridge\n(PCA 2-comp)', shortName: 'PCA',       r2: 0.25, mse: 55.02 },
  { name: 'Ridge\n(Poly Deg-2)', shortName: 'Poly Deg2', r2: 0.81, mse: 14.14 },
]

const COLORS = {
  best:   '#059669',
  middle: '#1A56DB',
  worst:  '#DC2626',
}

function getColor(metric, value, allValues) {
  const sorted = [...allValues].sort((a, b) => metric === 'r2' ? b - a : a - b)
  const rank = sorted.indexOf(value)
  if (rank === 0) return COLORS.best
  if (rank === allValues.length - 1) return COLORS.worst
  return COLORS.middle
}

const CustomTooltipR2 = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-lg p-3">
      <p className="font-semibold text-sm text-gray-900 dark:text-white">{d.shortName}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">R² Score: <strong className="text-blue-600 dark:text-blue-400">{d.r2.toFixed(2)}</strong></p>
    </div>
  )
}

const CustomTooltipMSE = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-lg p-3">
      <p className="font-semibold text-sm text-gray-900 dark:text-white">{d.shortName}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">MSE: <strong className="text-red-600 dark:text-red-400">{d.mse.toFixed(2)}</strong></p>
    </div>
  )
}

const r2Values  = models.map(m => m.r2)
const mseValues = models.map(m => m.mse)

export default function ModelComparison() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs font-semibold">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: COLORS.best }} />Best Model</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: COLORS.middle }} />Baseline</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: COLORS.worst }} />Worst Model</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* R² Chart */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-gray-900 dark:text-white">R² Score Comparison</h3>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Higher is better (max = 1.0)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={models} barSize={52} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="shortName" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltipR2 />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
              <Bar dataKey="r2" radius={[6, 6, 0, 0]}>
                {models.map((m, i) => (
                  <Cell key={i} fill={getColor('r2', m.r2, r2Values)} />
                ))}
                <LabelList dataKey="r2" position="top" formatter={(v) => v.toFixed(2)} style={{ fill: '#374151', fontSize: 11, fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* MSE Chart */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-gray-900 dark:text-white">MSE Comparison</h3>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Lower is better (mean squared error)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={models} barSize={52} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="shortName" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltipMSE />} cursor={{ fill: 'rgba(239,68,68,0.05)' }} />
              <Bar dataKey="mse" radius={[6, 6, 0, 0]}>
                {models.map((m, i) => (
                  <Cell key={i} fill={getColor('mse', m.mse, mseValues)} />
                ))}
                <LabelList dataKey="mse" position="top" formatter={(v) => v.toFixed(1)} style={{ fill: '#374151', fontSize: 11, fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-dark-border/50">
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Model</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">R² Score</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">MSE</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rank</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
            {[...models].sort((a, b) => b.r2 - a.r2).map((m, i) => (
              <tr key={m.shortName} className="hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{m.shortName}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${i === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>{m.r2.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${i === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>{m.mse.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {i === 0 && <span className="badge badge-success">🏆 Best</span>}
                  {i === 1 && <span className="badge badge-primary">2nd</span>}
                  {i === 2 && <span className="badge badge-danger">3rd</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
