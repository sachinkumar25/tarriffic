// src/components/ChartThumb.tsx
import React from "react";

type Props = {
  variant: "line" | "pie";
  className?: string; // use this to control the node size from the parent
};

export default function ChartThumb({ variant, className = "" }: Props) {
  return (
    <div className={`relative w-full h-full ${className}`} aria-hidden="true">
      {variant === "line" ? (
        // ---------------- LINE ----------------
        <svg
          viewBox="0 0 320 192"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* grid */}
          <g stroke="white" strokeOpacity="0.14" strokeWidth="1">
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={24 + i * 24} x2="320" y2={24 + i * 24} />
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={`v-${i}`} x1={16 + i * 48} y1="0" x2={16 + i * 48} y2="192" />
            ))}
          </g>

          <defs>
            <linearGradient id="thumbLineGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <filter id="thumbGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M16 140 C 48 120, 64 128, 80 116
               S 120 92, 144 98
               S 184 122, 208 104
               S 248 72, 272 86
               S 304 96, 320 78"
            fill="none"
            stroke="url(#thumbLineGrad)"
            strokeWidth="3"
            filter="url(#thumbGlow)"
          />
          {[16, 80, 144, 208, 272, 320].map((x, i) => (
            <circle
              key={i}
              cx={x}
              cy={[140, 116, 98, 104, 86, 78][i]}
              r="3.5"
              fill="white"
              fillOpacity="0.9"
            />
          ))}
        </svg>
      ) : (
        // ---------------- PIE (perfect circle) ----------------
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <clipPath id="thumbPieClip">
              <circle cx="100" cy="100" r="78" />
            </clipPath>
          </defs>

          {/* subtle ring */}
          <circle
            cx="100"
            cy="100"
            r="78"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.12)"
          />

          {/* slices (oversized + clipped to guarantee a circle) */}
          <g clipPath="url(#thumbPieClip)">
            <path d="M100 100 L100 -20 A120 120 0 0 1 220 120 Z" fill="#60a5fa" />
            <path d="M100 100 L220 120 A120 120 0 0 1 40 220 Z" fill="#34d399" />
            <path d="M100 100 L40 220 A120 120 0 0 1 -20 60 Z" fill="#f59e0b" />
            <path d="M100 100 L-20 60 A120 120 0 0 1 100 -20 Z" fill="#f43f5e" />
          </g>

          {/* donut hole */}
          <circle cx="100" cy="100" r="38" fill="black" fillOpacity="0.32" />
        </svg>
      )}
    </div>
  );
}
