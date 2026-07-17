# Project Architecture

## Overview

The **Boston Housing Prediction System** is a lightweight, decoupled platform designed to assist users in exploring and understanding housing price prediction through dimensionality reduction and regression techniques.

The solution follows a three-tier architecture:

- **Frontend SPA:** A single-page React application built with Vite and Tailwind CSS. It manages 13 route pages, visualizes PCA/t-SNE scatter plots, and handles live MEDV prediction requests.
- **Backend API:** A FastAPI microservice that handles REST API requests, validates inputs with Pydantic, loads pre-serialized joblib model artifacts, and returns JSON prediction responses.
- **Machine Learning Engine:** A pre-trained offline ML pipeline trained in Google Colab using scikit-learn. The pipeline is serialized and persisted using joblib.

These components coordinate through a dataset CSV layer (506 rows) via HTTP REST interfaces, keeping data operations fast, lightweight, and simple.

---

## High-Level Architecture

For operational workflows and communication boundaries between system elements are structured as follows:

```
┌─────────────────────────────────────────────────────┐
│                  User Browser                       │
│  ┌──────────────────────────────────────────────┐   │
│  │     React Frontend (Vite, Tailwind CSS)      │   │
│  │   Dashboard │ PCA/tSNE │ Predict │ Dataset   │   │
│  └────────────────────┬─────────────────────────┘   │
└───────────────────────│─────────────────────────────┘
                        │ HTTP REST (Axios)
                        ▼
┌─────────────────────────────────────────────────────┐
│               FastAPI Backend (:8000)               │
│  /health │ /meta │ /pca │ /tsne │ /predict          │
│  /model-comparison │ /dataset                       │
│  ┌──────────────────────────────────────────────┐   │
│  │       joblib.load() on startup               │   │
│  │  ridge_poly │ poly_transformer │ pca          │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                        │
             ┌──────────▼──────────┐
             │   model/*.joblib    │
             │  (pre-trained once  │
             │   in Google Colab)  │
             └─────────────────────┘
                        │
             ┌──────────▼──────────┐
             │  dataset/           │
             │  boston_housing.csv │
             │  (506 records)      │
             └─────────────────────┘
```

---

## System Components

### 1. Frontend SPA

- **Responsibility:** Manages form input, client validation, navigation routes, responsive design state transitions, connection status pulses, and local storage caching.
- **Key Modules:** `App.jsx` — router and theme context; `Dashboard.jsx` — KPIs and model comparison; `Visualizations.jsx` — PCA/t-SNE scatter plots; `Predict.jsx` — prediction form; `Dataset.jsx` — dataset explorer with filters and CSV export; API helpers (`axios.js`, `predictions.js`).

### 2. Backend API

- **Responsibility:** Manages ASGI routing, handles API request payloads, validates input data formats, handles runtime exceptions, and discovers the pre-trained model artifacts.
- **Key Modules:** `main.py` — FastAPI application, CORS middleware, all route handlers; `save_models.py` — one-time model serialization pipeline.

### 3. Machine Learning Engine

- **Responsibility:** Produces and serializes feature variables, scales state data, feeds Polynomial Features into the Ridge model instance, performs predictive classification, and serializes evaluation metrics and fitted transformers.
- **Key Modules:** scikit-learn `PCA`, `TSNE`, `PolynomialFeatures`, `Ridge`, `train_test_split`, `joblib` — Pandas data preparation and sklearn evaluation helpers.

### LocalStorage Cache

- **Key Modules:** Browser Web Storage API configured under the key `boston_predictions`.

---

## Project Directory Structure

