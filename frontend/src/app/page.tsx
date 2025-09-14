'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import MapboxGlobe from "@/components/MapboxGlobe"
import HeatmapThumb from "@/components/HeatmapThumb"
import ChartThumb from "@/components/ChartThumb"
import { cn } from "@/lib/utils"

const sections = [
  {
    id: "intro",
    title: "Tariffs: The Price of Protection",
    description:
      "A tariff is a tax on foreign goods entering the country. When a car from Germany or electronics from China arrive at a U.S. port, the government collects this tax. It's often said that other countries pay for tariffs, but in reality, the cost is typically passed down to American businesses and consumers through higher prices. We'll explore how the U.S. uses tariffs to protect its industries and the impact on the American economy.",
  },
  {
    id: "globe",
    title: "America's Global Trade Network",
    description:
      "This globe visualizes the United States' vast network of trade relationships. Each line represents a flow of goods between the U.S. and its global partners. These connections are the lifeblood of the American economy. Click the globe to explore an interactive view of these trade routes, showing the products Americans export and import, and the tariffs involved.",
  },
  {
    id: "heatmaps",
    title: "Tariff Strategy at a Glance",
    description:
      "Tariffs are not applied uniformly; they are a strategic tool. The heatmap on the left shows which product categories face the highest taxes, a direct look at the industries the U.S. government protects most. On the right, a global view illustrates all countries and their trade flows in context. Click the world heatmap to explore these economic strategies in detail.",
  },
  {
    id: "sectors",
    title: "Protecting Industries",
    description:
      "From steel and automobiles to agriculture, governments use tariffs to shield key industries from foreign competition. This chart breaks down which sectors receive the most protection. While these policies can support domestic jobs, they often result in higher prices and fewer choices for consumers. Click the chart for a detailed breakdown.",
  },
  {
    id: "trends",
    title: "How Trade Policies the Economy",
    description:
      "A change in a trade policy can create ripples across the globe. This chart shows how trade volumes respond to new tariffs. A sudden hike can trigger retaliation from other nations, disrupting supply chains for businesses and affecting the global economy. Click the chart to interact with the data and see how these critical economic trends unfold.",
  },
]

export default function Home() {
  const [activeSection, setActiveSection] = useState(0)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionRefs.current.indexOf(
              entry.target as HTMLDivElement
            )
            setActiveSection(index)
          } else {
            const index = sectionRefs.current.indexOf(
              entry.target as HTMLDivElement
            )
            if (activeSection === index) {
              setActiveSection(-1)
            }
          }
        })
      },
      {
        rootMargin: "-30% 0px -30% 0px",
        threshold: 0.8,
      }
    )

    sectionRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref)
      }
    })

    return () => {
      const currentRefs = sectionRefs.current;
      currentRefs.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref)
        }
      })
    }
  }, [activeSection])
  return (
    <div className="relative isolate min-h-screen bg-black text-white">
      <div className="relative z-10 px-4 pt-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-sky-200 via-cyan-200 to-white drop-shadow-[0_2px_12px_rgba(56,189,248,0.15)]">
            Tarrific
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-sky-200/90 font-medium tracking-wide">
            An Interactive Guide to U.S. Tariffs
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {/* Left side: Scrolling Text Content */}
        <div className="py-24 space-y-4">
          {sections.map((section, index) => (
            <section
              key={section.id}
              className="min-h-screen flex flex-col justify-center"
            >
              <div
                ref={(el) => {
                  if (el) {
                    sectionRefs.current[index] = el
                  }
                }}
                className="bg-black/50 backdrop-blur-sm p-8 rounded-2xl"
              >
                <h2 className="text-3xl font-bold mb-4 text-sky-200">
                  {section.title}
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {section.description}
                </p>
              </div>
            </section>
          ))}
        </div>

        {/* Right side: Sticky Visuals */}
        <div className="sticky top-0 h-screen flex items-center justify-start">
          <div className="relative w-full h-full max-w-xl max-h-xl flex items-center justify-center">
            {/* Intro Visual Placeholder */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                activeSection === 0
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">
                  Scroll down to begin
                </p>
              </div>
            </div>

            {/* Interactive Globe */}
            <Link
              href="/globe"
              className={cn(
                "absolute inset-0 transition-opacity duration-300 w-[560px] h-[560px]",
                activeSection === 1
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <MapboxGlobe transparentBackground />
            </Link>

            {/* Heatmaps */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center gap-12 transition-opacity duration-300",
                activeSection === 2
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
            >
              {/* US Heatmap on the left */}
              <Link
                href="/tariff-trends"
                className="flex flex-col items-center gap-2"
              >
                <div className="w-[200px] aspect-square">
                  <ChartThumb
                    variant="line"
                    className="h-full w-full rounded-2xl"
                  />
                </div>
                <p className="text-lg font-semibold text-gray-200">
                  U.S. Tariff Rates
                </p>
              </Link>

              {/* World Heatmap on the right */}
              <Link
                href="/heatmap"
                className="flex flex-col items-center gap-2"
              >
                <div className="w-[200px] aspect-square">
                  <HeatmapThumb
                    variant="world"
                    className="h-full w-full rounded-2xl"
                  />
                </div>
                <p className="text-lg font-semibold text-gray-200">
                  Global Trade Flows
                </p>
              </Link>
            </div>

            {/* Sector Breakdown */}
            <Link
              href="/sectors"
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                activeSection === 3
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <div className="w-[240px] aspect-square">
                <ChartThumb variant="pie" />
              </div>
            </Link>

            {/* Volume Trends */}
            <Link
              href="#"
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                activeSection === 4
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <div className="w-[480px] h-[270px]">
                <ChartThumb variant="line" className="h-full w-full" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}