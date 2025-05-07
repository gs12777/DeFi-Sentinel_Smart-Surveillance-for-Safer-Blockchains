import sys
import numpy as np
import pickle
import json
import os
import pandas as pd

# Set absolute paths for model and scaler
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "fraud_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")

# Load Model and Scaler
with open(MODEL_PATH, "rb") as model_file:
    model = pickle.load(model_file)

with open(SCALER_PATH, "rb") as scaler_file:
    scaler = pickle.load(scaler_file)

try:
    # Read transaction details from command-line args
    tx_value_eth = float(sys.argv[1])
    gas_price_gwei = float(sys.argv[2])
    time_since_last_tx = float(sys.argv[3])
    num_transactions_per_address = float(sys.argv[4])
    account_age_days = float(sys.argv[5])
    gas_fee_ratio = float(sys.argv[6])

    # Define feature names (to match training data)
    feature_columns = [
        "tx_value_eth", "gas_price_gwei", "time_since_last_tx",
        "num_transactions_per_address", "account_age_days", "gas_fee_ratio"
    ]

    # Convert input into a DataFrame with feature names
    input_df = pd.DataFrame([[tx_value_eth, gas_price_gwei, time_since_last_tx,
                              num_transactions_per_address, account_age_days, gas_fee_ratio]],
                            columns=feature_columns)

    # Apply scaling
    scaled_features = scaler.transform(input_df)

    # Make Prediction
    fraud_prob = float(model.predict_proba(scaled_features)[0][1] * 100)  # Convert to float
    is_fraud = fraud_prob > 50  # Threshold: 50%

    # Output as JSON
    result = {"is_fraud": bool(is_fraud), "fraud_probability": round(fraud_prob, 2)}
    print(json.dumps(result))  # Print properly formatted JSON

except Exception as e:
    error_response = {"error": str(e)}
    print(json.dumps(error_response))
