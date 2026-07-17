# API Documentation

## Overview

The Boston Housing Prediction System exposes a clean server-side API where the React frontend communicates with the FastAPI backend through a standardized HTTP REST interface.

When a user submits housing parameters through the frontend prediction form, the client transmits the data as an HTTP POST JSON payload to the backend server. The FastAPI server validates the incoming data schema, feeds the parameters into the serialized Ridge + Polynomial model, and returns the predicted MEDV value as a JSON response.

```
Frontend (React)              Backend (FastAPI)
┌──────────────────┐          ┌──────────────────────────────┐
│ Prediction Form  │ ──POST──▶│ /predict                     │
│ Dataset Explorer │ ──GET───▶│ /dataset                     │
│ PCA Scatter Plot │ ──GET───▶│ /pca                         │
│ t-SNE Scatter    │ ──GET───▶│ /tsne                        │
│ Model Comparison │ ──GET───▶│ /model-comparison            │
│ KPI Cards        │ ──GET───▶│ /meta                        │
└──────────────────┘          └──────────────────────────────┘
```

---

## Base URL

By default, the backend API server is hosted locally at:

```
http://127.0.0.1:8000
```

For live deployments, the Base URL is updated dynamically on the client side via the `VITE_API_URL` environment variable which holds the Render deployment URL.

---

## Authentication

Authentication is currently **not implemented** for local development. The API allows cross-origin requests from the React client via CORS middleware headers.

---

## Endpoints

### GET /health

**Purpose**
Verifies the current status of the serialized FastAPI server and ensures that all joblib model artifacts (ridge_poly, pca_transformer, poly_transformer) are loaded successfully at startup.

**Request**
- Method: `GET`
- Path: `/health`
- Headers Required: None
- Query Parameters: None

**Success Response**
- HTTP Status Code: `200 OK`
- Content-Type: `application/json`

**Example JSON**

```json
{
  "status": "healthy",
  "model_loaded": true
}
```

**Possible Error Response**
- HTTP Status Code: `503 Service Unavailable` — Returned if model artifacts failed to load at startup.

---

### GET /meta

**Purpose**
Returns dataset statistics, feature names, PCA explained variance ratios, polynomial feature count, and train/test split details — used to populate KPI cards and info panels on the dashboard.

**Success Response**

```json
{
  "records": 506,
  "features": 13,
  "poly_features": 104,
  "train_size": 404,
  "test_size": 102,
  "target": "MEDV",
  "target_range": { "min": 5.0, "max": 50.0 },
  "feature_names": ["crim","zn","indus","chas","nox","rm","age","dis","rad","tax","ptratio","b","lstat"],
  "pca_variance": [0.8008, 0.1668],
  "total_variance_explained": 0.9676
}
```

---

### GET /pca

**Purpose**
Returns PCA scatter plot data — PC1, PC2, and MEDV values for all 404 training samples. Used by the frontend D3.js viridis scatter plot. PCA was fitted on training data only to prevent data leakage.

**Success Response**

```json
{
  "points": [
    { "pc1": -3.21, "pc2": 1.45, "medv": 24.0 },
    { "pc1":  5.67, "pc2": -0.82, "medv": 13.5 }
  ],
  "variance_explained": [0.8008, 0.1668],
  "axis_labels": {
    "x": "Principal Component 1 (80.08%)",
    "y": "Principal Component 2 (16.68%)"
  }
}
```

---

### GET /tsne

**Purpose**
Returns t-SNE 2D embedding coordinates and MEDV values for all training samples. Used for the non-linear neighbourhood structure scatter plot. Run with `n_components=2`, `random_state=42`. t-SNE is visualization only — not used in regression.

**Success Response**

```json
{
  "points": [
    { "x": 12.4, "y": -5.3, "medv": 24.0 },
    { "x": -8.1, "y": 10.2, "medv": 13.5 }
  ],
  "axis_labels": {
    "x": "t-SNE Component 1",
    "y": "t-SNE Component 2"
  },
  "note": "t-SNE is used for visualization only — not fed into regression models"
}
```

---

### GET /model-comparison

**Purpose**
Returns the R² score and MSE for all three Ridge Regression models evaluated on the 20% held-out test set. Values are sourced directly from the Google Colab training session.

**Success Response**

```json
{
  "models": [
    { "name": "Ridge without PCA",              "r2": 0.67, "mse": 24.48, "features": 13  },
    { "name": "Ridge with PCA (2 components)",  "r2": 0.25, "mse": 55.02, "features": 2   },
    { "name": "Ridge with Polynomial Features", "r2": 0.81, "mse": 14.14, "features": 104 }
  ]
}
```

---

### POST /predict

