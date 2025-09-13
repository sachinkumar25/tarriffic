import { cn } from "@/lib/utils"

// Clean gradient backdrop with world map SVG overlay
export default function SupplyChainBackdrop({ className = "" }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none fixed inset-0 -z-[-1]", className)}>
      {/* Base gradients */}
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

      {/* World map overlay */}
      <div className="absolute inset-0">
        <img 
          src="/world.svg" 
          alt="" 
          className="w-full h-full object-cover opacity-8"
          style={{
            filter: 'hue-rotate(180deg) saturate(0.6) brightness(1.4)',
            mixBlendMode: 'overlay'
          }}
        />
      </div>
    </div>
  )
}