"use client"

import React, { useLayoutEffect, useRef, useState } from "react"

type ConnectionPoint = {
  componentId: string;
  side: "left" | "right" | "top" | "bottom";
  offset?: number; // percentage along the side, defaults to 50%
}

type Pair = { 
  from: ConnectionPoint; 
  to: ConnectionPoint; 
  dashed?: boolean 
}

type Props = { pairs: Pair[]; stroke?: string; width?: number }
type Side = "left" | "right" | "top" | "bottom"

export default function ArcConnectors({
  pairs,
  stroke = "rgba(56,189,248,0.6)",
  width = 3,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [paths, setPaths] = useState<{ d: string; dashed?: boolean }[]>([])

  const tangentVec = (side: Side): [number, number] =>
    side === "left" ? [-1, 0]
    : side === "right" ? [1, 0]
    : side === "top" ? [0, -1]
    : [0, 1]

  const getConnectionPoint = (point: ConnectionPoint) => {
    const el = document.getElementById(point.componentId)
    if (!el) {
      console.log(`Element not found: ${point.componentId}`)
      return null
    }
    
    const rect = el.getBoundingClientRect()
    const offset = point.offset || 50 // default to center
    
    let x: number, y: number
    
    // For the globe, we need to connect to the actual circular edge, not the square container
    if (point.componentId === "globe-component") {
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const radius = Math.min(rect.width, rect.height) / 2 * 0.95 // Slightly smaller to hit the actual globe edge
      
      switch (point.side) {
        case "left":
          x = centerX - radius
          y = centerY + ((offset - 50) / 50) * (radius * 0.6) // scale offset to circle
          break
        case "right":
          x = centerX + radius
          y = centerY + ((offset - 50) / 50) * (radius * 0.6)
          break
        case "top":
          x = centerX + ((offset - 50) / 50) * (radius * 0.6)
          y = centerY - radius
          break
        case "bottom":
          x = centerX + ((offset - 50) / 50) * (radius * 0.6)
          y = centerY + radius
          break
      }
    } else {
      // Regular rectangular connection points for other components
      switch (point.side) {
        case "left":
          x = rect.left
          y = rect.top + (rect.height * offset / 100)
          break
        case "right":
          x = rect.right
          y = rect.top + (rect.height * offset / 100)
          break
        case "top":
          x = rect.left + (rect.width * offset / 100)
          y = rect.top
          break
        case "bottom":
          x = rect.left + (rect.width * offset / 100)
          y = rect.bottom
          break
      }
    }
    
    return {
      x: x + window.scrollX,
      y: y + window.scrollY,
      side: point.side,
    }
  }

  const compute = () => {
    const validPaths = []
    
    for (const p of pairs) {
      const a = getConnectionPoint(p.from)
      const b = getConnectionPoint(p.to)
      
      if (!a || !b) {
        console.log(`Skipping connection: ${p.from.componentId} -> ${p.to.componentId}`)
        continue
      }

      const dx = b.x - a.x
      const dy = b.y - a.y

      // Simpler, more reliable curve calculation
      const handle = Math.min(150, Math.max(80, Math.abs(dx) * 0.4))

      const [tx1, ty1] = tangentVec(a.side)
      const [tx2, ty2] = tangentVec(b.side)

      // control points
      const c1x = a.x + tx1 * handle
      const c1y = a.y + ty1 * handle
      const c2x = b.x - tx2 * handle  
      const c2y = b.y - ty2 * handle

      const d = `M ${a.x},${a.y} C ${c1x},${c1y} ${c2x},${c2y} ${b.x},${b.y}`
      
      validPaths.push({ d, dashed: p.dashed })
    }

    setPaths(validPaths)
  }

  useLayoutEffect(() => {
    // Add a small delay to ensure components are mounted
    const timer = setTimeout(compute, 100)
    
    const ro = new ResizeObserver(() => compute())
    ro.observe(document.body)
    
    const onScroll = () => compute()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", compute)
    
    return () => {
      clearTimeout(timer)
      ro.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", compute)
    }
  }, [pairs])

  return (
    <svg ref={svgRef} className="pointer-events-none fixed inset-0 z-[5]" width="100%" height="100%">
      <defs>
        <filter id="cleanGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>
      
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill="none"
          stroke={stroke}
          strokeWidth={width}
          strokeLinecap="round"
          strokeDasharray={p.dashed ? "8 12" : undefined}
          filter="url(#cleanGlow)"
        />
      ))}
    </svg>
  )
}