import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.model_selection import train_test_split
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures

app = FastAPI(
    title="Boston Housing ML API",
    description="FastAPI backend serving PCA, t-SNE components, full dataset, and Ridge Polynomial predictions."
)

# Enable CORS for React frontend (on port 5173 or other local origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load & Train Models on Startup ──────────────────────────────────────────
print("Loading Boston Housing dataset...")
data_url = "http://lib.stat.cmu.edu/datasets/boston"
raw_df = pd.read_csv(data_url, sep=r"\s+", skiprows=22, header=None)
data = np.hstack([raw_df.values[::2, :], raw_df.values[1::2, :2]])
target = raw_df.values[1::2, 2]

feature_names = ['CRIM', 'ZN', 'INDUS', 'CHAS', 'NOX', 'RM', 'AGE', 'DIS', 'RAD', 'TAX', 'PTRATIO', 'B', 'LSTAT']

# Split
data_train, data_test, target_train, target_test = train_test_split(
    data, target, test_size=0.2, random_state=42
)

# PCA
print("Computing PCA...")
pca = PCA(n_components=2)
data_train_pca = pca.fit_transform(data_train)

# t-SNE
print("Computing t-SNE (this might take a few seconds)...")
tsne = TSNE(n_components=2, random_state=42)
data_train_tsne = tsne.fit_transform(data_train)

# Polynomial Feature Ridge Model (Best model: R² = 0.81)
print("Training Ridge model with Polynomial Features...")
poly = PolynomialFeatures(degree=2, include_bias=False)
data_train_poly = poly.fit_transform(data_train)
ridge_model_poly = Ridge(alpha=1.0)
ridge_model_poly.fit(data_train_poly, target_train)

print("ML Initialization complete!")


# ─── Pydantic Request Schema ────────────────────────────────────────────────
class PredictionInput(BaseModel):
    CRIM: float
    ZN: float
    INDUS: float
    CHAS: float
    NOX: float
    RM: float
    AGE: float
    DIS: float
    RAD: float
    TAX: float
    PTRATIO: float
    B: float
    LSTAT: float


# ─── API Endpoints ──────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(input_data: PredictionInput):
    # Parse features into 2D numpy array
    x_input = np.array([[
        input_data.CRIM, input_data.ZN, input_data.INDUS, input_data.CHAS, input_data.NOX,
        input_data.RM, input_data.AGE, input_data.DIS, input_data.RAD, input_data.TAX,
        input_data.PTRATIO, input_data.B, input_data.LSTAT
    ]])
    # Apply polynomial expansion (degree 2)
    x_poly = poly.transform(x_input)
    # Run prediction
    pred = ridge_model_poly.predict(x_poly)[0]
    return {"predicted_price": float(pred)}

@app.get("/pca")
def get_pca():
    result = []
    for i in range(len(data_train_pca)):
        result.append({
            "pc1": float(data_train_pca[i, 0]),
            "pc2": float(data_train_pca[i, 1]),
            "medv": float(target_train[i])
        })
    return result

@app.get("/tsne")
def get_tsne():
    result = []
    for i in range(len(data_train_tsne)):
        result.append({
            "x": float(data_train_tsne[i, 0]),
            "y": float(data_train_tsne[i, 1]),
            "medv": float(target_train[i])
        })
    return result

@app.get("/dataset")
def get_dataset():
    result = []
    for i in range(len(data)):
        row = {}
        for idx, col in enumerate(feature_names):
            row[col] = float(data[i, idx])
        row["MEDV"] = float(target[i])
        result.append(row)
    return result
