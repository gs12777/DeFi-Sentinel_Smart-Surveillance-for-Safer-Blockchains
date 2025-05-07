import pandas as pd
import numpy as np

np.random.seed(42)
num_samples = 2000  # Increase sample size for better training

# Generate synthetic transaction data
data = {
    'tx_value_eth': np.random.exponential(0.5, num_samples),
    'gas_price_gwei': np.random.normal(20, 10, num_samples),
    'time_since_last_tx': np.random.randint(1, 300, num_samples),
    'num_transactions_per_address': np.random.randint(1, 50, num_samples),
    'account_age_days': np.random.randint(1, 1000, num_samples),
    'gas_fee_ratio': np.random.uniform(0.01, 1, num_samples)
}

def assign_fraud_label(row):
    """ More realistic fraud detection rules """
    if (row['tx_value_eth'] == 0 and row['num_transactions_per_address'] > 20) or \
       (row['gas_price_gwei'] > 50 and row['gas_fee_ratio'] > 0.7) or \
       (row['account_age_days'] < 10 and row['num_transactions_per_address'] > 30):
        return 1  # Fraud
    return 0  # Legit

df = pd.DataFrame(data)
df['is_fraud'] = df.apply(assign_fraud_label, axis=1)

df.to_csv('ai/fraud_data.csv', index=False)
print("Updated fraud data saved to ai/fraud_data.csv!")
