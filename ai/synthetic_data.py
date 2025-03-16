import pandas as pd
import numpy as np

np.random.seed(42)
data = {
    'tx_value_eth': np.random.exponential(0.5, 1000),
    'gas_price_gwei': np.random.normal(20, 10, 1000),
    'time_since_last_tx': np.random.randint(1, 300, 1000),
    'is_fraud': np.random.choice([0, 1], 1000, p=[0.95, 0.05])
}
df = pd.DataFrame(data)
df.to_csv('ai/fraud_data.csv', index=False)
print("Data saved to ai/fraud_data.csv!")