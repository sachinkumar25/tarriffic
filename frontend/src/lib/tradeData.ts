import Papa from 'papaparse'

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
  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/alpha/${isoCode}`,
    )
    if (!response.ok) return null
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
  let brng = toDegrees(Math.atan2(y, x))
  return (brng + 360) % 360
}

export const generateTariffGeoJSON = async () => {
  const res = await fetch('/expanded_summary.csv')
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
    if (
      row.partner_iso &&
      row.partner_iso.toLowerCase() !== 'wld' &&
      row.partner_iso !== 'CAN' &&
      row.partner_iso !== 'MEX'
    ) {
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

  // Get top 25 countries by trade value
  const sortedCountries = Array.from(tradeByCountry.entries())
    .sort(([, a], [, b]) => b.totalTradeValue - a.totalTradeValue)
    .slice(0, 25)

  const lineFeatures = []
  const arrowFeatures = []

  for (const [iso, data] of sortedCountries) {
    const partnerCoords = await getCountryCoords(iso)
    if (partnerCoords) {
      const coordinates: [[number, number], [number, number]] = [
        USA_COORDS,
        partnerCoords,
      ]
      lineFeatures.push({
        type: 'Feature',
        properties: {
          tariffRate: data.avgTariff,
          tradeValue: data.totalTradeValue,
          partner: data.partnerName,
        },
        geometry: {
          type: 'LineString',
          coordinates,
        },
      })
      arrowFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: partnerCoords,
        },
        properties: {
          bearing: calculateBearing(USA_COORDS, partnerCoords),
        },
      })
    }
  }

  return {
    lines: {
      type: 'FeatureCollection',
      features: lineFeatures,
    },
    arrows: {
      type: 'FeatureCollection',
      features: arrowFeatures,
    },
  }
}
