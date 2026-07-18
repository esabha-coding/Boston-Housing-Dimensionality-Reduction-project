import os
import joblib
import pandas as pd
import numpy as np
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

app = FastAPI(
    title="Boston Housing ML API",
    description="FastAPI backend serving PCA, t-SNE components, full dataset, and Ridge Polynomial predictions."
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'model')

# Load models and pre-computed components
print("Loading saved models and pre-computed components...")
ridge_model_poly = joblib.load(os.path.join(MODEL_DIR, 'ridge_poly.joblib'))
poly = joblib.load(os.path.join(MODEL_DIR, 'poly_transformer.joblib'))
feature_names = joblib.load(os.path.join(MODEL_DIR, 'feature_names.joblib'))
data_train_pca = joblib.load(os.path.join(MODEL_DIR, 'data_train_pca.joblib'))
data_train_tsne = joblib.load(os.path.join(MODEL_DIR, 'data_train_tsne.joblib'))
target_train = joblib.load(os.path.join(MODEL_DIR, 'target_train.joblib'))
data = joblib.load(os.path.join(MODEL_DIR, 'data.joblib'))
target = joblib.load(os.path.join(MODEL_DIR, 'target.joblib'))

# Ensure feature names are uppercase for matching
feature_names = [f.upper() for f in feature_names]

# Pydantic Schema
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