```
Dimensionality & Features Boston Housing/
├── .venv/                          # Python virtual environment
├── backend/
│   ├── __init__.py
│   ├── main.py                     # FastAPI server & all endpoints
│   ├── save_models.py              # Run ONCE — trains & serializes all models
│   ├── requirements.txt
│   └── model/
│       ├── ridge_no_pca.joblib     # Ridge on 13 original features
│       ├── ridge_pca.joblib        # Ridge on 2 PCA components
│       ├── ridge_poly.joblib       # Ridge on 104 polynomial features (BEST)
│       ├── pca_transformer.joblib  # Fitted PCA(n_components=2)
│       ├── poly_transformer.joblib # Fitted PolynomialFeatures(degree=2)
│       ├── feature_names.joblib    # List of 13 feature name strings
│       └── splits.joblib           # Stored train/test arrays
├── dataset/
│   └── boston_housing.csv          # 506 records, 14 columns
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   └── predictions.js
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Visualizations.jsx
│   │   │   ├── Predict.jsx
│   │   │   └── Dataset.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── notebook/
│   └── dimensionality_reduction_ml.py   # Original Google Colab training script
├── doc/
│   ├── API_DOCUMENTATION.md
│   ├── BACKEND_DOCUMENTATION.md
│   ├── FRONTEND_DOCUMENTATION.md
│   ├── MODEL_DOCUMENTATION.md
│   ├── PROJECT_ARCHITECTURE.md
│   └── USER_GUIDE.md
└── README.md
```

---

## Data Flow

The lifecycle of a prediction request traverses the following stages:

```
1. User opens browser → React app loads at http://localhost:5173
   ↓
2. App.jsx mounts → axios.get('/meta') fetches dataset stats for KPI cards
   ↓
3. Visualizations.jsx mounts → GET /pca and GET /tsne fetch scatter data
   ↓
4. User fills prediction form → clicks "Predict" button
   ↓
5. axios.post('/predict', { crim, zn, ..., lstat }) sent to FastAPI
   ↓
6. FastAPI Pydantic validates 13 fields → assembles numpy array
   ↓
7. poly_transformer.transform() → 104 polynomial features
   ↓
8. ridge_poly.predict() → returns MEDV float
   ↓
9. JSON response → { "predicted_medv": 30.2, "unit": "$1,000s" }
   ↓
10. React renders result card → "$30,200 estimated home value"
    ↓
11. Result cached in browser localStorage under key "boston_predictions"
```

---

## Frontend Architecture

- **Pages:** Views are rendered as independent functional pages: `Dashboard` — displays form fields, dynamic AI assessment outputs; `Visualizations` — PCA and t-SNE scatter plots with D3.js; `Predict` — live prediction form; `Dataset` — paginated explorer with filters.
- **Context:** React Context stores global theme state (light/dark mode) and prediction history.
- **Services:** API calls are abstracted into `src/api/predictions.js`. Axios interceptors centralize request error handling across the application.
- **Routing:** React Router `v6` manages multi-page navigation across sections under the same `<App/>` context.
- **Theming:** Light/dark mode toggled through Tailwind `class` strategy with CSS variable overrides under the key `dark:`.

---

## Backend Architecture

- **FastAPI:** Main application manages ASGI request routing, endpoint mapping, and Pydantic schema definitions.
  - `GET /health` — diagnostic API heartbeat status check.
  - `GET /pca`, `GET /tsne` — scatter data endpoints for D3.js visualizations.
- **Model Loading:** Transforms raw JSON data into a Pandas DataFrame, applies `poly_transformer` and `ridge_poly` to generate a MEDV prediction.
- **Prediction Flow:** Translates the raw Pandas DataFrame into a Pandas Series using `transform()`, passes it to `ridge_poly.predict()`, returns a clean JSON response with unit and model name.
- **Error Handling:** Standard FastAPI exception handlers return `HTTP 422` for malformed inputs and `HTTP 500` for runtime errors.

---

## Machine Learning Pipeline

The backend implements a clean offline ML pipeline:

