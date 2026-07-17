import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Database, Search, Download, ChevronUp, ChevronDown } from 'lucide-react'
import { getDataset } from '../../api/predictions'
import { SkeletonTable } from '../ui/LoadingSkeleton'

const COLUMNS = ['CRIM','ZN','INDUS','CHAS','NOX','RM','AGE','DIS','RAD','TAX','PTRATIO','B','LSTAT','MEDV']

// Generate mock Boston data
function generateMockData(n = 50) {
  const rng = (min, max, dec = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(dec))
  return Array.from({ length: n }, () => ({
    CRIM: rng(0.006, 89, 5), ZN: rng(0, 100, 1), INDUS: rng(0.46, 27.74, 2),
    CHAS: Math.round(Math.random() * 0.3), NOX: rng(0.385, 0.871, 3),
    RM: rng(3.561, 8.78, 3), AGE: rng(2.9, 100, 1), DIS: rng(1.13, 12.13, 3),
    RAD: Math.round(rng(1, 24, 0)), TAX: Math.round(rng(187, 711, 0)),
    PTRATIO: rng(12.6, 22, 1), B: rng(0.32, 396.9, 2), LSTAT: rng(1.73, 37.97, 2),
    MEDV: rng(5, 50, 1),
  }))
}

export default function DatasetExplorer({ toast }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortCol, setSortCol] = useState('MEDV')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(0)
  const [usingMock, setUsingMock] = useState(false)
  const PAGE_SIZE = 15

  useEffect(() => {
    getDataset()
      .then(setData)
      .catch(() => { setData(generateMockData(50)); setUsingMock(true) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let rows = data
    if (search) {
      const s = parseFloat(search)
      rows = isNaN(s)
        ? rows
        : rows.filter(r => Object.values(r).some(v => String(v).startsWith(search)))
    }
    return [...rows].sort((a, b) => {
      const diff = (a[sortCol] ?? 0) - (b[sortCol] ?? 0)
      return sortDir === 'asc' ? diff : -diff
    })
  }, [data, search, sortCol, sortDir])

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const handleSort = (col) => {
    if (col === sortCol) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
    setPage(0)
  }

  const exportCSV = () => {
    const header = COLUMNS.join(',')
    const rows = data.map(r => COLUMNS.map(c => r[c] ?? '').join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'boston_housing.csv'; a.click()
    URL.revokeObjectURL(url)
    toast?.success('CSV exported successfully!')
  }

  if (loading) return <SkeletonTable rows={8} />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-dark-border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <div>
              <h2 className="section-title text-xl">Dataset Explorer</h2>
              <p className="section-subtitle">
                {filtered.length} of {data.length} records
                {usingMock && <span className="ml-2 badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Mock</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by value…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="input-field pl-9 w-48"
              />
            </div>
            <button onClick={exportCSV} className="btn-primary flex items-center gap-2 py-2">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-dark-border/50">
              {COLUMNS.map(col => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-3 py-3 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide cursor-pointer hover:text-primary dark:hover:text-primary transition-colors whitespace-nowrap select-none"
                >
                  <span className="flex items-center gap-1">
                    {col}
                    {sortCol === col
                      ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      : <span className="w-3 h-3 opacity-0 group-hover:opacity-30">↕</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
            {paged.map((row, i) => (
              <tr key={i} className="hover:bg-blue-50/50 dark:hover:bg-dark-border/30 transition-colors">
                {COLUMNS.map(col => (
                  <td key={col} className={`px-3 py-2.5 tabular-nums ${col === 'MEDV' ? 'font-bold text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                    {typeof row[col] === 'number' ? row[col].toFixed(col === 'RAD' || col === 'TAX' || col === 'CHAS' ? 0 : 2) : row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Previous</button>
          <span className="flex items-center text-xs text-gray-500 px-2">Page {page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next</button>
        </div>
      </div>
    </motion.div>
  )
}
