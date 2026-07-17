# 🏠 Boston Housing — Dimensionality Reduction & Price Prediction

> An end-to-end Machine Learning project exploring PCA, t-SNE, Ridge Regression, and Polynomial Feature Engineering on the classic Boston Housing dataset — paired with a modern React dashboard for interactive visualization and live predictions.

---

## 📸 Project Highlights

| Feature | Detail |
|---------|--------|
| 📊 Dataset | Boston Housing — 506 samples × 13 features |
| 🔬 Techniques | PCA, t-SNE, Ridge Regression, Polynomial Features |
| 🏆 Best Model | Ridge + PolynomialFeatures(degree=2) — **R² = 0.81** |
| 🎯 Task | Predict Median House Value (MEDV) in $1,000s |
| 🖥️ Frontend | React 18 + Vite + Tailwind CSS + D3.js + Recharts |
| 🐍 Backend | Python + scikit-learn (FastAPI-ready) |

---

## 📁 Project Structure

```
Dimensionality & Features Boston Housing/
│
├── backend/                          # ML training pipeline
│   ├── main.py                       # Full ML pipeline script
│   └── README.md                     # Backend documentation
│
├── frontend/                         # React dashboard
│   ├── src/
│   │   ├── api/                      # Axios API client
│   │   │   ├── axios.js              # Base URL → http://localhost:8000
│   │   │   └── predictions.js        # predict / pca / tsne / dataset endpoints
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useTheme.js           # Dark/light mode with localStorage
│   │   │   ├── useToast.js           # Toast notification queue
│   │   │   └── usePrediction.js      # API wrapper with loading/error state
│   │   ├── components/
│   │   │   ├── layout/Navbar.jsx     # Sticky nav + dark mode toggle
│   │   │   ├── ui/KPICard.jsx        # Animated count-up metric cards
│   │   │   ├── ui/LoadingSkeleton.jsx# Skeleton loaders
│   │   │   ├── ui/Toast.jsx          # Toast notifications
│   │   │   ├── charts/
│   │   │   │   ├── PCAScatter.jsx    # D3.js PCA biplot (viridis)
│   │   │   │   ├── TSNEScatter.jsx   # D3.js t-SNE plot (viridis)
│   │   │   │   └── ModelComparison.jsx # Recharts R² & MSE bar charts
│   │   │   ├── forms/
│   │   │   │   └── PredictionForm.jsx# 13-field live prediction form
│   │   │   └── panels/
│   │   │       ├── FeatureEngineering.jsx # 13→104 feature expansion panel
│   │   │       └── DatasetExplorer.jsx    # Sortable table + CSV export
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # KPIs + Model comparison + Features
│   │   │   ├── Visualizations.jsx    # PCA + t-SNE scatter plots
│   │   │   ├── Predict.jsx           # Live prediction interface
│   │   │   └── Dataset.jsx           # Dataset explorer
│   │   ├── App.jsx                   # Router + global layout
│   │   ├── main.jsx                  # React DOM entry
│   │   └── index.css                 # Tailwind + dark mode CSS vars
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── dataset/                          # Raw / processed dataset files
├── model/                            # Saved model artifacts (pkl files)
├── notebook/                         # Jupyter / Colab notebooks
├── doc/                              # Additional documentation
├── screenshot/                       # Project screenshots
├── test/                             # Unit tests
└── .venv/                            # Python virtual environment
```

---

## 🔬 Machine Learning Pipeline

### Dataset

The Boston Housing dataset is **manually loaded** from `http://lib.stat.cmu.edu/datasets/boston` because `sklearn.datasets.load_boston` was deprecated due to ethical concerns with one of its features (B — racial composition proxy).

| Property | Value |
|----------|-------|
| Samples  | 506   |
| Features | 13    |
| Target   | MEDV (Median house value in $1,000s) |
| Train/Test | 80% / 20% (random_state=42) |

### Features

| Feature | Description |
|---------|-------------|
| CRIM | Per capita crime rate by town |
| ZN | Proportion of residential land zoned for large lots |
| INDUS | Proportion of non-retail business acres per town |
| CHAS | Charles River dummy variable (1 if tract bounds river) |
| NOX | Nitric oxides concentration (parts per 10 million) |
| RM | Average number of rooms per dwelling |
| AGE | Proportion of owner-occupied units built before 1940 |
| DIS | Weighted distances to five Boston employment centres |
| RAD | Index of accessibility to radial highways |
| TAX | Full-value property-tax rate per $10,000 |
| PTRATIO | Pupil-teacher ratio by town |
| B | 1000(Bk - 0.63)² where Bk is Black population proportion |
| LSTAT | % lower status of the population |
| **MEDV** | **Target — Median value of owner-occupied homes ($1,000s)** |

---

### Dimensionality Reduction

#### PCA (Principal Component Analysis)
```python
PCA(n_components=2)
```
- Linear transformation that maximises variance
- 2 principal components capture the dominant structure
- Used with Ridge Regression → **R² = 0.25** (significant information loss)
- Scatter plot uses **viridis** colormap, colour-coded by MEDV

#### t-SNE (t-Distributed Stochastic Neighbor Embedding)
```python
TSNE(n_components=2, random_state=42)
```
- Non-linear manifold learning technique
- Preserves local neighbourhood structure
- Reveals clusters of similar-priced housing
- Used for **visualisation only** — axes have no interpretable meaning

