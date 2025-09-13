import Link from "next/link"
import MapboxGlobe from "@/components/MapboxGlobe"
import HeatmapThumb from "@/components/HeatmapThumb"
import ChartThumb from "@/components/ChartThumb"
import SupplyChainBackdrop from "@/components/SupplyChainBackdrop"
import Dock from "@/components/Dock"
import ArcConnectors from "@/components/ArcConnectors"

export default function Home() {
  return (
    <div className="relative isolate min-h-screen bg-black text-white">
      {/* animated background */}
      <SupplyChainBackdrop />

      {/* connectors (behind nodes, above backdrop) */}
      <ArcConnectors
        pairs={[
          { from: "usDockRight",          to: "globeDockLeftTop" },
          { from: "worldDockRight",       to: "globeDockLeftBottom", dashed: true },
          { from: "globeDockRightTop",    to: "lineDockLeft" },
          { from: "globeDockRightBottom", to: "pieDockLeft", dashed: true },
        ]}
      />

      {/* header */}
      <div className="relative z-10 px-4 pt-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight
                       bg-clip-text text-transparent
                       bg-gradient-to-b from-sky-200 via-cyan-200 to-white
                       drop-shadow-[0_2px_12px_rgba(56,189,248,0.15)]">
          Tarrific
        </h1>
        <div className="mt-3 mb-4 flex justify-center gap-12">
          <Link
            href="#"
            className="text-lg font-semibold text-gray-300 hover:text-white transition-colors
                       underline underline-offset-8 decoration-transparent hover:decoration-sky-400/50"
          >
            How to Use
          </Link>
          <Link
            href="/tariff-info"
            className="text-lg font-semibold text-gray-300 hover:text-white transition-colors
                       underline underline-offset-8 decoration-transparent hover:decoration-sky-400/50"
          >
            Tariff Info
          </Link>
        </div>
      </div>

      {/* node layer */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Globe — hard circular mask, centered */}
        <section className="relative mx-auto mt-8 w-[520px] md:w-[560px] aspect-square">
          <div
            className="absolute inset-0"
            style={{
              WebkitMaskImage:
                "radial-gradient(closest-side, #000 99.6%, transparent 100%)",
              maskImage:
                "radial-gradient(closest-side, #000 99.6%, transparent 100%)",
            }}
          >
            <MapboxGlobe />
          </div>
          {/* docks around the globe */}
          <Dock id="globeDockLeftTop"     side="left"  offset="38%" />
          <Dock id="globeDockLeftBottom"  side="left"  offset="66%" />
          <Dock id="globeDockRightTop"    side="right" offset="38%" />
          <Dock id="globeDockRightBottom" side="right" offset="66%" />
        </section>

        {/* Absolute nodes placed at arc endpoints */}
        {/* US heatmap – top-left */}
        <section className="absolute left-[min(3.5vw,40px)] top-[220px]">
          <div className="w-[180px] aspect-square">
            <HeatmapThumb variant="us" className="h-full w-full rounded-2xl" />
          </div>
          <Dock id="usDockRight" side="right" offset="50%" />
        </section>

        {/* World heatmap – bottom-left */}
        <section className="absolute left-[min(3.5vw,40px)] top-[440px]">
          <div className="w-[180px] aspect-square">
            <HeatmapThumb variant="world" className="h-full w-full rounded-2xl" />
          </div>
          <Dock id="worldDockRight" side="right" offset="50%" />
        </section>

        {/* Line chart – top-right */}
        <section className="absolute right-[min(3.5vw,40px)] top-[210px]">
          <div className="w-[340px] h-[180px] rounded-2xl overflow-hidden">
            <ChartThumb variant="line" className="h-full w-full" />
          </div>
          <Dock id="lineDockLeft" side="left" offset="46%" />
        </section>

        {/* Pie chart – bottom-right, forced perfect circle */}
        <section className="absolute right-[min(3.5vw,40px)] top-[450px]">
          <div className="w-[170px] aspect-square rounded-full overflow-hidden grid place-items-center">
            <div className="w-[82%] aspect-square rounded-full overflow-hidden">
              <ChartThumb variant="pie" />
            </div>
          </div>
          <Dock id="pieDockLeft" side="left" offset="50%" />
        </section>
      </div>
    </div>
  )
}
