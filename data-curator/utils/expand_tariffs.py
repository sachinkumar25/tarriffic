#!/usr/bin/env python3
"""
Tariff Data Expansion Script

This script expands tariff data from "World" partner level to individual partner countries
by replicating tariff rates across all partners that appear in trade flow data.

Problem:
- Tariff data only has "World" as partner
- Trade data has specific partner countries (Canada, China, Mexico, etc.)
- Need to replicate tariff rates across all partners for proper visualization

Solution:
- Load both tariff and trade data
- For each HS4 product, replicate the "World" tariff across all partners
- Create expanded dataset with partner-level tariff data
"""

import pandas as pd
import numpy as np
import os
from typing import Dict, List, Tuple

def normalize_hs4(product_code: str) -> str:
    """Normalize product code to HS4 format (first 4 digits)"""
    if pd.isna(product_code) or product_code == "":
        return ""
    
    code = str(product_code).strip()
    code = ''.join(filter(str.isdigit, code))
    
    if len(code) >= 4:
        return code[:4]
    elif len(code) > 0:
        return code.zfill(4)
    else:
        return ""

def load_tariff_data() -> pd.DataFrame:
    """Load and clean tariff data"""
    print("📊 Loading tariff data...")
    
    tariff_file = "data/raw/DataJobID-2947815_2947815_USATariffInfoWorld.csv"
    df = pd.read_csv(tariff_file)
    
    print(f"  ✓ Loaded {len(df)} tariff records")
    
    # Clean the data
    df['hs4'] = df['ProductCode'].apply(normalize_hs4)
    df = df[df['hs4'] != ""]
    
    # Convert numeric columns
    df['AdValorem Equivalent'] = pd.to_numeric(df['AdValorem Equivalent'], errors='coerce')
    df = df.dropna(subset=['hs4', 'AdValorem Equivalent'])
    
    # Rename columns
    df = df.rename(columns={
        'AdValorem Equivalent': 'simple_average',
        'Year': 'year',
        'ReporterName': 'ReporterName_x'
    })
    
    # Aggregate by HS4 (take mean of tariff rates, max of year)
    aggregated = df.groupby('hs4').agg({
        'simple_average': 'mean',
        'year': 'max',
        'Reporter_ISO_N': 'first',
        'ReporterName_x': 'first'
    }).reset_index()
    
    print(f"  ✓ Cleaned and aggregated to {len(aggregated)} unique HS4 codes")
    print(f"  📈 HS4 codes range: {aggregated['hs4'].min()} - {aggregated['hs4'].max()}")
    print(f"  📅 Year range: {aggregated['year'].min()} - {aggregated['year'].max()}")
    print(f"  💰 Average tariff rate: {aggregated['simple_average'].mean():.2f}%")
    
    return aggregated

def load_trade_data() -> pd.DataFrame:
    """Load and clean trade data"""
    print("📊 Loading trade data...")
    
    trade_file = "data/raw/DataJobID-2947807_2947807_USAGrossImportsAllPartners.csv"
    df = pd.read_csv(trade_file)
    
    print(f"  ✓ Loaded {len(df)} trade records")
    
    # Clean the data
    df['hs4'] = df['ProductCode'].apply(normalize_hs4)
    df = df[df['hs4'] != ""]
    
    # Convert numeric columns
    df['TradeValue in 1000 USD'] = pd.to_numeric(df['TradeValue in 1000 USD'], errors='coerce')
    df = df.dropna(subset=['hs4', 'TradeValue in 1000 USD'])
    
    # Convert trade value from 1000 USD to USD
    df['trade_value_total'] = df['TradeValue in 1000 USD'] * 1000
    
    # Rename columns
    df = df.rename(columns={
        'Year': 'year',
        'ReporterName': 'ReporterName_y',
        'PartnerName': 'partner_name',
        'PartnerISO3': 'partner_iso'
    })
    
    print(f"  ✓ Cleaned to {len(df)} trade records")
    print(f"  🏷️  Unique HS4 codes: {df['hs4'].nunique()}")
    print(f"  🌍 Unique partners: {df['partner_name'].nunique()}")
    print(f"  💵 Total trade value: ${df['trade_value_total'].sum()/1e12:.2f}T")
    
    return df

