/**
 * GET /api/summary/[hs4]
 * Returns a single product row by HS4 code
 * 
 * Parameters:
 * - hs4: 4-digit HS4 product code (e.g., "2709")
 * 
 * Response format:
 * {
 *   status: "success",
 *   data: {
 *     hs4: string,
 *     simple_average: number,
 *     trade_value_total: number,
 *     tariff_revenue_estimate: number,
 *     // ... all other fields from CSV
 *   }
 * }
 */

import { loadCSV, getSummaryFilename, validateHS4, calculateTariffRevenue, formatTradeValue, formatTariffRate, getHS4Category } from '../../../lib/csvLoader';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed. Use GET.'
    });
  }

  const { hs4 } = req.query;

  // Validate HS4 parameter
  if (!hs4) {
    return res.status(400).json({
      status: 'error',
      message: 'HS4 parameter is required'
    });
  }

  if (!validateHS4(hs4)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid HS4 format. Must be 4 digits (e.g., "2709")'
    });
  }

  try {
    // Load the summary data (expanded or merged)
    const filename = getSummaryFilename();
    const data = await loadCSV(filename);
    
    // Find the product by HS4 code
    const product = data.find(row => row.hs4 === hs4);
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: `Product with HS4 code "${hs4}" not found`,
        availableHs4Codes: data.slice(0, 10).map(row => row.hs4) // Show first 10 for reference
      });
    }

    // Calculate tariff revenue estimate
    const tariffRevenueEstimate = calculateTariffRevenue(product.simple_average, product.trade_value_total);

    // Enrich the product data with computed fields
    const enrichedProduct = {
      ...product,
      tariff_revenue_estimate: tariffRevenueEstimate,
      trade_value_formatted: formatTradeValue(product.trade_value_total),
      tariff_rate_formatted: formatTariffRate(product.simple_average),
      tariff_revenue_formatted: formatTradeValue(tariffRevenueEstimate),
      category: getHS4Category(hs4),
      category_code: hs4.substring(0, 2)
    };

    // Return successful response
    res.status(200).json({
      status: 'success',
      data: enrichedProduct,
      meta: {
        hs4: hs4,
        category: getHS4Category(hs4),
        dataYear: {
          tariff: product.year_x || 'N/A',
          trade: product.year_y || 'N/A'
        }
      }
    });

  } catch (error) {
    console.error(`Error in /api/summary/${hs4}:`, error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to load product data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
