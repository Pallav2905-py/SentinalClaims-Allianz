import numpy as np
import pandas as pd
import random

np.random.seed(42)

N = 10000

data = []

for i in range(N):
    user_id = f"USR{random.randint(1000,9999)}"
    age = random.randint(18,70)

    total_claims_1y = np.random.poisson(2)
    avg_claim_amount = np.random.randint(5000, 60000)

    days_since_last_claim = random.randint(1, 365)

    claimed_amount = int(np.random.normal(avg_claim_amount, avg_claim_amount * 0.6))
    claimed_amount = max(1000, claimed_amount)

    policy_limit = random.choice([100000, 200000, 300000, 500000])

    amount_vs_avg_ratio = claimed_amount / avg_claim_amount
    amount_vs_policy_ratio = claimed_amount / policy_limit

    report_delay_hours = abs(int(np.random.normal(6, 8)))
    time_since_policy_start = random.randint(5, 700)

    geo_risk_score = round(np.random.uniform(0, 1), 2)

    missing_docs_count = random.choice([0,0,0,1,1,2,3])
    duplicate_doc_flag = random.choice([0,0,0,1])
    doc_tamper_score = round(np.random.uniform(0, 1), 2)

    previous_rejections = random.choice([0,0,1,2])
    fraud_history_flag = random.choice([0,0,0,1])

    # ---- Fraud Logic (realistic rule blending) ----
    risk = (
        0.4 * (amount_vs_avg_ratio > 1.8) +
        0.3 * (report_delay_hours > 24) +
        0.3 * (doc_tamper_score > 0.7) +
        0.2 * (geo_risk_score > 0.7) +
        0.2 * fraud_history_flag +
        0.2 * (total_claims_1y > 5)
    )

    is_fraud = 1 if risk > 0.7 else 0

    data.append([
        user_id, age, total_claims_1y, avg_claim_amount,
        days_since_last_claim, claimed_amount, policy_limit,
        amount_vs_avg_ratio, amount_vs_policy_ratio,
        report_delay_hours, time_since_policy_start,
        geo_risk_score, missing_docs_count, duplicate_doc_flag,
        doc_tamper_score, previous_rejections, fraud_history_flag,
        is_fraud
    ])

columns = [
    "user_id", "age", "total_claims_1y", "avg_claim_amount",
    "days_since_last_claim", "claimed_amount", "policy_limit",
    "amount_vs_avg_ratio", "amount_vs_policy_ratio",
    "report_delay_hours", "time_since_policy_start",
    "geo_risk_score", "missing_docs_count", "duplicate_doc_flag",
    "doc_tamper_score", "previous_rejections", "fraud_history_flag",
    "is_fraud"
]

df = pd.DataFrame(data, columns=columns)

df.to_csv("synthetic_insurance_claims.csv", index=False)

print(df.head())
print("\nFraud rate:", df["is_fraud"].mean())
