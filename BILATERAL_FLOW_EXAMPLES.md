# Bilateral Trade Flow Data - Complete Examples

## 🎯 **Yes! You now have complete bilateral flow data for every trade relationship**

With the expanded dataset, you can access **specific bilateral flows** with all the details you need for trade analysis and visualization.

## 📊 **Available Data Fields for Each Bilateral Flow**

For any **HS4 product** + **Partner country** combination, you get:

### **Core Trade Data**
- `hs4`: 4-digit product code (e.g., "2709")
- `partner_name`: Partner country (e.g., "Canada", "China", "Mexico")
- `partner_iso`: 3-letter ISO code (e.g., "CAN", "CHN", "MEX")
- `trade_value_total`: Total trade value in USD
- `trade_value_formatted`: Human-readable format (e.g., "$103.3B")

### **Tariff Information**
- `simple_average`: Average tariff rate as percentage
- `tariff_rate_formatted`: Formatted tariff (e.g., "1.77%")
- `year_x`: Tariff data year (2023)

### **Revenue Calculations**
- `tariff_revenue_estimate`: Estimated tariff revenue in USD
- `tariff_revenue_formatted`: Formatted revenue (e.g., "$1.8B")

### **Product Classification**
- `category`: HS4 category description
- `category_code`: 2-digit category code

### **Metadata**
- `ReporterName_x`: Reporting country (United States)
- `ReporterName_y`: Trade data source (USA,PR,USVI)
- `year_y`: Trade data year (2024)

## 🌍 **Real Bilateral Flow Examples**

### **Example 1: USA → Canada (Mineral Fuels)**
```json
{
  "hs4": "2709",
  "partner_name": "Canada",
  "partner_iso": "CAN",
  "trade_value_total": 103300938691,
  "trade_value_formatted": "$103.3B",
  "simple_average": 1.77,
  "tariff_rate_formatted": "1.77%",
  "tariff_revenue_estimate": 1823261567.896,
  "tariff_revenue_formatted": "$1.8B",
  "category": "Mineral fuels, mineral oils"
}
```

**Analysis**: USA imports $103.3B in mineral fuels from Canada with a 1.77% tariff, generating ~$1.8B in tariff revenue.

### **Example 2: USA → China (Footwear)**
```json
{
  "hs4": "6402",
  "partner_name": "China",
  "partner_iso": "CHN",
  "trade_value_total": 3625034651,
  "trade_value_formatted": "$3.6B",
  "simple_average": 34.93,
  "tariff_rate_formatted": "34.93%",
  "tariff_revenue_estimate": 1266079602.208,
  "tariff_revenue_formatted": "$1.3B",
  "category": "Footwear, gaiters and the like"
}
```

**Analysis**: USA imports $3.6B in footwear from China with a 34.93% tariff, generating ~$1.3B in tariff revenue.

### **Example 3: USA → Mexico (Apparel)**
```json
{
  "hs4": "6204",
  "partner_name": "Mexico",
  "partner_iso": "MEX",
  "trade_value_total": 2272605958,
  "trade_value_formatted": "$2.3B",
  "simple_average": 23.63,
  "tariff_rate_formatted": "23.63%",
  "tariff_revenue_estimate": 536903157.577,
  "tariff_revenue_formatted": "$536.9M",
  "category": "Articles of apparel and clothing accessories"
}
```

**Analysis**: USA imports $2.3B in apparel from Mexico with a 23.63% tariff, generating ~$537M in tariff revenue.

## 🔍 **How to Query Specific Bilateral Flows**

### **Method 1: Direct API Query**
```javascript
// Get all bilateral flows for a specific HS4 product
const response = await fetch('/api/summary');
const { data } = await response.json();

// Filter for specific bilateral flow
const bilateralFlow = data.find(row => 
  row.hs4 === "2709" && row.partner_name === "Canada"
);

console.log(bilateralFlow);
```

### **Method 2: Partner-Specific Analysis**
```javascript
// Get all flows for a specific partner
const canadaFlows = data.filter(row => 
  row.partner_name === "Canada"
);

// Sort by trade value
const topCanadaFlows = canadaFlows
  .sort((a, b) => b.trade_value_total - a.trade_value_total)
  .slice(0, 10);
```

### **Method 3: High-Tariff Bilateral Flows**
```javascript
// Find high-tariff bilateral flows
const highTariffFlows = data.filter(row => 
  row.simple_average > 20 && row.trade_value_total > 1000000000
);

// Group by partner
const byPartner = highTariffFlows.reduce((acc, flow) => {
  if (!acc[flow.partner_name]) acc[flow.partner_name] = [];
  acc[flow.partner_name].push(flow);
  return acc;
}, {});
```

## 📈 **Trade Analysis Capabilities**

