# Merged Summary CSV Documentation

## Overview
The `merged_summary.csv` file contains the intersection of US tariff and trade data by HS4 product codes. This dataset was created by merging tariff data from WITS (World Integrated Trade Solution) with trade flow data from UN Comtrade.

## File Information
- **File**: `merged_summary.csv`
- **Records**: 168 rows
- **Columns**: 9 columns
- **Data Sources**: WITS Tariff Data (2023) + UN Comtrade Trade Data (2024)
- **Geographic Scope**: United States (including Puerto Rico and US Virgin Islands)

## Column Descriptions

### Core Data Columns

| Column Name | Type | Description | Example | Notes |
|-------------|------|-------------|---------|-------|
| `hs4` | String | 4-digit Harmonized System product code | `2709` | Primary key for merging datasets |
| `simple_average` | Float | Average tariff rate (%) | `1.77` | Import-weighted average duty rate |
| `trade_value_total` | Float | Total trade value in USD | `348847200000.0` | Sum of all trade flows for this HS4 |

### Metadata Columns

| Column Name | Type | Description | Example | Notes |
|-------------|------|-------------|---------|-------|
| `year_x` | Integer | Year of tariff data | `2023` | Source: WITS tariff database |
| `Reporter_ISO_N` | Integer | ISO numeric country code (tariff) | `840` | 840 = United States |
| `ReporterName_x` | String | Country name (tariff) | `United States` | Source country for tariff data |
| `year_y` | Integer | Year of trade data | `2024` | Source: UN Comtrade |
| `ReporterCode` | Integer | Reporter code (trade) | `842` | Includes PR and USVI |
| `ReporterName_y` | String | Country name (trade) | `USA,PR,USVI` | Includes Puerto Rico & US Virgin Islands |

## Data Statistics

### Summary Statistics
- **Total Trade Value**: $1,080,731,617,048 (1.08 trillion USD)
- **Average Tariff Rate**: 7.42%
- **Tariff Range**: 0.03% to 77.20%
- **Trade Value Range**: $41,348 to $348.8 billion
- **Year Coverage**: Tariffs (2023), Trade (2024)

### Top Product Categories by Trade Value
1. **2709** - Crude petroleum oils: $348.8B, 1.77% tariff
2. **2710** - Petroleum oils (not crude): $117.4B, 7.92% tariff
3. **7115** - Precious metals (not gold): $42.5B, 10.47% tariff
4. **4011** - Rubber tires: $39.9B, 0.47% tariff
5. **7108** - Gold: $31.9B, 4.24% tariff

## HS4 Code Categories

HS4 codes represent 4-digit product categories in the Harmonized System:

| HS4 Range | Category | Examples |
|-----------|----------|----------|
| 01-05 | Live animals & animal products | Live cattle, meat, dairy |
| 06-14 | Vegetable products | Cereals, fruits, vegetables |
| 15 | Animal/vegetable fats & oils | Olive oil, butter |
| 16-24 | Foodstuffs, beverages, tobacco | Processed foods, alcohol |
| 25-27 | Mineral products | Oil, gas, coal, salt |
| 28-38 | Chemicals & allied products | Pharmaceuticals, fertilizers |
| 39-40 | Plastics & rubber | Plastic products, tires |
| 41-43 | Raw hides, leather, furs | Leather goods, furs |
| 44-46 | Wood & wood products | Lumber, furniture |
| 47-49 | Pulp, paper, printed matter | Paper, books, newspapers |
| 50-63 | Textiles & textile articles | Clothing, fabrics |
| 64-67 | Footwear, headgear, umbrellas | Shoes, hats, umbrellas |
| 68-70 | Stone, plaster, cement, glass | Building materials |
| 71 | Pearls, precious stones, metals | Diamonds, gold, silver |
| 72-83 | Base metals & articles | Steel, aluminum, tools |
| 84-85 | Machinery & electrical equipment | Computers, phones, engines |
| 86-89 | Transportation equipment | Cars, ships, aircraft |
| 90-97 | Miscellaneous manufactured articles | Clocks, musical instruments |

## Usage Examples

### Python Analysis
```python
import pandas as pd

# Load the data
df = pd.read_csv('merged_summary.csv')

# Find high-tariff products
high_tariff = df[df['simple_average'] > 20]
print(f"Products with >20% tariffs: {len(high_tariff)}")

# Find high-trade products  
high_trade = df[df['trade_value_total'] > 10_000_000_000]  # >$10B
print(f"Products with >$10B trade: {len(high_trade)}")

# Calculate estimated tariff revenue
df['tariff_revenue_estimate'] = df['simple_average'] / 100 * df['trade_value_total']
total_revenue = df['tariff_revenue_estimate'].sum()
print(f"Estimated tariff revenue: ${total_revenue/1e9:.1f}B")

# Group by HS4 prefix (2-digit categories)
df['hs2'] = df['hs4'].astype(str).str[:2]
category_summary = df.groupby('hs2').agg({
    'simple_average': 'mean',
    'trade_value_total': 'sum',
    'hs4': 'count'
}).round(2)
```

### Visualization Applications
- **World Map**: Color countries by average tariff rates
- **Sankey Diagrams**: Flow thickness = trade value, color = tariff rate
- **Bar Charts**: Top products by trade value or tariff rate
- **Scatter Plots**: Trade value vs. tariff rate correlation
- **Heat Maps**: Tariff rates by product category

## Data Quality Notes

### Limitations
1. **Year Mismatch**: Tariff data (2023) vs. Trade data (2024)
2. **Geographic Inconsistency**: Trade data includes PR/USVI, tariff data doesn't
3. **Coverage Gap**: Only 168 of ~1,200 possible HS4 codes have both datasets
4. **Aggregation**: Multiple tariff lines per HS4 are averaged (simple average)
5. **Currency**: All values in USD (trade data converted from 1000 USD units)

### Data Processing
- **HS4 Normalization**: Product codes standardized to 4-digit format
- **Missing Values**: Rows with NaN in key columns were dropped
- **Duplicate Handling**: Multiple tariff lines aggregated by mean
- **Trade Aggregation**: Multiple trade flows summed by HS4 code

## File Generation
This file was created using the data curation pipeline:
1. **Source Files**: 
   - `DataJobID-2947815_2947815_USATariffInfoWorld.csv` (tariff data)
   - `DataJobID-2947807_2947807_USAGrossImportsAllPartners.csv` (trade data)
2. **Processing**: `utils/data_cleaner.py` functions
3. **Pipeline**: `curate.py` main script
4. **Validation**: `tests/test_merge.py` test suite

## Related Files
- `column_explanations.csv` - Detailed column metadata
- `data_dictionary.json` - Machine-readable column definitions
- Source raw files in `../raw/` directory

---
*Generated by Tariff Insights Data Curation Pipeline*
*Last Updated: $(date)*
