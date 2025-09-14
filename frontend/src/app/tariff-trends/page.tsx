'use client'

import LineChart from '@/components/charts/LineChart'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { TariffDataPoint } from '@/lib/tradeData'
import { formatAnalysis } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

interface AnalysisRecord {
  year: number
  rate: number
  analysis: string
}

export default function TariffTrendsPage() {
  const [selectedPoint, setSelectedPoint] = useState<TariffDataPoint | null>(null)
  const [
    analysisData,
    setAnalysisData,
  ] = useState<Record<string, AnalysisRecord> | null>(null)

  // Effect to fetch analysis data once
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const res = await fetch('/historical_analysis.json')
        if (res.ok) {
          const json = await res.json()
          setAnalysisData(json)
        } else {
          setAnalysisData({}) // Set to empty if not found
        }
      } catch (error) {
        console.error("Failed to fetch analysis data", error)
        setAnalysisData({}) // Set to empty on error
      }
    }
    fetchAnalysisData()
  }, [])

  const handlePointSelect = (point: TariffDataPoint | null) => {
    setSelectedPoint(point)
  }

  const currentAnalysis = selectedPoint
    ? analysisData?.[selectedPoint.year]?.analysis
    : null

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col relative">
      <div className="relative z-10 px-4 pt-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-sky-200 via-cyan-200 to-white drop-shadow-[0_2px_12px_rgba(56,189,248,0.15)]">
          Historical Tariff Trends
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-sky-200/90 font-medium tracking-wide">
          U.S. Average Tariff Rates Over Time
        </p>
        <Link
          href="/"
          className="absolute top-8 left-8 text-lg font-semibold text-gray-300 hover:text-white transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>

      <div className="flex-grow p-8">
        <div className="h-full bg-black/50 backdrop-blur-sm p-8 rounded-2xl">
          <LineChart onPointSelect={handlePointSelect} />
        </div>
      </div>

      {/* Analysis Sidebar */}
      <AnimatePresence>
        {selectedPoint && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPoint(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-gray-900/90 border-l border-gray-700 shadow-2xl z-50 flex flex-col"
            >
              <div className="flex-shrink-0 p-6 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  Analysis for {selectedPoint.year}
                </h2>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="text-white/70 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-grow p-6 overflow-y-auto">
                {/* Rate Display */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 mb-6 border border-white/10 text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-1">
                    📊 {selectedPoint.rate.toFixed(1)}%
                  </div>
                  <div className="text-white/70 text-sm font-medium">
                    Average Tariff Rate
                  </div>
                </div>

                {/* Analysis Section */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    📜 Historical Context
                  </h3>
                  <div className="bg-white/5 rounded-lg p-4 min-h-[200px]">
                    {analysisData === null ? (
                      <div className="flex items-center space-x-2 text-white/70">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Loading analysis...</span>
                      </div>
                    ) : currentAnalysis ? (
                      <div className="text-white/90 leading-relaxed space-y-3">
                        {formatAnalysis(currentAnalysis)}
                      </div>
                    ) : (
                      <div className="text-white/70 space-y-2">
                        <p>
                          Analysis for this year has not been generated yet.
                        </p>
                        <p>
                          Run{' '}
                          <code className="bg-gray-700 text-sm p-1 rounded">
                            npm run generate-analysis
                          </code>{' '}
                          in your terminal to create it.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
