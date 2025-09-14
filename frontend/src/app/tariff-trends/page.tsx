'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const LineChart = dynamic(() => import('@/components/charts/LineChart'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-gray-400">
      Loading Chart...
    </div>
  )
})

export default function TariffTrendsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="relative z-10 px-4 pt-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-sky-200 via-cyan-200 to-white drop-shadow-[0_2px_12px_rgba(56,189,248,0.15)]">
            Historical Tariff Trends
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-sky-200/90 font-medium tracking-wide">
            U.S. Average Tariff Rates Over Time
          </p>
        </div>
        <Link
          href="/"
          className="absolute top-8 left-8 text-lg font-semibold text-gray-300 hover:text-white transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-black/50 backdrop-blur-sm p-8 rounded-2xl">
          <div className="h-[600px]">
            <LineChart />
          </div>
        </div>
      </div>
    </div>
  )
}
