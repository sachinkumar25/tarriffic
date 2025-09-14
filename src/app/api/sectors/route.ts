import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

// Define the structure of the HS4 categories from the data dictionary
interface Hs4Categories {
  [range: string]: string;
}

// Function to find the category name for a given HS2 code
const getCategoryName = (hs2: string, categories: Hs4Categories): string => {
  const hs2Num = parseInt(hs2, 10);
  for (const range in categories) {
    const parts = range.split('-').map(Number);
    const start = parts[0];
    const end = parts.length > 1 ? parts[1] : start; // Handle single-number ranges
    if (hs2Num >= start && hs2Num <= end) {
      return categories[range];
    }
  }
  return `Category ${hs2}`; // Fallback name
};


export async function GET(req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'expanded_summary.csv');
    const dictionaryPath = path.join(process.cwd(), '..', 'data-curator', 'data', 'processed', 'data_dictionary.json');
    
    const csvFile = fs.readFileSync(filePath, 'utf8');
    const dictionaryFile = fs.readFileSync(dictionaryPath, 'utf8');
    const dataDictionary = JSON.parse(dictionaryFile);
    const hs4Categories: Hs4Categories = dataDictionary.hs4_categories;


    const parsedData = Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    const rows = parsedData.data;

    const hs2Map = new Map();
    let totalValue = 0;

    rows.forEach((row: any) => {
      if (row.partner_iso !== 'WLD') { // Exclude 'World' entries for bilateral trade
        const hs4 = row.hs4?.toString();
        if (!hs4) return;
        
        const hs2 = hs4.substring(0, 2);
        const tradeValue = row.trade_value_total || 0;
        totalValue += tradeValue;

        if (!hs2Map.has(hs2)) {
          hs2Map.set(hs2, {
            hs2: hs2,
            name: getCategoryName(hs2, hs4Categories),
            value: 0,
            tariff: 0,
            children: new Map(),
            tariffRates: []
          });
        }

        const hs2Entry = hs2Map.get(hs2);
        hs2Entry.value += tradeValue;
        hs2Entry.tariffRates.push(row.simple_average || 0);

        const hs4Map = hs2Entry.children;
        if (!hs4Map.has(hs4)) {
          hs4Map.set(hs4, {
            hs4: hs4,
            name: `HS4 ${hs4}`, // Use HS4 code as placeholder name for clarity
            value: 0,
            tariff: row.simple_average || 0
          });
        }
        hs4Map.get(hs4)!.value += tradeValue;
      }
    });

    const children = Array.from(hs2Map.values()).map(hs2Entry => {
      // Calculate weighted average tariff for HS2
      hs2Entry.tariff = hs2Entry.tariffRates.reduce((a, b) => a + b, 0) / hs2Entry.tariffRates.length;
      delete hs2Entry.tariffRates;

      hs2Entry.children = Array.from(hs2Entry.children.values());
      return hs2Entry;
    });

    // --- Top-N Filtering ---
    const topN = 10;
    children.sort((a, b) => b.value - a.value);

    const topChildren = children.slice(0, topN);
    const otherChildren = children.slice(topN);

    if (otherChildren.length > 0) {
      const otherValue = otherChildren.reduce((acc, child) => acc + child.value, 0);
      const weightedTariffSum = otherChildren.reduce((acc, child) => acc + child.value * child.tariff, 0);
      const otherTariff = weightedTariffSum / otherValue;

      topChildren.push({
        hs2: 'Other',
        name: 'Other',
        value: otherValue,
        tariff: otherTariff,
        children: []
      });
    }

    // --- Add share_of_total ---
    const finalChildren = topChildren.map(child => ({
      ...child,
      share_of_total: (child.value / totalValue) * 100
    }));


    const hierarchicalData = {
      from: "USA",
      to: "World (Bilateral)",
      total_value: totalValue,
      children: finalChildren
    };

    return NextResponse.json(hierarchicalData);
  } catch (error) {
    console.error('Error fetching or processing sector data:', error);
    return NextResponse.json({ error: 'Failed to load sector data' }, { status: 500 });
  }
}
