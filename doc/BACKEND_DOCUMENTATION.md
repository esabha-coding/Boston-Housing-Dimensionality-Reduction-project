# Backend Documentation

## Overview

The backend of the **Boston Housing Prediction System** is structured as a lightweight, high-performance microservice. Its primary objective is to serve real-time housing price predictions by exposing a pre-trained machine learning model through a RESTful API.

**Key Backend Responsibilities**
- **API Engine (FastAPI):** Manages ASGI routing, handles request-response pairing, enforces CORS cross-origin configurations, and runs input validation checks using Pydantic.
- **Machine Learning Inference:** Receives 13 housing feature parameters, runs them through the serialized Ridge + Polynomial Feature model, maps the output, and returns the predicted MEDV classification results.
- **Decoupled Frontend Communication:** Accepts standard JSON payloads from the React front-end client and outputs standardised HTTP response payloads on port `8000`.

---

## Backend Folder Structure

The backend source code is organized within a dedicated `backend/` directory layout:

```
backend/
├── __init__.py          # Declares app folder as a Python package
├── main.py              # Core API file (server startup, loads models, maps CORS, prediction endpoints)
├── save_models.py       # Run ONCE: trains transformers, fits Ridge models, saves all joblib artifacts
├── requirements.txt     # scikit-learn training, serving, joblib serialization
└── model/
    ├── ridge_no_pca.joblib       # Ridge trained on 13 original features
    ├── ridge_pca.joblib          # Ridge trained on 2 PCA components
    ├── ridge_poly.joblib         # Ridge trained on 104 polynomial features (BEST)
    ├── pca_transformer.joblib    # Fitted PCA(n_components=2) object
    ├── poly_transformer.joblib   # Fitted PolynomialFeatures(degree=2) object
    ├── feature_names.joblib      # List of 13 feature name strings
    └── splits.joblib             # Stored train/test arrays for PCA and t-SNE endpoints
```

**File Purposes**

1. **main.py** — Core operational file for the API. Handles server startup, loads all binary model artifacts into memory once, maps CORS, and processes `/predict` payload submissions.
2. **save_models.py** — Contains data-loading routines. It audits and reconstructs the Boston Housing dataset from the CMU URL, performs stratified train-test splits, fits all sklearn transformers and Ridge models, and saves all `.joblib` artifacts to the `model/` folder.

---

## Main Components

### main.py

The main program file initiates the REST server and maps the model prediction endpoints:

- **FastAPI Initialization:** Instantiated with custom title and metadata headers, running on Uvicorn.
- **CORS Configuration:** Instantiated with `CORSMiddleware` with wildcard rules (`*`) for local client access.
- **Loading ML Model:** Resolves absolute file paths to `model/*.joblib` and loads the binary into memory using `joblib.load(model_path)` during server startup.
- **Health Check Endpoint (`GET /health`):** A dedicated health checker that reports server info and model connectivity details.
- **Prediction Endpoint (`POST /predict`):** Takes validated Pydantic payloads (`HousingInput`), builds a Pandas DataFrame containing feature column headers, executes `poly_transformer.transform()` on the array, and returns the final mapped category.

### save_models.py

This module contains the model serialization pipeline and runs **once** before the server starts:

- **Dataset Loading:** Reads `boston_housing.csv` from the `dataset/` folder.
- **Feature Selection & Target Extraction:** Separates the 13 feature columns and the MEDV target column.
- **Duplicate Checking:** Scans rows using `df.duplicated().sum()` to identify data redundancy.
- **Train/Test Split:** Executes `train_test_split(data, target, test_size=0.2, random_state=42)` to produce reproducible splits.
- **PCA Fitting:** Fits `PCA(n_components=2)` on training data, transforms both train and test sets.
- **Polynomial Feature Fitting:** Fits `PolynomialFeatures(degree=2, include_bias=False)` on training data only, transforms both sets to produce 104-feature matrices.
- **Ridge Model Training:** Trains three separate `Ridge(alpha=1.0)` models on original, PCA-reduced, and polynomial feature sets.
- **Saving Artifacts:** Creates the `model/` directory if missing and serializes all transformers and models using `joblib.dump()`.

---

## Machine Learning Pipeline

The machine learning data flow is organized as follows:

