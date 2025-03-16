import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from joblib import dump

df = pd.read_csv('ai/fraud_data.csv')
X = df[['tx_value_eth', 'gas_price_gwei', 'time_since_last_tx']]
y = df['is_fraud']

model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)
dump(model, 'ai/fraud_detection_model.joblib')
print("Model saved to ai/fraud_detection_model.joblib!")