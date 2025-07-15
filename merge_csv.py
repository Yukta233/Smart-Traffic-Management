# File: backend/merge_csv.py
import os
import pandas as pd

data_dir = 'data'
merged_df = pd.DataFrame()

for file in os.listdir(data_dir):
    if file.endswith('.csv'):
        df = pd.read_csv(os.path.join(data_dir, file))
        merged_df = pd.concat([merged_df, df], ignore_index=True)

# Save merged output
merged_df.to_csv('merged_traffic_data.csv', index=False)
print(f"Merged {len(os.listdir(data_dir))} files into merged_traffic_data.csv")
