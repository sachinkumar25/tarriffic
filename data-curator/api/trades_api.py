# trades_api.py
import requests
import pandas as pd
import time
from typing import Dict, List, Optional

# UN Comtrade API endpoint
COMTRADE_BASE = "https://comtradeapi.un.org/data/v1/get"

def fetch_bilateral_trade(reporter: int, partner: int, year: int) -> pd.DataFrame:
    """
    Fetch bilateral trade data between two countries for a given year
    More efficient than individual product calls
    """
    url = f"{COMTRADE_BASE}/bilateral"
    params = {
        "reporterCode": reporter,
        "partnerCode": partner,
        "period": year,
        "frequency": "A",  # annual
        "tradeFlow": "X,M"  # both exports and imports
    }
    
    print(f"Fetching trade data: {reporter} <-> {partner}, {year}")
    
    try:
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        
        if 'data' in data:
            return pd.DataFrame(data['data'])
        else:
            print(f"No trade data found for {reporter} <-> {partner}, {year}")
            return pd.DataFrame()
            
    except requests.exceptions.RequestException as e:
        print(f"Error fetching trade data: {e}")
        return pd.DataFrame()
    
    # Rate limiting
    time.sleep(1)

def fetch_trade(reporter: int, partner: int, hs: str, year: int) -> pd.DataFrame:
    """
    Legacy function - kept for compatibility but not recommended for bulk operations
    """
    url = f"{COMTRADE_BASE}/bilateral"
    params = {
        "reporterCode": reporter,
        "partnerCode": partner,
        "period": year,
        "frequency": "A",
        "tradeFlow": "X,M",
        "cmdCode": hs  # specific HS code
    }
    
    print(f"Fetching trade: {reporter}->{partner}, HS:{hs}, {year}")
    
    try:
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        
        if 'data' in data:
            return pd.DataFrame(data['data'])
        else:
            return pd.DataFrame()
            
    except requests.exceptions.RequestException as e:
        print(f"Error fetching trade: {e}")
        return pd.DataFrame()
    
    # Rate limiting
    time.sleep(1)
