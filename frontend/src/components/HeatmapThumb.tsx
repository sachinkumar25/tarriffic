import React from "react";

type Props = {
  variant?: "world" | "us";
  className?: string; // parent controls size; e.g. "w-40 aspect-square"
};

export default function HeatmapThumb({
  variant = "world",
  className = "",
}: Props) {
  // Warm palette for world, flag palette for US
  const worldBlobs = [
    "radial-gradient(180px 130px at 20% 25%, rgba(249,115,22,0.85), rgba(249,115,22,0) 60%)", // orange
    "radial-gradient(220px 160px at 66% 30%, rgba(234,179,8,0.85), rgba(234,179,8,0) 60%)",   // amber
    "radial-gradient(220px 160px at 50% 72%, rgba(253,224,71,0.80), rgba(253,224,71,0) 60%)", // yellow
    "radial-gradient(200px 150px at 82% 82%, rgba(245,158,11,0.70), rgba(245,158,11,0) 60%)", // deep amber
  ];

  const usBlobs = [
    "radial-gradient(200px 150px at 66% 28%, rgba(37,99,235,0.90), rgba(37,99,235,0) 60%)",  // blue
    "radial-gradient(180px 130px at 24% 35%, rgba(239,68,68,0.85), rgba(239,68,68,0) 60%)",  // red
    "radial-gradient(200px 150px at 50% 72%, rgba(255,255,255,0.80), rgba(255,255,255,0) 55%)", // white highlight
    "radial-gradient(170px 130px at 80% 82%, rgba(59,130,246,0.75), rgba(59,130,246,0) 60%)", // blue
  ];

  const blobs = (variant === "us" ? usBlobs : worldBlobs).join(",");

  return (
    <div
      className={[
        // pure node art: no border/background; parent sizes it
        "relative isolate overflow-hidden rounded-xl",
        // default to square if the parent doesn't provide sizing
        !/aspect-|h-|w-/.test(className) ? "aspect-square" : "",
        className,
      ].join(" ")}
    >
      {/* Color blobs */}
      <div
        className="absolute inset-[-12%] opacity-90 blur-[12px]"
        style={{ backgroundImage: blobs, backgroundRepeat: "no-repeat" }}
      />

      {/* Gentle glassy highlight to match the backdrop vibe */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_-20%,rgba(255,255,255,0.16),transparent)]" />

      {/* Variant details */}
      {variant === "us" ? (
        <>
          {/* faint stripes */}
          <div
            className="absolute inset-0 opacity-12"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #ffffff 0 4px, transparent 4px 10px)",
            }}
          />
          {/* small blue canton with dots */}
          <svg className="absolute top-2 left-2 w-12 h-8 opacity-85" viewBox="0 0 48 32">
            <rect x="0" y="0" width="48" height="32" rx="3" fill="#1d4ed8" />
            {Array.from({ length: 3 }).map((_, r) =>
              Array.from({ length: 5 }).map((__, c) => (
                <circle
                  key={`${r}-${c}`}
                  cx={6 + c * 9}
                  cy={6 + r * 9}
                  r="1.2"
                  fill="white"
                  opacity="0.9"
                />
              ))
            )}
          </svg>
        </>
      ) : (
        // subtle graticule for "world"
        <svg className="absolute inset-0 opacity-18" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[10, 25, 40, 60, 75, 90].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="white" strokeWidth="0.4" />
          ))}
          {[15, 30, 45, 60, 75, 90].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="white" strokeWidth="0.4" />
          ))}
        </svg>
      )}
    </div>
  );
}
