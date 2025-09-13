'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import HeatmapLegend from './HeatmapLegend';

interface CountryData {
  country: string;
  iso_a3: string;
  avg_tariff: number;
  total_trade_value: number;
  tariff_revenue: number;
  product_count: number;
}

interface GeoJSONFeature {
  type: string;
  id?: string;
  properties: {
    ISO_A3?: string;
    iso_a3?: string;
    [key: string]: unknown;
  };
  geometry: unknown;
}

interface HeatmapProps {
  metric?: 'avg_tariff' | 'total_trade_value' | 'tariff_revenue';
  projection?: 'globe' | 'mercator';
  showHotspots?: boolean;
  onDataLoaded?: (data: CountryData[]) => void;
}

const INITIAL_CENTER: [number, number] = [0, 15]
const INITIAL_ZOOM = 1.25

export default function Heatmap({
  metric = 'avg_tariff',
  projection = 'globe',
  showHotspots = true,
  onDataLoaded = () => {}
}: HeatmapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [countryData, setCountryData] = useState<CountryData[]>([])
  const [geojsonData, setGeojsonData] = useState<any>(null)
  const [colorStops, setColorStops] = useState<[number, string][]>([])

  // Fetch country data
  const fetchCountryData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/countries')
      const data = await res.json()
      setCountryData(data)
      onDataLoaded(data)
    } catch (error) {
      console.error('Error fetching country data:', error)
    } finally {
      setLoading(false)
    }
  }, [onDataLoaded])

  // Fetch GeoJSON data
  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const res = await fetch('/world-countries.json')
        const data = await res.json()
        setGeojsonData(data)
      } catch (error) {
        console.error('Error fetching GeoJSON data:', error)
      }
    }
    fetchGeoJSON()
  }, [])


  // Handle country click
  const handleCountryClick = useCallback((country: CountryData) => {
    setSelectedCountry(country)
    setShowDrawer(true)
  }, [])

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current || !geojsonData) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      projection: { name: projection },
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 0,
      bearing: 0,
      antialias: true,
    })
    mapRef.current = map

    map.once('load', () => {
      // Load world countries GeoJSON
      map.addSource('countries', {
        type: 'geojson',
        data: geojsonData
      })

      // Add countries layer
      map.addLayer({
        id: 'countries-fill',
        type: 'fill',
        source: 'countries',
        paint: {
          'fill-color': '#E5F5E0',
          'fill-outline-color': '#ffffff',
          'fill-opacity': 0.85
        }
      })

      // Add countries outline
      map.addLayer({
        id: 'countries-outline',
        type: 'line',
        source: 'countries',
        paint: {
          'line-color': '#ffffff',
          'line-width': 1
        }
      })
      
      // Add hotspots layer
        map.addLayer({
            id: 'hotspots-layer',
            type: 'line',
            source: 'countries',
            paint: {
                'line-color': '#ff0000',
                'line-width': 2,
                'line-opacity': 0.8
            },
            filter: ['in', ['id'], '']
        });

      // Event handlers will be set up in a separate useEffect when data is available
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [geojsonData, projection]) // Now depends on geojsonData and projection

  // Fetch country data once on mount
  useEffect(() => {
    fetchCountryData()
  }, [fetchCountryData])

  // Set up event handlers when data is available
  useEffect(() => {
    if (!mapRef.current || !countryData.length) return

    const map = mapRef.current

    // Event listeners will be added fresh each time

    // Add hover effect
    map.on('mousemove', 'countries-fill', (e) => {
      if (e.features && e.features.length > 0) {
        map.getCanvas().style.cursor = 'pointer'
        
        const feature = e.features[0]
        const iso = feature.id || feature.properties?.ISO_A3 || feature.properties?.iso_a3
        const country = countryData.find(c => c.iso_a3 === iso)
        
        if (country) {
          const value = country[metric]
          const valueFormatted = metric === 'avg_tariff' 
            ? `${value}%` 
            : `$${value.toLocaleString()}`
          
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2">
                <strong>${country.country}</strong><br/>
                ${metric.replace('_', ' ').toUpperCase()}: ${valueFormatted}
              </div>
            `)
            .addTo(map)
        }
      }
    })

    map.on('mouseleave', 'countries-fill', () => {
      map.getCanvas().style.cursor = ''
    })

    // Add click handler
    map.on('click', 'countries-fill', (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0]
        const iso = feature.id || feature.properties?.ISO_A3 || feature.properties?.iso_a3
        const country = countryData.find(c => c.iso_a3 === iso)
        
        if (country) {
          handleCountryClick(country)
        }
      }
    })
  }, [countryData, metric, handleCountryClick])

  // Update map colors when country data or metric changes
  useEffect(() => {
    if (!mapRef.current || !countryData.length || !geojsonData || !mapRef.current.isStyleLoaded()) {
      return
    }

    const map = mapRef.current
    const source = map.getSource('countries') as mapboxgl.GeoJSONSource
    if (!source) {
      return
    }

    // Create a lookup map for faster access
    const countryLookup = new Map()
    countryData.forEach(country => {
      countryLookup.set(country.iso_a3, country)
    })

    const updatedFeatures = geojsonData.features.map((feature: GeoJSONFeature) => {
      const iso = feature.id || feature.properties?.ISO_A3 || feature.properties?.iso_a3
      const country = countryLookup.get(iso)

      if (country) {
        return {
          ...feature,
          properties: {
            ...feature.properties,
            avg_tariff: country.avg_tariff,
            total_trade_value: country.total_trade_value,
            tariff_revenue: country.tariff_revenue,
            product_count: country.product_count
          }
        }
      }
      return feature
    })
    
    source.setData({
        ...geojsonData,
        features: updatedFeatures
    })

    // Update hotspot layer
    if (map.getLayer('hotspots-layer')) {
        map.setLayoutProperty('hotspots-layer', 'visibility', showHotspots ? 'visible' : 'none');

        if (showHotspots) {
            const top5Isos = [...countryData]
                .sort((a, b) => b[metric] - a[metric])
                .slice(0, 5)
                .map(c => c.iso_a3);

            map.setFilter('hotspots-layer', ['in', ['id'], ['literal', top5Isos]]);
        }
    }

    // Define color stops based on metric
    let stops: [number, string][] = []
    switch (metric) {
      case 'avg_tariff':
        stops = [
          [0, '#E5F5E0'],
          [2, '#A1D99B'],
          [5, '#31A354'],
          [10, '#006D2C'],
          [20, '#00441B']
        ]
        break
      case 'total_trade_value':
        stops = [
          [0, '#E5F5E0'],
          [1000000000, '#A1D99B'], // 1B
          [5000000000, '#31A354'], // 5B
          [10000000000, '#006D2C'], // 10B
          [50000000000, '#00441B'] // 50B
        ]
        break
      case 'tariff_revenue':
        stops = [
          [0, '#E5F5E0'],
          [100000000, '#A1D99B'], // 100M
          [500000000, '#31A354'], // 500M
          [1000000000, '#006D2C'], // 1B
          [5000000000, '#00441B'] // 5B
        ]
        break
      default:
        stops = [
          [0, '#E5F5E0'],
          [2, '#A1D99B'],
          [5, '#31A354'],
          [10, '#006D2C'],
          [20, '#00441B']
        ]
    }
    setColorStops(stops);

    const paintProperty = [
      'interpolate',
      ['linear'],
      ['coalesce', ['get', metric], 0], // Use 0 as fallback if property is null
      ...stops.flat()
    ]
    
    if (map.getLayer('countries-fill')) {
      map.setPaintProperty('countries-fill', 'fill-color', paintProperty)
    }

  }, [countryData, geojsonData, metric, showHotspots])

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute right-2 bottom-2 text-xs text-white/70 pointer-events-none">
          loading data…
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Side Drawer for Country Details */}
      {showDrawer && selectedCountry && (
        <div className="absolute top-0 right-0 w-96 h-full bg-black/90 backdrop-blur-sm border-l border-white/20 z-50 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {selectedCountry.country}
              </h2>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-white/70 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Country Details */}
            <div className="space-y-4 mb-6">
              <div>
                <span className="text-white/70 text-sm">Average Tariff Rate:</span>
                <p className="text-white font-medium">{selectedCountry.avg_tariff}%</p>
              </div>
              <div>
                <span className="text-white/70 text-sm">Total Trade Value:</span>
                <p className="text-white font-medium">${selectedCountry.total_trade_value.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-white/70 text-sm">Tariff Revenue:</span>
                <p className="text-white font-medium">${selectedCountry.tariff_revenue.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-white/70 text-sm">Products:</span>
                <p className="text-white font-medium">{selectedCountry.product_count}</p>
              </div>
            </div>

            {/* Metric Legend */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Color Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span className="text-white/70 text-sm">Low</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-300 rounded"></div>
                  <span className="text-white/70 text-sm">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span className="text-white/70 text-sm">High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-900 rounded"></div>
                  <span className="text-white/70 text-sm">Very High</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {colorStops.length > 0 && <HeatmapLegend metric={metric} colorStops={colorStops} />}
    </div>
  )
}
