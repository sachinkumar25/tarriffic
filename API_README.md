# Tariff Insights API Documentation

## Overview
This Next.js API provides clean JSON endpoints for accessing processed tariff and trade data. The API serves data from CSV files in the `data-curator/data/processed/` directory.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Test API Endpoints
```bash
npm run test-api
```

## 📡 API Endpoints

### 1. GET `/api/summary`
Returns all rows from `merged_summary.csv` as JSON.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "hs4": "2709",
      "simple_average": 1.77,
      "trade_value_total": 348847200000,
      "tariff_revenue_estimate": 6174619440,
      "trade_value_formatted": "$348.8B",
      "tariff_rate_formatted": "1.77%",
      "tariff_revenue_formatted": "$6.2B",
      "year_x": 2023,
      "ReporterName_x": "United States",
      "year_y": 2024,
      "ReporterName_y": "USA,PR,USVI"
    }
  ],
  "meta": {
    "total": 168,
    "totalTradeValue": 1080731617048,
    "averageTariff": 7.42,
    "tariffRange": { "min": 0.025, "max": 77.2 }
  }
}
```

### 2. GET `/api/summary/[hs4]`
Returns a single product by HS4 code.

**Parameters:**
- `hs4`: 4-digit HS4 product code (e.g., "2709")

**Example:** `/api/summary/2709`

**Response:**
```json
{
  "status": "success",
  "data": {
    "hs4": "2709",
    "simple_average": 1.77,
    "trade_value_total": 348847200000,
    "tariff_revenue_estimate": 6174619440,
    "category": "Mineral fuels, mineral oils",
    "category_code": "27"
  },
  "meta": {
    "hs4": "2709",
    "category": "Mineral fuels, mineral oils"
  }
}
```

**Error Response (Invalid HS4):**
```json
{
  "status": "error",
  "message": "Invalid HS4 format. Must be 4 digits (e.g., \"2709\")"
}
```

### 3. GET `/api/categories`
Returns `category_summary.csv` as JSON, grouped by HS4 categories.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "hs2": "27",
      "simple_average": 6.15,
      "trade_value_total": 468500000000,
      "hs4": 3,
      "category_code": "27",
      "category_name": "Mineral fuels, mineral oils",
      "trade_share": 43.3
    }
  ],
  "meta": {
    "total": 10,
    "totalTradeValue": 1080731617048,
    "averageTariff": 7.42,
    "topCategory": "Mineral fuels, mineral oils"
  }
}
```

### 4. GET `/api/high-tariff`
Returns `high_tariff_products.csv` as JSON - products with >10% tariff rates.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "hs4": "2309",
      "simple_average": 77.2,
      "trade_value_total": 6476123424,
      "tariff_revenue_estimate": 4999563287,
      "category": "Residues and wastes from the food industries"
    }
  ],
  "meta": {
    "total": 16,
    "averageTariff": 32.1,
    "highestTariff": 77.2,
    "totalTariffRevenue": 75780000000
  }
}
```

### 5. GET `/api/dictionary`
Returns `data_dictionary.json` with column definitions and metadata.

**Response:**
```json
{
  "status": "success",
  "data": {
    "dataset_info": {
      "name": "merged_summary",
      "description": "Intersection of US tariff and trade data",
      "records": 168,
      "columns": 9
    },
    "columns": {
      "hs4": {
        "type": "string",
        "description": "4-digit Harmonized System product code"
      }
    },
    "hs4_categories": {
      "27": "Mineral fuels, mineral oils"
    }
  },
  "meta": {
    "lastUpdated": "2024-09-13",
    "totalColumns": 9,
    "version": "1.0.0"
  }
}
```

## 🔧 Data Processing

### CSV Loading
All CSV files are parsed using PapaParse with the following configuration:
- Headers are automatically detected
- Empty lines are skipped
- Numeric strings are converted to numbers
- Whitespace is trimmed from headers

### Computed Fields
The API automatically adds computed fields to enhance the data:

- `tariff_revenue_estimate`: `simple_average/100 * trade_value_total`
- `trade_value_formatted`: Human-readable format (e.g., "$348.8B")
- `tariff_rate_formatted`: Percentage format (e.g., "1.77%")
- `tariff_revenue_formatted`: Human-readable revenue format
- `category`: HS4 category description
- `category_code`: 2-digit HS4 prefix

## 🛠️ Error Handling

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "details": "Additional details (development only)"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (HS4 code not found)
- `405`: Method Not Allowed (non-GET requests)
- `500`: Internal Server Error (file loading issues)

## 📁 File Structure

```
pages/api/
├── summary.js           # GET /api/summary
├── summary/
│   └── [hs4].js        # GET /api/summary/[hs4]
├── categories.js        # GET /api/categories
├── high-tariff.js       # GET /api/high-tariff
└── dictionary.js        # GET /api/dictionary

lib/
└── csvLoader.js         # Shared CSV parsing utilities

scripts/
└── test-api.js          # API testing script
```

## 🧪 Testing

Run the test suite to verify all endpoints:

```bash
# Test all endpoints
npm run test-api

# Test with custom base URL
API_BASE_URL=https://your-domain.com npm run test-api
```

The test script will:
- Test all API endpoints
- Validate response structure
- Check error handling
- Display detailed results

## 🔗 Frontend Integration

### Fetching Data in React
```javascript
// Fetch all summary data
const response = await fetch('/api/summary');
const { data, meta } = await response.json();

// Fetch specific product
const productResponse = await fetch('/api/summary/2709');
const { data: product } = await productResponse.json();

// Fetch categories for Sankey diagram
const categoriesResponse = await fetch('/api/categories');
const { data: categories } = await categoriesResponse.json();
```

### Using with Mapbox
```javascript
// Load data for map visualization
const summaryData = await fetch('/api/summary').then(r => r.json());
const mapData = summaryData.data.map(item => ({
  type: 'Feature',
  properties: {
    hs4: item.hs4,
    tariff: item.simple_average,
    tradeValue: item.trade_value_total
  }
}));
```

### Using with D3
```javascript
// Load data for D3 visualizations
const categories = await fetch('/api/categories').then(r => r.json());
const sankeyData = categories.data.map(cat => ({
  source: cat.category_name,
  target: 'US Market',
  value: cat.trade_value_total
}));
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Other Platforms
Ensure the following files are accessible:
- `data-curator/data/processed/*.csv`
- `data-curator/data/processed/*.json`

## 📊 Data Sources

The API serves data from these processed files:
- `merged_summary.csv`: Core dataset with 168 HS4 products
- `category_summary.csv`: Aggregated by HS4 categories
- `high_tariff_products.csv`: Products with >10% tariffs
- `data_dictionary.json`: Column definitions and metadata

## 🔍 Performance Notes

- CSV files are parsed on each request (consider caching for production)
- Files are read synchronously (consider async for large datasets)
- Response sizes vary by endpoint (summary: ~50KB, others: ~5-10KB)

## 🛡️ Security

- Only GET requests are allowed
- File paths are validated to prevent directory traversal
- Error details are hidden in production mode
- Input validation on all parameters

---

*For questions or issues, check the test script output or review the source code in `lib/csvLoader.js`.*
