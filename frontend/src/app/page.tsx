import Link from "next/link"
import MapboxGlobe from "@/components/MapboxGlobe"
import HeatmapThumb from "@/components/HeatmapThumb"
import ChartThumb from "@/components/ChartThumb"
import SupplyChainBackdrop from "@/components/SupplyChainBackdrop"
import ArcConnectors from "@/components/ArcConnectors"

export default function Home() {
  return (
    <div className="relative isolate min-h-screen bg-black text-white">
      {/* animated background */}
      <SupplyChainBackdrop />

      {/* header */}
      <div className="relative z-10 px-4 pt-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight
                       bg-clip-text text-transparent
                       bg-gradient-to-b from-sky-200 via-cyan-200 to-white
                       drop-shadow-[0_2px_12px_rgba(56,189,248,0.15)]">
          Tarrific
        </h1>
        <p className="mt-2 text-xl text-gray-300 font-medium">
          Explore how tariffs shape global trade
        </p>
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
        <Link
          href="/globe"
          id="globe-component"
          className="relative block mx-auto mt-8 w-[520px] md:w-[560px] aspect-square group"
        >
          {/* use a true mask so nothing bleeds past the circle */}
          <div
            className="absolute inset-0"
            style={{
              WebkitMaskImage:
                "radial-gradient(closest-side, #000 99.6%, transparent 100%)",
              maskImage:
                "radial-gradient(closest-side, #000 99.6%, transparent 100%)",
            }}
          >
            <MapboxGlobe transparentBackground />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors grid place-items-center">
              <span className="text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Click to explore global tariffs
              </span>
            </div>
          </div>
        </Link>

        {/* Absolute nodes placed at arc endpoints */}
        {/* US heatmap – top-left corner */}
        <section className="absolute left-[min(3.5vw,40px)] top-[80px]">
          <Link 
            href="#" 
            id="us-heatmap"
            className="block w-[150px] aspect-square group relative"
          >
            <div className="w-full h-full">
              <HeatmapThumb variant="us" className="h-full w-full rounded-2xl" />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors grid place-items-center rounded-2xl">
              <span className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity text-center">
                US Tariff Rates
              </span>
            </div>
          </Link>
        </section>

        {/* World heatmap – bottom-left corner */}
        <section className="absolute left-[min(3.5vw,40px)] top-[400px]">
          <Link 
            href="#" 
            id="world-heatmap"
            className="block w-[150px] aspect-square group relative"
          >
            <div className="w-full h-full">
              <HeatmapThumb variant="world" className="h-full w-full rounded-2xl" />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors grid place-items-center rounded-2xl">
              <span className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity text-center">
                Global Trade Flows
              </span>
            </div>
          </Link>
        </section>

        {/* Line chart – top-right corner */}
        <section className="absolute right-[min(3.5vw,40px)] top-[70px]">
          <Link 
            href="#" 
            id="line-chart"
            className="block w-[300px] h-[160px] group relative"
          >
            <div className="w-full h-full rounded-2xl overflow-hidden">
              <ChartThumb variant="line" className="h-full w-full" />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors grid place-items-center rounded-2xl">
              <span className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity text-center">
                Trade Volume Trends
              </span>
            </div>
          </Link>
        </section>

        {/* Pie chart – bottom-right corner (made bigger) */}
        <section className="absolute right-[min(3.5vw,40px)] top-[400px]">
          <Link 
            href="#" 
            id="pie-chart"
            className="block w-[200px] aspect-square group relative"
          >
            <div className="w-full aspect-square rounded-full overflow-hidden grid place-items-center">
              <div className="w-[82%] aspect-square rounded-full overflow-hidden">
                <ChartThumb variant="pie" />
              </div>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors grid place-items-center rounded-full">
              <span className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity text-center">
                Sector Breakdown
              </span>
            </div>
          </Link>
        </section>

        {/* CONNECTORS — mount AFTER all nodes so endpoints always resolve */}
        <ArcConnectors
          pairs={[
            // Strategic primary connections only - creating a clean data flow
            { 
              from: { componentId: "us-heatmap", side: "right", offset: 50 },
              to: { componentId: "globe-component", side: "left", offset: 32 }
            },
            { 
              from: { componentId: "world-heatmap", side: "right", offset: 50 },
              to: { componentId: "globe-component", side: "left", offset: 72 }
            },
            { 
              from: { componentId: "globe-component", side: "right", offset: 32 },
              to: { componentId: "line-chart", side: "left", offset: 46 }
            },
            { 
              from: { componentId: "globe-component", side: "right", offset: 72 },
              to: { componentId: "pie-chart", side: "left", offset: 50 }
            },
          ]}
        />
      </div>
    </div>
  )
}