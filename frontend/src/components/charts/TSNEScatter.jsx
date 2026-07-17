import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { getTSNEData } from '../../api/predictions'
import { SkeletonChart } from '../ui/LoadingSkeleton'

function generateMockTSNE(n = 200) {
  const clusters = [
    { cx: -30, cy: -20, r: 18, medvBase: 10 },
    { cx: 20,  cy: 10,  r: 22, medvBase: 25 },
    { cx: -10, cy: 35,  r: 15, medvBase: 40 },
  ]
  const rng = d3.randomNormal.source(d3.randomLcg(99))
  return Array.from({ length: n }, (_, i) => {
    const c = clusters[i % clusters.length]
    const xn = rng(c.cx, c.r)
    const yn = rng(c.cy, c.r)
    return { x: xn(), y: yn(), medv: c.medvBase + Math.random() * 10 }
  })
}

export default function TSNEScatter() {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    getTSNEData()
      .then(setData)
      .catch(() => { setData(generateMockTSNE()); setUsingMock(true) })
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

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height)
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const xExt = d3.extent(data, d => d.x)
    const yExt = d3.extent(data, d => d.y)
    const xPad = (xExt[1] - xExt[0]) * 0.05
    const yPad = (yExt[1] - yExt[0]) * 0.05

    const xScale = d3.scaleLinear().domain([xExt[0] - xPad, xExt[1] + xPad]).range([0, innerW])
    const yScale = d3.scaleLinear().domain([yExt[0] - yPad, yExt[1] + yPad]).range([innerH, 0])
    const colorScale = d3.scaleSequential(d3.interpolateViridis).domain(d3.extent(data, d => d.medv))

    g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(xScale).ticks(6).tickSize(-innerH))
      .call(ag => { ag.select('.domain').remove(); ag.selectAll('.tick line').attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'); ag.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', 11) })

    g.append('g').call(d3.axisLeft(yScale).ticks(5).tickSize(-innerW))
      .call(ag => { ag.select('.domain').remove(); ag.selectAll('.tick line').attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'); ag.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', 11) })

    g.append('text').attr('x', innerW / 2).attr('y', innerH + 44).attr('text-anchor', 'middle').attr('fill', '#475569').attr('font-size', 12).attr('font-weight', 600).text('t-SNE Dimension 1')
    g.append('text').attr('transform', 'rotate(-90)').attr('x', -innerH / 2).attr('y', -44).attr('text-anchor', 'middle').attr('fill', '#475569').attr('font-size', 12).attr('font-weight', 600).text('t-SNE Dimension 2')

    const tooltip = d3.select(container).select('.d3-tooltip')

    g.selectAll('circle').data(data).join('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 0)
      .attr('fill', d => colorScale(d.medv))
      .attr('opacity', 0.75)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('r', 7).attr('opacity', 1)
        tooltip.style('display', 'block')
          .style('left', (event.offsetX + 12) + 'px')
          .style('top', (event.offsetY - 36) + 'px')
          .html(`<strong>MEDV:</strong> $${d.medv.toFixed(1)}k<br/>t-SNE 1: ${d.x.toFixed(2)}<br/>t-SNE 2: ${d.y.toFixed(2)}`)
      })
      .on('mouseleave', function() { d3.select(this).attr('r', 4).attr('opacity', 0.75); tooltip.style('display', 'none') })
      .transition().duration(700).delay((_, i) => i * 2)
      .attr('r', 4)

    // Legend
    const defs = svg.append('defs')
    const grad = defs.append('linearGradient').attr('id', 'viridis-tsne').attr('gradientTransform', 'rotate(90)')
    const medvExt = d3.extent(data, d => d.medv)
    Array.from({ length: 11 }).forEach((_, i) => {
      grad.append('stop').attr('offset', `${i * 10}%`)
        .attr('stop-color', colorScale(medvExt[1] - (i / 10) * (medvExt[1] - medvExt[0])))
    })
    const legendH = 120; const lx = innerW + 20; const ly = (innerH - legendH) / 2
    g.append('rect').attr('x', lx).attr('y', ly).attr('width', 14).attr('height', legendH).attr('fill', 'url(#viridis-tsne)').attr('rx', 3)
    g.append('text').attr('x', lx + 18).attr('y', ly + 6).attr('fill', '#64748b').attr('font-size', 10).text(`$${medvExt[1].toFixed(0)}k`)
    g.append('text').attr('x', lx + 18).attr('y', ly + legendH).attr('fill', '#64748b').attr('font-size', 10).text(`$${medvExt[0].toFixed(0)}k`)
    g.append('text').attr('x', lx + 7).attr('y', ly - 8).attr('fill', '#64748b').attr('font-size', 10).attr('text-anchor', 'middle').text('MEDV')
  }, [data])

  if (loading) return <SkeletonChart height={380} />

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="section-title text-xl">t-SNE Scatter Plot</h2>
          <p className="section-subtitle">Non-linear manifold embedding — color-coded by MEDV</p>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-primary">2D Embedding</span>
          {usingMock && <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Mock Data</span>}
        </div>
      </div>
      <div ref={containerRef} className="relative w-full overflow-x-auto">
        <div className="d3-tooltip" style={{ display: 'none', position: 'absolute' }} />
        <svg ref={svgRef} className="w-full" />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        t-SNE preserves local neighbourhood structure. Clusters indicate groups of houses with similar feature profiles. Unlike PCA, axes have no interpretable meaning.
      </p>
    </div>
  )
}