def expand_tariffs_across_partners(tariff_df: pd.DataFrame, trade_df: pd.DataFrame) -> pd.DataFrame:
    """Expand tariff data across all partners in trade data"""
    print("🔗 Expanding tariffs across partners...")
    
    # Get unique partners for each HS4 code
    hs4_partners = trade_df.groupby('hs4').agg({
        'partner_name': lambda x: list(x.unique()),
        'partner_iso': lambda x: list(x.unique()),
        'ReporterName_y': 'first',
        'ReporterCode': 'first'
    }).reset_index()
    
    print(f"  📊 HS4 codes with partner data: {len(hs4_partners)}")
    
    # Create expanded dataset
    expanded_rows = []
    
    for _, tariff_row in tariff_df.iterrows():
        hs4 = tariff_row['hs4']
        
        # Find partners for this HS4
        partners_data = hs4_partners[hs4_partners['hs4'] == hs4]
        
        if len(partners_data) == 0:
            # No trade data for this HS4, skip
            continue
            
        partners_row = partners_data.iloc[0]
        partner_names = partners_row['partner_name']
        partner_isos = partners_row['partner_iso']
        
        # Replicate tariff row for each partner
        for partner_name, partner_iso in zip(partner_names, partner_isos):
            # Get trade value for this HS4-partner combination
            trade_value = trade_df[
                (trade_df['hs4'] == hs4) & 
                (trade_df['partner_name'] == partner_name)
            ]['trade_value_total'].sum()
            
            # Create expanded row
            expanded_row = {
                'hs4': hs4,
                'simple_average': tariff_row['simple_average'],
                'year_x': tariff_row['year'],
                'Reporter_ISO_N': tariff_row['Reporter_ISO_N'],
                'ReporterName_x': tariff_row['ReporterName_x'],
                'trade_value_total': trade_value,
                'year_y': 2024,  # Trade data year
                'ReporterCode': partners_row['ReporterCode'],
                'ReporterName_y': partners_row['ReporterName_y'],
                'partner_name': partner_name,
                'partner_iso': partner_iso
            }
            
            expanded_rows.append(expanded_row)
    
    expanded_df = pd.DataFrame(expanded_rows)
    
    print(f"  ✓ Created {len(expanded_df)} expanded records")
    print(f"  🏷️  Unique HS4 codes: {expanded_df['hs4'].nunique()}")
    print(f"  🌍 Unique partners: {expanded_df['partner_name'].nunique()}")
    print(f"  💵 Total trade value: ${expanded_df['trade_value_total'].sum()/1e12:.2f}T")
    
    return expanded_df

def add_computed_fields(df: pd.DataFrame) -> pd.DataFrame:
    """Add computed fields to the expanded dataset"""
    print("🧮 Adding computed fields...")
    
    # Calculate tariff revenue estimate
    df['tariff_revenue_estimate'] = (df['simple_average'] / 100) * df['trade_value_total']
    
    # Add formatted fields
    df['trade_value_formatted'] = df['trade_value_total'].apply(format_trade_value)
    df['tariff_rate_formatted'] = df['simple_average'].apply(lambda x: f"{x:.2f}%")
    df['tariff_revenue_formatted'] = df['tariff_revenue_estimate'].apply(format_trade_value)
    
    # Add category information
    df['category'] = df['hs4'].apply(get_hs4_category)
    df['category_code'] = df['hs4'].str[:2]
    
    print(f"  ✓ Added computed fields to {len(df)} records")
    
    return df

def format_trade_value(value: float) -> str:
    """Format trade value for display"""
    if pd.isna(value) or value < 0:
        return '$0'
    
    if value >= 1e12:
        return f'${value/1e12:.1f}T'
    elif value >= 1e9:
        return f'${value/1e9:.1f}B'
    elif value >= 1e6:
        return f'${value/1e6:.1f}M'
    elif value >= 1e3:
        return f'${value/1e3:.1f}K'
    else:
        return f'${value:.0f}'

