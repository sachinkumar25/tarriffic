'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { generateTariffGeoJSON, getAllCountries } from '@/lib/tradeData'
import CountryFilter from './CountryFilter'
import { Filter } from 'lucide-react'

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

const INITIAL_CENTER: [number, number] = [-98, 39]
const INITIAL_ZOOM = 1.25

export default function MapboxGlobe({
  transparentBackground = true,
}: {
  transparentBackground?: boolean
}) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [loading, setLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [selectedFlow, setSelectedFlow] = useState<FlowData | null>(null)
  const [analysis, setAnalysis] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  
  // Filter state
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [showFilter, setShowFilter] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isMapReady, setIsMapReady] = useState(false)

  const fetchAnalysis = useCallback(async (flow: FlowData) => {
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
  }, [])

  const handleFlowClick = useCallback(async (flow: FlowData) => {
    setSelectedFlow(flow)
    setShowDrawer(true)
    setAnalysis("")
    await fetchAnalysis(flow)
  }, [fetchAnalysis])

  const handleRouteClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0]
      const props = feature.properties
      if (props) {
        const flow: FlowData = {
          reporter: props.reporter || 'United States',
          partner: props.partner || 'Unknown',
          product: props.product || 'Unknown Product',
          hs4: props.hs4 || '',
          year: props.year || 2022,
          trade_value: props.tradeValue || 0,
          tariff_rate: props.tariffRate || 0,
          tariff_revenue: props.tariff_revenue || 0,
        }
        handleFlowClick(flow)
      }
    }
  }, [handleFlowClick])

  const handleMouseEnter = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.getCanvas().style.cursor = 'pointer'
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.getCanvas().style.cursor = ''
    }
  }, [])

  // Helper function to get user-friendly product category name
  const getProductCategoryName = (hs4: string) => {
    // Map of country codes to their major export categories
    const countryProducts: Record<string, string> = {
      'BRA': 'Agricultural Products & Raw Materials',
      'CHN': 'Electronics & Manufacturing',
      'CAN': 'Energy & Natural Resources', 
      'MEX': 'Automotive & Manufacturing',
      'JPN': 'Technology & Vehicles',
      'DEU': 'Machinery & Automotive',
      'GBR': 'Financial Services & Manufacturing',
      'KOR': 'Electronics & Semiconductors',
      'FRA': 'Luxury Goods & Agriculture',
      'ITA': 'Fashion & Machinery',
      'IND': 'Textiles & Pharmaceuticals',
      'NLD': 'Agricultural Products & Chemicals',
      'CHE': 'Pharmaceuticals & Precision Instruments',
      'BEL': 'Chemicals & Diamonds',
      'ESP': 'Food Products & Machinery',
    }
    
    return countryProducts[hs4] || 'Mixed Trade Goods'
  }

  // Helper function to get product description
  const getProductDescription = (hs4: string) => {
    const descriptions: Record<string, string> = {
      'BRA': 'Soybeans, coffee, iron ore, and manufactured goods',
      'CHN': 'Consumer electronics, machinery, and textiles',
      'CAN': 'Oil, lumber, minerals, and agricultural products',
      'MEX': 'Vehicles, electronics, and agricultural products',
      'JPN': 'Cars, electronics, and precision machinery',
      'DEU': 'Cars, machinery, and chemical products',
      'GBR': 'Machinery, pharmaceuticals, and financial services',
      'KOR': 'Semiconductors, cars, and consumer electronics',
      'FRA': 'Wine, luxury goods, and aerospace products',
      'ITA': 'Fashion, machinery, and food products',
      'IND': 'Textiles, pharmaceuticals, and IT services',
      'NLD': 'Flowers, chemicals, and refined petroleum',
      'CHE': 'Watches, pharmaceuticals, and precision tools',
      'BEL': 'Chemicals, diamonds, and petroleum products',
      'ESP': 'Olive oil, wine, and machinery',
    }
    
    return descriptions[hs4] || 'Various imported and exported goods'
  }

  // Format analysis text with proper styling
  const formatAnalysis = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim()
      
      // Handle bold headers (text between **)
      if (trimmedLine.includes('**')) {
        const formattedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        return (
          <div 
            key={index} 
            className="font-semibold text-white text-base mb-2"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        )
      }
      
      // Handle bullet points (lines starting with •)
      if (trimmedLine.startsWith('•')) {
        return (
          <div key={index} className="flex items-start space-x-2 ml-2">
            <span className="text-blue-400 text-sm mt-1">•</span>
            <span className="text-white/90 text-sm">{trimmedLine.substring(1).trim()}</span>
          </div>
        )
      }
      
      // Handle regular paragraphs
      if (trimmedLine.length > 0) {
        return (
          <p key={index} className="text-white/90 text-sm leading-relaxed">
            {trimmedLine}
          </p>
        )
      }
      
      return null
    }).filter(Boolean)
  }

  // Initialize with top 15 countries on first load
  useEffect(() => {
    const initializeFilter = async () => {
      if (isInitialLoad) {
        const allCountries = await getAllCountries()
        const top15 = allCountries.slice(0, 15).map(c => c.iso)
        setSelectedCountries(top15)
        setIsInitialLoad(false)
      }
    }
    initializeFilter()
  }, [isInitialLoad])
  
  // Effect for map initialization (runs once)
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;
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
    });
    mapRef.current = map;

    map.on('load', () => {
      if (transparentBackground) {
        map.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgba(0,0,0,0)',
          'star-intensity': 0,
        });
        map.getCanvas().style.background = 'transparent';
      }
      setIsMapReady(true);
    });
    
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(mapContainer.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [transparentBackground]);

  // Effect for data loading and layer updates
  useEffect(() => {
    const map = mapRef.current;
    if (!isMapReady || !map) return;

    const updateMapData = async () => {
      setLoading(true);
      setDataLoaded(false);

      const geojsonData = await generateTariffGeoJSON(selectedCountries);

      if (map.getSource('tariffs-lines')) {
        (map.getSource('tariffs-lines') as mapboxgl.GeoJSONSource).setData(geojsonData.lines);
        (map.getSource('tariffs-arrows') as mapboxgl.GeoJSONSource).setData(geojsonData.arrows);
      } else {
        map.addSource('tariffs-lines', { type: 'geojson', data: geojsonData.lines });
        map.addSource('tariffs-arrows', { type: 'geojson', data: geojsonData.arrows });
        map.addLayer({
          id: 'tariff-lines',
          type: 'line',
          source: 'tariffs-lines',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-width': 3, 'line-color': 'black', 'line-opacity': 0.8 },
        });
        map.addLayer({
          id: 'tariff-arrows',
          type: 'symbol',
          source: 'tariffs-arrows',
          layout: {
            'text-field': '▲',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 24,
            'text-rotate': ['get', 'bearing'],
            'text-rotation-alignment': 'map',
            'text-pitch-alignment': 'map',
            'text-allow-overlap': true,
            'text-ignore-placement': true,
          },
          paint: { 'text-color': 'black' },
        });
      }
      
      setLoading(false);
      setDataLoaded(true);
    };

    if (selectedCountries.length > 0) {
      updateMapData();
    }
  }, [isMapReady, selectedCountries]);

  // Effect for attaching event listeners
  useEffect(() => {
    const map = mapRef.current;
    if (!isMapReady || !dataLoaded || !map) return;

    map.on('click', 'tariff-lines', handleRouteClick);
    map.on('click', 'tariff-arrows', handleRouteClick);
    map.on('mouseenter', 'tariff-lines', handleMouseEnter);
    map.on('mouseenter', 'tariff-arrows', handleMouseEnter);
    map.on('mouseleave', 'tariff-lines', handleMouseLeave);
    map.on('mouseleave', 'tariff-arrows', handleMouseLeave);

    return () => {
      map.off('click', 'tariff-lines', handleRouteClick);
      map.off('click', 'tariff-arrows', handleRouteClick);
      map.off('mouseenter', 'tariff-lines', handleMouseEnter);
      map.off('mouseenter', 'tariff-arrows', handleMouseEnter);
      map.off('mouseleave', 'tariff-lines', handleMouseLeave);
      map.off('mouseleave', 'tariff-arrows', handleMouseLeave);
    };
  }, [isMapReady, dataLoaded, handleRouteClick, handleMouseEnter, handleMouseLeave]);

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute right-2 bottom-2 text-xs text-white/70 pointer-events-none">
          loading data…
        </div>
      )}
      
      {/* Filter Button */}
      <button
        onClick={() => setShowFilter(true)}
        className="absolute top-4 left-4 z-40 bg-gray-900/90 backdrop-blur-sm text-white p-3 rounded-lg border border-gray-600 hover:bg-gray-800/90 transition-all shadow-lg flex items-center gap-2"
      >
        <Filter size={18} />
        <span className="text-sm font-medium">
          {selectedCountries.length} Countries
        </span>
      </button>

      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Country Filter Sidebar */}
      <CountryFilter
        selectedCountries={selectedCountries}
        onCountriesChange={setSelectedCountries}
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
      />
      
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

            {/* Trade Overview */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 mb-6 border border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">
                    💰 ${(selectedFlow.trade_value / 1e9).toFixed(1)}B
                  </div>
                  <div className="text-white/70 text-sm font-medium">Annual Trade Volume</div>
                  <div className="text-white/50 text-xs mt-1">
                    Total value of goods traded each year
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-1">
                    📊 {selectedFlow.tariff_rate.toFixed(1)}%
                  </div>
                  <div className="text-white/70 text-sm font-medium">Import Tax Rate</div>
                  <div className="text-white/50 text-xs mt-1">
                    {selectedFlow.tariff_rate > 10 ? 'High tax rate' : 
                     selectedFlow.tariff_rate > 5 ? 'Moderate tax rate' : 'Low tax rate'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">🏛️ Government Revenue:</span>
                  <span className="text-green-400 font-semibold text-lg">
                    ${(selectedFlow.tariff_revenue / 1e9).toFixed(2)}B/year
                  </span>
                </div>
                <div className="text-white/50 text-xs mt-1">
                  Money the U.S. government collects from import taxes
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">🏷️ Main Products:</span>
                  <span className="text-blue-300 font-medium">
                    {getProductCategoryName(selectedFlow.hs4)}
                  </span>
                </div>
                <div className="text-white/50 text-xs mt-1">
                  Examples: {getProductDescription(selectedFlow.hs4)}
                </div>
              </div>
            </div>

            {/* Analysis Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">📊 What This Means</h3>
              <div className="bg-white/5 rounded-lg p-4">
                {isAnalyzing ? (
                  <div className="flex items-center space-x-2 text-white/70">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating analysis...</span>
                  </div>
                ) : analysis ? (
                  <div className="text-white/90 leading-relaxed space-y-3">
                    {formatAnalysis(analysis)}
                  </div>
                ) : (
                  <p className="text-white/70">Click on a trade route to see analysis</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}