# test_wits_api.py
"""
Test script to verify WITS API endpoints are working correctly
"""
from api.wits_api import fetch_tariff_data, fetch_trade_data, fetch_combined_data
from config import COUNTRIES, PRODUCTS, YEARS

def test_single_tariff_call():
    """Test a single tariff API call"""
    print("🧪 Testing single tariff API call...")
    
    # Test USA -> China, Electronics, 2022
    tariff_data = fetch_tariff_data(
        reporter=840,  # USA
        partner=156,   # China
        product="85",  # Electronics
        year=2022
    )
    
    if tariff_data:
        print(f"✅ Tariff data received:")
        print(f"  Simple Average: {tariff_data.simple_average}%")
        print(f"  Min Rate: {tariff_data.min_rate}%")
        print(f"  Max Rate: {tariff_data.max_rate}%")
        print(f"  Tariff Type: {tariff_data.tariff_type}")
        print(f"  Total Lines: {tariff_data.total_lines}")
    else:
        print("❌ No tariff data received")

def test_single_trade_call():
    """Test a single trade API call"""
    print("\n🧪 Testing single trade API call...")
    
    # Test USA -> China, Electronics, 2022
    trade_data = fetch_trade_data(
        reporter=840,  # USA
        partner=156,   # China
        product="85",  # Electronics
        year=2022
    )
    
    if trade_data:
        print(f"✅ Trade data received:")
        print(f"  Trade Value: ${trade_data.trade_value_usd:,.0f}")
        print(f"  Quantity: {trade_data.quantity:,.0f}")
        print(f"  Unit: {trade_data.unit}")
    else:
        print("❌ No trade data received")

def test_combined_call():
    """Test combined tariff + trade call"""
    print("\n🧪 Testing combined API call...")
    
    # Test USA -> China, Electronics, 2022
    combined_data = fetch_combined_data(
        reporter=840,  # USA
        partner=156,   # China
        product="85",  # Electronics
        year=2022
    )
    
    if combined_data:
        print(f"✅ Combined data received:")
        print(f"  Reporter: {combined_data['reporter']}")
        print(f"  Partner: {combined_data['partner']}")
        print(f"  Product: {combined_data['product']}")
        print(f"  Year: {combined_data['year']}")
        if 'simple_average' in combined_data:
            print(f"  Tariff Rate: {combined_data['simple_average']}%")
        if 'trade_value_usd' in combined_data:
            print(f"  Trade Value: ${combined_data['trade_value_usd']:,.0f}")
    else:
        print("❌ No combined data received")

def test_multiple_products():
    """Test multiple products to see which ones have data"""
    print("\n🧪 Testing multiple products...")
    
    test_products = [
        ("85", "Electronics"),
        ("1201", "Soybeans"),
        ("1001", "Wheat"),
        ("8507", "EV Batteries")
    ]
    
    for hs_code, name in test_products:
        print(f"\n  Testing {name} (HS: {hs_code})...")
        combined_data = fetch_combined_data(
            reporter=840,  # USA
            partner=156,   # China
            product=hs_code,
            year=2022
        )
        
        if combined_data:
            tariff_rate = combined_data.get('simple_average', 'N/A')
            trade_value = combined_data.get('trade_value_usd', 0)
            print(f"    ✅ {name}: {tariff_rate}% tariff, ${trade_value:,.0f} trade")
        else:
            print(f"    ❌ {name}: No data available")

if __name__ == "__main__":
    print("🚀 Starting WITS API tests...")
    print("This will test the actual WITS API endpoints to verify they work")
    
    # Test individual functions
    test_single_tariff_call()
    test_single_trade_call()
    test_combined_call()
    
    # Test multiple products
    test_multiple_products()
    
    print("\n✅ API testing complete!")
    print("If you see successful data above, the API endpoints are working correctly.")
    print("If you see mostly 'No data available', the API might be down or the endpoints might be incorrect.")
