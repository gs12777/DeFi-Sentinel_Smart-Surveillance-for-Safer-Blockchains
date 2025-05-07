import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score
import pickle

# Load dataset
df = pd.read_csv(r"C:\Users\gurus\New fold\blockchain-fraud-detect-new\ai\fraud_data.csv")

# Define features and target
X = df[['tx_value_eth', 'gas_price_gwei', 'time_since_last_tx',
        'num_transactions_per_address', 'account_age_days', 'gas_fee_ratio']]
y = df['is_fraud']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Logistic Regression
log_model = LogisticRegression()
log_model.fit(X_train_scaled, y_train)
log_preds = log_model.predict(X_test_scaled)
log_acc = accuracy_score(y_test, log_preds)

# Train XGBoost
xgb_model = XGBClassifier(use_label_encoder=False, eval_metric='logloss')
xgb_model.fit(X_train_scaled, y_train)
xgb_preds = xgb_model.predict(X_test_scaled)
xgb_acc = accuracy_score(y_test, xgb_preds)

# Select best model
if xgb_acc > log_acc:
    best_model = xgb_model
    print(f"XGBoost selected with accuracy: {xgb_acc:.2f}")
else:
    best_model = log_model
    print(f"Logistic Regression selected with accuracy: {log_acc:.2f}")

# Save best model as .pkl
with open('fraud_model.pkl', 'wb') as model_file:
    pickle.dump(best_model, model_file)
print("✅ Best model saved to ai/fraud_model.pkl!")

# Save the scaler
with open('scaler.pkl', 'wb') as scaler_file:
    pickle.dump(scaler, scaler_file)
print("✅ Scaler saved to ai/scaler.pkl!")