def get_hs4_category(hs4: str) -> str:
    """Get HS4 category description from 2-digit prefix"""
    if not hs4 or len(hs4) < 2:
        return 'Unknown'
    
    prefix = hs4[:2]
    category_map = {
        '01': 'Live animals & animal products',
        '02': 'Meat and edible meat offal',
        '03': 'Fish and crustaceans',
        '04': 'Dairy products',
        '05': 'Products of animal origin',
        '06': 'Live trees and plants',
        '07': 'Edible vegetables',
        '08': 'Edible fruits and nuts',
        '09': 'Coffee, tea, mate and spices',
        '10': 'Cereals',
        '11': 'Products of the milling industry',
        '12': 'Oil seeds and oleaginous fruits',
        '13': 'Lac; gums, resins and other vegetable saps',
        '14': 'Vegetable plaiting materials',
        '15': 'Animal or vegetable fats and oils',
        '16': 'Preparations of meat, fish or crustaceans',
        '17': 'Sugars and sugar confectionery',
        '18': 'Cocoa and cocoa preparations',
        '19': 'Preparations of cereals, flour, starch or milk',
        '20': 'Preparations of vegetables, fruit, nuts',
        '21': 'Miscellaneous edible preparations',
        '22': 'Beverages, spirits and vinegar',
        '23': 'Residues and wastes from the food industries',
        '24': 'Tobacco and manufactured tobacco substitutes',
        '25': 'Salt; sulphur; earths and stone',
        '26': 'Ores, slag and ash',
        '27': 'Mineral fuels, mineral oils',
        '28': 'Inorganic chemicals',
        '29': 'Organic chemicals',
        '30': 'Pharmaceutical products',
        '31': 'Fertilisers',
        '32': 'Tanning or dyeing extracts',
        '33': 'Essential oils and resinoids',
        '34': 'Soap, organic surface-active agents',
        '35': 'Albuminoidal substances',
        '36': 'Explosives; pyrotechnic products',
        '37': 'Photographic or cinematographic goods',
        '38': 'Miscellaneous chemical products',
        '39': 'Plastics and articles thereof',
        '40': 'Rubber and articles thereof',
        '41': 'Raw hides and skins',
        '42': 'Articles of leather',
        '43': 'Furskins and artificial fur',
        '44': 'Wood and articles of wood',
        '45': 'Cork and articles of cork',
        '46': 'Manufactures of straw',
        '47': 'Pulp of wood or of other fibrous cellulosic material',
        '48': 'Paper and paperboard',
        '49': 'Printed books, newspapers, pictures',
        '50': 'Silk',
        '51': 'Wool, fine or coarse animal hair',
        '52': 'Cotton',
        '53': 'Other vegetable textile fibres',
        '54': 'Man-made filaments',
        '55': 'Man-made staple fibres',
        '56': 'Wadding, felt and nonwovens',
        '57': 'Carpets and other textile floor coverings',
        '58': 'Special woven fabrics',
        '59': 'Impregnated, coated, covered or laminated textile fabrics',
        '60': 'Knitted or crocheted fabrics',
        '61': 'Articles of apparel and clothing accessories',
        '62': 'Articles of apparel and clothing accessories',
        '63': 'Other made up textile articles',
        '64': 'Footwear, gaiters and the like',
        '65': 'Headgear and parts thereof',
        '66': 'Umbrellas, sun umbrellas, walking sticks',
        '67': 'Prepared feathers and down',
        '68': 'Articles of stone, plaster, cement, asbestos',
        '69': 'Ceramic products',
        '70': 'Glass and glassware',
        '71': 'Natural or cultured pearls, precious stones',
        '72': 'Iron and steel',
        '73': 'Articles of iron or steel',
        '74': 'Copper and articles thereof',
        '75': 'Nickel and articles thereof',
        '76': 'Aluminium and articles thereof',
        '78': 'Lead and articles thereof',
        '79': 'Zinc and articles thereof',
        '80': 'Tin and articles thereof',
        '81': 'Other base metals',
        '82': 'Tools, implements, cutlery, spoons and forks',
        '83': 'Miscellaneous articles of base metal',
        '84': 'Nuclear reactors, boilers, machinery',
        '85': 'Electrical machinery and equipment',
        '86': 'Railway or tramway locomotives',
        '87': 'Vehicles other than railway or tramway rolling stock',
        '88': 'Aircraft, spacecraft, and parts thereof',
        '89': 'Ships, boats and floating structures',
        '90': 'Optical, photographic, cinematographic, measuring',
        '91': 'Clocks and watches and parts thereof',
        '92': 'Musical instruments',
        '93': 'Arms and ammunition',
        '94': 'Furniture; bedding, mattresses',
        '95': 'Toys, games and sports requisites',
        '96': 'Miscellaneous manufactured articles',
        '97': 'Works of art, collectors\' pieces and antiques'
    }
    
    return category_map.get(prefix, 'Other products')

