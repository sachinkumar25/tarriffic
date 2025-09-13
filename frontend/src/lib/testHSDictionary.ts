/**
 * Test file for HS Dictionary functionality
 * Run this to verify the HS dictionary is working correctly
 */

import { getHSDescription, getHSDictionaryStats, searchHSByDescription } from './hsDictionary';

// Test function to verify HS dictionary functionality
export const testHSDictionary = () => {
  console.log('🧪 Testing HS Dictionary...');
  
  // Test basic functionality
  console.log('\n📊 Dictionary Statistics:');
  const stats = getHSDictionaryStats();
  console.log(stats);
  
  // Test some known HS codes
  console.log('\n🔍 Testing specific HS codes:');
  const testCodes = ['010119', '010120', '1234', '8517', '999999'];
  
  testCodes.forEach(code => {
    const description = getHSDescription(code);
    console.log(`  ${code}: ${description}`);
  });
  
  // Test search functionality
  console.log('\n🔎 Testing search functionality:');
  const searchResults = searchHSByDescription('horses', 5);
  console.log('Search for "horses":');
  searchResults.forEach(result => {
    console.log(`  ${result.code}: ${result.description}`);
  });
  
  // Test fallback functionality
  console.log('\n🔄 Testing fallback functionality:');
  const fallbackTest = getHSDescription('INVALID_CODE', 'Custom Fallback');
  console.log(`Invalid code fallback: ${fallbackTest}`);
  
  console.log('\n✅ HS Dictionary test completed!');
};

// Export for use in development
export default testHSDictionary;
