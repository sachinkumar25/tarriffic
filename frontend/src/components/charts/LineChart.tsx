'use client'
import React, { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import {
  getTariffRateHistory,
  TariffDataPoint,
} from '@/lib/tradeData'

const LineChart = () => {
  const [data, setData] = useState<TariffDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const tariffData = await getTariffRateHistory()
      setData(tariffData)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-400">
        Loading Chart...
      </div>
    )
  }

  const chartData = [
    {
      x: data.map(d => d.year),
      y: data.map(d => d.rate),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      marker: { color: '#8884d8' },
      line: { color: '#8884d8' },
      name: 'Avg. Tariff Rate',
    },
  ]

  const layout = {
    title: { text: 'US Average Tariff Rate (1990-2022)' },
    xaxis: {
      title: { text: 'Year' },
      gridcolor: '#e0e0e0',
    },
    yaxis: {
      title: { text: 'Tariff Rate (%)' },
      gridcolor: '#e0e0e0',
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      color: '#333',
    },
  }

  return (
    <div className="h-full w-full">
      <Plot
        data={chartData}
        layout={layout}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler
      />
    </div>
  )
}

export default LineChart
