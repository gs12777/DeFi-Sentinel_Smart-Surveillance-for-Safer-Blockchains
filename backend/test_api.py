import requests

url = "http://127.0.0.1:5000/predict"
data = {
    "tx_value_eth": 0.1,
    "gas_price_gwei": 5,
    "time_since_last_tx": 12,
    "num_transactions_per_address": 20,
    "account_age_days": 365,
    "gas_fee_ratio": 0.02
}

response = requests.post(url, json=data)
print(response.json())
