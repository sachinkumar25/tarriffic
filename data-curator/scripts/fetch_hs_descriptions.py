import pandas as pd
import requests
import json
import os

def fetch_and_process_hs_codes():
    """
    Fetches HS code descriptions from a public source, processes them,
    and saves the result as a JSON file.
    """
    # URL of the HS code dataset
    url = "https://raw.githubusercontent.com/datasets/harmonized-system-codes/main/data/harmonized-system-codes.csv"
    
    print("Fetching HS code data...")
    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return

    # Save the raw data to a temporary CSV file
    raw_csv_path = 'temp_hs_codes.csv'
    with open(raw_csv_path, 'w') as f:
        f.write(response.text)
    
    print("Processing data...")
    # Read the CSV with pandas
    df = pd.read_csv(raw_csv_path)

    # Filter for HS4-level codes (where hscode length is 4 or 6, and only keep the first 4 digits)
    df['hs4'] = df['hscode'].astype(str).str.replace('.', '').str.pad(width=6, side='right', fillchar='0').str[:4]
    
    # Keep only the most relevant columns and drop duplicates
    df_hs4 = df[['hs4', 'description']].drop_duplicates(subset=['hs4'])

    # Create the dictionary for the JSON mapping
    hs4_map = dict(zip(df_hs4['hs4'], df_hs4['description']))

    # Define the output path
    output_dir = '../frontend/public'
    output_path = os.path.join(output_dir, 'hs4_descriptions.json')

    # Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Save the mapping as a JSON file
    print(f"Saving HS4 descriptions to {output_path}...")
    with open(output_path, 'w') as f:
        json.dump(hs4_map, f, indent=2)
    
    # Clean up the temporary file
    os.remove(raw_csv_path)
    
    print("Processing complete.")

if __name__ == "__main__":
    fetch_and_process_hs_codes()
