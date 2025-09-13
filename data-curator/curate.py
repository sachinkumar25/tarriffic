# curate.py
import os
import pandas as pd
from utils.data_cleaner import clean_tariff_data, clean_trade_data, validate_merged_data

# Set output directory
OUTDIR = "data/processed"
os.makedirs(OUTDIR, exist_ok=True)

def main():
    """
    Main function to clean and merge tariff and trade data
    """
    print("🚀 Starting data curation pipeline...")
    print("This will clean and merge tariff and trade CSV files by HS4 product code")
    
    # File paths
    tariff_file = "data/raw/DataJobID-2947815_2947815_USATariffInfoWorld.csv"
    trade_file = "data/raw/DataJobID-2947807_2947807_USAGrossImportsAllPartners.csv"
    
    # Step 1: Clean tariff data
    print("\n📊 Step 1: Cleaning tariff data...")
    tariffs = clean_tariff_data(tariff_file)
    
    if tariffs.empty:
        print("❌ Failed to clean tariff data. Exiting.")
        return
    
    # Step 2: Clean trade data
    print("\n📊 Step 2: Cleaning trade data...")
    trades = clean_trade_data(trade_file)
    
    if trades.empty:
        print("❌ Failed to clean trade data. Exiting.")
        return
    
    # Step 3: Merge the datasets
    print("\n🔗 Step 3: Merging datasets...")
    print(f"  Tariff records: {len(tariffs)}")
    print(f"  Trade records: {len(trades)}")
    
    # Merge on HS4 code
    merged = pd.merge(tariffs, trades, on="hs4", how="inner")
    
    print(f"  ✓ Merged records: {len(merged)}")
    
    if merged.empty:
        print("❌ No overlapping HS4 codes found. Exiting.")
        return
    
    # Step 4: Validate the merged data
    print("\n🔍 Step 4: Validating merged data...")
    validation_results = validate_merged_data(merged)
    
    # Step 5: Save the merged dataset
    print("\n💾 Step 5: Saving merged dataset...")
    output_file = os.path.join(OUTDIR, "merged_summary.csv")
    merged.to_csv(output_file, index=False)
    
    print(f"✅ Saved merged dataset with shape: {merged.shape}")
    print(f"📁 Output file: {output_file}")
    
    # Print final summary
    print("\n📈 Final Summary:")
    print(f"  📊 Total merged records: {len(merged)}")
    print(f"  🏷️  Unique HS4 codes: {merged['hs4'].nunique()}")
    print(f"  🔄 Overlapping HS4 codes: {validation_results['overlapping_hs4_codes']}")
    
    if validation_results['tariff_stats']:
        print(f"  💰 Average tariff rate: {validation_results['tariff_stats']['avg_tariff']:.2f}%")
    
    if validation_results['trade_stats']:
        print(f"  💵 Total trade value: ${validation_results['trade_stats']['total_trade']:,.0f}")
    
    print("\n🎉 Data curation pipeline completed successfully!")
    
    return merged

if __name__ == "__main__":
    main()