### **Partner Comparison**
```javascript
// Compare tariff revenue from different partners for same product
const mineralFuelsFlows = data.filter(row => row.hs4 === "2709");

const partnerComparison = mineralFuelsFlows
  .map(flow => ({
    partner: flow.partner_name,
    tradeValue: flow.trade_value_total,
    tariffRate: flow.simple_average,
    tariffRevenue: flow.tariff_revenue_estimate,
    tradeShare: (flow.trade_value_total / totalTradeValue * 100).toFixed(1)
  }))
  .sort((a, b) => b.tariffRevenue - a.tariffRevenue);
```

### **Product Analysis**
```javascript
// Analyze all bilateral flows for a specific product
const productAnalysis = data
  .filter(row => row.hs4 === "6204") // Apparel
  .reduce((acc, flow) => {
    acc.totalTradeValue += flow.trade_value_total;
    acc.totalTariffRevenue += flow.tariff_revenue_estimate;
    acc.partnerCount += 1;
    acc.partners.push(flow.partner_name);
    return acc;
  }, {
    totalTradeValue: 0,
    totalTariffRevenue: 0,
    partnerCount: 0,
    partners: []
  });
```

### **Tariff Impact Analysis**
```javascript
// Calculate tariff impact by partner
const tariffImpact = data.map(flow => ({
  partner: flow.partner_name,
  product: flow.hs4,
  category: flow.category,
  tradeValue: flow.trade_value_total,
  tariffRate: flow.simple_average,
  tariffRevenue: flow.tariff_revenue_estimate,
  tariffBurden: (flow.tariff_revenue_estimate / flow.trade_value_total * 100).toFixed(2)
}));
```

## 🗺️ **Mapbox Integration Examples**

### **Trade Flow Visualization**
```javascript
// Create trade flow arrows for Mapbox
const tradeFlows = data.map(flow => ({
  type: 'Feature',
  properties: {
    source: 'USA',
    target: flow.partner_iso,
    hs4: flow.hs4,
    category: flow.category,
    tradeValue: flow.trade_value_total,
    tariffRate: flow.simple_average,
    tariffRevenue: flow.tariff_revenue_estimate,
    // Visual properties
    strokeWidth: Math.log10(flow.trade_value_total) * 2,
    strokeColor: getTariffColor(flow.simple_average)
  },
  geometry: {
    type: 'LineString',
    coordinates: [
      [-95.7129, 37.0902], // USA coordinates
      getPartnerCoordinates(flow.partner_iso)
    ]
  }
}));
```

### **Country Coloring by Tariff Revenue**
```javascript
// Color countries by total tariff revenue received
const countryTariffRevenue = data.reduce((acc, flow) => {
  if (!acc[flow.partner_iso]) acc[flow.partner_iso] = 0;
  acc[flow.partner_iso] += flow.tariff_revenue_estimate;
  return acc;
}, {});

const countryColors = Object.entries(countryTariffRevenue).map(([country, revenue]) => ({
  country,
  revenue,
  color: getRevenueColor(revenue)
}));
```

## 📊 **D3 Visualization Examples**

### **Sankey Diagram Data**
```javascript
// Prepare data for Sankey diagram
const sankeyData = data.map(flow => ({
  source: flow.partner_name,
  target: flow.category,
  value: flow.trade_value_total,
  tariffRevenue: flow.tariff_revenue_estimate
}));
```

### **Bar Chart by Partner**
```javascript
// Top partners by tariff revenue
const topPartners = data
  .reduce((acc, flow) => {
    if (!acc[flow.partner_name]) {
      acc[flow.partner_name] = {
        partner: flow.partner_name,
        totalTradeValue: 0,
        totalTariffRevenue: 0,
        flowCount: 0
      };
    }
    acc[flow.partner_name].totalTradeValue += flow.trade_value_total;
    acc[flow.partner_name].totalTariffRevenue += flow.tariff_revenue_estimate;
    acc[flow.partner_name].flowCount += 1;
    return acc;
  }, {});
```

## 🎯 **Key Benefits for Your Analysis**

### **✅ Complete Bilateral Coverage**
- **9,188 bilateral flows** across 168 HS4 products and 213 partners
- Every trade relationship has matching tariff data
- No missing bilateral flows

### **✅ Rich Data Fields**
- Trade values, tariff rates, revenue estimates
- Product categories, partner ISO codes
- Formatted values for display

### **✅ Flexible Querying**
- Filter by HS4 product, partner country, tariff level
- Sort by trade value, tariff revenue, tariff rate
- Group by category, partner, or product

### **✅ Visualization Ready**
- Perfect for Mapbox trade flow arrows
- Ideal for D3 Sankey diagrams and bar charts
- Ready for interactive dashboards

## 🚀 **Next Steps**

1. **Query specific bilateral flows** using the examples above
2. **Create partner-specific visualizations** with the rich data
3. **Build interactive dashboards** showing tariff impact by country
4. **Analyze trade patterns** across different product categories

**Result**: You now have complete bilateral trade flow data with tariffs, trade values, and revenue estimates for every USA trading relationship! 🌍📊
