'use client'

import { useState } from 'react'
import Heatmap from '@/components/Heatmap'
import HotspotList from '@/components/HotspotList';
import { Switch } from '@/components/ui/switch';

interface CountryData {
  country: string;
  iso_a3: string;
  avg_tariff: number;
  total_trade_value: number;
  tariff_revenue: number;
  product_count: number;
}

export default function HeatmapPage() {
  const [metric, setMetric] = useState<'avg_tariff' | 'total_trade_value' | 'tariff_revenue'>('avg_tariff')
  const [projection, setProjection] = useState<'globe' | 'mercator'>('globe');
  const [showHotspots, setShowHotspots] = useState(true);
  const [countryData, setCountryData] = useState<CountryData[]>([]);

  return (
    <div className="relative isolate w-screen h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm border-b border-white/20">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-4">Global Tariff Heatmap</h1>
          
          <div className="flex justify-between items-center">
            {/* Metric Selector */}
            <div className="flex space-x-4">
              <button
                onClick={() => setMetric('avg_tariff')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  metric === 'avg_tariff'
                    ? 'bg-white text-black'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Average Tariff Rate
              </button>
              <button
                onClick={() => setMetric('total_trade_value')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  metric === 'total_trade_value'
                    ? 'bg-white text-black'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Total Trade Value
              </button>
              <button
                onClick={() => setMetric('tariff_revenue')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  metric === 'tariff_revenue'
                    ? 'bg-white text-black'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Tariff Revenue
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex space-x-2 bg-white/20 p-1 rounded-lg">
              <button
                onClick={() => setProjection('mercator')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  projection === 'mercator'
                    ? 'bg-white text-black'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                2D Map
              </button>
              <button
                onClick={() => setProjection('globe')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  projection === 'globe'
                    ? 'bg-white text-black'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                3D Globe
              </button>
            </div>

            {/* Hotspot Toggle */}
            <div className="flex items-center space-x-2">
                <Switch 
                    id="hotspot-toggle" 
                    checked={showHotspots} 
                    onCheckedChange={setShowHotspots}
                />
                <label htmlFor="hotspot-toggle" className="text-sm font-medium text-white">Show Hotspots</label>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Component */}
      <div className="relative z-0 w-full h-full">
        <Heatmap 
            metric={metric} 
            projection={projection} 
            showHotspots={showHotspots}
            onDataLoaded={setCountryData}
            transparentBackground
        />
      </div>
      {showHotspots && countryData.length > 0 && <HotspotList countryData={countryData} metric={metric} />}
    </div>
  )
}

