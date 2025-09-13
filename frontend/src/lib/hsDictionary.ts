/**
 * HS Code Dictionary Helper
 * Provides functions to get product descriptions from HS codes
 */

// Import the HS dictionary JSON
import hsDictionaryData from '../../public/hs_dictionary.json';

// Type definition for the HS dictionary
export interface HSDictionary {
  [hsCode: string]: string;
}

// Cast the imported data to our interface
const hsDictionary: HSDictionary = hsDictionaryData as HSDictionary;

/**
 * Get the product description for a given HS code
 * @param hsCode - The HS code (e.g., "010119", "1234", "12")
 * @param fallback - Optional fallback text if code not found
 * @returns The product description or fallback
 */
export const getHSDescription = (hsCode: string, fallback?: string): string => {
  if (!hsCode) return fallback || 'Unknown Product';
  
  // Clean the HS code (remove spaces, convert to string)
  const cleanCode = String(hsCode).trim();
  
  // Try exact match first
  if (hsDictionary[cleanCode]) {
    return hsDictionary[cleanCode];
  }
  
  // Try to find the closest match for truncated codes
  // This is useful when you have HS2 or HS4 codes but the dictionary has HS6
  const matchingKeys = Object.keys(hsDictionary).filter(key => 
    key.startsWith(cleanCode) || cleanCode.startsWith(key)
  );
  
  if (matchingKeys.length > 0) {
    // Return the description of the first match
    return hsDictionary[matchingKeys[0]];
  }
  
  // If no match found, return fallback or formatted code
  return fallback || `HS Code ${cleanCode}`;
};

/**
 * Get multiple descriptions for an array of HS codes
 * @param hsCodes - Array of HS codes
 * @returns Object mapping HS codes to descriptions
 */
export const getHSDescriptions = (hsCodes: string[]): { [code: string]: string } => {
  const result: { [code: string]: string } = {};
  
  hsCodes.forEach(code => {
    result[code] = getHSDescription(code);
  });
  
  return result;
};

/**
 * Search for HS codes by description (case-insensitive)
 * @param searchTerm - The search term
 * @param limit - Maximum number of results (default: 10)
 * @returns Array of matching HS codes with descriptions
 */
export const searchHSByDescription = (searchTerm: string, limit: number = 10): Array<{code: string, description: string}> => {
  if (!searchTerm || searchTerm.trim().length < 2) return [];
  
  const search = searchTerm.toLowerCase().trim();
  const matches: Array<{code: string, description: string}> = [];
  
  for (const [code, description] of Object.entries(hsDictionary)) {
    if (description.toLowerCase().includes(search)) {
      matches.push({ code, description });
      if (matches.length >= limit) break;
    }
  }
  
  return matches;
};

/**
 * Get statistics about the HS dictionary
 * @returns Object with dictionary statistics
 */
export const getHSDictionaryStats = () => {
  const codes = Object.keys(hsDictionary);
  const descriptions = Object.values(hsDictionary);
  
  return {
    totalCodes: codes.length,
    uniqueDescriptions: new Set(descriptions).size,
    averageDescriptionLength: descriptions.reduce((sum, desc) => sum + desc.length, 0) / descriptions.length,
    codeLengths: {
      '2-digit': codes.filter(code => code.length === 2).length,
      '4-digit': codes.filter(code => code.length === 4).length,
      '6-digit': codes.filter(code => code.length === 6).length,
      'other': codes.filter(code => ![2, 4, 6].includes(code.length)).length,
    }
  };
};

// Export the dictionary for direct access if needed
export { hsDictionary };
