# test_merge.py
"""
Test script to verify the merged CSV pipeline works correctly
"""
import os
import sys
import pandas as pd

# Add parent directory to path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.data_cleaner import (
    normalize_hs4, 
    clean_tariff_data, 
    clean_trade_data, 
    validate_merged_data
)

def test_normalize_hs4():
    """Test HS4 normalization function"""
    print("🧪 Testing HS4 normalization...")
    
    test_cases = [
        ("01022940", "0102"),
        ("85", "0085"),
        ("8517", "8517"),
        ("0101", "0101"),
        ("", ""),
        ("abc123def", "0123"),  # Non-digit chars should be removed, pad to 4 digits
        (None, ""),  # None should become empty string
        ("12345678", "1234"),  # Long code should be truncated
        ("12", "0012"),  # Short code should be padded
    ]
    
    for input_code, expected in test_cases:
        result = normalize_hs4(input_code)
        if result == expected:
            print(f"  ✅ '{input_code}' -> '{result}'")
        else:
            print(f"  ❌ '{input_code}' -> '{result}' (expected '{expected}')")
            return False
    
    print("  ✅ All HS4 normalization tests passed!")
    return True

def test_clean_tariff_data():
    """Test tariff data cleaning"""
    print("\n🧪 Testing tariff data cleaning...")
    
    tariff_file = "data/raw/DataJobID-2947815_2947815_USATariffInfoWorld.csv"
    
    if not os.path.exists(tariff_file):
        print(f"  ❌ Tariff file not found: {tariff_file}")
        return False
    
    try:
        df = clean_tariff_data(tariff_file)
        
        if df.empty:
            print("  ❌ Cleaned tariff data is empty")
            return False
        
        # Check required columns
        required_cols = ['hs4', 'simple_average', 'year']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            print(f"  ❌ Missing required columns: {missing_cols}")
            return False
        
        # Check data types
        if not pd.api.types.is_numeric_dtype(df['simple_average']):
            print("  ❌ simple_average should be numeric")
            return False
        
        if not pd.api.types.is_numeric_dtype(df['year']):
            print("  ❌ year should be numeric")
            return False
        
        # Check HS4 format (should be 4 digits)
        invalid_hs4 = df[~df['hs4'].str.match(r'^\d{4}$')]
        if not invalid_hs4.empty:
            print(f"  ❌ Invalid HS4 codes found: {invalid_hs4['hs4'].tolist()}")
            return False
        
        print(f"  ✅ Tariff data cleaned successfully!")
        print(f"    📊 Records: {len(df)}")
        print(f"    🏷️  HS4 codes: {df['hs4'].nunique()}")
        print(f"    📅 Year range: {df['year'].min()} - {df['year'].max()}")
        print(f"    💰 Tariff range: {df['simple_average'].min():.2f}% - {df['simple_average'].max():.2f}%")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Error cleaning tariff data: {e}")
        return False

def test_clean_trade_data():
    """Test trade data cleaning"""
    print("\n🧪 Testing trade data cleaning...")
    
    trade_file = "data/raw/DataJobID-2947807_2947807_USAGrossImportsAllPartners.csv"
    
    if not os.path.exists(trade_file):
        print(f"  ❌ Trade file not found: {trade_file}")
        return False
    
    try:
        df = clean_trade_data(trade_file)
        
        if df.empty:
            print("  ❌ Cleaned trade data is empty")
            return False
        
        # Check required columns
        required_cols = ['hs4', 'trade_value_total', 'year']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            print(f"  ❌ Missing required columns: {missing_cols}")
            return False
        
        # Check data types
        if not pd.api.types.is_numeric_dtype(df['trade_value_total']):
            print("  ❌ trade_value_total should be numeric")
            return False
        
        if not pd.api.types.is_numeric_dtype(df['year']):
            print("  ❌ year should be numeric")
            return False
        
        # Check HS4 format (should be 4 digits)
        invalid_hs4 = df[~df['hs4'].str.match(r'^\d{4}$')]
        if not invalid_hs4.empty:
            print(f"  ❌ Invalid HS4 codes found: {invalid_hs4['hs4'].tolist()}")
            return False
        
        print(f"  ✅ Trade data cleaned successfully!")
        print(f"    📊 Records: {len(df)}")
        print(f"    🏷️  HS4 codes: {df['hs4'].nunique()}")
        print(f"    📅 Year range: {df['year'].min()} - {df['year'].max()}")
        print(f"    💵 Trade range: ${df['trade_value_total'].min():,.0f} - ${df['trade_value_total'].max():,.0f}")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Error cleaning trade data: {e}")
        return False

