"use client"

import React, { useLayoutEffect, useRef, useState } from "react"

type Pair = { from: string; to: string; dashed?: boolean }
type Props = { pairs: Pair[]; stroke?: string; width?: number }
type Side = "left" | "right" | "top" | "bottom"

export default function ArcConnectors({
  pairs,
  stroke = "rgba(255,255,255,0.35)",
  width = 2,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [paths, setPaths] = useState<{ d: string; dashed?: boolean }[]>([])

  const tangentVec = (side: Side): [number, number] =>
    side === "left" ? [-1, 0]
    : side === "right" ? [1, 0]
    : side === "top" ? [0, -1]
    : [0, 1]

  const getDockInfo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return null
    const r = el.getBoundingClientRect()
    const side = (el.getAttribute("data-dock-side") || "right") as Side
    return {
      x: r.left + r.width / 2 + window.scrollX,
      y: r.top + r.height / 2 + window.scrollY,
      side,
    }
  }

  const compute = () => {
    const ps = pairs.map(p => {
      const a = getDockInfo(p.from)
      const b = getDockInfo(p.to)
      if (!a || !b) return null

      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.hypot(dx, dy)

      // handle length scales with horizontal separation; clamped for nice arcs
      const handle = Math.min(240, Math.max(80, Math.abs(dx) * 0.55))

      const [tx1, ty1] = tangentVec(a.side)
      const [tx2, ty2] = tangentVec(b.side)

      // control points exit/approach along each dock's tangent
      const c1 = { x: a.x + tx1 * handle, y: a.y + ty1 * handle }
      const c2 = { x: b.x - tx2 * handle, y: b.y - ty2 * handle }

      // tiny vertical lift to echo the backdrop arcs (optional seasoning)
      const lift = Math.min(60, dist * 0.08) * (dx >= 0 ? -0.15 : -0.12)
      const c1y = c1.y + lift
      const c2y = c2.y + lift

      const d = `M ${a.x},${a.y} C ${c1.x},${c1y} ${c2.x},${c2y} ${b.x},${b.y}`
      return { d, dashed: p.dashed }
    }).filter(Boolean) as { d: string; dashed?: boolean }[]

    setPaths(ps)
  }

  useLayoutEffect(() => {
    compute()
    const ro = new ResizeObserver(() => compute())
    ro.observe(document.body)
    const onScroll = () => compute()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", compute)
    return () => {
      ro.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", compute)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs])

  return (
    <svg ref={svgRef} className="pointer-events-none fixed inset-0 z-[5]" width="100%" height="100%">
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill="none"
          stroke={stroke}
          strokeWidth={width}
          strokeLinecap="round"
          strokeDasharray={p.dashed ? "6 10" : undefined}
          filter="drop-shadow(0 2px 6px rgba(0,0,0,0.35))"
        />
      ))}
    </svg>
  )
}
