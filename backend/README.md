# 🏠 Backend — Dimensionality Reduction & Price Prediction

This folder contains the core ML training script (`main.py`) that powers the Boston Housing Dimensionality Reduction & Price Prediction project. The script was originally developed as a Google Colab notebook and adapted for local/backend use.

---

## 📁 Folder Structure

```
backend/
└── main.py          # Full ML pipeline — data loading, PCA, t-SNE, models, evaluation
```

---

## 📜 What `main.py` Does

The script runs a **complete end-to-end machine learning pipeline** on the Boston Housing dataset:

### 1. Dataset Loading
Since `sklearn.datasets.load_boston` is **deprecated** (ethical concerns), the dataset is manually fetched from:
```
http://lib.stat.cmu.edu/datasets/boston
```
It is parsed with `pandas`, reshaped from interleaved rows, and structured into a dictionary with:
- `data` — 506 × 13 feature matrix
- `target` — 506 MEDV (Median House Value) labels
- `feature_names` — `['CRIM', 'ZN', 'INDUS', 'CHAS', 'NOX', 'RM', 'AGE', 'DIS', 'RAD', 'TAX', 'PTRATIO', 'B', 'LSTAT']`

### 2. Train / Test Split
```python
train_test_split(..., test_size=0.2, random_state=42)
# → 404 training samples | 102 test samples
```

### 3. PCA (Principal Component Analysis)
```python
PCA(n_components=2)
```
- Reduces 13 features to **2 principal components**
- Plotted with Matplotlib using `viridis` colormap, color-coded by MEDV

### 4. t-SNE (t-Distributed Stochastic Neighbor Embedding)
```python
TSNE(n_components=2, random_state=42)
```
- Non-linear dimensionality reduction to **2 components**
- Plotted with `viridis` colormap — reveals cluster structure invisible to PCA

### 5. Model Training & Evaluation

Three Ridge Regression models are trained and compared:

| # | Model | Features | R² Score | MSE |
|---|-------|----------|----------|-----|
| 1 | Ridge without PCA | 13 original | **0.67** | 24.48 |
| 2 | Ridge with PCA | 2 PCA components | 0.25 | 55.02 |
| 3 | Ridge + Polynomial Degree 2 | **104 poly features** | **🏆 0.81** | **14.14** |

### 6. Feature Engineering
```python
PolynomialFeatures(degree=2, include_bias=False)
```
Expands 13 features into **104 features** via:
- 13 linear terms (original)
- 13 squared terms (x²)
- 78 cross-product terms (x·y)

Formula: `13 + 13 + C(13,2) = 13 + 13 + 78 = 104`

### 7. Visualization
- **R² Comparison Bar Chart** — Seaborn barplot with viridis palette
- **MSE Comparison Bar Chart** — Seaborn barplot with magma palette

---

## 🔬 Key Findings

> **Polynomial feature engineering** was the critical insight. By capturing non-linear interactions like `RM × LSTAT` (rooms × poverty), the best model achieved **R² = 0.81** — a **+20.8% improvement** over the baseline Ridge without PCA.

| Key Metric | Value |
|------------|-------|
| Dataset    | Boston Housing (506 samples) |
| Features   | 13 original → 104 after poly expansion |
| Best Model | Ridge + PolynomialFeatures(degree=2) |
| Best R²    | **0.81** |
| Best MSE   | **14.14** |
| Train Split | 80% (404 samples) |
| Test Split  | 20% (102 samples) |

---

## 🐍 Dependencies

Install with pip:

```bash
pip install numpy pandas scikit-learn matplotlib seaborn
```

| Package | Purpose |
|---------|---------|
| `numpy` | Numerical array operations |
| `pandas` | CSV loading and data manipulation |
| `scikit-learn` | PCA, t-SNE, Ridge, PolynomialFeatures, metrics |
| `matplotlib` | PCA and t-SNE scatter plots |
| `seaborn` | Model comparison bar charts |

---

## ▶️ How to Run

### Option 1 — Directly as a Python script
```bash
# Activate virtual environment (if using .venv)
.\.venv\Scripts\activate        # Windows
source .venv/bin/activate       # Linux/Mac

# Run the training pipeline
python backend/main.py
```

### Option 2 — Google Colab
Open the original notebook:
> https://colab.research.google.com/drive/13gAisUu0fK3DinAiYIqqpA1MPwVCjtG3

---

## 🌐 Extending to a FastAPI Server

To connect this ML pipeline to the React frontend dashboard, wrap it in a FastAPI app. Create `backend/app.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

app = FastAPI(title="Boston Housing API")

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])

# ── Train models on startup (run main.py logic here) ──────────────────────────

class HouseFeatures(BaseModel):
    CRIM: float; ZN: float; INDUS: float; CHAS: float; NOX: float
    RM: float; AGE: float; DIS: float; RAD: float; TAX: float
    PTRATIO: float; B: float; LSTAT: float

@app.post("/predict")
def predict(features: HouseFeatures):
    X = np.array([[features.CRIM, features.ZN, features.INDUS, features.CHAS,
                   features.NOX, features.RM, features.AGE, features.DIS,
                   features.RAD, features.TAX, features.PTRATIO, features.B, features.LSTAT]])
    X_poly = poly.transform(X)
    prediction = ridge_model_poly.predict(X_poly)[0]
    return {"predicted_price": round(float(prediction), 2)}

@app.get("/pca")
def get_pca():
    return [{"pc1": float(r[0]), "pc2": float(r[1]), "medv": float(t)}
            for r, t in zip(data_train_pca, target_train)]

@app.get("/tsne")
def get_tsne():
    return [{"x": float(r[0]), "y": float(r[1]), "medv": float(t)}
            for r, t in zip(data_train_tsne, target_train)]

@app.get("/dataset")
def get_dataset():
    import pandas as pd
    cols = ['CRIM','ZN','INDUS','CHAS','NOX','RM','AGE','DIS','RAD','TAX','PTRATIO','B','LSTAT']
    df = pd.DataFrame(boston['data'], columns=cols)
    df['MEDV'] = boston['target']
    return df.to_dict(orient='records')

@app.get("/health")
def health():
    return {"status": "ok"}
```

Then run:
```bash
pip install fastapi uvicorn
uvicorn backend.app:app --reload --port 8000
```

---

## 📊 Expected Output

When you run `main.py`, the console will print:

```
--- Performance Without PCA ---
Mean Squared Error: 24.48
R-squared: 0.67

--- Performance With PCA (2 components) ---
Mean Squared Error: 55.02
R-squared: 0.25

Original number of features: 13
Number of features after polynomial transformation (degree 2): 104

--- Performance With Polynomial Features (Degree 2) ---
Mean Squared Error: 14.14
R-squared: 0.81

--- Final Model Performance Comparison ---
1. Ridge without PCA (Baseline):       R-squared = 0.67, MSE = 24.48
2. Ridge with PCA (2 components):      R-squared = 0.25, MSE = 55.02
3. Ridge with Polynomial Features (Degree 2):   R-squared = 0.81, MSE = 14.14
```

---

*Script originally generated by Google Colab — adapted for local Python execution.*
