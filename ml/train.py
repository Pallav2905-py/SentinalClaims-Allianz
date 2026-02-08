import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import roc_auc_score

# =====================
# Load data
# =====================
df = pd.read_csv("synthetic_insurance_claims.csv")
df = df.drop(columns=["user_id"])

X = df.drop(columns=["is_fraud"])
y = df["is_fraud"]

# =====================
# Split
# =====================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=42
)

# =====================
# Scale
# =====================
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# =====================
# Train MLP
# =====================
model = MLPClassifier(
    hidden_layer_sizes=(128,64,32),
    activation="relu",
    max_iter=500,
    batch_size=64,
    random_state=42
)

model.fit(X_train, y_train)

auc = roc_auc_score(y_test, model.predict_proba(X_test)[:,1])
print("ROC AUC:", round(auc,3))

# =====================
# Save
# =====================
joblib.dump(model, "mlp_model.pkl")
joblib.dump(scaler, "scaler.pkl")

print("✅ Model & scaler saved")
