# wits_api.py
import requests
import time
import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

# WITS API Base URLs - Updated based on actual API structure
TARIFF_BASE = "https://wits.worldbank.org/API/V1/SDMX/V21/datasource/TRN"
TRADE_BASE = "https://wits.worldbank.org/API/V1/SDMX/V21/datasource/TMF"

@dataclass
class TariffData:
    """Clean tariff data structure"""
    reporter: int
    partner: int
    product: str
    year: int
    simple_average: float
    min_rate: float
    max_rate: float
    tariff_type: str
    total_lines: int
    mfn_lines: int
    pref_lines: int
    na_lines: int

@dataclass
class TradeData:
    """Clean trade data structure"""
    reporter: int
    partner: int
    product: str
    year: int
    trade_value_usd: float
    quantity: float
    unit: str

def fetch_tariff_data(reporter: int, partner: int, product: str, year: int) -> Optional[TariffData]:
    """
    Fetch tariff data from WITS TRN endpoint
    Returns clean TariffData object or None if failed
    """
    url = f"{TARIFF_BASE}/reporter/{reporter}/partner/{partner}/product/{product}/year/{year}/datatype/reported?format=JSON"
    print(f"Fetching tariff: {reporter}->{partner}, HS:{product}, {year}")
    
    try:
        response = requests.get(url, timeout=30)
        
        # Handle rate limiting
        if response.status_code == 403:
            print(f"  Rate limited, waiting 5 seconds...")
            time.sleep(5)
            response = requests.get(url, timeout=30)
        
        response.raise_for_status()
        data = response.json()
        
        # Extract tariff data from WITS response
        if 'data' in data and data['data']:
            tariff_info = data['data'][0]  # First (and usually only) record
            
            return TariffData(
                reporter=reporter,
                partner=partner,
                product=product,
                year=year,
                simple_average=float(tariff_info.get('SimpleAverage', 0)),
                min_rate=float(tariff_info.get('MinRate', 0)),
                max_rate=float(tariff_info.get('MaxRate', 0)),
                tariff_type=tariff_info.get('TariffType', 'Unknown'),
                total_lines=int(tariff_info.get('TotalNoOfLines', 0)),
                mfn_lines=int(tariff_info.get('Nbr_MFN_Lines', 0)),
                pref_lines=int(tariff_info.get('Nbr_Pref_Lines', 0)),
                na_lines=int(tariff_info.get('Nbr_NA_Lines', 0))
            )
        else:
            print(f"  No tariff data found for {reporter}->{partner}, HS:{product}, {year}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"  Error fetching tariff: {e}")
        return None
    except (KeyError, ValueError, TypeError) as e:
        print(f"  Error parsing tariff data: {e}")
        return None
    
    # Rate limiting between calls
    time.sleep(0.5)

def fetch_trade_data(reporter: int, partner: int, product: str, year: int) -> Optional[TradeData]:
    """
    Fetch trade data from WITS TMF endpoint
    Returns clean TradeData object or None if failed
    """
    url = f"{TRADE_BASE}/reporter/{reporter}/partner/{partner}/product/{product}/year/{year}?format=JSON"
    print(f"Fetching trade: {reporter}->{partner}, HS:{product}, {year}")
    
    try:
        response = requests.get(url, timeout=30)
        
        # Handle rate limiting
        if response.status_code == 403:
            print(f"  Rate limited, waiting 5 seconds...")
            time.sleep(5)
            response = requests.get(url, timeout=30)
        
        response.raise_for_status()
        data = response.json()
        
        # Extract trade data from WITS response
        if 'data' in data and data['data']:
            trade_info = data['data'][0]  # First (and usually only) record
            
            return TradeData(
                reporter=reporter,
                partner=partner,
                product=product,
                year=year,
                trade_value_usd=float(trade_info.get('TradeValue', 0)) * 1000,  # Convert from 1000 USD
                quantity=float(trade_info.get('Quantity', 0)),
                unit=trade_info.get('Unit', 'Unknown')
            )
        else:
            print(f"  No trade data found for {reporter}->{partner}, HS:{product}, {year}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"  Error fetching trade: {e}")
        return None
    except (KeyError, ValueError, TypeError) as e:
        print(f"  Error parsing trade data: {e}")
        return None
    
    # Rate limiting between calls
    time.sleep(0.5)

def fetch_combined_data(reporter: int, partner: int, product: str, year: int) -> Optional[Dict]:
    """
    Fetch both tariff and trade data and combine them
    Returns merged dict or None if both failed
    """
    tariff_data = fetch_tariff_data(reporter, partner, product, year)
    trade_data = fetch_trade_data(reporter, partner, product, year)
    
    if not tariff_data and not trade_data:
        return None
    
    # Combine the data
    combined = {
        "reporter": reporter,
        "partner": partner,
        "product": product,
        "year": year
    }
    
    if tariff_data:
        combined.update({
            "simple_average": tariff_data.simple_average,
            "min_rate": tariff_data.min_rate,
            "max_rate": tariff_data.max_rate,
            "tariff_type": tariff_data.tariff_type,
            "total_lines": tariff_data.total_lines,
            "mfn_lines": tariff_data.mfn_lines,
            "pref_lines": tariff_data.pref_lines,
            "na_lines": tariff_data.na_lines
        })
    
    if trade_data:
        combined.update({
            "trade_value_usd": trade_data.trade_value_usd,
            "quantity": trade_data.quantity,
            "unit": trade_data.unit
        })
    
    return combined

# Legacy functions for backward compatibility
def fetch_country_tariffs(reporter: int, year: int) -> Dict:
    """Legacy function - not recommended"""
    print("⚠️  Using legacy fetch_country_tariffs - not recommended")
    return {}

def fetch_trade_indicators(reporter: int, year: int) -> Dict:
    """Legacy function - not recommended"""
    print("⚠️  Using legacy fetch_trade_indicators - not recommended")
    return {}

def fetch_tariff(reporter: int, partner: int, hs: str, year: int) -> Dict:
    """Legacy function - use fetch_tariff_data instead"""
    print("⚠️  Using legacy fetch_tariff - use fetch_tariff_data instead")
    tariff_data = fetch_tariff_data(reporter, partner, hs, year)
    if tariff_data:
        return {
            "tariffRate": tariff_data.simple_average,
            "tariffType": tariff_data.tariff_type
        }
    return {}
