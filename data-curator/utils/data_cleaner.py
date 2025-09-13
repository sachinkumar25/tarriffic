# data_cleaner.py
import pandas as pd
import numpy as np
from typing import Optional

def normalize_hs4(product_code: str) -> str:
    """
    Normalize product code to HS4 format (first 4 digits)
    
    Args:
        product_code: Product code string (e.g., "01022940", "85", "8517")
        
    Returns:
        HS4 code string (e.g., "0102", "0085", "8517")
    """
    if pd.isna(product_code) or product_code == "":
        return ""
    
    # Convert to string and strip whitespace
    code = str(product_code).strip()
    
    # Remove any non-digit characters
    code = ''.join(filter(str.isdigit, code))
    
    # Take first 4 digits and pad with zeros if necessary
    if len(code) >= 4:
        return code[:4]
    elif len(code) > 0:
        # Pad with leading zeros to make it 4 digits
        return code.zfill(4)
    else:
        return ""

def clean_tariff_data(csv_path: str) -> pd.DataFrame:
    """
    Clean tariff CSV data from WITS
    
    Args:
        csv_path: Path to the tariff CSV file
        
    Returns:
        Cleaned DataFrame with normalized HS4 codes and aggregated data
    """
    print(f"📊 Cleaning tariff data from: {csv_path}")
    
    # Read the CSV file
    try:
        df = pd.read_csv(csv_path)
        print(f"  ✓ Loaded {len(df)} tariff records")
    except Exception as e:
        print(f"  ❌ Error loading CSV: {e}")
        return pd.DataFrame()
    
    # Check required columns
    required_cols = ["ProductCode", "AdValorem Equivalent", "Year"]
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        print(f"  ❌ Missing required columns: {missing_cols}")
        print(f"  Available columns: {list(df.columns)}")
        return pd.DataFrame()
    
    # Clean the data
    print("  🔧 Cleaning data...")
    
    # Create HS4 column
    df['hs4'] = df['ProductCode'].apply(normalize_hs4)
    
    # Filter out invalid HS4 codes
    df = df[df['hs4'] != ""]
    
    # Convert numeric columns
    numeric_cols = ['AdValorem Equivalent', 'Year']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Drop rows with NaN values in key columns
    df = df.dropna(subset=['hs4', 'AdValorem Equivalent', 'Year'])
    
    # Rename columns for consistency
    df = df.rename(columns={
        'AdValorem Equivalent': 'simple_average',
        'Year': 'year'
    })
    
    # Aggregate by HS4 code (take mean of tariff rates, max of year)
    aggregated = df.groupby('hs4').agg({
        'simple_average': 'mean',
        'year': 'max',  # Use the most recent year
        'Reporter_ISO_N': 'first',
        'ReporterName': 'first'
    }).reset_index()
    
    print(f"  ✓ Cleaned and aggregated to {len(aggregated)} unique HS4 codes")
    print(f"  📈 HS4 codes range: {aggregated['hs4'].min()} - {aggregated['hs4'].max()}")
    print(f"  📅 Year range: {aggregated['year'].min()} - {aggregated['year'].max()}")
    print(f"  💰 Average tariff rate: {aggregated['simple_average'].mean():.2f}%")
    
    return aggregated

