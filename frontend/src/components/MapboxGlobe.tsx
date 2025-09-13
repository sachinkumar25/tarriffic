'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { generateTariffGeoJSON } from '@/lib/tradeData'

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
    </div>
  )
}