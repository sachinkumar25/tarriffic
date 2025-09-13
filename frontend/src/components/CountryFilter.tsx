"use client"

import { useState, useEffect, useMemo } from 'react'
import { Search, X, CheckSquare, Square } from 'lucide-react'
import { CountryTradeData, getAllCountries } from '@/lib/tradeData'

interface CountryFilterProps {
  selectedCountries: string[]
  onCountriesChange: (countries: string[]) => void
  isOpen: boolean
  onClose: () => void
}

export default function CountryFilter({
  selectedCountries,
  onCountriesChange,
  isOpen,
  onClose
}: CountryFilterProps) {
  const [countries, setCountries] = useState<CountryTradeData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCountries = async () => {
      setLoading(true)
      const allCountries = await getAllCountries()
      setCountries(allCountries)
      setLoading(false)
    }
    loadCountries()
  }, [])

  // Filter countries based on search term
  const filteredCountries = useMemo(() => {
    return countries.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.iso.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [countries, searchTerm])

  const handleCountryToggle = (countryIso: string) => {
    const isSelected = selectedCountries.includes(countryIso)
    if (isSelected) {
      onCountriesChange(selectedCountries.filter(iso => iso !== countryIso))
    } else {
      onCountriesChange([...selectedCountries, countryIso])
    }
  }

  const handleSelectTop15 = () => {
    const top15 = countries.slice(0, 15).map(c => c.iso)
    onCountriesChange(top15)
  }

  const handleSelectAll = () => {
    onCountriesChange(countries.map(c => c.iso))
  }

  const handleClearAll = () => {
    onCountriesChange([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-80 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700 shadow-xl">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Country Filter</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSelectTop15}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
            >
              Top 15
            </button>
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            {selectedCountries.length} of {countries.length} selected
          </div>
        </div>

        {/* Countries List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Loading countries...
            </div>
          ) : filteredCountries.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No countries found
            </div>
          ) : (
            <div className="p-2">
              {filteredCountries.map((country) => {
                const isSelected = selectedCountries.includes(country.iso)
                return (
                  <button
                    key={country.iso}
                    onClick={() => handleCountryToggle(country.iso)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors text-left"
                  >
                    {isSelected ? (
                      <CheckSquare size={18} className="text-blue-400 flex-shrink-0" />
                    ) : (
                      <Square size={18} className="text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {country.name}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <span>#{country.rank}</span>
                        <span>•</span>
                        <span>${(country.totalTradeValue / 1e9).toFixed(1)}B</span>
                        <span>•</span>
                        <span>{country.avgTariff.toFixed(1)}%</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
