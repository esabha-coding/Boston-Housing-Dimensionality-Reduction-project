import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { getPCAData } from '../../api/predictions'
import { SkeletonChart } from '../ui/LoadingSkeleton'

// Fallback mock data when backend is offline
function generateMockPCA(n = 200) {
  const rng = d3.randomNormal.source(d3.randomLcg(42))
  const x = rng(0, 50)
  const y = rng(0, 30)
  return Array.from({ length: n }, () => {
    const medv = Math.random() * 45 + 5
    return { pc1: x() + medv * 0.3, pc2: y() + medv * 0.1, medv }
  })
}

export default function PCAScatter() {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    getPCAData()
      .then(setData)
      .catch(() => { setData(generateMockPCA()); setUsingMock(true) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    const container = containerRef.current
    const width = container.clientWidth || 600
    const height = 380
    const margin = { top: 20, right: 100, bottom: 60, left: 60 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const xExtent = d3.extent(data, d => d.pc1)
    const yExtent = d3.extent(data, d => d.pc2)
    const xPad = (xExtent[1] - xExtent[0]) * 0.05
    const yPad = (yExtent[1] - yExtent[0]) * 0.05

    const xScale = d3.scaleLinear().domain([xExtent[0] - xPad, xExtent[1] + xPad]).range([0, innerW])
    const yScale = d3.scaleLinear().domain([yExtent[0] - yPad, yExtent[1] + yPad]).range([innerH, 0])
    const colorScale = d3.scaleSequential(d3.interpolateViridis).domain(d3.extent(data, d => d.medv))

    // Axes
    g.append('g').attr('transform', `translate(0,${innerH})`).call(
      d3.axisBottom(xScale).ticks(6).tickSize(-innerH)
    ).call(ag => {
      ag.select('.domain').remove()
      ag.selectAll('.tick line').attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
      ag.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', 11)
    })

    g.append('g').call(
      d3.axisLeft(yScale).ticks(5).tickSize(-innerW)
    ).call(ag => {
      ag.select('.domain').remove()
      ag.selectAll('.tick line').attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
      ag.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', 11)
    })

    // Axis labels
    g.append('text').attr('x', innerW / 2).attr('y', innerH + 44)
      .attr('text-anchor', 'middle').attr('fill', '#475569').attr('font-size', 12).attr('font-weight', 600)
      .text('Principal Component 1')

    g.append('text').attr('transform', 'rotate(-90)').attr('x', -innerH / 2).attr('y', -44)
      .attr('text-anchor', 'middle').attr('fill', '#475569').attr('font-size', 12).attr('font-weight', 600)
      .text('Principal Component 2')

    // Tooltip
    const tooltip = d3.select(container).select('.d3-tooltip')

    // Points
    g.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => xScale(d.pc1))
      .attr('cy', d => yScale(d.pc2))
      .attr('r', 0)
      .attr('fill', d => colorScale(d.medv))
      .attr('opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('r', 7).attr('opacity', 1).attr('stroke-width', 1.5)
        tooltip
          .style('display', 'block')
          .style('left', (event.offsetX + 12) + 'px')
          .style('top', (event.offsetY - 36) + 'px')
          .html(`<strong>MEDV:</strong> $${d.medv.toFixed(1)}k<br/>PC1: ${d.pc1.toFixed(2)}<br/>PC2: ${d.pc2.toFixed(2)}`)
      })
      .on('mouseleave', function() {
        d3.select(this).attr('r', 4).attr('opacity', 0.8).attr('stroke-width', 0.5)
        tooltip.style('display', 'none')
      })
      .transition().duration(600).delay((_, i) => i * 1.5)
      .attr('r', 4)

    // Color legend (vertical gradient)
    const defs = svg.append('defs')
    const grad = defs.append('linearGradient').attr('id', 'viridis-grad').attr('gradientTransform', 'rotate(90)')
    const steps = 10
    Array.from({ length: steps + 1 }).forEach((_, i) => {
      grad.append('stop').attr('offset', `${(i / steps) * 100}%`)
        .attr('stop-color', colorScale(d3.extent(data, d => d.medv)[1] - (i / steps) * (d3.extent(data, d => d.medv)[1] - d3.extent(data, d => d.medv)[0])))
    })

    const legendH = 120
    const lx = innerW + 20
    const ly = (innerH - legendH) / 2
    g.append('rect').attr('x', lx).attr('y', ly).attr('width', 14).attr('height', legendH)
      .attr('fill', 'url(#viridis-grad)').attr('rx', 3)
    g.append('text').attr('x', lx + 18).attr('y', ly + 6).attr('fill', '#64748b').attr('font-size', 10).text(`$${d3.max(data, d => d.medv).toFixed(0)}k`)
    g.append('text').attr('x', lx + 18).attr('y', ly + legendH).attr('fill', '#64748b').attr('font-size', 10).text(`$${d3.min(data, d => d.medv).toFixed(0)}k`)
    g.append('text').attr('x', lx + 7).attr('y', ly - 8).attr('fill', '#64748b').attr('font-size', 10).attr('text-anchor', 'middle').text('MEDV')

  }, [data])

  if (loading) return <SkeletonChart height={380} />

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="section-title text-xl">PCA Scatter Plot</h2>
          <p className="section-subtitle">PC1 vs PC2 — color-coded by house price (MEDV)</p>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-primary">2 Components</span>
          {usingMock && <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Mock Data</span>}
        </div>
      </div>
      <div ref={containerRef} className="relative w-full overflow-x-auto">
        <div className="d3-tooltip" style={{ display: 'none', position: 'absolute' }} />
        <svg ref={svgRef} className="w-full" />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        Variance explained: <strong>PC1 captures the highest variance</strong>. Points clustered by MEDV indicate price-driven separation in principal space.
      </p>
    </div>
  )
}
