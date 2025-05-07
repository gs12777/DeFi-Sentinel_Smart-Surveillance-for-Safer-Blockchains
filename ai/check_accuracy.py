import joblib
import pandas as pd
from sklearn.metrics import accuracy_score

# Load model
model = joblib.load("ai/fraud_detection_model.joblib")

# Load dataset
df = pd.read_csv("ai/fraud_data.csv")
X = df[['tx_value_eth', 'gas_price_gwei', 'time_since_last_tx', 'num_transactions_per_address', 'account_age_days', 'gas_fee_ratio']]
y = df['is_fraud']

# Get predictions and check accuracy
predictions = model.predict(X)
accuracy = accuracy_score(y, predictions)
print(f"Model Accuracy: {accuracy * 100:.2f}%")
