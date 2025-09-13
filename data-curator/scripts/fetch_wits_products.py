import json
import os
import sys

# Add the project root to the Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from data_curator.api.wits_api import WitsApi

def fetch_and_save_product_definitions():
    """
    Fetches HS product definitions from the WITS API and saves them
    to a JSON file.
    """
    print("Initializing WITS API...")
    wits_api = WitsApi()

    print("Fetching product definitions...")
    try:
        # Fetch the product definitions (this might take a moment)
        products_df = wits_api.get_products()
        
        # Filter for HS4-level codes
        products_df['hs4'] = products_df['productcode'].astype(str).str.replace('.', '').str.pad(width=6, side='right', fillchar='0').str[:4]
        
        # Keep only the most relevant columns and drop duplicates
        df_hs4 = products_df[['hs4', 'productdescription']].drop_duplicates(subset=['hs4'])

        # Create the dictionary for the JSON mapping
        hs4_map = dict(zip(df_hs4['hs4'], df_hs4['productdescription']))

        # Define the output path
        output_dir = '../frontend/public'
        output_path = os.path.join(output_dir, 'hs4_descriptions.json')

        # Ensure the output directory exists
        os.makedirs(output_dir, exist_ok=True)

        print(f"Saving HS4 descriptions to {output_path}...")
        with open(output_path, 'w') as f:
            json.dump(hs4_map, f, indent=2)
            
        print("Processing complete.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    fetch_and_save_product_definitions()
