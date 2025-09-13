/**
 * GET /api/categories
 * Returns category_summary.csv as JSON
 * 
 * Response format:
 * {
 *   status: "success",
 *   data: [...],
 *   meta: {
 *     total: number,
 *     totalTradeValue: number,
 *     averageTariff: number
 *   }
 * }
 */

import { loadCSV, formatTradeValue, formatTariffRate } from '../../lib/csvLoader';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed. Use GET.'
    });
  }

  try {
    // Load the category summary data
    const data = await loadCSV('category_summary.csv');
    
    // Calculate summary statistics
    const totalTradeValue = data.reduce((sum, row) => sum + (row.trade_value_total || 0), 0);
    const tariffRates = data.map(row => row.simple_average).filter(rate => rate != null);
    const averageTariff = tariffRates.length > 0 
      ? tariffRates.reduce((sum, rate) => sum + rate, 0) / tariffRates.length 
      : 0;

    // Enrich the data with formatted values and category information
    const enrichedData = data.map(row => {
      const categoryCode = row.hs2 || row.hs4?.toString().substring(0, 2);
      const categoryName = getCategoryName(categoryCode);
      
      return {
        ...row,
        category_code: categoryCode,
        category_name: categoryName,
        trade_value_formatted: formatTradeValue(row.trade_value_total),
        tariff_rate_formatted: formatTariffRate(row.simple_average),
        product_count: row.hs4 || 0,
        trade_share: totalTradeValue > 0 ? (row.trade_value_total / totalTradeValue * 100) : 0
      };
    }).sort((a, b) => b.trade_value_total - a.trade_value_total); // Sort by trade value descending

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
        topCategory: enrichedData[0]?.category_name || 'N/A',
        topCategoryTradeValue: enrichedData[0]?.trade_value_formatted || '$0'
      }
    });

  } catch (error) {
    console.error('Error in /api/categories:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to load category data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get category name from 2-digit HS code
 * @param {string} code - 2-digit HS code
 * @returns {string} Category name
 */
function getCategoryName(code) {
  if (!code) return 'Unknown';
  
  const categoryMap = {
    '01': 'Live animals & animal products',
    '02': 'Meat and edible meat offal',
    '03': 'Fish and crustaceans',
    '04': 'Dairy products',
    '05': 'Products of animal origin',
    '06': 'Live trees and plants',
    '07': 'Edible vegetables',
    '08': 'Edible fruits and nuts',
    '09': 'Coffee, tea, mate and spices',
    '10': 'Cereals',
    '11': 'Products of the milling industry',
    '12': 'Oil seeds and oleaginous fruits',
    '13': 'Lac; gums, resins and other vegetable saps',
    '14': 'Vegetable plaiting materials',
    '15': 'Animal or vegetable fats and oils',
    '16': 'Preparations of meat, fish or crustaceans',
    '17': 'Sugars and sugar confectionery',
    '18': 'Cocoa and cocoa preparations',
    '19': 'Preparations of cereals, flour, starch or milk',
    '20': 'Preparations of vegetables, fruit, nuts',
    '21': 'Miscellaneous edible preparations',
    '22': 'Beverages, spirits and vinegar',
    '23': 'Residues and wastes from the food industries',
    '24': 'Tobacco and manufactured tobacco substitutes',
    '25': 'Salt; sulphur; earths and stone',
    '26': 'Ores, slag and ash',
    '27': 'Mineral fuels, mineral oils',
    '28': 'Inorganic chemicals',
    '29': 'Organic chemicals',
    '30': 'Pharmaceutical products',
    '31': 'Fertilisers',
    '32': 'Tanning or dyeing extracts',
    '33': 'Essential oils and resinoids',
    '34': 'Soap, organic surface-active agents',
    '35': 'Albuminoidal substances',
    '36': 'Explosives; pyrotechnic products',
    '37': 'Photographic or cinematographic goods',
    '38': 'Miscellaneous chemical products',
    '39': 'Plastics and articles thereof',
    '40': 'Rubber and articles thereof',
    '41': 'Raw hides and skins',
    '42': 'Articles of leather',
    '43': 'Furskins and artificial fur',
    '44': 'Wood and articles of wood',
    '45': 'Cork and articles of cork',
    '46': 'Manufactures of straw',
    '47': 'Pulp of wood or of other fibrous cellulosic material',
    '48': 'Paper and paperboard',
    '49': 'Printed books, newspapers, pictures',
    '50': 'Silk',
    '51': 'Wool, fine or coarse animal hair',
    '52': 'Cotton',
    '53': 'Other vegetable textile fibres',
    '54': 'Man-made filaments',
    '55': 'Man-made staple fibres',
    '56': 'Wadding, felt and nonwovens',
    '57': 'Carpets and other textile floor coverings',
    '58': 'Special woven fabrics',
    '59': 'Impregnated, coated, covered or laminated textile fabrics',
    '60': 'Knitted or crocheted fabrics',
    '61': 'Articles of apparel and clothing accessories',
    '62': 'Articles of apparel and clothing accessories',
    '63': 'Other made up textile articles',
    '64': 'Footwear, gaiters and the like',
    '65': 'Headgear and parts thereof',
    '66': 'Umbrellas, sun umbrellas, walking sticks',
    '67': 'Prepared feathers and down',
    '68': 'Articles of stone, plaster, cement, asbestos',
    '69': 'Ceramic products',
    '70': 'Glass and glassware',
    '71': 'Natural or cultured pearls, precious stones',
    '72': 'Iron and steel',
    '73': 'Articles of iron or steel',
    '74': 'Copper and articles thereof',
    '75': 'Nickel and articles thereof',
    '76': 'Aluminium and articles thereof',
    '78': 'Lead and articles thereof',
    '79': 'Zinc and articles thereof',
    '80': 'Tin and articles thereof',
    '81': 'Other base metals',
    '82': 'Tools, implements, cutlery, spoons and forks',
    '83': 'Miscellaneous articles of base metal',
    '84': 'Nuclear reactors, boilers, machinery',
    '85': 'Electrical machinery and equipment',
    '86': 'Railway or tramway locomotives',
    '87': 'Vehicles other than railway or tramway rolling stock',
    '88': 'Aircraft, spacecraft, and parts thereof',
    '89': 'Ships, boats and floating structures',
    '90': 'Optical, photographic, cinematographic, measuring',
    '91': 'Clocks and watches and parts thereof',
    '92': 'Musical instruments',
    '93': 'Arms and ammunition',
    '94': 'Furniture; bedding, mattresses',
    '95': 'Toys, games and sports requisites',
    '96': 'Miscellaneous manufactured articles',
    '97': 'Works of art, collectors\' pieces and antiques'
  };
  
  return categoryMap[code] || 'Other products';
}
