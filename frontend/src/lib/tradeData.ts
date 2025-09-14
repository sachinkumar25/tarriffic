import Papa from 'papaparse'
import { supabase, HistoricalAnalysis } from './supabase'

interface ExpandedSummaryRow {
  partner_iso: string
  trade_value_total: string
  simple_average: string
  partner_name: string
  hs4: string
}

interface CountryInfo {
  latlng: [number, number]
}

const getCountryCoords = async (
  isoCode: string,
): Promise<[number, number] | null> => {
  if (!isoCode || isoCode.toLowerCase() === 'wld') return null
  
  // Check hardcoded coordinates first for faster loading
  if (COUNTRY_COORDS[isoCode]) {
    return COUNTRY_COORDS[isoCode]
  }
  
  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/alpha/${isoCode}`,
    )
    if (!response.ok) {
      return null
    }
    const data: CountryInfo[] = await response.json()
    if (data && data[0] && data[0].latlng) {
      const [lat, lon] = data[0].latlng
      return [lon, lat]
    }
    return null
  } catch (error) {
    console.error(`Could not fetch coordinates for ${isoCode}`, error)
    return null
  }
}

const USA_COORDS: [number, number] = [-98.5795, 39.8283] // Center of USA

// Hardcoded coordinates for major trading partners to avoid API delays
const COUNTRY_COORDS: Record<string, [number, number]> = {
  'CAN': [-106.3468, 56.1304], // Canada
  'MEX': [-102.5528, 23.6345], // Mexico
  'CHN': [104.1954, 35.8617], // China
  'JPN': [138.2529, 36.2048], // Japan
  'DEU': [10.4515, 51.1657], // Germany
  'GBR': [-3.4360, 55.3781], // United Kingdom
  'KOR': [127.7669, 35.9078], // South Korea
  'FRA': [2.2137, 46.2276], // France
  'ITA': [12.5674, 41.8719], // Italy
  'IND': [78.9629, 20.5937], // India
  'BRA': [-51.9253, -14.2350], // Brazil
  'NLD': [5.2913, 52.1326], // Netherlands
  'CHE': [8.2275, 46.8182], // Switzerland
  'BEL': [4.4699, 50.5039], // Belgium
  'ESP': [-3.7492, 40.4637], // Spain
}

// Function to calculate bearing
const calculateBearing = (
  start: [number, number],
  end: [number, number],
): number => {
  const toRadians = (deg: number) => (deg * Math.PI) / 180
  const toDegrees = (rad: number) => (rad * 180) / Math.PI

  const lon1 = toRadians(start[0])
  const lat1 = toRadians(start[1])
  const lon2 = toRadians(end[0])
  const lat2 = toRadians(end[1])

  const y = Math.sin(lon2 - lon1) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
  const brng = toDegrees(Math.atan2(y, x))
  return (brng + 360) % 360
}

export interface CountryTradeData {
  iso: string
  name: string
  totalTradeValue: number
  avgTariff: number
  rank: number
}

export const generateTariffGeoJSON = async (selectedCountries?: string[]) => {
  try {
    const res = await fetch('/expanded_summary.csv')
    if (!res.ok) {
      throw new Error(`Failed to fetch CSV: ${res.status} ${res.statusText}`)
    }
    const text = await res.text()

  const allRows = Papa.parse<ExpandedSummaryRow>(text, {
    header: true,
    skipEmptyLines: true,
  }).data

  // Group by partner country and sum trade value
  const tradeByCountry = new Map<
    string,
    {
      totalTradeValue: number
      avgTariff: number
      tariffs: number[]
      partnerName: string
    }
  >()

  for (const row of allRows) {
    if (row.partner_iso && row.partner_iso.toLowerCase() !== 'wld') {
      const tradeValue = parseFloat(row.trade_value_total)
      const tariffRate = parseFloat(row.simple_average)
      if (!isNaN(tradeValue) && !isNaN(tariffRate)) {
        if (!tradeByCountry.has(row.partner_iso)) {
          tradeByCountry.set(row.partner_iso, {
            totalTradeValue: 0,
            avgTariff: 0,
            tariffs: [],
            partnerName: row.partner_name,
          })
        }
        const countryData = tradeByCountry.get(row.partner_iso)!
        countryData.totalTradeValue += tradeValue
        countryData.tariffs.push(tariffRate)
      }
    }
  }

  // Calculate average tariff for each country
  tradeByCountry.forEach(value => {
    const sum = value.tariffs.reduce((a, b) => a + b, 0)
    value.avgTariff = sum / value.tariffs.length
  })

  // Get all countries sorted by trade value
  const allCountriesSorted = Array.from(tradeByCountry.entries())
    .sort(([, a], [, b]) => b.totalTradeValue - a.totalTradeValue)

  // Filter countries based on selection (show nothing if no countries selected)
  const countriesToShow = selectedCountries && selectedCountries.length > 0 
    ? allCountriesSorted.filter(([iso]) => selectedCountries.includes(iso))
    : [] // Show nothing when no countries are selected

  const lineFeatures = []
  const arrowFeatures = []

  for (const [iso, data] of countriesToShow) {
    const partnerCoords = await getCountryCoords(iso)
    if (partnerCoords) {
      const coordinates: [[number, number], [number, number]] = [
        USA_COORDS,
        partnerCoords,
      ]
      lineFeatures.push({
        type: 'Feature' as const,
        properties: {
          tariffRate: data.avgTariff,
          tradeValue: data.totalTradeValue,
          partner: data.partnerName,
          reporter: 'United States',
          product: `HS4 ${iso}`,
          hs4: iso,
          year: 2022,
          tariff_revenue: (data.totalTradeValue * data.avgTariff) / 100,
        },
        geometry: {
          type: 'LineString' as const,
          coordinates,
        },
      })
      arrowFeatures.push({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: partnerCoords,
        },
        properties: {
          bearing: calculateBearing(USA_COORDS, partnerCoords),
          tariffRate: data.avgTariff,
          tradeValue: data.totalTradeValue,
          partner: data.partnerName,
          reporter: 'United States',
          product: `HS4 ${iso}`,
          hs4: iso,
          year: 2022,
          tariff_revenue: (data.totalTradeValue * data.avgTariff) / 100,
        },
      })
    }
  }

  return {
    lines: {
      type: 'FeatureCollection' as const,
      features: lineFeatures,
    },
    arrows: {
      type: 'FeatureCollection' as const,
      features: arrowFeatures,
    },
  }
  } catch (error) {
    console.error('Error generating tariff GeoJSON:', error)
    return {
      lines: {
        type: 'FeatureCollection' as const,
        features: [],
      },
      arrows: {
        type: 'FeatureCollection' as const,
        features: [],
      },
    }
  }
}

// Function to get all countries for the filter
export const getAllCountries = async (): Promise<CountryTradeData[]> => {
  try {
    const res = await fetch('/expanded_summary.csv')
    if (!res.ok) {
      throw new Error(`Failed to fetch CSV: ${res.status} ${res.statusText}`)
    }
    const text = await res.text()

    const allRows = Papa.parse<ExpandedSummaryRow>(text, {
      header: true,
      skipEmptyLines: true,
    }).data

    // Group by partner country and sum trade value
    const tradeByCountry = new Map<
      string,
      {
        totalTradeValue: number
        avgTariff: number
        tariffs: number[]
        partnerName: string
      }
    >()

    for (const row of allRows) {
      if (row.partner_iso && row.partner_iso.toLowerCase() !== 'wld') {
        const tradeValue = parseFloat(row.trade_value_total)
        const tariffRate = parseFloat(row.simple_average)
        if (!isNaN(tradeValue) && !isNaN(tariffRate)) {
          if (!tradeByCountry.has(row.partner_iso)) {
            tradeByCountry.set(row.partner_iso, {
              totalTradeValue: 0,
              avgTariff: 0,
              tariffs: [],
              partnerName: row.partner_name,
            })
          }
          const countryData = tradeByCountry.get(row.partner_iso)!
          countryData.totalTradeValue += tradeValue
          countryData.tariffs.push(tariffRate)
        }
      }
    }

    // Calculate average tariff for each country
    tradeByCountry.forEach(value => {
      const sum = value.tariffs.reduce((a, b) => a + b, 0)
      value.avgTariff = sum / value.tariffs.length
    })

    // Return all countries sorted by trade value with rank
    const allCountriesSorted = Array.from(tradeByCountry.entries())
      .sort(([, a], [, b]) => b.totalTradeValue - a.totalTradeValue)
      .map(([iso, data], index) => ({
        iso,
        name: data.partnerName,
        totalTradeValue: data.totalTradeValue,
        avgTariff: data.avgTariff,
        rank: index + 1
      }))

    return allCountriesSorted
  } catch (error) {
    console.error('Error getting all countries:', error)
    return []
  }
}

export interface TariffDataPoint {
  year: number
  rate: number
  analysis?: string
}

export const getTariffRateHistory = async (): Promise<TariffDataPoint[]> => {
  try {
    // Fetch from Supabase historical_analysis table
    const { data, error } = await supabase
      .from('historical_analysis')
      .select('year, rate, analysis')
      .order('year', { ascending: true })

    if (error) {
      console.error('Error fetching from Supabase:', JSON.stringify(error, null, 2))
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      // Fallback to CSV if Supabase fails
      return await getTariffRateHistoryFromCSV()
    }

    if (!data || data.length === 0) {
      console.log('No data from Supabase, falling back to CSV')
      return await getTariffRateHistoryFromCSV()
    }

    return data.map((row: HistoricalAnalysis) => ({
      year: row.year,
      rate: row.rate,
      analysis: row.analysis
    }))
  } catch (error) {
    console.error('Error getting tariff rate history from Supabase:', error)
    console.error('Supabase catch error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    // Fallback to CSV
    return await getTariffRateHistoryFromCSV()
  }
}

// Fallback function to get data from CSV (original implementation)
const getTariffRateHistoryFromCSV = async (): Promise<TariffDataPoint[]> => {
  try {
    const res = await fetch('/us_tariff_history.csv')
    if (!res.ok) {
      throw new Error(`Failed to fetch CSV: ${res.status} ${res.statusText}`)
    }
    const text = await res.text()

    const result = Papa.parse<string[]>(text, {
      header: false,
      skipEmptyLines: true,
    })

    const allRows = result.data

    if (allRows.length < 6) {
      console.error('CSV data is not in the expected format. Expected at least 6 rows, got:', allRows.length)
      console.error('CSV rows:', allRows)
      return []
    }

    // The data from the World Bank CSV has metadata in the first 4 rows.
    // Row 4 (0-indexed) contains the headers (years).
    // Row 5 contains the values for the United States.
    const yearHeaders = allRows[4]
    const rateValues = allRows[5]

    console.log('Year headers:', yearHeaders?.slice(0, 10)) // Log first 10 for debugging
    console.log('Rate values:', rateValues?.slice(0, 10)) // Log first 10 for debugging

    const data: TariffDataPoint[] = []

    // The first 4 columns are metadata, so we start from the 5th column (index 4).
    for (let i = 4; i < yearHeaders.length; i++) {
      const year = parseInt(yearHeaders[i], 10)
      const rate = parseFloat(rateValues[i])

      if (!isNaN(year) && !isNaN(rate)) {
        data.push({ year, rate })
      }
    }

    return data
  } catch (error) {
    console.error('Error getting tariff rate history from CSV:', error)
    return []
  }
}
