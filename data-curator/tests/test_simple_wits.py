# test_simple_wits.py
"""
Simple test to check WITS API structure and find working endpoints
"""
import requests
import json

def test_wits_api_structure():
    """Test different WITS API endpoint structures to find the correct one"""
    
    # Test different endpoint structures
    test_urls = [
        # Structure 1: From documentation
        "https://wits.worldbank.org/API/V1/SDMX/V21/datasource/TRN/reporter/840/partner/156/product/020110/year/2022/datatype/reported?format=JSON",
        
        # Structure 2: Alternative format
        "https://wits.worldbank.org/API/V1/SDMX/V21/datasource/TRN/reporter/840/partner/156/product/020110/year/2022?format=JSON",
        
        # Structure 3: Different base
        "https://wits.worldbank.org/API/V1/SDMX/V21/rest/data/TRN/reporter/840/partner/156/product/020110/year/2022?format=JSON",
        
        # Structure 4: Simple format
        "https://wits.worldbank.org/API/V1/SDMX/V21/rest/data/TRN/840/156/020110/2022?format=JSON"
    ]
    
    print("🧪 Testing different WITS API endpoint structures...")
    
    for i, url in enumerate(test_urls, 1):
        print(f"\n{i}. Testing URL structure:")
        print(f"   {url}")
        
        try:
            response = requests.get(url, timeout=10)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ SUCCESS! Response structure:")
                print(f"   {json.dumps(data, indent=2)[:500]}...")
                return url, data
            else:
                print(f"   ❌ Failed: {response.text[:200]}...")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    return None, None

def test_different_products():
    """Test different product codes to find valid ones"""
    
    # Test different HS codes
    test_products = [
        "020110",  # From documentation example
        "85",      # Electronics (2-digit)
        "8517",    # Electronics (4-digit)
        "1001",    # Wheat
        "1201",    # Soybeans
        "01",      # Live animals (2-digit)
        "02"       # Meat (2-digit)
    ]
    
    print("\n🧪 Testing different product codes...")
    
    base_url = "https://wits.worldbank.org/API/V1/SDMX/V21/datasource/TRN/reporter/840/partner/156/product/{product}/year/2022/datatype/reported?format=JSON"
    
    for product in test_products:
        url = base_url.format(product=product)
        print(f"\n  Testing product {product}...")
        
        try:
            response = requests.get(url, timeout=10)
            print(f"    Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"    ✅ SUCCESS! Product {product} works")
                print(f"    Response: {json.dumps(data, indent=2)[:300]}...")
                return product, data
            else:
                print(f"    ❌ Failed: {response.text[:100]}...")
                
        except Exception as e:
            print(f"    ❌ Error: {e}")
    
    return None, None

def test_different_years():
    """Test different years to find available data"""
    
    years = [2020, 2021, 2022, 2023]
    product = "020110"  # Use a known working product if we found one
    
    print(f"\n🧪 Testing different years for product {product}...")
    
    base_url = "https://wits.worldbank.org/API/V1/SDMX/V21/datasource/TRN/reporter/840/partner/156/product/{product}/year/{year}/datatype/reported?format=JSON"
    
    for year in years:
        url = base_url.format(product=product, year=year)
        print(f"\n  Testing year {year}...")
        
        try:
            response = requests.get(url, timeout=10)
            print(f"    Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"    ✅ SUCCESS! Year {year} works")
                print(f"    Response: {json.dumps(data, indent=2)[:300]}...")
                return year, data
            else:
                print(f"    ❌ Failed: {response.text[:100]}...")
                
        except Exception as e:
            print(f"    ❌ Error: {e}")
    
    return None, None

if __name__ == "__main__":
    print("🚀 Starting WITS API structure discovery...")
    
    # Test 1: Find working endpoint structure
    working_url, working_data = test_wits_api_structure()
    
    if working_url:
        print(f"\n✅ Found working endpoint structure: {working_url}")
    else:
        print("\n❌ No working endpoint structure found")
    
    # Test 2: Find working product codes
    working_product, product_data = test_different_products()
    
    if working_product:
        print(f"\n✅ Found working product: {working_product}")
    else:
        print("\n❌ No working product codes found")
    
    # Test 3: Find working years
    working_year, year_data = test_different_years()
    
    if working_year:
        print(f"\n✅ Found working year: {working_year}")
    else:
        print("\n❌ No working years found")
    
    print("\n📊 Summary:")
    print(f"  Working URL: {working_url is not None}")
    print(f"  Working Product: {working_product}")
    print(f"  Working Year: {working_year}")
    
    if working_url and working_product and working_year:
        print("\n🎉 SUCCESS! We found working WITS API parameters!")
        print("   Use these to update the main API implementation.")
    else:
        print("\n⚠️  Some parameters are missing. The WITS API might be down or have changed.")
