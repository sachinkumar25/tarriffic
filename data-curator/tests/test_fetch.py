# test_fetch.py
from api.trades_api import fetch_trade
from api.wits_api import fetch_tariff
from config import COUNTRIES, PRODUCTS

print(fetch_trade(COUNTRIES["USA"], COUNTRIES["CHN"], PRODUCTS["electronics"]["hs"], 2022).head())
print(fetch_tariff(COUNTRIES["USA"], COUNTRIES["CHN"], PRODUCTS["electronics"]["hs"], 2022))
