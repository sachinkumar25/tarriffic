'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import MapboxGlobe from "@/components/MapboxGlobe"
import HeatmapThumb from "@/components/HeatmapThumb"
import ChartThumb from "@/components/ChartThumb"
import BasketThumb from "@/components/BasketThumb"
import GlobeThumb from "@/components/GlobeThumb"
import { cn } from "@/lib/utils"
import { Volume2, Square } from 'lucide-react';


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
    id: "us-rates",
    title: "U.S. Tariff Rates",
    description:
      "Tariffs are not applied uniformly; they are a strategic tool. This chart shows which product categories face the highest taxes, giving a direct look at the industries the U.S. government aims to protect most. High tariffs on certain goods can shield domestic industries from foreign competition but may also lead to higher prices for consumers. Click to explore these economic strategies in detail.",
  },
  {
    id: "global-flows",
    title: "Global Trade Flows",
    description:
      "Understanding global trade is key to understanding the U.S. economy. This heatmap illustrates the intricate network of trade flows between countries, highlighting the most significant trade relationships. Disruptions in these flows, whether from tariffs or other global events, can have far-reaching consequences, affecting supply chains, market stability, and consumer prices both in the U.S. and abroad. Click the map to see the full picture.",
  },
  {
    id: "sectors",
    title: "Protecting U.S. Industries",
    description:
      "The U.S. government uses tariffs to shield key domestic industries like steel, automobiles, and agriculture from foreign competition. This chart breaks down which sectors receive the most protection. While these policies can support American jobs, they often result in higher prices and fewer choices for U.S. consumers. Click the chart for a detailed breakdown of which industries are most protected.",
  },
  {
    id: "trends",
    title: "How Tariffs Affect Your Shopping Basket",
    description:
      "Tariffs aren't just abstract economic policy; they directly impact the wallets of American families. This interactive tool demonstrates how taxes on imported goods like food, clothing, and electronics translate into higher monthly household costs for you. Click to simulate tariff changes and see firsthand how these policies affect the prices of items in your shopping basket.",
  },
]

export default function Home() {
  const [activeSection, setActiveSection] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (audio) {
      const onEnded = () => {
        setIsSpeaking(false);
      };
      audio.addEventListener('ended', onEnded);
      return () => {
        audio.removeEventListener('ended', onEnded);
      };
    }
  }, [audio]);

  async function playAI(text: string) {
    if (isSpeaking && audio) {
      audio.pause();
      audio.currentTime = 0;
      setAudio(null);
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      const res = await fetch("/api/voice", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const newAudio = new Audio(url);
      setAudio(newAudio);
      newAudio.play();
    } catch (error) {
      console.error("Error playing AI voice:", error);
      setIsSpeaking(false);
    }
  }

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
        rootMargin: "-20% 0px -20% 0px",
        threshold: 0.5,
      }
    )

    const refs = sectionRefs.current;
    refs.forEach((ref) => {
      if (ref) {
        observer.observe(ref)
      }
    })

    return () => {
      refs.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref)
        }
      })
    }
  }, [activeSection])
  return (
    <div className="relative isolate min-h-screen text-white">
      <div className="relative z-10 px-4 pt-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-sky-200 via-cyan-200 to-white drop-shadow-[0_2px_12px_rgba(56,189,248,0.15)]">
            Tributum
          </h1>
          <p className="mt-2 text-sm text-sky-200/70 tracking-widest">
            (tree-BYOO-toom) <span className="italic">noun</span> | Latin: tax, tribute
          </p>
          <p className="mt-4 text-xl md:text-2xl text-sky-200/90 font-medium tracking-wide">
            An Interactive Guide to U.S. Tariffs
          </p>
        </div>
        <div className="absolute top-8 left-8 flex gap-4">
          <Link
            href="/tariff-info"
            className="text-lg font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Tariff Info
          </Link>
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
                <button
                  onClick={() => playAI(section.description)}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/20 text-sky-200 hover:bg-sky-500/40 transition-colors"
                >
                  {isSpeaking ? <Square size={18} /> : <Volume2 size={18} />}
                  <span>{isSpeaking ? 'Stop' : 'Read aloud'}</span>
                </button>
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
                "absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out",
                activeSection === 0
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400 animate-pulse">
                  Scroll to explore
                </p>
                <div className="mt-4 text-4xl animate-bounce">👇</div>
              </div>
            </div>

            {/* Interactive Globe */}
            <Link
              href="/globe"
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out w-[560px] h-[560px]",
                activeSection === 1
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <MapboxGlobe transparentBackground showFilterButton={false} />
            </Link>

            {/* Heatmaps */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center gap-12 transition-opacity duration-1000 ease-in-out",
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
                <div className="w-[480px] aspect-square">
                  <img 
                    src="https://static.vecteezy.com/system/resources/thumbnails/018/922/755/small_2x/infographic-color-symbol-png.png" 
                    alt="Bar Chart of Tariff Rates" 
                    className="h-full w-full rounded-2xl object-cover"
                  />
                </div>
              </Link>
            </div>
            
            <Link
              href="/heatmap"
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out",
                activeSection === 3
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-[480px] aspect-square">
                  <GlobeThumb className="h-full w-full rounded-2xl" />
                </div>
              </div>
            </Link>

            {/* Sector Breakdown */}
            <Link
              href="/sectors"
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out",
                activeSection === 4
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <div className="w-[480px] aspect-square">
                <img 
                  src="https://images.vexels.com/media/users/3/129856/isolated/preview/83b8b3382c3f8f1ac4a8b16c5388360f-colorful-four-parts-pie-chart.png" 
                  alt="Sankey Chart Thumbnail" 
                  className="h-full w-full rounded-2xl object-cover"
                />
              </div>
            </Link>

            {/* Volume Trends */}
            <Link
              href="/basket"
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out",
                activeSection === 5
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <div className="w-[480px] h-[480px]">
                <BasketThumb className="h-full w-full" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}