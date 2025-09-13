'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const INITIAL_CENTER: [number, number] = [0, 15]
// Slightly conservative so the full sphere fits within a square mask.
const INITIAL_ZOOM = 1.25

export default function MapboxGlobe() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      projection: 'globe',
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 0,
      bearing: 0,
      antialias: true,
      // Keep interactions; disable pitch-rotate to avoid skewing the circle
      pitchWithRotate: false,
    })
    mapRef.current = m

    m.on('style.load', () => {
      // Make atmosphere/space fully transparent (no halo, no stars)
      m.setFog({
        color: 'rgba(0,0,0,0)',
        'high-color': 'rgba(0,0,0,0)',
        'horizon-blend': 0.0,
        'space-color': 'rgba(0,0,0,0)',
        'star-intensity': 0.0,
      })
      // Ensure the style's background layer is transparent too
      const bg = m.getStyle().layers?.find(l => l.type === 'background')?.id
      if (bg) m.setPaintProperty(bg, 'background-color', 'rgba(0,0,0,0)')
    })

    // Resize once layout settles
    requestAnimationFrame(() => m.resize())

    // Keep up with container size changes (e.g., responsive layout)
    const ro = new ResizeObserver(() => m.resize())
    ro.observe(mapContainer.current)

    return () => {
      ro.disconnect()
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // No rounding here; the parent applies a circular mask.
  return <div ref={mapContainer} className="w-full h-full" />
}
