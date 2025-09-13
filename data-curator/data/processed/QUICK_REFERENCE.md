# Quick Reference: Merged Summary CSV

## 📁 Files in this directory:
- `merged_summary.csv` - Main dataset (168 rows, 9 columns)
- `README.md` - Comprehensive documentation
- `column_explanations.csv` - Column metadata
- `data_dictionary.json` - Machine-readable definitions
- `example_analysis.py` - Analysis example script
- `QUICK_REFERENCE.md` - This file

## 🔑 Key Columns:
| Column | What it is | Example |
|--------|------------|---------|
| `hs4` | Product code (4 digits) | `2709` |
| `simple_average` | Tariff rate (%) | `1.77` |
| `trade_value_total` | Trade value (USD) | `348847200000.0` |

## 📊 Quick Stats:
- **168 products** with both tariff & trade data
- **$1.08T** total trade value
- **7.42%** average tariff rate
- **0.03% - 77.20%** tariff range

## 🚀 Quick Start:
```python
import pandas as pd
df = pd.read_csv('merged_summary.csv')

# High-tariff products
high_tariff = df[df['simple_average'] > 20]

# High-trade products  
high_trade = df[df['trade_value_total'] > 10_000_000_000]

# Estimated tariff revenue
df['revenue'] = df['simple_average'] / 100 * df['trade_value_total']
```

## 🏆 Top Products:
1. **2709** (Oil): $348.8B, 1.77% tariff
2. **2710** (Petroleum): $117.4B, 7.92% tariff  
3. **7115** (Metals): $42.5B, 10.47% tariff

## ⚠️ Data Notes:
- Tariff data: 2023
- Trade data: 2024
- Includes PR & USVI in trade data
- Only 168 of ~1,200 HS4 codes covered

---
*For detailed info, see README.md*
