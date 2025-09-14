"use client"

const events = [
  { year: 1930, title: "Smoot-Hawley Tariff Act", desc: "Raised duties on 20,000+ imports; worsened Great Depression." },
  { year: 1947, title: "GATT", desc: "General Agreement on Tariffs and Trade reduced tariffs post-WWII." },
  { year: 1962, title: "Trade Expansion Act", desc: "Gave authority for Kennedy Round tariff cuts." },
  { year: 1994, title: "NAFTA", desc: "Eliminated most tariffs between US, Canada, and Mexico." },
  { year: 2001, title: "China joins WTO", desc: "Accelerated trade flows, reduced tariffs globally." },
  { year: 2018, title: "US-China Trade War", desc: "Tariffs on $360B goods from both sides." },
  { year: 2020, title: "Phase One Deal", desc: "Partial rollback of tariffs, new purchase commitments." },
  { year: 2022, title: "Tech Tariffs", desc: "Duties on EVs, solar panels, semiconductors." },
  { year: 2025, title: "Present Day", desc: "Tariffs remain a central US trade tool." },
]

export default function TariffTimeline() {
  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-12 pb-4">
        {events.map((e) => (
          <div key={e.year} className="relative min-w-[200px]">
            {/* dot + line */}
            <div className="flex items-center mb-3">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 via-white to-blue-500" />
              <span className="ml-3 font-semibold">{e.year}</span>
            </div>
            {/* card */}
            <div className="p-4 rounded-lg bg-gray-900/70 border border-gray-700">
              <p className="font-bold">{e.title}</p>
              <p className="text-sm text-gray-300">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
