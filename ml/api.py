import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel

# =====================
# Load model
# =====================
model = joblib.load("mlp_model.pkl")
scaler = joblib.load("scaler.pkl")

app = FastAPI(title="Insurance Fraud Detection API")

# =====================
# Input schema
# =====================
class ClaimInput(BaseModel):
    age: int
    total_claims_1y: int
    avg_claim_amount: float
    days_since_last_claim: int
    claimed_amount: float
    policy_limit: float
    amount_vs_avg_ratio: float
    amount_vs_policy_ratio: float
    report_delay_hours: int
    time_since_policy_start: int
    geo_risk_score: float
    missing_docs_count: int
    duplicate_doc_flag: int
    doc_tamper_score: float
    previous_rejections: int
    fraud_history_flag: int

# =====================
# Prediction endpoint
# =====================
@app.post("/predict")
def predict_fraud(claim: ClaimInput):

    features = np.array([[
        claim.age,
        claim.total_claims_1y,
        claim.avg_claim_amount,
        claim.days_since_last_claim,
        claim.claimed_amount,
        claim.policy_limit,
        claim.amount_vs_avg_ratio,
        claim.amount_vs_policy_ratio,
        claim.report_delay_hours,
        claim.time_since_policy_start,
        claim.geo_risk_score,
        claim.missing_docs_count,
        claim.duplicate_doc_flag,
        claim.doc_tamper_score,
        claim.previous_rejections,
        claim.fraud_history_flag
    ]])

    features_scaled = scaler.transform(features)

    fraud_prob = float(model.predict_proba(features_scaled)[0][1])

    return {
        "fraud_probability": round(fraud_prob, 4),
        "risk_level": "HIGH" if fraud_prob > 0.7 else "LOW"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
    