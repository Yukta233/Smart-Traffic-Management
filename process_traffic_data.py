import csv
import pandas as pd
from datetime import datetime, timedelta

# Path to the merged raw CSV file
RAW_CSV = "./backend/merged_traffic_data.csv"
CLEANED_CSV = "./backend/data/cleaned_traffic_data.csv"

days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

cleaned_rows = []

with open(RAW_CSV, newline='', encoding='utf-8') as csvfile:
    reader = csv.reader(csvfile)
    headers = next(reader)

    for row in reader:
        # Skip malformed or too short rows
        if len(row) < 8:
            continue

        time_full = row[0].strip()  # e.g., "12:00 AM"

        try:
            time_obj = datetime.strptime(time_full, "%I:%M %p")
        except ValueError:
            continue

        for i, day in enumerate(days):
            value = row[i + 1].strip()

            if value == '' or value.lower() == 'na':
                continue

            # Set reference start date as Sunday (e.g. July 7, 2024)
            base_date = datetime.strptime("2024-07-07", "%Y-%m-%d")
            date = base_date + timedelta(days=i)
            full_time = datetime.combine(date.date(), time_obj.time())

            cleaned_rows.append({
                "timestamp": full_time.strftime("%Y-%m-%d %H:%M:%S"),
                "day": day,
                "time": time_full,
                "value": value
            })

# Convert to DataFrame
cleaned_df = pd.DataFrame(cleaned_rows)
cleaned_df.to_csv(CLEANED_CSV, index=False)
print(f"✅ Cleaned data saved to {CLEANED_CSV}")
