import React from "react";

type Props = {
  variant?: "world" | "us";
  className?: string;
};

export default function HeatmapThumb({
  variant = "world",
  className = "",
}: Props) {
  const worldColors = ["#f59e0b", "#fbbf24", "#fcd34d"];
  const usColors = ["#3b82f6", "#60a5fa", "#ef4444", "#f87171"];

  const gradientId = `heatmap-gradient-${variant}`;

  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl shadow-lg shadow-black/30 group ${className}`}
    >
      <svg
        className="absolute inset-0 w-full h-full -z-10"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={gradientId}>
            <stop
              offset="0%"
              stopColor={variant === "us" ? usColors[0] : worldColors[0]}
            />
            <stop
              offset="100%"
              stopColor={variant === "us" ? usColors[1] : worldColors[1]}
            />
          </radialGradient>
          <filter id="heatmap-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${gradientId})`}
          filter="url(#heatmap-glow)"
        />
      </svg>

      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

      {/* Grid pattern */}
      <div className="absolute inset-0 p-2">
        <div className="grid grid-cols-6 grid-rows-6 w-full h-full gap-1">
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[2px] opacity-20 group-hover:opacity-30 transition-opacity"
              style={{
                backgroundColor:
                  variant === "us"
                    ? usColors[(i % 12) % 4]
                    : worldColors[(i % 12) % 3],
                transform: `scale(${1 + Math.sin(i * 0.5) * 0.2})`,
              }}
            />
          ))}
        </div>
      </div>
      {/* Glassy highlight */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent_60%)]" />
    </div>
  );
}
