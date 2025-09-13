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
        // ---------------- SANKEY ----------------
        <svg
          viewBox="0 0 480 270"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Animated gradient for the flowing effect */}
            <linearGradient
              id="flow-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              <animate
                attributeName="x1"
                from="-100%"
                to="100%"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                from="0%"
                to="200%"
                dur="2s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect
            width="480"
            height="270"
            rx="16"
            fill="rgba(10, 10, 20, 0.7)"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
          <rect
            width="480"
            height="270"
            rx="16"
            fill="transparent"
            style={{ backdropFilter: "blur(12px)" }}
          />

          {/* Countries (Left) */}
          <g>
            {[
              { label: "US", y: 30 },
              { label: "China", y: 90 },
              { label: "EU", y: 150 },
              { label: "Mexico", y: 210 },
            ].map(({ label, y }) => (
              <g key={label}>
                <rect
                  x="20"
                  y={y}
                  width="80"
                  height="30"
                  rx="4"
                  fill="rgba(255,255,255,0.1)"
                />
                <text
                  x="60"
                  y={y + 20}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {label}
                </text>
              </g>
            ))}
          </g>

          {/* Product Categories (Right) */}
          <g>
            {[
              { label: "Electronics", y: 40 },
              { label: "Automotive", y: 120 },
              { label: "Agriculture", y: 200 },
            ].map(({ label, y }) => (
              <g key={label}>
                <rect
                  x="380"
                  y={y}
                  width="80"
                  height="30"
                  rx="4"
                  fill="rgba(255,255,255,0.1)"
                />
                <text
                  x="420"
                  y={y + 20}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {label}
                </text>
              </g>
            ))}
          </g>

          {/* Ribbons */}
          <g fill="none" strokeWidth="2">
            {/* Stable (Blue) */}
            <path d="M100 45 C 240 45, 240 55, 380 55" stroke="#3b82f6" strokeWidth="12" />
            {/* Growing (Green) */}
            <path d="M100 105 C 240 105, 240 135, 380 135" stroke="#22c55e" strokeWidth="18" />
            {/* Disrupted (Red) */}
            <path d="M100 165 C 240 165, 240 215, 380 215" stroke="#ef4444" strokeWidth="8" />
             {/* Another Stable Flow */}
            <path d="M100 225 C 240 225, 240 135, 380 135" stroke="#3b82f6" strokeWidth="10" />
          </g>
           {/* Flowing Animation Overlay */}
          <g stroke="url(#flow-gradient)" pointerEvents="none">
            <path d="M100 45 C 240 45, 240 55, 380 55" strokeWidth="12" />
            <path d="M100 105 C 240 105, 240 135, 380 135" strokeWidth="18" />
            <path d="M100 165 C 240 165, 240 215, 380 215" strokeWidth="8" />
            <path d="M100 225 C 240 225, 240 135, 380 135" strokeWidth="10" />
          </g>
        </svg>
      ) : (
        // ---------------- PIE ----------------
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="pie-grad-1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </radialGradient>
            <radialGradient id="pie-grad-2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22c55e" />
            </radialGradient>
            <radialGradient id="pie-grad-3" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#eab308" />
            </radialGradient>
            <radialGradient id="pie-grad-4" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#ef4444" />
            </radialGradient>
          </defs>

          {/* Segments */}
          <g transform="rotate(-90 100 100)">
            <circle cx="100" cy="100" r="100" fill="url(#pie-grad-1)" />
            <path d="M100,100 L100,0 A100,100 0 0,1 200,100 z" fill="url(#pie-grad-2)" />
            <path d="M100,100 L200,100 A100,100 0 0,1 100,200 z" fill="url(#pie-grad-3)" />
            <path d="M100,100 L100,200 A100,100 0 0,1 0,100 z" fill="url(#pie-grad-4)" />
          </g>
        </svg>
      )}
    </div>
  );
}
