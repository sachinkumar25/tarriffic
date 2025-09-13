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
          {/* Background gradient */}
          <defs>
            <linearGradient id="chartBg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(56,189,248,0.08)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0.02)" />
            </linearGradient>
            <linearGradient id="thumbLineGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="30%" stopColor="#60a5fa" />
              <stop offset="70%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(56,189,248,0.3)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0.05)" />
            </linearGradient>
            <filter id="thumbGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect width="320" height="192" fill="url(#chartBg)" rx="8" />

          {/* Grid */}
          <g stroke="white" strokeOpacity="0.08" strokeWidth="0.8">
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={`h-${i}`} x1="16" y1={24 + i * 24} x2="304" y2={24 + i * 24} />
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={`v-${i}`} x1={16 + i * 48} y1="24" x2={16 + i * 48} y2="168" />
            ))}
          </g>

          {/* Area under curve */}
          <path
            d="M16 140 C 48 120, 64 128, 80 116
               S 120 92, 144 98
               S 184 122, 208 104
               S 248 72, 272 86
               S 304 96, 320 78
               L 320 192 L 16 192 Z"
            fill="url(#areaGrad)"
          />

          {/* Main line */}
          <path
            d="M16 140 C 48 120, 64 128, 80 116
               S 120 92, 144 98
               S 184 122, 208 104
               S 248 72, 272 86
               S 304 96, 320 78"
            fill="none"
            stroke="url(#thumbLineGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#thumbGlow)"
          />

          {/* Data points */}
          {[16, 80, 144, 208, 272, 320].map((x, i) => (
            <g key={i}>
              <circle
                cx={x}
                cy={[140, 116, 98, 104, 86, 78][i]}
                r="6"
                fill="rgba(56,189,248,0.2)"
                filter="url(#pointGlow)"
              />
              <circle
                cx={x}
                cy={[140, 116, 98, 104, 86, 78][i]}
                r="3.5"
                fill="white"
                fillOpacity="0.95"
                stroke="url(#thumbLineGrad)"
                strokeWidth="1.5"
              />
            </g>
          ))}

          {/* Border */}
          <rect width="320" height="192" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" rx="8" />
        </svg>
      ) : (
        // ---------------- PIE ----------------
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

          {/* slices (radius = 78 to match clip) */}
          <g clipPath="url(#thumbPieClip)" pointerEvents="visiblePainted">
            <path d="M100 100 L100 22 A78 78 0 0 1 178 100 Z" fill="#60a5fa" />
            <path d="M100 100 L178 100 A78 78 0 0 1 100 178 Z" fill="#34d399" />
            <path d="M100 100 L100 178 A78 78 0 0 1 22 100 Z" fill="#f59e0b" />
            <path d="M100 100 L22 100 A78 78 0 0 1 100 22 Z" fill="#f43f5e" />
          </g>

          {/* donut hole */}
          <circle cx="100" cy="100" r="38" fill="black" fillOpacity="0.32" />
        </svg>
      )}
    </div>
  );
}
