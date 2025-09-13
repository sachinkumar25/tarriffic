/**
 * GET /api/check-coverage
 * Debug endpoint to check data coverage and expansion statistics
 * 
 * Response format:
 * {
 *   status: "success",
 *   data: {
 *     dataset_info: {...},
 *     coverage_stats: {...},
 *     partner_breakdown: {...},
 *     hs4_breakdown: {...}
 *   }
 * }
 */

import { loadCSV, getSummaryFilename, loadJSON } from '../../lib/csvLoader';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed. Use GET.'
    });
  }

  try {
    // Load the summary data
    const filename = getSummaryFilename();
    const data = await loadCSV(filename);
    
    // Load validation results if available
    let validationResults = null;
    try {
      validationResults = await loadJSON('expansion_validation.json');
    } catch (error) {
      // Validation file not available, continue without it
    }
    
    // Calculate coverage statistics
    const totalRecords = data.length;
    const uniqueHs4Codes = new Set(data.map(row => row.hs4)).size;
    const uniquePartners = new Set(data.map(row => row.partner_name || 'Unknown')).size;
    const totalTradeValue = data.reduce((sum, row) => sum + (row.trade_value_total || 0), 0);
    const totalTariffRevenue = data.reduce((sum, row) => sum + (row.tariff_revenue_estimate || 0), 0);
    
    // Partner breakdown
    const partnerStats = {};
    data.forEach(row => {
      const partner = row.partner_name || 'Unknown';
      if (!partnerStats[partner]) {
        partnerStats[partner] = {
          hs4_count: 0,
          trade_value_total: 0,
          tariff_revenue_total: 0
        };
      }
      partnerStats[partner].hs4_count += 1;
      partnerStats[partner].trade_value_total += row.trade_value_total || 0;
      partnerStats[partner].tariff_revenue_total += row.tariff_revenue_estimate || 0;
    });
    
    // Top partners by trade value
    const topPartners = Object.entries(partnerStats)
      .map(([partner, stats]) => ({
        partner,
        hs4_count: stats.hs4_count,
        trade_value_total: stats.trade_value_total,
        tariff_revenue_total: stats.tariff_revenue_total,
        trade_share: (stats.trade_value_total / totalTradeValue * 100).toFixed(2)
      }))
      .sort((a, b) => b.trade_value_total - a.trade_value_total)
      .slice(0, 20);
    
    // HS4 breakdown
    const hs4Stats = {};
    data.forEach(row => {
      const hs4 = row.hs4;
      if (!hs4Stats[hs4]) {
        hs4Stats[hs4] = {
          partner_count: 0,
          trade_value_total: 0,
          tariff_rate: row.simple_average || 0,
          category: row.category || 'Unknown'
        };
      }
      hs4Stats[hs4].partner_count += 1;
      hs4Stats[hs4].trade_value_total += row.trade_value_total || 0;
    });
    
    // Top HS4 codes by trade value
    const topHs4Codes = Object.entries(hs4Stats)
      .map(([hs4, stats]) => ({
        hs4,
        partner_count: stats.partner_count,
        trade_value_total: stats.trade_value_total,
        tariff_rate: stats.tariff_rate,
        category: stats.category,
        trade_share: (stats.trade_value_total / totalTradeValue * 100).toFixed(2)
      }))
      .sort((a, b) => b.trade_value_total - a.trade_value_total)
      .slice(0, 20);
    
    // Category breakdown
    const categoryStats = {};
    data.forEach(row => {
      const category = row.category || 'Unknown';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          hs4_count: 0,
          partner_count: 0,
          trade_value_total: 0
        };
      }
      categoryStats[category].hs4_count += 1;
      categoryStats[category].trade_value_total += row.trade_value_total || 0;
    });
    
    // Count unique partners per category
    Object.keys(categoryStats).forEach(category => {
      const partners = new Set(data.filter(row => row.category === category).map(row => row.partner_name));
      categoryStats[category].partner_count = partners.size;
    });
    
    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        hs4_count: stats.hs4_count,
        partner_count: stats.partner_count,
        trade_value_total: stats.trade_value_total,
        trade_share: (stats.trade_value_total / totalTradeValue * 100).toFixed(2)
      }))
      .sort((a, b) => b.trade_value_total - a.trade_value_total)
      .slice(0, 15);
    
    // Determine if this is expanded data
    const isExpanded = filename === 'expanded_summary.csv';
    const hasPartnerData = data.some(row => row.partner_name && row.partner_name !== 'World');
    
    // Return successful response
    res.status(200).json({
      status: 'success',
      data: {
        dataset_info: {
          filename,
          is_expanded: isExpanded,
          has_partner_data: hasPartnerData,
          last_updated: validationResults?.lastUpdated || 'Unknown'
        },
        coverage_stats: {
          total_records: totalRecords,
          unique_hs4_codes: uniqueHs4Codes,
          unique_partners: uniquePartners,
          total_trade_value: totalTradeValue,
          total_tariff_revenue: totalTariffRevenue,
          average_tariff: data.reduce((sum, row) => sum + (row.simple_average || 0), 0) / data.length,
          expansion_ratio: validationResults ? validationResults.total_records / 168 : null
        },
        partner_breakdown: {
          total_partners: uniquePartners,
          top_partners: topPartners,
          partner_with_most_hs4: Object.entries(partnerStats).sort((a, b) => b[1].hs4_count - a[1].hs4_count)[0]
        },
        hs4_breakdown: {
          total_hs4_codes: uniqueHs4Codes,
          top_hs4_codes: topHs4Codes,
          hs4_with_most_partners: Object.entries(hs4Stats).sort((a, b) => b[1].partner_count - a[1].partner_count)[0]
        },
        category_breakdown: {
          total_categories: Object.keys(categoryStats).length,
          top_categories: topCategories
        },
        validation_results: validationResults
      }
    });

  } catch (error) {
    console.error('Error in /api/check-coverage:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to load coverage data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
