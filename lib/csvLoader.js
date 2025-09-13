/**
 * CSV Loader Utility
 * Shared functions for parsing CSV files and loading JSON data
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'papaparse';

/**
 * Get the absolute path to the data/processed directory
 */
function getDataPath() {
  return path.join(process.cwd(), 'data-curator', 'data', 'processed');
}

/**
 * Check if expanded dataset exists and is newer than merged dataset
 * @returns {string} Filename to use ('expanded_summary.csv' or 'merged_summary.csv')
 */
export function getSummaryFilename() {
  const dataPath = getDataPath();
  const expandedFile = path.join(dataPath, 'expanded_summary.csv');
  const mergedFile = path.join(dataPath, 'merged_summary.csv');
  
  if (fs.existsSync(expandedFile)) {
    return 'expanded_summary.csv';
  } else if (fs.existsSync(mergedFile)) {
    return 'merged_summary.csv';
  } else {
    throw new Error('No summary dataset found. Please run the data expansion script.');
  }
}

/**
 * Parse CSV file and return as JSON array
 * @param {string} filename - CSV filename in data/processed directory
 * @returns {Promise<Array>} Parsed CSV data as JSON array
 */
export async function loadCSV(filename) {
  try {
    const filePath = path.join(getDataPath(), filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filename}`);
    }
    
    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse CSV
    const result = parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(), // Remove whitespace from headers
      transform: (value, field) => {
        // Convert numeric strings to numbers where appropriate
        if (value === '') return null;
        
        // Keep HS4 codes as strings
        if (field === 'hs4') {
          return value.toString();
        }
        
        // Convert other numeric fields to numbers
        if (!isNaN(value) && value !== '') {
          return parseFloat(value);
        }
        return value;
      }
    });
    
    if (result.errors.length > 0) {
      console.warn(`CSV parsing warnings for ${filename}:`, result.errors);
    }
    
    return result.data;
  } catch (error) {
    console.error(`Error loading CSV ${filename}:`, error);
    throw error;
  }
}

/**
 * Load JSON file and return parsed data
 * @param {string} filename - JSON filename in data/processed directory
 * @returns {Promise<Object>} Parsed JSON data
 */
export async function loadJSON(filename) {
  try {
    const filePath = path.join(getDataPath(), filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filename}`);
    }
    
    // Read and parse JSON
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading JSON ${filename}:`, error);
    throw error;
  }
}

/**
 * Validate HS4 code format (4 digits)
 * @param {string} hs4 - HS4 code to validate
 * @returns {boolean} True if valid HS4 format
 */
export function validateHS4(hs4) {
  if (!hs4 || typeof hs4 !== 'string') {
    return false;
  }
  
  // Check if it's exactly 4 digits
  const hs4Regex = /^\d{4}$/;
  return hs4Regex.test(hs4);
}

/**
 * Calculate tariff revenue estimate
 * @param {number} tariffRate - Tariff rate as percentage
 * @param {number} tradeValue - Trade value in USD
 * @returns {number} Estimated tariff revenue in USD
 */
export function calculateTariffRevenue(tariffRate, tradeValue) {
  if (!tariffRate || !tradeValue || tariffRate < 0 || tradeValue < 0) {
    return 0;
  }
  
  return (tariffRate / 100) * tradeValue;
}

/**
 * Format trade value for display
 * @param {number} value - Trade value in USD
 * @returns {string} Formatted value (e.g., "1.2B", "500M")
 */
export function formatTradeValue(value) {
  if (!value || value < 0) return '$0';
  
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(1)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
}

/**
 * Format tariff rate for display
 * @param {number} rate - Tariff rate as percentage
 * @returns {string} Formatted rate (e.g., "5.2%")
 */
export function formatTariffRate(rate) {
  if (!rate || rate < 0) return '0%';
  return `${rate.toFixed(2)}%`;
}

/**
 * Get HS4 category description from 2-digit prefix
 * @param {string} hs4 - 4-digit HS4 code
 * @returns {string} Category description
 */
export function getHS4Category(hs4) {
  if (!hs4 || hs4.length < 2) return 'Unknown';
  
  const prefix = hs4.substring(0, 2);
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
  
  return categoryMap[prefix] || 'Other products';
}
