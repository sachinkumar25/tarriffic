import Papa from 'papaparse'

interface TradeDataRow {
  ReporterName: string
  ProductCode: string
  PartnerName: string
  PartnerISO3: string
  'TradeValue in 1000 USD': string
}

interface TariffDataRow {
  hs4: string
  simple_average: string
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
  const [tradeRes, tariffRes] = await Promise.all([
    fetch('/trade_data.csv'),
    fetch('/tariff_data.csv'),
  ])

  const [tradeText, tariffText] = await Promise.all([
    tradeRes.text(),
    tariffRes.text(),
  ])

  const tradeData = Papa.parse<TradeDataRow>(tradeText, {
    header: true,
    skipEmptyLines: true,
  }).data
  const tariffData = Papa.parse<TariffDataRow>(tariffText, {
    header: true,
    skipEmptyLines: true,
  }).data

  const tariffMap = new Map<string, number>()
  for (const row of tariffData) {
    tariffMap.set(row.hs4, parseFloat(row.simple_average))
  }

  const availableHs4Codes = new Set(tariffMap.keys())
  const lineFeatures = []
  const arrowFeatures = []

  // Filter trade data to only include products with available tariff info
  const relevantTradeData = tradeData.filter(
    row =>
      row.PartnerISO3 &&
      row.PartnerISO3.toLowerCase() !== 'wld' &&
      availableHs4Codes.has(row.ProductCode.padStart(4, '0')),
  )

  // Sort by trade value and take top 25
  const sortedTradeData = relevantTradeData
    .sort(
      (a, b) =>
        parseFloat(b['TradeValue in 1000 USD']) -
        parseFloat(a['TradeValue in 1000 USD']),
    )
    .slice(0, 25)

  for (const row of sortedTradeData) {
    const tariffRate = tariffMap.get(row.ProductCode.padStart(4, '0'))
    if (tariffRate !== undefined) {
      const partnerCoords = await getCountryCoords(row.PartnerISO3)
      if (partnerCoords) {
        // Line from USA to partner country
        const coordinates: [[number, number], [number, number]] = [
          USA_COORDS,
          partnerCoords,
        ]

        lineFeatures.push({
          type: 'Feature',
          properties: {
            tariffRate: tariffRate,
            tradeValue: parseFloat(row['TradeValue in 1000 USD']) * 1000,
            partner: row.PartnerName,
          },
          geometry: {
            type: 'LineString',
            coordinates,
          },
        })

        // Arrowhead at the destination (partner country)
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