def clean_trade_data(csv_path: str) -> pd.DataFrame:
    """
    Clean trade flow CSV data from Comtrade/WITS
    
    Args:
        csv_path: Path to the trade CSV file
        
    Returns:
        Cleaned DataFrame with normalized HS4 codes and aggregated trade values
    """
    print(f"📊 Cleaning trade data from: {csv_path}")
    
    # Read the CSV file
    try:
        df = pd.read_csv(csv_path)
        print(f"  ✓ Loaded {len(df)} trade records")
    except Exception as e:
        print(f"  ❌ Error loading CSV: {e}")
        return pd.DataFrame()
    
    # Check required columns
    required_cols = ["ProductCode", "TradeValue in 1000 USD", "Year"]
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        print(f"  ❌ Missing required columns: {missing_cols}")
        print(f"  Available columns: {list(df.columns)}")
        return pd.DataFrame()
    
    # Clean the data
    print("  🔧 Cleaning data...")
    
    # Create HS4 column
    df['hs4'] = df['ProductCode'].apply(normalize_hs4)
    
    # Filter out invalid HS4 codes
    df = df[df['hs4'] != ""]
    
    # Convert numeric columns
    numeric_cols = ['TradeValue in 1000 USD', 'Year']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Drop rows with NaN values in key columns
    df = df.dropna(subset=['hs4', 'TradeValue in 1000 USD', 'Year'])
    
    # Convert trade value from 1000 USD to USD
    df['trade_value_total'] = df['TradeValue in 1000 USD'] * 1000
    
    # Rename columns for consistency
    df = df.rename(columns={
        'Year': 'year'
    })
    
    # Aggregate by HS4 code (sum trade values, max of year)
    aggregated = df.groupby('hs4').agg({
        'trade_value_total': 'sum',
        'year': 'max',  # Use the most recent year
        'ReporterCode': 'first',
        'ReporterName': 'first'
    }).reset_index()
    
    print(f"  ✓ Cleaned and aggregated to {len(aggregated)} unique HS4 codes")
    print(f"  📈 HS4 codes range: {aggregated['hs4'].min()} - {aggregated['hs4'].max()}")
    print(f"  📅 Year range: {aggregated['year'].min()} - {aggregated['year'].max()}")
    print(f"  💰 Total trade value: ${aggregated['trade_value_total'].sum():,.0f}")
    
    return aggregated

def validate_merged_data(merged_df: pd.DataFrame) -> dict:
    """
    Validate the merged dataset and return summary statistics
    
    Args:
        merged_df: Merged DataFrame from tariff and trade data
        
    Returns:
        Dictionary with validation results and statistics
    """
    print("🔍 Validating merged dataset...")
    
    validation_results = {
        'total_records': len(merged_df),
        'unique_hs4_codes': merged_df['hs4'].nunique(),
        'has_tariff_data': 'simple_average' in merged_df.columns,
        'has_trade_data': 'trade_value_total' in merged_df.columns,
        'overlapping_hs4_codes': 0,
        'year_range': {},
        'tariff_stats': {},
        'trade_stats': {}
    }
    
    if validation_results['has_tariff_data']:
        validation_results['tariff_stats'] = {
            'min_tariff': merged_df['simple_average'].min(),
            'max_tariff': merged_df['simple_average'].max(),
            'avg_tariff': merged_df['simple_average'].mean(),
            'median_tariff': merged_df['simple_average'].median()
        }
    
    if validation_results['has_trade_data']:
        validation_results['trade_stats'] = {
            'min_trade': merged_df['trade_value_total'].min(),
            'max_trade': merged_df['trade_value_total'].max(),
            'total_trade': merged_df['trade_value_total'].sum(),
            'avg_trade': merged_df['trade_value_total'].mean(),
            'median_trade': merged_df['trade_value_total'].median()
        }
    
    if 'year' in merged_df.columns:
        validation_results['year_range'] = {
            'min_year': merged_df['year'].min(),
            'max_year': merged_df['year'].max()
        }
    
    # Count overlapping HS4 codes (records that have both tariff and trade data)
    if validation_results['has_tariff_data'] and validation_results['has_trade_data']:
        tariff_hs4 = set(merged_df[merged_df['simple_average'].notna()]['hs4'])
        trade_hs4 = set(merged_df[merged_df['trade_value_total'].notna()]['hs4'])
        validation_results['overlapping_hs4_codes'] = len(tariff_hs4.intersection(trade_hs4))
    
    # Print summary
    print(f"  📊 Total records: {validation_results['total_records']}")
    print(f"  🏷️  Unique HS4 codes: {validation_results['unique_hs4_codes']}")
    print(f"  🔄 Overlapping HS4 codes: {validation_results['overlapping_hs4_codes']}")
    
    if validation_results['tariff_stats']:
        print(f"  💰 Tariff range: {validation_results['tariff_stats']['min_tariff']:.2f}% - {validation_results['tariff_stats']['max_tariff']:.2f}%")
        print(f"  📈 Average tariff: {validation_results['tariff_stats']['avg_tariff']:.2f}%")
    
    if validation_results['trade_stats']:
        print(f"  💵 Total trade value: ${validation_results['trade_stats']['total_trade']:,.0f}")
        print(f"  📊 Average trade per HS4: ${validation_results['trade_stats']['avg_trade']:,.0f}")
    
    return validation_results
