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
  const [loading, setLoading] = useState(false) // only for data, not a full-screen overlay

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

    // Ensure a first render even if the container finished sizing just after init
    requestAnimationFrame(() => {
      map.resize()
      map.triggerRepaint()
    })

    map.once('load', () => {
      // One more resize after tiles/style are ready
      map.resize()
      map.triggerRepaint()
    })

    map.on('style.load', () => {
      if (transparentBackground) {
        map.setFog({
          color: 'rgba(0,0,0,0)',
          'high-color': 'rgba(0,0,0,0)',
          'horizon-blend': 0,
          'space-color': 'rgba(0,0,0,0)',
          'star-intensity': 0,
        })
        const bg = map.getStyle().layers?.find(l => l.type === 'background')?.id
        if (bg) map.setPaintProperty(bg, 'background-color', 'rgba(0,0,0,0)')
        // and make the canvas itself transparent just in case
        map.getCanvas().style.background = 'transparent'
      }

      // OPTIONAL: load your trade data without blocking the render
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
      {/* small, non-blocking loader in the corner */}
      {loading && (
        <div className="absolute right-2 bottom-2 text-xs text-white/70 pointer-events-none">
          loading data…
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  )
}
