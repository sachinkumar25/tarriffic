// Soft peach→indigo gradient with subtle “supply-chain” linework.
// Sits behind all content (pointer-events-none, fixed, low opacity).

export default function SupplyChainBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-[-1]">
      {/* Layered radial/linear gradients */}
      <div className="absolute inset-0">
        <div className="
          absolute inset-0
          bg-[radial-gradient(900px_600px_at_12%_10%,rgba(255,180,160,0.55),transparent)]
        " />
        <div className="
          absolute inset-0
          bg-[radial-gradient(900px_700px_at_85%_20%,rgba(147,197,253,0.45),transparent)]
        " />
        <div className="
          absolute inset-0
          bg-gradient-to-br from-transparent via-[rgba(99,102,241,0.20)] to-[rgba(2,6,23,0.55)]
        " />
      </div>

      {/* Linework overlay (very light) */}
      <svg
        viewBox="0 0 1440 900"
        className="absolute inset-0 w-full h-full opacity-50"
        aria-hidden
      >
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="white" opacity="0.45" />
          </marker>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Curved routes */}
        {[
          "M 80 380 C 360 200, 740 200, 1060 360",
          "M 160 640 C 460 520, 920 520, 1280 620",
          "M 120 220 C 520 120, 920 140, 1320 240",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1.25"
            markerEnd="url(#arrow)"
            filter="url(#glow)"
          />
        ))}

        {/* Dashed sea/air route */}
        <path
          d="M 180 520 C 420 360, 780 340, 1180 460"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.25"
          strokeDasharray="6 8"
        />

        {/* Nodes */}
        {[
          [120, 380], [360, 260], [720, 230], [1060, 360],
          [220, 640], [560, 560], [980, 560], [1280, 620],
          [160, 220], [520, 150], [920, 170], [1320, 240],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="3.5" fill="white" />
            <circle cx={x} cy={y} r="9" stroke="white" strokeOpacity="0.25" fill="none" />
          </g>
        ))}
      </svg>
    </div>
  )
}