def validate_expansion(expanded_df: pd.DataFrame) -> Dict:
    """Validate the expanded dataset"""
    print("🔍 Validating expanded dataset...")
    
    validation_results = {
        'total_records': len(expanded_df),
        'unique_hs4_codes': expanded_df['hs4'].nunique(),
        'unique_partners': expanded_df['partner_name'].nunique(),
        'total_trade_value': expanded_df['trade_value_total'].sum(),
        'total_tariff_revenue': expanded_df['tariff_revenue_estimate'].sum(),
        'average_tariff': expanded_df['simple_average'].mean(),
        'tariff_range': {
            'min': expanded_df['simple_average'].min(),
            'max': expanded_df['simple_average'].max()
        },
        'top_partners': expanded_df.groupby('partner_name')['trade_value_total'].sum().sort_values(ascending=False).head(10).to_dict(),
        'top_hs4_codes': expanded_df.groupby('hs4')['trade_value_total'].sum().sort_values(ascending=False).head(10).to_dict()
    }
    
    print(f"  📊 Total records: {validation_results['total_records']:,}")
    print(f"  🏷️  Unique HS4 codes: {validation_results['unique_hs4_codes']}")
    print(f"  🌍 Unique partners: {validation_results['unique_partners']}")
    print(f"  💵 Total trade value: ${validation_results['total_trade_value']/1e12:.2f}T")
    print(f"  💰 Total tariff revenue: ${validation_results['total_tariff_revenue']/1e9:.1f}B")
    print(f"  📈 Average tariff: {validation_results['average_tariff']:.2f}%")
    print(f"  📊 Tariff range: {validation_results['tariff_range']['min']:.2f}% - {validation_results['tariff_range']['max']:.2f}%")
    
    return validation_results

def main():
    """Main function to expand tariff data across partners"""
    print("🚀 Starting Tariff Data Expansion...")
    print("=" * 50)
    
    # Load data
    tariff_df = load_tariff_data()
    trade_df = load_trade_data()
    
    # Expand tariffs across partners
    expanded_df = expand_tariffs_across_partners(tariff_df, trade_df)
    
    # Add computed fields
    expanded_df = add_computed_fields(expanded_df)
    
    # Validate results
    validation_results = validate_expansion(expanded_df)
    
    # Save expanded dataset
    output_file = "data/processed/expanded_summary.csv"
    expanded_df.to_csv(output_file, index=False)
    
    print(f"\n💾 Saved expanded dataset to: {output_file}")
    print(f"📁 File size: {os.path.getsize(output_file) / 1024 / 1024:.1f} MB")
    
    # Save validation results
    import json
    validation_file = "data/processed/expansion_validation.json"
    with open(validation_file, 'w') as f:
        json.dump(validation_results, f, indent=2, default=str)
    
    print(f"📊 Validation results saved to: {validation_file}")
    
    print("\n🎉 Tariff data expansion completed successfully!")
    print(f"✅ Expanded from {len(tariff_df)} tariff records to {len(expanded_df)} partner-level records")
    print(f"✅ Coverage: {validation_results['unique_hs4_codes']} HS4 codes across {validation_results['unique_partners']} partners")
    
    return expanded_df

if __name__ == "__main__":
    expanded_data = main()
