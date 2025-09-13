# config.py

# HS Codes for products we care about
PRODUCTS = {
    "electronics": {"hs": "85", "name": "Electronics & Telecom"},
    "soybeans": {"hs": "1201", "name": "Soybeans"},
    "wheat": {"hs": "1001", "name": "Wheat"},
    "ev_batteries": {"hs": "8507", "name": "EV Batteries"},
}

# ISO numeric codes (WITS/Comtrade)
# 840 = USA, 156 = China, 76 = Brazil, 699 = India, 918 = EU
COUNTRIES = {
    "USA": 840,
    "CHN": 156,
    "BRA": 76,
    "IND": 699,
    "EU": 918
}

YEARS = [2021, 2022, 2023]
