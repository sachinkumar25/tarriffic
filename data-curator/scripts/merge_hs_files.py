#!/usr/bin/env python3
"""
Script to merge all HS code files into a single dictionary JSON file.
Combines UNCTAD and WTO HS classification files.
"""

import pandas as pd
import glob
import json
import os
from pathlib import Path

def merge_hs_files():
    # Path to the hs_selections folder
    folder_path = Path(__file__).parent.parent / "hs_selections"
    
    if not folder_path.exists():
        print(f"Error: {folder_path} does not exist")
        return
    
    # Collect all Excel files
    files = list(folder_path.glob("*.xls*")) + list(folder_path.glob("*.csv"))
    
    if not files:
        print(f"No files found in {folder_path}")
        return
    
    print(f"Found {len(files)} files to process:")
    for f in files:
        print(f"  - {f.name}")
    
    all_data = []
    
    for file_path in files:
        try:
            print(f"\nProcessing {file_path.name}...")
            
            # Read the file
            if file_path.suffix.lower() == '.csv':
                df = pd.read_csv(file_path, dtype=str)
            else:
                df = pd.read_excel(file_path, dtype=str)
            
            print(f"  Shape: {df.shape}")
            print(f"  Columns: {list(df.columns)}")
            
            # Normalize column names
            df.columns = [c.strip().lower() for c in df.columns]
            
            # Identify the correct columns for HS codes and descriptions
            # Looking for Productcode and ProductDescription specifically
            if "productcode" in df.columns and "productdescription" in df.columns:
                code_col = "productcode"
                desc_col = "productdescription"
            else:
                # Fallback to original logic
                code_cols = [c for c in df.columns if "code" in c or "hs" in c]
                desc_cols = [c for c in df.columns if "desc" in c or "name" in c or "product" in c]
                
                if not code_cols:
                    print(f"  Warning: No code column found in {file_path.name}")
                    continue
                    
                if not desc_cols:
                    print(f"  Warning: No description column found in {file_path.name}")
                    continue
                
                code_col = code_cols[0]
                desc_col = desc_cols[0]
            
            print(f"  Using code column: '{code_col}', description column: '{desc_col}'")
            
            # Clean and prepare data
            df_clean = df[[code_col, desc_col]].copy()
            df_clean = df_clean.dropna(subset=[code_col])
            df_clean = df_clean.rename(columns={code_col: "hs_code", desc_col: "description"})
            
            # Clean the data
            df_clean["hs_code"] = df_clean["hs_code"].astype(str).str.strip()
            df_clean["description"] = df_clean["description"].astype(str).str.strip()
            
            # Remove empty entries
            df_clean = df_clean[df_clean["hs_code"] != ""]
            df_clean = df_clean[df_clean["description"] != ""]
            
            print(f"  Clean data shape: {df_clean.shape}")
            
            all_data.append(df_clean)
            
        except Exception as e:
            print(f"  Error processing {file_path.name}: {e}")
            continue
    
    if not all_data:
        print("No data to merge!")
        return
    
    # Merge all data
    print(f"\nMerging {len(all_data)} datasets...")
    merged = pd.concat(all_data, ignore_index=True)
    
    print(f"Total records before deduplication: {len(merged)}")
    
    # Remove duplicates, keeping the last occurrence (later files override earlier ones)
    merged = merged.drop_duplicates(subset=["hs_code"], keep='last')
    
    print(f"Total unique HS codes after deduplication: {len(merged)}")
    
    # Convert to dictionary
    hs_dict = dict(zip(merged["hs_code"], merged["description"]))
    
    # Save as JSON
    output_path = Path(__file__).parent.parent / "data" / "processed" / "hs_dictionary.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(hs_dict, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Successfully saved {len(hs_dict)} HS codes to {output_path}")
    
    # Show some sample entries
    print("\nSample entries:")
    sample_codes = list(hs_dict.keys())[:5]
    for code in sample_codes:
        print(f"  {code}: {hs_dict[code]}")
    
    return output_path

if __name__ == "__main__":
    merge_hs_files()
