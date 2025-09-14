'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import {
  getTariffRateHistory,
  TariffDataPoint,
} from '@/lib/tradeData'
import HistoricalAnalysisSheet from '../HistoricalAnalysisSheet'

const LineChart = () => {
  const [data, setData] = useState<TariffDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDataPoint, setSelectedDataPoint] = useState<TariffDataPoint | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const tariffData = await getTariffRateHistory()
      setData(tariffData)
      setLoading(false)
    }

    fetchData()
  }, [])

  const handlePointClick = useCallback((event: any) => {
    if (event.points && event.points.length > 0) {
      const point = event.points[0]
      const pointIndex = point.pointIndex
      const clickedDataPoint = data[pointIndex]
      
      if (clickedDataPoint) {
        setSelectedDataPoint(clickedDataPoint)
        setShowAnalysis(true)
      }
    }
  }, [data])

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
        color: '#3b82f6',
        size: 8,
        line: {
          color: '#1e40af',
          width: 2
        }
      },
      line: { 
        color: '#3b82f6',
        width: 3
      },
      name: 'US Tariff Rate',
      hovertemplate: '<b>Year:</b> %{x}<br>' +
                    '<b>Tariff Rate:</b> %{y:.2f}%<br>' +
                    '<extra></extra>',
    },
  ]

  const layout = {
    title: { 
      text: 'US Historical Tariff Rates (1821-2025)',
      font: { color: '#ffffff', size: 18, family: 'Inter, sans-serif' },
      x: 0.5,
      y: 0.95
    },
    xaxis: {
      title: { 
        text: 'Year', 
        font: { color: '#ffffff', size: 14 } 
      },
      gridcolor: '#374151',
      tickfont: { color: '#ffffff', size: 12 },
      showgrid: true,
      zeroline: false,
      range: data.length > 0 ? [Math.min(...data.map(d => d.year)) - 5, Math.max(...data.map(d => d.year)) + 5] : undefined,
      dtick: 25
    },
    yaxis: {
      title: { 
        text: 'Tariff Rate (%)', 
        font: { color: '#ffffff', size: 14 } 
      },
      gridcolor: '#374151',
      tickfont: { color: '#ffffff', size: 12 },
      showgrid: true,
      zeroline: false
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      color: '#ffffff',
      family: 'Inter, sans-serif'
    },
    margin: {
      l: 60,
      r: 30,
      t: 60,
      b: 60
    },
    showlegend: false
  }

  const config = {
    displayModeBar: false,
    responsive: true
  }

  return (
    <div className="h-full w-full relative">
      <Plot
        {...{
          data: chartData,
          layout: layout,
          config: config,
          style: { width: '100%', height: '100%' },
          useResizeHandler: true,
          onClick: handlePointClick,
        } as any}
      />
      
      <HistoricalAnalysisSheet
        isOpen={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        dataPoint={selectedDataPoint}
      />
    </div>
  )
}

export default LineChart
