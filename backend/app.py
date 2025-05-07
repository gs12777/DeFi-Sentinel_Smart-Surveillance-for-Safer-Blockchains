from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np  # ✅ Import numpy

app = Flask(__name__)
CORS(app)

# ✅ Load Model and Scaler
model_path = r"C:\Users\gurus\New fold\blockchain-fraud-detect-new\backend\fraud_model.pkl"
scaler_path = r"C:\Users\gurus\New fold\blockchain-fraud-detect-new\backend\scaler.pkl"

try:
    with open(model_path, "rb") as model_file:
        model = pickle.load(model_file)

    with open(scaler_path, "rb") as scaler_file:
        scaler = pickle.load(scaler_file)

    print("✅ Model and scaler loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model or scaler: {e}")
    exit(1)  # Stop execution if models are not loaded properly

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Fraud Detection API is running!"})

@app.route("/predict", methods=["POST"])
def predict_fraud():
    try:
        data = request.get_json()
        print(f"🔍 Received request: {data}")  # ✅ Log input request

        # ✅ Required feature columns
        feature_columns = ['tx_value_eth', 'gas_price_gwei', 'time_since_last_tx',
                           'num_transactions_per_address', 'account_age_days', 'gas_fee_ratio']

        # ✅ Validate input
        if not data or not all(key in data for key in feature_columns):
            return jsonify({"error": "❌ Missing required fields"}), 400

        # ✅ Convert input to DataFrame (Ensure float conversion)
        try:
            input_df = pd.DataFrame([{key: float(data[key]) for key in feature_columns}])
        except ValueError as e:
            return jsonify({"error": f"❌ Invalid data type: {e}"}), 400

        # ✅ Scale input data
        input_scaled = scaler.transform(input_df)

        # ✅ Make prediction
        prediction = model.predict(input_scaled)[0]
        fraud_probability = model.predict_proba(input_scaled)[0][1] * 100  # Convert to percentage

        result = {
            "is_fraud": bool(prediction),
            "fraud_probability": round(float(fraud_probability), 2)  # ✅ Proper rounding
        }

        print(f"✅ Prediction Result: {result}")  # ✅ Log prediction result
        return jsonify(result)

    except Exception as e:
        print(f"❌ Error in prediction: {e}")  # ✅ Log errors
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
