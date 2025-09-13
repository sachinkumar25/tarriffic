"use client"

import Link from "next/link"

type EventItem = {
  year: string
  title: string
  desc: string
}

const ITEMS: EventItem[] = [
  { year: "1930", title: "Smoot–Hawley Tariff Act", desc: "Raised duties on 20,000+ imports to shield domestic producers. Retaliation followed and world trade contracted during the Great Depression." },
  { year: "1947", title: "GATT Established", desc: "Post-WWII liberalization begins. Multilateral rounds steadily cut average tariffs on industrial goods." },
  { year: "1962", title: "Trade Expansion Act", desc: "Enabled Kennedy Round tariff cuts (~35% on many industrial products). Created Section 232 (national-security tariffs authority)." },
  { year: "1994", title: "NAFTA", desc: "Phased out most tariffs among the U.S., Canada, and Mexico, deepening integrated supply chains." },
  { year: "2001", title: "China Joins the WTO", desc: "U.S. imports from China surged; debates intensify over import competition and adjustment policy." },
  { year: "2018–2021", title: "U.S.–China Trade War", desc: "Steel & aluminum (232) plus broad Section 301 duties on Chinese goods; retaliation and supply-chain rerouting. Many duties remained." },
  { year: "2020", title: "Phase One Deal", desc: "Purchase commitments and IP provisions; most tariffs stayed in place and compliance was uneven." },
  { year: "2022", title: "Tech Focus & CHIPS Act", desc: "Targeted duties on EVs, solar panels, semiconductors; CHIPS Act invests to rebuild domestic fabrication." },
  { year: "May 2024", title: "Targeted Section 301 Hikes (China)", desc: "Higher rates announced for strategic categories: EVs (very high effective rates), semiconductors (phased up), batteries/parts, solar inputs, critical minerals." },
  { year: "September 2024", title: "Implementation Milestone", desc: "First wave of increased duties takes effect (EVs, certain batteries, solar cells/inputs, selected metals), with further phase-ins scheduled." },
  { year: "Early 2025", title: "North American Flare-ups", desc: "Broader U.S. tariffs on selected Canadian and Mexican goods prompt swift retaliation; some exemptions/adjustments follow." },
  { year: "April 2025", title: "“Liberation Day” Tariffs", desc: "Baseline and reciprocal tariffs invoked under emergency authorities; higher rates for targeted sectors; immediate legal and diplomatic pushback." },
  { year: "Mid–Late 2025", title: "Semiconductor & Clean-Tech Focus", desc: "Section 232 probes consider chip import risks. Clean-tech inputs (e.g., solar wafers/polysilicon, tungsten) see higher rates; courts review emergency tariff powers." },
]

export default function TariffInfoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Back */}
        <div className="mb-6 text-sm">
          <Link href="/" className="text-sky-400 hover:underline">
            ← Back to Home
          </Link>
        </div>

        {/* Intro */}
        <h1 className="mb-4 text-4xl font-bold text-red-400">Tariff Info</h1>
        <p className="mb-8 text-lg text-gray-200">
          A tariff is a tax on imports at the border. While the importer pays it
          directly, the effects ripple through supply chains and can reshape
          prices, trade flows, and industries.
        </p>

        {/* Quick facts */}
        <div className="mb-10 bg-slate-800/60 p-6 rounded-lg shadow-lg">
          <h2 className="mb-2 text-xl font-semibold text-sky-300">Quick Facts:</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-200">
            <li>Tariffs can protect domestic producers but often raise consumer prices.</li>
            <li>U.S. policy has swung between protectionism and liberalization.</li>
            <li>Recent actions concentrate on EVs, semiconductors, batteries, and solar.</li>
          </ul>
        </div>

        {/* Timeline (no inner scrolling; part of page flow) */}
        <h2 className="mb-6 text-2xl font-bold text-sky-300">U.S. Tariff Timeline (1900–2025)</h2>

        <ol className="relative border-l border-slate-600 pl-6">
          {ITEMS.map((e, idx) => (
            <li key={`${e.year}-${idx}`} className="mb-10">
              {/* dot */}
              <span
                className="absolute -left-2 mt-1 h-4 w-4 rounded-full bg-gradient-to-r from-red-500 via-white to-blue-500 shadow"
                aria-hidden
              />
              {/* year */}
              <div className="text-sm font-semibold text-slate-300">{e.year}</div>
              {/* content (no card box; subtle container) */}
              <div className="mt-2 rounded-md border border-slate-700/60 bg-slate-900/60 p-4 backdrop-blur-[1px]">
                <div className="text-sky-300 font-bold">{e.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">{e.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Footer */}
        <div className="mt-12 text-center text-sm">
          <Link href="/" className="text-sky-400 hover:underline">
            Back to Globe
          </Link>
        </div>
      </div>
    </main>
  )
}
