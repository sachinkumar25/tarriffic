#!/usr/bin/env python3
"""
Example analysis script for merged_summary.csv
Demonstrates how to read and analyze the merged tariff and trade data
"""

import pandas as pd
import json
import os

def load_data_dictionary():
    """Load the data dictionary for reference"""
    with open('data_dictionary.json', 'r') as f:
        return json.load(f)

def analyze_merged_data():
    """Perform basic analysis on the merged dataset"""
    
    # Load the data
    print("📊 Loading merged tariff and trade data...")
    df = pd.read_csv('merged_summary.csv')
    
    # Load data dictionary
    data_dict = load_data_dictionary()
    
    print(f"✅ Loaded {len(df)} records with {len(df.columns)} columns")
    print()
    
    # Basic statistics
    print("📈 Dataset Summary:")
    print("=" * 50)
    print(f"Total trade value: ${df['trade_value_total'].sum()/1e12:.2f}T")
    print(f"Average tariff rate: {df['simple_average'].mean():.2f}%")
    print(f"Tariff range: {df['simple_average'].min():.2f}% - {df['simple_average'].max():.2f}%")
    print(f"Trade value range: ${df['trade_value_total'].min():,.0f} - ${df['trade_value_total'].max():,.0f}")
    print()
    
    # Top products by trade value
    print("🏆 Top 10 Products by Trade Value:")
    print("=" * 50)
    top_trade = df.nlargest(10, 'trade_value_total')[
        ['hs4', 'simple_average', 'trade_value_total']
    ].copy()
    top_trade['trade_billions'] = top_trade['trade_value_total'] / 1e9
    print(top_trade[['hs4', 'simple_average', 'trade_billions']].to_string(
        index=False, 
        formatters={'trade_billions': '${:.1f}B'.format}
    ))
    print()
    
    # High tariff products
    print("⚠️  Products with Highest Tariff Rates (>20%):")
    print("=" * 50)
    high_tariff = df[df['simple_average'] > 20].sort_values('simple_average', ascending=False)
    if not high_tariff.empty:
        print(high_tariff[['hs4', 'simple_average', 'trade_value_total']].to_string(
            index=False,
            formatters={'trade_value_total': '${:,.0f}'.format}
        ))
    else:
        print("No products found with >20% tariff rates")
    print()
    
    # Calculate estimated tariff revenue
    print("💰 Estimated Tariff Revenue:")
    print("=" * 50)
    df['tariff_revenue_estimate'] = df['simple_average'] / 100 * df['trade_value_total']
    total_revenue = df['tariff_revenue_estimate'].sum()
    print(f"Total estimated tariff revenue: ${total_revenue/1e9:.1f}B")
    print(f"Average revenue per HS4 code: ${df['tariff_revenue_estimate'].mean()/1e6:.1f}M")
    print()
    
    # HS4 category analysis
    print("📂 Analysis by HS4 Categories (2-digit prefixes):")
    print("=" * 50)
    df['hs2'] = df['hs4'].astype(str).str[:2]
    category_summary = df.groupby('hs2').agg({
        'simple_average': 'mean',
        'trade_value_total': 'sum',
        'hs4': 'count'
    }).round(2)
    category_summary['trade_billions'] = category_summary['trade_value_total'] / 1e9
    category_summary = category_summary.sort_values('trade_billions', ascending=False)
    
    print(category_summary[['simple_average', 'trade_billions', 'hs4']].head(10).to_string(
        formatters={'trade_billions': '${:.1f}B'.format}
    ))
    print()
    
    # Data quality insights
    print("🔍 Data Quality Insights:")
    print("=" * 50)
    print(f"Year mismatch: Tariff data from {df['year_x'].iloc[0]}, Trade data from {df['year_y'].iloc[0]}")
    print(f"Geographic scope: {df['ReporterName_y'].iloc[0]} vs {df['ReporterName_x'].iloc[0]}")
    print(f"Coverage: {len(df)} HS4 codes with both tariff and trade data")
    print(f"Missing data: Potential gaps for HS4 codes not in this dataset")
    print()
    
    return df

def export_analysis_results(df):
    """Export analysis results to CSV files"""
    
    print("💾 Exporting analysis results...")
    
    # Top products by trade value
    top_trade = df.nlargest(20, 'trade_value_total')
    top_trade.to_csv('top_products_by_trade_value.csv', index=False)
    
    # High tariff products
    high_tariff = df[df['simple_average'] > 10].sort_values('simple_average', ascending=False)
    high_tariff.to_csv('high_tariff_products.csv', index=False)
    
    # Category summary
    df['hs2'] = df['hs4'].astype(str).str[:2]
    category_summary = df.groupby('hs2').agg({
        'simple_average': 'mean',
        'trade_value_total': 'sum',
        'hs4': 'count'
    }).round(2)
    category_summary.to_csv('category_summary.csv')
    
    print("✅ Exported files:")
    print("  - top_products_by_trade_value.csv")
    print("  - high_tariff_products.csv") 
    print("  - category_summary.csv")

if __name__ == "__main__":
    print("🚀 Tariff Insights - Data Analysis Example")
    print("=" * 60)
    
    # Check if files exist
    if not os.path.exists('merged_summary.csv'):
        print("❌ Error: merged_summary.csv not found!")
        print("Please run the data curation pipeline first: python curate.py")
        exit(1)
    
    if not os.path.exists('data_dictionary.json'):
        print("❌ Error: data_dictionary.json not found!")
        print("Please ensure all documentation files are present")
        exit(1)
    
    try:
        # Run analysis
        df = analyze_merged_data()
        
        # Export results
        export_analysis_results(df)
        
        print("\n🎉 Analysis complete!")
        print("Check the exported CSV files for detailed results.")
        
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        exit(1)
