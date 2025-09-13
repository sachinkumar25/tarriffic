/**
 * GET /api/summary
 * Returns all rows from merged_summary.csv as JSON
 * 
 * Response format:
 * {
 *   status: "success",
 *   data: [...],
 *   meta: {
 *     total: number,
 *     totalTradeValue: number,
 *     averageTariff: number,
 *     tariffRange: { min: number, max: number }
 *   }
 * }
 */

import { loadCSV, getSummaryFilename, calculateTariffRevenue, formatTradeValue, formatTariffRate } from '../../lib/csvLoader';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed. Use GET.'
    });
  }

  try {
    // Load the summary data (expanded or merged)
    const filename = getSummaryFilename();
    const data = await loadCSV(filename);
    
    // Calculate summary statistics
    const totalTradeValue = data.reduce((sum, row) => sum + (row.trade_value_total || 0), 0);
    const tariffRates = data.map(row => row.simple_average).filter(rate => rate != null);
    const averageTariff = tariffRates.length > 0 
      ? tariffRates.reduce((sum, rate) => sum + rate, 0) / tariffRates.length 
      : 0;
    
    const tariffRange = {
      min: Math.min(...tariffRates),
      max: Math.max(...tariffRates)
    };

    // Add computed fields to each row
    const enrichedData = data.map(row => ({
      ...row,
      tariff_revenue_estimate: calculateTariffRevenue(row.simple_average, row.trade_value_total),
      trade_value_formatted: formatTradeValue(row.trade_value_total),
      tariff_rate_formatted: formatTariffRate(row.simple_average),
      tariff_revenue_formatted: formatTradeValue(calculateTariffRevenue(row.simple_average, row.trade_value_total))
    }));

    // Return successful response
    res.status(200).json({
      status: 'success',
      data: enrichedData,
      meta: {
        total: data.length,
        totalTradeValue,
        totalTradeValueFormatted: formatTradeValue(totalTradeValue),
        averageTariff,
        averageTariffFormatted: formatTariffRate(averageTariff),
        tariffRange,
        tariffRangeFormatted: {
          min: formatTariffRate(tariffRange.min),
          max: formatTariffRate(tariffRange.max)
        },
        dataYear: {
          tariff: data[0]?.year_x || 'N/A',
          trade: data[0]?.year_y || 'N/A'
        }
      }
    });

  } catch (error) {
    console.error('Error in /api/summary:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to load summary data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
