import React from 'react'

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="skeleton w-12 h-12 rounded-2xl" />
        <div className="skeleton w-12 h-5 rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-9 w-28 rounded-lg" />
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-3 w-40 rounded" />
      </div>
    </div>
  )
}

export function SkeletonChart({ height = 300, className = '' }) {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="skeleton h-6 w-48 rounded mb-2" />
      <div className="skeleton h-4 w-64 rounded mb-6" />
      <div className="skeleton rounded-xl" style={{ height }} />
    </div>
  )
}

export function SkeletonTable({ rows = 6, className = '' }) {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="skeleton h-6 w-40 rounded mb-6" />
      <div className="space-y-3">
        <div className="skeleton h-10 w-full rounded-lg" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-full rounded" />
        ))}
      </div>
    </div>
  )
}

export default function LoadingSkeleton({ type = 'card', ...props }) {
  const map = { card: SkeletonCard, chart: SkeletonChart, table: SkeletonTable }
  const Component = map[type] || SkeletonCard
  return <Component {...props} />
}