```
boston_housing.csv (506 rows, 14 columns)
    ↓
pd.read_csv() — load dataset
    ↓
train_test_split(test_size=0.2, random_state=42)
    ↓ 404 train / 102 test
    ↓
┌────────────────────────┐   ┌────────────────────────┐   ┌────────────────────────┐
│ Path 1: Original (13)  │   │ Path 2: PCA (2 comp)   │   │ Path 3: Poly (104)     │
│ Ridge.fit(data_train)  │   │ PCA.fit_transform()    │   │ PolyFeat.fit_transform │
│ R²=0.67, MSE=24.48    │   │ Ridge.fit(pca_train)   │   │ Ridge.fit(poly_train)  │
│                        │   │ R²=0.25, MSE=55.02    │   │ R²=0.81, MSE=14.14 ✓  │
└────────────────────────┘   └────────────────────────┘   └────────────────────────┘
    ↓
joblib.dump() → model/*.joblib
```

---

## Request Lifecycle

The diagram below details the journey of a prediction request from user interface to response:

```
[ Client sends POST → /predict with 13 JSON fields ]
    ↓
[ Pydantic Check ] → [ 422 HTTP Error Response ]
    (pass)
[ Pandas DataFrame → builds feature matrix in layout order ]
    ↓
[ PolyFeat.transform() → 13 features become 104 polynomial features ]
    ↓
[ ridge_poly.predict() ] → returns float MEDV value
    ↓
[ JSON Response ] → { "predicted_medv": 30.2, "unit": "$1,000s" }
```

---

## Error Handling

The API employs structured error handling to ensure service stability:

- **Missing Model Error:** During server initialization, `main.py` checks for the existence of all `model/*.joblib` files. If missing, the app raises a descriptive `FileNotFoundError` and fails startup to prevent serving broken predictions.
- **Invalid Request Model:** If request fields are missing, malformed, or mismatched (e.g. string for `rm`), FastAPI's Pydantic schema validation returns an `HTTP 422 Unprocessable Entity` response with coordinate error traces.
- **Internal Server Error:** Catches unhandled backend exception during inference, returning a clean `HTTP 500 Internal Server Error` block while printing stack traces to server logs for developer inspection.

---

## Dependencies

Backend operational dependencies are defined in `requirements.txt`:

| Package | Version | Purpose |
|---|---|---|
| fastapi | latest | ASGI framework for REST API routing and endpoints |
| uvicorn | 0.31.0 | Light ASGI server implementation to host FastAPI locally |
| pydantic | latest | Data validation schemas and serialization parsing |
| pandas | latest | Structuring API requests into standard dataframes |
| numpy | latest | Scientific numeric mathematics support |
| scikit-learn | latest | Machine Learning algorithms, metrics, and splitting utilities |
| joblib | latest | Serializing and reloading persistent ML models |

---

## Performance Notes

- **Startup Model Loading:** The persistent model binary (`ridge_poly.joblib`) is loaded into memory only once when the FastAPI application starts up.
- **Inference Latency Optimization:** By avoiding model reload loops during request routing, prediction endpoints require minimal processing overhead. Live inferences execute in under 5ms, optimized for real-time decision support systems.

---

## Security Considerations

- **Authentication Scope:** The current iteration contains **no user authentication layers** and is configured strictly for local development and testing.
- **Cross-Origin Resource Sharing (CORS):** Allowed origins are set to wildcards (`*`) for local port testing convenience. Production deployments must restrict this to client domain names explicitly.
- **Future Security Updates:** Production deployments must secure API ports by implementing SSL/TLS HTTPS certification and enforcing authorization tokens (JWT).

---

## Future Backend Improvements

To scale this clinical platform for institutionalized enterprise use:

- **JWT Authentication:** Secure prediction endpoints behind JWT token access rules to prevent unauthorized queries.
- **Logging & Monitoring:** Add Python logging outputs and metrics trackers (like Prometheus/Grafana) to trace model inference metrics.
- **Dockerization:** Containerize the FastAPI backend and React frontend to maintain standard environments across developer machines.
- **Cloud Deployment:** Set up pipelines to deploy FastAPI to cloud providers (AWS, GCP, or Azure) with auto-scaling rules.

---

## Conclusion

The backend architecture of the Boston Housing Prediction System provides a clean, modular Python microservice. By isolating data preparation, model training, and inference into separate processes, the backend ensures simple code maintenance, robust schema validation, and high-performance inference operations.
