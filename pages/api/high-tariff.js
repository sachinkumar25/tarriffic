/**
 * GET /api/high-tariff
 * Returns high_tariff_products.csv as JSON
 * 
 * Response format:
 * {
 *   status: "success",
 *   data: [...],
 *   meta: {
 *     total: number,
 *     averageTariff: number,
 *     highestTariff: number,
 *     totalTradeValue: number
 *   }
 * }
 */

import { loadCSV, calculateTariffRevenue, formatTradeValue, formatTariffRate, getHS4Category } from '../../lib/csvLoader';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed. Use GET.'
    });
  }

  try {
    // Load the high tariff products data
    const data = await loadCSV('high_tariff_products.csv');
    
    // Calculate summary statistics
    const totalTradeValue = data.reduce((sum, row) => sum + (row.trade_value_total || 0), 0);
    const tariffRates = data.map(row => row.simple_average).filter(rate => rate != null);
    const averageTariff = tariffRates.length > 0 
      ? tariffRates.reduce((sum, rate) => sum + rate, 0) / tariffRates.length 
      : 0;
    const highestTariff = Math.max(...tariffRates);
    const lowestTariff = Math.min(...tariffRates);

    // Enrich the data with computed fields
    const enrichedData = data.map(row => ({
      ...row,
      tariff_revenue_estimate: calculateTariffRevenue(row.simple_average, row.trade_value_total),
      trade_value_formatted: formatTradeValue(row.trade_value_total),
      tariff_rate_formatted: formatTariffRate(row.simple_average),
      tariff_revenue_formatted: formatTradeValue(calculateTariffRevenue(row.simple_average, row.trade_value_total)),
      category: getHS4Category(row.hs4),
      category_code: row.hs4?.toString().substring(0, 2),
      trade_share: totalTradeValue > 0 ? (row.trade_value_total / totalTradeValue * 100) : 0
    })).sort((a, b) => b.simple_average - a.simple_average); // Sort by tariff rate descending

    // Calculate total estimated tariff revenue
    const totalTariffRevenue = enrichedData.reduce((sum, row) => sum + row.tariff_revenue_estimate, 0);

    // Return successful response
    res.status(200).json({
      status: 'success',
      data: enrichedData,
      meta: {
        total: data.length,
        totalTradeValue,
        totalTradeValueFormatted: formatTradeValue(totalTradeValue),
        totalTariffRevenue,
        totalTariffRevenueFormatted: formatTradeValue(totalTariffRevenue),
        averageTariff,
        averageTariffFormatted: formatTariffRate(averageTariff),
        highestTariff,
        highestTariffFormatted: formatTariffRate(highestTariff),
        lowestTariff,
        lowestTariffFormatted: formatTariffRate(lowestTariff),
        tariffRange: {
          min: lowestTariff,
          max: highestTariff
        },
        tariffRangeFormatted: {
          min: formatTariffRate(lowestTariff),
          max: formatTariffRate(highestTariff)
        },
        topProduct: enrichedData[0]?.hs4 || 'N/A',
        topProductTariff: enrichedData[0]?.tariff_rate_formatted || 'N/A'
      }
    });

  } catch (error) {
    console.error('Error in /api/high-tariff:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to load high tariff products data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
