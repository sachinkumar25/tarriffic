/**
 * GET /api/dictionary
 * Returns data_dictionary.json as JSON
 * 
 * Response format:
 * {
 *   status: "success",
 *   data: {
 *     dataset_info: {...},
 *     columns: {...},
 *     hs4_categories: {...},
 *     data_quality: {...},
 *     usage_examples: {...}
 *   }
 * }
 */

import { loadJSON } from '../../lib/csvLoader';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed. Use GET.'
    });
  }

  try {
    // Load the data dictionary
    const dictionary = await loadJSON('data_dictionary.json');
    
    // Return successful response
    res.status(200).json({
      status: 'success',
      data: dictionary,
      meta: {
        lastUpdated: dictionary.dataset_info?.created_date || 'N/A',
        totalColumns: Object.keys(dictionary.columns || {}).length,
        totalCategories: Object.keys(dictionary.hs4_categories || {}).length,
        version: '1.0.0'
      }
    });

  } catch (error) {
    console.error('Error in /api/dictionary:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to load data dictionary',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