**Purpose**
Calculates a predicted median home value (MEDV in $1,000s) by applying Polynomial Feature transformation to the input and running it through the Ridge Regression model trained in Google Colab.

**Request Headers**
- Content-Type: `application/json`

**Request Body (JSON)**

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| crim | Float | Yes | Per capita crime rate by town | 0.006 |
| zn | Float | Yes | Proportion of residential land 25k+ sq ft | 18.0 |
| indus | Float | Yes | Proportion of non-retail business acres | 2.31 |
| chas | Integer | Yes | Charles River dummy variable (0 or 1) | 0 |
| nox | Float | Yes | Nitric oxide concentration (parts per 10M) | 0.538 |
| rm | Float | Yes | Average number of rooms per dwelling | 6.575 |
| age | Float | Yes | Proportion of units built before 1940 | 65.2 |
| dis | Float | Yes | Weighted distance to employment centres | 4.09 |
| rad | Integer | Yes | Radial highway accessibility index | 1 |
| tax | Float | Yes | Full-value property-tax rate per $10,000 | 296.0 |
| ptratio | Float | Yes | Pupil-teacher ratio by town | 15.3 |
| b | Float | Yes | 1000(Bk - 0.63)² racial composition proxy | 396.9 |
| lstat | Float | Yes | Percentage lower status of the population | 4.98 |

**Example Request Payload**

```json
{
  "crim": 0.006, "zn": 18.0, "indus": 2.31, "chas": 0,
  "nox": 0.538, "rm": 6.575, "age": 65.2, "dis": 4.09,
  "rad": 1, "tax": 296.0, "ptratio": 15.3, "b": 396.9, "lstat": 4.98
}
```

**Success Response**

```json
{
  "predicted_medv": 30.2,
  "model": "Ridge with Polynomial Features (Degree 2)",
  "unit": "$1,000s",
  "poly_features_applied": 104
}
```

**UI Translation Notes**
- `predicted_medv` displayed as `$30,200 estimated home value`
- `poly_features_applied` shown as: "104 polynomial features used"

**Validation Error (422)**

```json
{
  "detail": [
    { "loc": ["body", "rm"], "msg": "field required", "type": "value_error.missing" }
  ]
}
```

**Internal Server Error (500)**

```json
{
  "detail": "Internal server error: model artifact not found at model/ridge_poly.joblib"
}
```

---

### GET /dataset

**Purpose**
Returns paginated Boston Housing records for the dataset explorer table. Supports filtering by price range and CHAS.

**Query Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| page | Integer | 1 | Page number |
| per_page | Integer | 20 | Records per page |
| min_medv | Float | None | Minimum MEDV filter |
| max_medv | Float | None | Maximum MEDV filter |
| chas | Integer | None | River adjacency filter (0 or 1) |

---

## Response Status Codes

| Status Code | Message | Description |
|---|---|---|
| 200 | OK | Request completed successfully |
| 422 | Unprocessable Entity | Request parameters are malformed or invalid |
| 500 | Internal Server Error | Backend server exception or model loading error |
| 503 | Service Unavailable | Model artifacts failed to load at startup |

---

## Backend Workflow

```
1. Client POST → /predict with 13 JSON feature values
   ↓
2. Pydantic validation (checks all 13 fields, types, presence)
   ↓
3. Features assembled into numpy array shape (1, 13)
   ↓
4. poly_transformer.transform() → expands to shape (1, 104)
   ↓
5. ridge_poly.predict() → returns MEDV float value
   ↓
6. JSON response returned with predicted_medv, model name, unit
```

---

## Testing

### Testing with cURL

```bash
# Health check
curl http://127.0.0.1:8000/health

# Prediction
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"crim":0.006,"zn":18.0,"indus":2.31,"chas":0,"nox":0.538,
       "rm":6.575,"age":65.2,"dis":4.09,"rad":1,"tax":296,
       "ptratio":15.3,"b":396.9,"lstat":4.98}'
```

### Testing with Postman

1. Open Postman and create a new `POST` request to `http://127.0.0.1:8000/predict`
2. Click **Body** → select **raw** → set type to **JSON**
3. Paste the request body from the example above
4. Click **Send** — the response panel will return the predicted MEDV

---

## Notes

- **No Retraining:** The backend never retrains at startup. Run `save_models.py` once to serialize all artifacts.
- **CORS Configuration:** `http://localhost:5173` and your Vercel URL must be whitelisted in FastAPI's CORS middleware.
- **Model Path:** All joblib artifacts are loaded from the `model/` directory relative to `main.py`.
- **Interactive Docs:** Full Swagger UI available at `http://127.0.0.1:8000/docs` when the server is running.