def test_merge_pipeline():
    """Test the complete merge pipeline"""
    print("\n🧪 Testing complete merge pipeline...")
    
    tariff_file = "data/raw/DataJobID-2947815_2947815_USATariffInfoWorld.csv"
    trade_file = "data/raw/DataJobID-2947807_2947807_USAGrossImportsAllPartners.csv"
    
    if not os.path.exists(tariff_file) or not os.path.exists(trade_file):
        print(f"  ❌ Required CSV files not found")
        return False
    
    try:
        # Clean both datasets
        tariffs = clean_tariff_data(tariff_file)
        trades = clean_trade_data(trade_file)
        
        if tariffs.empty or trades.empty:
            print("  ❌ Failed to clean input data")
            return False
        
        # Merge the datasets
        merged = pd.merge(tariffs, trades, on="hs4", how="inner")
        
        if merged.empty:
            print("  ❌ No overlapping HS4 codes found")
            return False
        
        # Validate the merged data
        validation_results = validate_merged_data(merged)
        
        # Check that we have at least 10 overlapping HS4 codes
        if validation_results['overlapping_hs4_codes'] < 10:
            print(f"  ❌ Not enough overlapping HS4 codes: {validation_results['overlapping_hs4_codes']}")
            return False
        
        # Check required columns in merged data
        required_cols = ['hs4', 'simple_average', 'trade_value_total']
        missing_cols = [col for col in required_cols if col not in merged.columns]
        if missing_cols:
            print(f"  ❌ Missing required columns in merged data: {missing_cols}")
            return False
        
        print(f"  ✅ Merge pipeline completed successfully!")
        print(f"    📊 Total merged records: {len(merged)}")
        print(f"    🏷️  Unique HS4 codes: {merged['hs4'].nunique()}")
        print(f"    🔄 Overlapping HS4 codes: {validation_results['overlapping_hs4_codes']}")
        print(f"    💰 Average tariff: {validation_results['tariff_stats']['avg_tariff']:.2f}%")
        print(f"    💵 Total trade value: ${validation_results['trade_stats']['total_trade']:,.0f}")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Error in merge pipeline: {e}")
        return False

def test_output_file():
    """Test that the output file is created correctly"""
    print("\n🧪 Testing output file creation...")
    
    output_file = "data/processed/merged_summary.csv"
    
    if not os.path.exists(output_file):
        print(f"  ❌ Output file not found: {output_file}")
        return False
    
    try:
        df = pd.read_csv(output_file)
        
        if df.empty:
            print("  ❌ Output file is empty")
            return False
        
        # Check required columns
        required_cols = ['hs4', 'simple_average', 'trade_value_total']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            print(f"  ❌ Missing required columns in output file: {missing_cols}")
            return False
        
        print(f"  ✅ Output file created successfully!")
        print(f"    📁 File: {output_file}")
        print(f"    📊 Records: {len(df)}")
        print(f"    🏷️  HS4 codes: {df['hs4'].nunique()}")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Error reading output file: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting merge pipeline tests...")
    
    # Run all tests
    tests = [
        test_normalize_hs4,
        test_clean_tariff_data,
        test_clean_trade_data,
        test_merge_pipeline,
        test_output_file
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"  ❌ Test {test.__name__} failed with exception: {e}")
            failed += 1
    
    print(f"\n📊 Test Results:")
    print(f"  ✅ Passed: {passed}")
    print(f"  ❌ Failed: {failed}")
    print(f"  📈 Success Rate: {passed/(passed+failed)*100:.1f}%")
    
    if failed == 0:
        print("\n🎉 All tests passed! The merge pipeline is working correctly.")
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please check the errors above.")
