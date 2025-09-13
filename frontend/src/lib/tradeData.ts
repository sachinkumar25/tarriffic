import Papa from 'papaparse';

interface TradeDataRow {
  ReporterName: string;
  ProductCode: string;
  PartnerName: string;
  PartnerISO3: string;
  'TradeValue in 1000 USD': string;
}

interface TariffDataRow {
  hs4: string;
  simple_average: string;
}

interface CountryInfo {
  latlng: [number, number];
}

const getCountryCoords = async (isoCode: string): Promise<[number, number] | null> => {
  if (!isoCode || isoCode.toLowerCase() === 'wld') return null;
  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${isoCode}`);
    if (!response.ok) return null;
    const data: CountryInfo[] = await response.json();
    if (data && data[0] && data[0].latlng) {
      const [lat, lon] = data[0].latlng;
      return [lon, lat];
    }
    return null;
  } catch (error) {
    console.error(`Could not fetch coordinates for ${isoCode}`, error);
    return null;
  }
};

const USA_COORDS: [number, number] = [-98.5795, 39.8283]; // Center of USA

export const generateTariffGeoJSON = async () => {
  const [tradeRes, tariffRes] = await Promise.all([
    fetch('/trade_data.csv'),
    fetch('/tariff_data.csv')
  ]);

  const [tradeText, tariffText] = await Promise.all([
    tradeRes.text(),
    tariffRes.text()
  ]);

  const tradeData = Papa.parse<TradeDataRow>(tradeText, { header: true, skipEmptyLines: true }).data;
  const tariffData = Papa.parse<TariffDataRow>(tariffText, { header: true, skipEmptyLines: true }).data;

  const tariffMap = new Map<string, number>();
  for (const row of tariffData) {
    tariffMap.set(row.hs4, parseFloat(row.simple_average));
  }

  const availableHs4Codes = new Set(tariffMap.keys());
  const features = [];

  // Filter trade data to only include products with available tariff info
  const relevantTradeData = tradeData.filter(row =>
    row.PartnerISO3 &&
    row.PartnerISO3.toLowerCase() !== 'wld' &&
    availableHs4Codes.has(row.ProductCode.padStart(4, '0'))
  );

  // Sort by trade value and take top 25
  const sortedTradeData = relevantTradeData
    .sort((a, b) => parseFloat(b['TradeValue in 1000 USD']) - parseFloat(a['TradeValue in 1000 USD']))
    .slice(0, 25);

  for (const row of sortedTradeData) {
    const tariffRate = tariffMap.get(row.ProductCode.padStart(4, '0'));
    if (tariffRate !== undefined) {
      const partnerCoords = await getCountryCoords(row.PartnerISO3);
      if (partnerCoords) {
        features.push({
          type: 'Feature',
          properties: {
            tariffRate: tariffRate,
            tradeValue: parseFloat(row['TradeValue in 1000 USD']) * 1000,
            partner: row.PartnerName,
          },
          geometry: {
            type: 'LineString',
            coordinates: [partnerCoords, USA_COORDS],
          },
        });
      }
    }
  }

  return {
    type: 'FeatureCollection',
    features,
  };
};
