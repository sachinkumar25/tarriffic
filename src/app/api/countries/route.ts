import { NextResponse } from "next/server";
import Papa from 'papaparse';

interface CountryData {
  country: string;
  iso_a3: string;
  avg_tariff: number;
  total_trade_value: number;
  tariff_revenue: number;
  product_count: number;
}

export async function GET(request: Request) {
  try {
    // Fetch CSV from public assets via HTTP for serverless compatibility
    const csvUrl = new URL('/expanded_summary.csv', request.url);
    const res = await fetch(csvUrl.toString(), { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch expanded_summary.csv');
    }
    const text = await res.text();

    const allRows = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    }).data;

    // Group by country and calculate metrics
    const countryMap = new Map<string, {
      totalTradeValue: number;
      totalTariffRevenue: number;
      tariffs: number[];
      productCount: number;
    }>();

    for (const row of allRows) {
      const rowData = row as Record<string, string>;
      const partnerIso = rowData.partner_iso;
      
      if (!partnerIso || partnerIso.toLowerCase() === 'wld') continue;

      const tradeValue = parseFloat(rowData.trade_value_total) || 0;
      const tariffRate = parseFloat(rowData.simple_average) || 0;
      const tariffRevenue = parseFloat(rowData.tariff_revenue_estimate) || 0;

      if (!countryMap.has(partnerIso)) {
        countryMap.set(partnerIso, {
          totalTradeValue: 0,
          totalTariffRevenue: 0,
          tariffs: [],
          productCount: 0,
        });
      }

      const countryData = countryMap.get(partnerIso)!;
      countryData.totalTradeValue += tradeValue;
      countryData.totalTariffRevenue += tariffRevenue;
      countryData.tariffs.push(tariffRate);
      countryData.productCount += 1;
    }

    // Convert to array and calculate average tariff
    const countries: CountryData[] = Array.from(countryMap.entries()).map(([iso, data]) => {
      const avgTariff = data.tariffs.length > 0 
        ? data.tariffs.reduce((sum, tariff) => sum + tariff, 0) / data.tariffs.length 
        : 0;

      return {
        country: iso, // We'll use ISO as country name for now
        iso_a3: iso,
        avg_tariff: Math.round(avgTariff * 100) / 100, // Round to 2 decimal places
        total_trade_value: Math.round(data.totalTradeValue),
        tariff_revenue: Math.round(data.totalTariffRevenue),
        product_count: data.productCount,
      };
    });

    // Sort by trade value descending
    countries.sort((a, b) => b.total_trade_value - a.total_trade_value);

    return NextResponse.json(countries);

  } catch (error) {
    console.error('Error fetching country data:', error);
    return NextResponse.json({ error: 'Failed to fetch country data' }, { status: 500 });
  }
}