```
boston_housing.csv → pd.read_csv()
    ↓
train_test_split(test_size=0.2, random_state=42)
    ↓ 404 train / 102 test
    ↓
Path A: Ridge(13 features) → R²=0.67, MSE=24.48
Path B: PCA(2) → Ridge → R²=0.25, MSE=55.02
Path C: PolynomialFeatures(104) → Ridge → R²=0.81, MSE=14.14 ✓
    ↓
joblib.dump() → model/*.joblib (saved once, loaded on startup)
```

---

## Communication Flow

The frontend communicates with the backend through standardized REST requests:

- **Request Header:** `Content-Type: application/json` defining input payload format.
- **Request Body:** A JSON object with 13 Pydantic schema parameters mapped in housing feature layout order.
- **Response Body:** The backend returns a standardized JSON response with `predicted_medv`, `model`, and `unit` under `HTTP 200 OK`.
- **CORS Headers:** Backend CORS middleware returns `Access-Control-Allow-Origin: *` for local port `5173` — and explicitly set to Vercel URL for production.
- **Routing:** React Router `v6` manages multi-section navigation under the same context with lazy loading for `Visualizations` and `Dataset` pages.

---

## Error Handling Architecture

- **Frontend Validation:** Captures missing variables, field type errors, and range discrepancies locally before sending responses, reducing invalid backend calls.
- **Backend Validation:** Pydantic schema catches null and incorrect element within HTTP POST requests — validation responses include field path, missing type, and declarative messages.
- **API Errors:** If the API throws an HTTP error, Axios interceptors catch unhandled backend inference failures and return mock data automatically.
- **Internal Server Error:** Blocks while printing exception during inference catches modal failures and alerts back traces to prevent cascading failures.

---

## Performance Considerations

- **Model Loaded Once:** Loading the model into memory during server startup ensures subsequent API prediction requests require no I/O overhead.
- **Fast API Response:** The serialized model and transformer pipeline generates inferences under 5ms, optimized for real-time analytics operations.
- **Production Build:** Vite generates minified chunks, removing development logs and unused imports to optimize bundle delivery for high-performance loading.

---

## Security Considerations

- **Cross-Origin Resource Sharing (CORS):** Configured to allow origins `*` for local development, which must be restricted to client domain names for production.
- **Authentication:** Production services bypass authentication rates and API access controllers — this should be enforced via JWT before production deployment.
- **Input Sanitisation:** Pydantic checks and fixes field bounds and validates inputs to present injection attacks.

---

## Scalability

To transition the project from local prototyping to institutionalized enterprise scale:

- **Authentication:** Integrate secure login interfaces (such as Auth0 or OAuth2) to protect authorized access.
- **Database:** Replace CSV-level data handling with PostgreSQL or MySQL instances for secure, performant data queries.
- **Cloud Deployment:** Set up pipelines to deploy FastAPI to cloud containers (AWS ECS, Google Cloud Run) with auto-scaling tools.
- **Orchestration:** Create Dockerfile configs for backend to run containerized services to scale microservices by replica under load.
- **Monitoring:** Add monitoring hooks to track request traffic and dashboard prediction models.

---

## Future Architecture (Version 2)

```
React Frontend (Vercel CDN)
    ↓ HTTPS REST
FastAPI Backend (Railway / Render)
    ↓
PostgreSQL Database (Supabase / RDS)
    ↓
ML Service (retrain pipeline on new data)
    ↓
Model Registry (MLflow / joblib versioned)
```

The next architectural milestone (Version 2) continues:

- **API Authentication:** Implementing secure production-grade API validation middleware.
- **Advanced Models:** Implement non-linear regressors (Random Forest, XGBoost, LightGBM) for higher prediction accuracy.
- **Data Cache:** Calculate and cache tabular column results to optimize ML model caching and speed and high availability.
- **Kubernetes:** Configure deployment services to manage cluster container problems.

---

## Conclusion

The Boston Housing Prediction System implements a clean, decoupled three-tier architecture. By separating the React frontend from the FastAPI backend and the Google Colab training pipeline, the platform ensures easy code maintenance, robust schema validation, and high-performance inference operations at every layer.
