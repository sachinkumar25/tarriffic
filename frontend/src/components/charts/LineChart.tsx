'use client'

import dynamic from 'next/dynamic'
import {
  getTariffRateHistory,
  TariffDataPoint,
} from '@/lib/tradeData'
import { PlotlyClickEvent } from 'react-plotly.js'
import { useEffect, useState } from 'react'

// Create a separate component for the plot to isolate the dynamic import
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-gray-400">
      Loading Chart...
    </div>
  ),
})

interface LineChartProps {
  onPointSelect: (point: TariffDataPoint | null) => void
}

const LineChart = ({ onPointSelect }: LineChartProps) => {
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

  const handlePointClick = (event: Readonly<PlotlyClickEvent>) => {
    if (event.points.length > 0) {
      const point = event.points[0]
      const year = point.x as number
      const rate = point.y as number
      onPointSelect({ year, rate })
    }
  }

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
      marker: {
        color: '#8884d8',
        size: 8,
        symbol: 'circle',
      },
      line: { color: '#38bdf8' }, // sky-400
      name: 'Avg. Tariff Rate',
    },
  ]

  const layout = {
    title: {
      text: 'US Average Tariff Rate (1821-2025)',
      font: {
        color: '#e0e0e0',
        size: 20,
      },
    },
    xaxis: {
      title: {
        text: 'Year',
        font: { color: '#b0b0b0' },
      },
      gridcolor: 'rgba(255, 255, 255, 0.2)',
      tickfont: { color: '#b0b0b0' },
      linecolor: 'rgba(255, 255, 255, 0.2)',
      dtick: 25,
    },
    yaxis: {
      title: {
        text: 'Tariff Rate (%)',
        font: { color: '#b0b0b0' },
      },
      gridcolor: 'rgba(255, 255, 255, 0.2)',
      tickfont: { color: '#b0b0b0' },
      linecolor: 'rgba(255, 255, 255, 0.2)',
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      color: '#e0e0e0',
    },
    hoverlabel: {
      bgcolor: '#1f2937', // gray-800
      font: { color: '#e0e0e0' },
    },
    modebar: {
      color: '#e0e0e0',
      activecolor: '#38bdf8', // sky-400
    },
  }

  return (
    <div className="h-full w-full">
      <Plot
        data={chartData}
        layout={layout}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler
        onClick={handlePointClick}
        config={{ displayModeBar: false }}
      />
    </div>
  )
}

export default LineChart
