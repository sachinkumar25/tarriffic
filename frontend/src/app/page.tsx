'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
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
      "A tariff is a tax on foreign goods entering the country. When a car from Germany or electronics from China arrive at a U.S. port, the government collects this tax. It's often said that other countries pay for tariffs, but in reality, the cost is typically passed down to businesses and consumers through higher prices. We'll explore how the U.S. uses tariffs to protect its industries and the impact on the American economy.",
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
      "Tariffs are not applied uniformly; they are a strategic tool. The global heatmap shows all countries and their trade flows in context. Click the heatmap to explore these economic strategies in detail.",
  },
  {
    id: "sectors",
    title: "Protecting Industries",
    description:
      "From steel and automobiles to agriculture, governments use tariffs to shield key industries from foreign competition. This chart breaks down which sectors receive the most protection. While these policies can support domestic jobs, they often result in higher prices and fewer choices for consumers. Click the chart for a detailed breakdown.",
  },
  {
    id: "consumer",
    title: "Consumer Impact",
    description:
      "Tariffs don't just affect businesses—they directly impact your wallet. Every tariff increase raises the cost of imported goods, from electronics and clothing to food and fuel. This interactive tool shows how tariffs affect a typical household's monthly spending. See how your shopping basket fills up with higher prices as tariffs increase.",
  },
]

export default function Home() {
  const [activeSection, setActiveSection] = useState(0)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const observerRef = useRef<IntersectionObserver | null>(null)
  const rafRef = useRef<number | null>(null)

  // Memoize the intersection callback to prevent unnecessary re-renders
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    // Cancel any pending RAF to prevent multiple updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sectionRefs.current.indexOf(
            entry.target as HTMLDivElement
          )
          if (index !== -1 && index !== activeSection) {
            setActiveSection(index)
          }
        }
      })
    })
  }, [activeSection])

  // Optimized intersection observer setup
  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: "-30% 0px -30% 0px",
      threshold: 0.8,
    })

    const refs = sectionRefs.current
    refs.forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref)
      }
    })

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      if (observerRef.current) {
        refs.forEach((ref) => {
          if (ref) {
            observerRef.current?.unobserve(ref)
          }
        })
        observerRef.current.disconnect()
      }
    }
  }, [handleIntersection])

  // Memoize sections to prevent unnecessary re-renders
  const memoizedSections = useMemo(() => sections, [])
  return (
    <div className="relative isolate min-h-screen bg-black text-white scroll-container" style={{
      scrollBehavior: 'smooth',
      willChange: 'scroll-position',
      transform: 'translateZ(0)', // Force hardware acceleration
    }}>
      <div className="relative z-10 px-4 pt-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-sky-200 via-cyan-200 to-white drop-shadow-[0_2px_12px_rgba(56,189,248,0.15)]">
            Tarrific
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-sky-200/90 font-medium tracking-wide">
            An Interactive Guide to U.S. Tariffs
          </p>
        </div>
        <div className="absolute top-8 right-8 flex gap-4">
          <Link
            href="/tariff-info"
            className="text-lg font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Tariff Info
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Zigzag Layout */}
        <div className="space-y-0">
          {memoizedSections.map((section, index) => (
            <section
              key={section.id}
              className="min-h-screen flex items-center"
              style={{
                willChange: 'transform',
                transform: 'translateZ(0)', // Force hardware acceleration
              }}
            >
              <div
                ref={(el) => {
                  if (el) {
                    sectionRefs.current[index] = el
                  }
                }}
                className={cn(
                  "w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center",
                  index % 2 === 0 ? "md:grid-flow-col" : "md:grid-flow-col-dense"
                )}
              >
                {/* Text Content */}
                <div className={cn(
                  "order-1 md:order-1",
                  index % 2 === 0 ? "md:order-1" : "md:order-2"
                )}>
                  <div className="bg-black/50 backdrop-blur-sm p-8 rounded-2xl">
                    <h2 className="text-3xl font-bold mb-4 text-sky-200">
                      {section.title}
                    </h2>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>

                {/* Visual Content */}
                <div className={cn(
                  "order-2 md:order-2 flex items-center justify-center",
                  index % 2 === 0 ? "md:order-2" : "md:order-1"
                )}>
                  <div className="relative w-full h-[400px] max-w-xl flex items-center justify-center">
                    {/* Section-specific visuals */}
                    {index === 0 && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-400">
                          Scroll down to begin
                        </p>
                      </div>
                    )}

                    {index === 1 && (
                      <Link href="/globe" className="w-full h-full">
                        <MapboxGlobe transparentBackground showFilterButton={false} />
                      </Link>
                    )}

                    {index === 2 && (
                      <div className="flex items-center justify-center">
                        {/* World Heatmap */}
                        <Link
                          href="/heatmap"
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="w-[300px] aspect-square">
                            <HeatmapThumb
                              variant="world"
                              className="h-full w-full rounded-2xl"
                            />
                          </div>
                          <p className="text-sm font-semibold text-gray-200">
                            Global Trade Flows
                          </p>
                        </Link>
                      </div>
                    )}

                    {index === 3 && (
                      <Link href="/sectors" className="w-full h-full flex items-center justify-center">
                        <div className="w-[240px] aspect-square">
                          <ChartThumb variant="pie" />
                        </div>
                      </Link>
                    )}

                    {index === 4 && (
                      <Link href="/basket" className="w-full h-full flex items-center justify-center">
                        {/* Shopping Basket Icon */}
                        <div className="relative">
                          <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                            <svg 
                              width="80" 
                              height="80" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              className="text-white"
                            >
                              <path 
                                d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" 
                                fill="currentColor"
                              />
                              <path 
                                d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z" 
                                fill="currentColor"
                              />
                            </svg>
                          </div>
                          {/* Price tags floating around */}
                          <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-bounce">
                            +5%
                          </div>
                          <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-bounce" style={{animationDelay: '0.5s'}}>
                            +12%
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}