---

### Model Comparison

All models use **Ridge Regression** with `alpha=1.0` for L2 regularisation.

| Model | Strategy | R² Score | MSE | Rank |
|-------|----------|----------|-----|------|
| Ridge (Baseline) | 13 original features | 0.67 | 24.48 | 🥈 2nd |
| Ridge + PCA | 2 PCA components | 0.25 | 55.02 | 🥉 3rd (worst) |
| **Ridge + Poly** | **104 polynomial features** | **0.81** | **14.14** | **🏆 Best** |

---

### Feature Engineering — The Key Insight

```python
PolynomialFeatures(degree=2, include_bias=False)
# 13 features → 104 features
```

| Term Type | Count | Example |
|-----------|-------|---------|
| Linear | 13 | `RM`, `LSTAT` |
| Squared | 13 | `RM²`, `LSTAT²` |
| Cross-products | 78 | `RM × LSTAT`, `AGE × DIS` |
| **Total** | **104** | |

> The interaction term `RM × LSTAT` (rooms × poverty) is especially powerful — it captures that a high number of rooms is much more valuable in a low-poverty neighbourhood.

**Result:** R² improved from **0.67 → 0.81** (+20.8%)

---

## 🖥️ Frontend Dashboard

The React dashboard provides 4 pages:

| Page | URL | Content |
|------|-----|---------|
| Dashboard | `/` | KPI cards, model bar charts, feature engineering panel |
| Visualizations | `/visualizations` | D3.js PCA + t-SNE scatter plots |
| Predict | `/predict` | Live prediction form (13 inputs → MEDV) |
| Dataset | `/dataset` | Sortable table, search filter, CSV export |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS 3 (dark/light mode) |
| Charts | Recharts (bar charts) + D3.js (scatter plots) |
| Animation | Framer Motion |
| HTTP | Axios → `http://localhost:8000` |
| Routing | React Router DOM v6 |
| Icons | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm 9+

---

### 1. Clone / Open the Project

```bash
cd "Dimensionality & Features Boston Housing"
```

---

### 2. Run the ML Pipeline (Backend)

```bash
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate        # Windows
# source .venv/bin/activate     # Linux / Mac

# Install Python dependencies
pip install numpy pandas scikit-learn matplotlib seaborn

# Run the training script
python backend/main.py
```

**Expected output:**
```
--- Performance Without PCA ---
Mean Squared Error: 24.48   |   R-squared: 0.67

--- Performance With PCA (2 components) ---
Mean Squared Error: 55.02   |   R-squared: 0.25

Number of features after polynomial transformation (degree 2): 104

--- Performance With Polynomial Features (Degree 2) ---
Mean Squared Error: 14.14   |   R-squared: 0.81
```

---

### 3. (Optional) Start the FastAPI API Server

To enable live predictions in the frontend, wrap the trained models in FastAPI:

```bash
pip install fastapi uvicorn
uvicorn backend.app:app --reload --port 8000
```

See [`backend/README.md`](./backend/README.md) for the full FastAPI server code.

---

### 4. Start the React Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

> ⚡ **Offline mode:** The frontend works even without the backend — all charts fall back to realistic mock data automatically.

---

## 🎨 Design System

| Token | Color | Usage |
|-------|-------|-------|
| Primary | `#1A56DB` | Buttons, nav, links |
| Secondary | `#3B82F6` | Accents, charts |
| Success | `#059669` | Best model highlights |
| Danger | `#DC2626` | Worst model highlights |
| Background | `#F8FAFC` | Light mode surface |

---

## 📊 Results Summary

```
╔═══════════════════════════════════════════════════════════╗
║             FINAL MODEL PERFORMANCE SUMMARY               ║
╠═══════════════════════╦════════════╦════════════╦═════════╣
║ Model                 ║ R² Score   ║ MSE        ║ Rank    ║
╠═══════════════════════╬════════════╬════════════╬═════════╣
║ Ridge (No PCA)        ║   0.67     ║   24.48    ║ 2nd     ║
║ Ridge + PCA (2-comp)  ║   0.25     ║   55.02    ║ Worst   ║
║ Ridge + Poly Deg-2    ║   0.81 ✓  ║   14.14 ✓  ║ BEST    ║
╚═══════════════════════╩════════════╩════════════╩═════════╝
```

---

## 📚 References

- [Boston Housing Dataset (CMU)](http://lib.stat.cmu.edu/datasets/boston)
- [scikit-learn — PCA](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html)
- [scikit-learn — TSNE](https://scikit-learn.org/stable/modules/generated/sklearn.manifold.TSNE.html)
- [scikit-learn — Ridge](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.Ridge.html)
- [scikit-learn — PolynomialFeatures](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.PolynomialFeatures.html)
- [Original Google Colab Notebook](https://colab.research.google.com/drive/13gAisUu0fK3DinAiYIqqpA1MPwVCjtG3)

---

## ⚠️ Ethical Note on Dataset

The original `sklearn.datasets.load_boston` was deprecated because the dataset contains a feature (`B`) that is a proxy for racial composition of neighbourhoods, which raises ethical concerns about using such data in predictive modelling. This project loads the raw data directly and acknowledges this concern.

---

*Built with Python · scikit-learn · React · Vite · D3.js · Recharts*
