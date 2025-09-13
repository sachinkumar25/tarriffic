'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { generateTariffGeoJSON } from '@/lib/tradeData'

interface FlowData {
  reporter: string;
  partner: string;
  product: string;
  hs4: string;
  year: number;
  trade_value: number;
  tariff_rate: number;
  tariff_revenue: number;
}

const INITIAL_CENTER: [number, number] = [0, 15]
const INITIAL_ZOOM = 1.25

export default function MapboxGlobe({
  transparentBackground = true,
}: {
  transparentBackground?: boolean
}) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedFlow, setSelectedFlow] = useState<FlowData | null>(null)
  const [analysis, setAnalysis] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)

  // Function to fetch analysis from API
  const fetchAnalysis = async (flow: FlowData) => {
    setIsAnalyzing(true)
    try {
      const res = await fetch("/api/analyzeFlow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow }),
      })
      const data = await res.json()
      if (data.status === "success") {
        setAnalysis(data.analysis)
      } else {
        setAnalysis("Failed to generate analysis. Please try again.")
      }
    } catch (error) {
      console.error("Error fetching analysis:", error)
      setAnalysis("Failed to generate analysis. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle flow click
  const handleFlowClick = async (flow: FlowData) => {
    setSelectedFlow(flow)
    setShowDrawer(true)
    setAnalysis("")
    await fetchAnalysis(flow)
  }

  useEffect(() => {
    if (!mapContainer.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      projection: 'globe',
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 0,
      bearing: 0,
      antialias: true,
      pitchWithRotate: false,
    })
    mapRef.current = map

    requestAnimationFrame(() => {
      map.resize()
      map.triggerRepaint()
    })

    map.once('load', () => {
      map.resize()
      map.triggerRepaint()
    })

    map.on('style.load', () => {
      if (transparentBackground) {
        // Set space to transparent but keep atmosphere visible
        map.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgba(0,0,0,0)', // Only make space transparent
          'star-intensity': 0,
        })
        // Make canvas background transparent
        map.getCanvas().style.background = 'transparent'
      }

      setLoading(true)
      generateTariffGeoJSON()
        .then(data => {
          if (!mapRef.current) return

          if (!map.getSource('tariffs')) {
            map.addSource('tariffs', { type: 'geojson', data: data as any })
          }
          if (!map.getLayer('tariff-lines')) {
            map.addLayer({
              id: 'tariff-lines',
              type: 'line',
              source: 'tariffs',
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: {
                'line-width': [
                  'interpolate', ['linear'], ['coalesce', ['get', 'tradeValue'], 0],
                  0, 0.5,
                  1e10, 5,
                ],
                'line-color': [
                  'interpolate', ['linear'], ['coalesce', ['get', 'tariffRate'], 0],
                  0, 'blue',
                  10, 'purple',
                  20, 'red',
                ],
                'line-opacity': 0.7,
              },
            })
          }
          if (!map.getLayer('tariff-arrows')) {
            map.addLayer({
              id: 'tariff-arrows',
              type: 'symbol',
              source: 'tariffs',
              layout: {
                'symbol-placement': 'line',
                'symbol-spacing': 100,
                'text-field': '▶',
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-size': 12,
                'text-rotate': 90,
                'text-allow-overlap': true,
                'text-ignore-placement': true,
                'text-keep-upright': false,
              },
              paint: {
                'text-color': [
                  'interpolate', ['linear'], ['coalesce', ['get', 'tariffRate'], 0],
                  0, 'blue',
                  20, 'red',
                ],
              },
            })
          }

          // Add click handler for tariff arrows
          map.on('click', 'tariff-arrows', (e) => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0]
              const props = feature.properties
              const flow: FlowData = {
                reporter: props.reporter || 'United States',
                partner: props.partner || 'Unknown',
                product: props.product || 'Unknown Product',
                hs4: props.hs4 || '0000',
                year: props.year || 2022,
                trade_value: props.tradeValue || 0,
                tariff_rate: props.tariffRate || 0,
                tariff_revenue: props.tariff_revenue || 0,
              }
              handleFlowClick(flow)
            }
          })

          // Change cursor on hover
          map.on('mouseenter', 'tariff-arrows', () => {
            map.getCanvas().style.cursor = 'pointer'
          })

          map.on('mouseleave', 'tariff-arrows', () => {
            map.getCanvas().style.cursor = ''
          })
        })
        .catch(err => {
          console.error('tariff data error:', err)
        })
        .finally(() => {
          setLoading(false)
          map.triggerRepaint()
        })
    })

    const ro = new ResizeObserver(() => {
      map.resize()
      map.triggerRepaint()
    })
    ro.observe(mapContainer.current)

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [transparentBackground])

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute right-2 bottom-2 text-xs text-white/70 pointer-events-none">
          loading data…
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Side Drawer for Analysis */}
      {showDrawer && selectedFlow && (
        <div className="absolute top-0 right-0 w-96 h-full bg-black/90 backdrop-blur-sm border-l border-white/20 z-50 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {selectedFlow.reporter} → {selectedFlow.partner}
              </h2>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-white/70 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Flow Details */}
            <div className="space-y-4 mb-6">
              <div>
                <span className="text-white/70 text-sm">Product:</span>
                <p className="text-white font-medium">{selectedFlow.product}</p>
              </div>
              <div>
                <span className="text-white/70 text-sm">Trade Value:</span>
                <p className="text-white font-medium">${selectedFlow.trade_value.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-white/70 text-sm">Tariff Rate:</span>
                <p className="text-white font-medium">{selectedFlow.tariff_rate}%</p>
              </div>
              <div>
                <span className="text-white/70 text-sm">Estimated Revenue:</span>
                <p className="text-white font-medium">${selectedFlow.tariff_revenue.toLocaleString()}</p>
              </div>
            </div>

            {/* Analysis Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Macroeconomic Analysis</h3>
              <div className="bg-white/5 rounded-lg p-4">
                {isAnalyzing ? (
                  <div className="flex items-center space-x-2 text-white/70">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating analysis...</span>
                  </div>
                ) : analysis ? (
                  <p className="text-white/90 leading-relaxed">{analysis}</p>
                ) : (
                  <p className="text-white/70">Click on a tariff arrow to see analysis</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}