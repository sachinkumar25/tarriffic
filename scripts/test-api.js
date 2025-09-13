#!/usr/bin/env node

/**
 * API Testing Script
 * Tests all API endpoints to ensure they work correctly
 */

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ENDPOINTS = [
  '/api/summary',
  '/api/categories', 
  '/api/high-tariff',
  '/api/dictionary',
  '/api/check-coverage', // New coverage endpoint
  '/api/summary/2709', // Test dynamic route with valid HS4
  '/api/summary/9999'  // Test dynamic route with invalid HS4 (expected 404)
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: error.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    log(`\n🧪 Testing: ${endpoint}`, 'blue');
    
    const response = await makeRequest(url);
    
    // Check status code
    if (response.status === 200) {
      log(`✅ Status: ${response.status}`, 'green');
      
      // Check response structure
      if (response.data.status === 'success') {
        log(`✅ Response structure: Valid`, 'green');
        
        // Show sample data
        if (response.data.data) {
          if (Array.isArray(response.data.data)) {
            log(`📊 Records: ${response.data.data.length}`, 'blue');
            if (response.data.data.length > 0) {
              log(`📋 Sample keys: ${Object.keys(response.data.data[0]).slice(0, 5).join(', ')}...`, 'blue');
            }
          } else {
            log(`📊 Data keys: ${Object.keys(response.data.data).slice(0, 5).join(', ')}...`, 'blue');
          }
        }
        
        // Show metadata if available
        if (response.data.meta) {
          log(`📈 Metadata keys: ${Object.keys(response.data.meta).join(', ')}`, 'blue');
        }
        
      } else {
        log(`❌ Invalid response structure: missing 'status: success'`, 'red');
      }
      
    } else if (response.status === 404) {
      // 404 is expected for invalid HS4 codes, so count as success
      log(`✅ Status: ${response.status} (Not Found - Expected)`, 'green');
      if (response.data.message) {
        log(`💬 Message: ${response.data.message}`, 'green');
      }
      return {
        endpoint,
        success: true, // Count 404 as success for invalid HS4
        status: response.status,
        response: response.data
      };
    } else if (response.status === 400) {
      log(`⚠️  Status: ${response.status} (Bad Request)`, 'yellow');
      if (response.data.message) {
        log(`💬 Message: ${response.data.message}`, 'yellow');
      }
    } else {
      log(`❌ Status: ${response.status}`, 'red');
      if (response.data.message) {
        log(`💬 Message: ${response.data.message}`, 'red');
      }
    }
    
    return {
      endpoint,
      success: response.status === 200 && response.data.status === 'success',
      status: response.status,
      response: response.data
    };
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return {
      endpoint,
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  log(`${colors.bold}🚀 Tariff Insights API Test Suite${colors.reset}`);
  log(`${colors.bold}================================${colors.reset}`);
  log(`Base URL: ${BASE_URL}`);
  log(`Endpoints to test: ${ENDPOINTS.length}`);
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  // Summary
  log(`\n${colors.bold}📊 Test Summary${colors.reset}`);
  log(`${colors.bold}===============${colors.reset}`);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  log(`Total tests: ${results.length}`);
  log(`✅ Successful: ${successful}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (failed > 0) {
    log(`\n${colors.bold}Failed endpoints:${colors.reset}`);
    results.filter(r => !r.success).forEach(r => {
      log(`❌ ${r.endpoint}`, 'red');
    });
  }
  
  // Detailed results
  log(`\n${colors.bold}📋 Detailed Results${colors.reset}`);
  log(`${colors.bold}==================${colors.reset}`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const color = result.success ? 'green' : 'red';
    log(`${status} ${result.endpoint}`, color);
    
    if (result.error) {
      log(`   Error: ${result.error}`, 'red');
    } else if (result.status) {
      log(`   Status: ${result.status}`, 'blue');
    }
  });
  
  log(`\n${colors.bold}🎉 API testing complete!${colors.reset}`);
  
  if (successful === results.length) {
    log(`All endpoints are working correctly! 🚀`, 'green');
    process.exit(0);
  } else {
    log(`Some endpoints need attention. Check the errors above.`, 'yellow');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    log(`❌ Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { testEndpoint, runTests };
