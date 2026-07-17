# Model Documentation

## Overview

The machine learning component of the **Boston Housing Prediction System** is a regression pipeline designed to predict the median value of owner-occupied homes (MEDV) in Boston suburbs. Based on 13 physiological and socioeconomic housing indicators, the system trains three Ridge Regression variants and selects the best-performing configuration through objective test-set evaluation.

---

## Backend Integration

The pre-trained model is serialized and stored as a binary file (`ridge_poly.joblib`) inside the `model/` directory. During FastAPI startup, the backend server loads this model once into memory using `joblib.load`. When a client calls the `/predict` endpoint with 13 housing feature parameters, the API constructs the incoming JSON data into a Pandas DataFrame, passes the feature matrix to the loaded `poly_transformer` and then `ridge_poly` model instance, and returns the final MEDV prediction. This decoupled setup eliminates backend server logic from the ML training process, ensuring prediction requests remain fast and efficient.

---

## Dataset

The model is trained on the Boston Housing dataset sourced directly from the CMU Statistics library:

- **Dataset Name:** Boston Housing Dataset
- **Source:** http://lib.stat.cmu.edu/datasets/boston (Harrison & Rubinfeld, 1978)
- **Number of Records:** 506 housing samples
- **Number of Features:** 13 physiological and socioeconomic attributes
- **Target Variable:** `MEDV` — Median value of owner-occupied homes in $1,000s
- **Feature Names:** `crim, zn, indus, chas, nox, rm, age, dis, rad, tax, ptratio, b, lstat`
- **Target Range:**
  - Min: $5,000
  - Max: $50,000

**Note on load_boston Deprecation**
`sklearn.datasets.load_boston()` was permanently removed in scikit-learn v1.2 due to ethical concerns about the `B` feature (racial self-segregation proxy). The dataset is loaded manually using:

```python
raw_df = pd.read_csv("http://lib.stat.cmu.edu/datasets/boston", sep=r"\s+", skiprows=22, header=None)
data = np.hstack([raw_df.values[::2, :], raw_df.values[1::2, :2]])
target = raw_df.values[1::2, 2]
```

---

## Feature Descriptions

| Feature | Data Type | Description | Example |
|---|---|---|---|
| CRIM | Float | Per capita crime rate by town | 0.006 |
| ZN | Float | Proportion of residential land zoned for 25k+ sq ft lots | 18.0 |
| INDUS | Float | Proportion of non-retail business acres per town | 2.31 |
| CHAS | Integer | Charles River dummy variable (1 if tract bounds river) | 0 |
| NOX | Float | Nitric oxide concentration (parts per 10 million) | 0.538 |
| RM | Float | Average number of rooms per dwelling | 6.575 |
| AGE | Float | Proportion of owner-occupied units built before 1940 | 65.2 |
| DIS | Float | Weighted distance to five Boston employment centres | 4.09 |
| RAD | Integer | Index of accessibility to radial highways | 1 |
| TAX | Float | Full-value property-tax rate per $10,000 | 296.0 |
| PTRATIO | Float | Pupil-teacher ratio by town | 15.3 |
| B | Float | 1000(Bk - 0.63)² where Bk = proportion of Black population | 396.9 |
| LSTAT | Float | Percentage of lower status population | 4.98 |
| MEDV | Float | **TARGET** — Median home value in $1,000s | 24.0 |

---

## Data Preprocessing

Data preparation tasks are handled inside `save_models.py` before training:

1. **Dataset Loading:** Reads `boston_housing.csv` using Pandas with path validation checks.
2. **Feature Selection & Target Extraction:** Separates the 13 feature columns from the MEDV target column.
3. **Missing Value Check:** Confirms `df.isnull().sum()` returns zero for all columns.
4. **Duplicate Checking:** Scans rows using `df.duplicated().sum()` to identify data redundancy.
5. **Train/Test Split:** Executes a fixed random split using `train_test_split(test_size=0.2, random_state=42)` to preserve matching dimensional distributions in both subsets.

### Importance of Preprocessing

Raw datasets frequently contain invalid data types or outliers. Auditing the dataset for missing parameters and duplicate rows ensures training scripts load high-quality samples. The fixed random_state ensures split features preserve matching dimensional boundaries, enabling proper model training across all three pipeline paths.

---

## Model Selection

For the current project scope, three **Ridge Regression** variants were evaluated as the regression algorithm.

**Advantages:**
- Simplicity: highly interpretable, mapping relationships between feature weights and prediction outcomes.
- Low Resource Usage: extremely fast training time and negligible memory requirements.
- Low Risk of Overfitting: ideal for medium-sized datasets like Boston Housing (506 samples).

**Limitations:**
- Linear Boundaries: assumes linear relationships between inputs and outputs, which may struggle with complex interactions.
- Feature Sensitivity: sensitive to multicollinearity if variables are closely correlated.

**Current Project Scope**

Ridge Regression provides a solid baseline for local development, proof-of-concept SaaS layout designs, and API integration tests without the complexity of deep learning training pipelines.

---

## Model Training

The training workflow is structured as follows:

1. **Dataset Loading:** Loads `boston_housing.csv` via pandas and invokes `train_test_split()` to split feature arrays.
2. **Model Training & Fitting:** Instantiates `Ridge(alpha=1.0)` and fits the coefficients on the training set using `model.fit(X_train, y_train)`.
3. **Evaluation:** Predicts outcomes on test inputs (`X_test`), calculates accuracy, confusion matrices, and detailed classification reports (precision, recall, F1-score).
4. **Saving Model:** Serializes the scikit-learn estimator object to `model/ridge_poly.joblib` using `joblib.dump`.

---

## Model Persistence

- **Joblib Serialization:** Persists model weights using the joblib library, which is highly efficient for large NumPy arrays.
- **Benefits:**
  - Eliminates model compilation overhead during client calls.
  - Keeps endpoint response latency under 5ms.
  - Decouples server operations from ML training scripts.

---

## Evaluation Metrics

Below are the actual validation performance metrics logged by running the scikit-learn training pipeline.

### Summary Performance

| Model | R² Score | MSE | Features Used |
|---|---|---|---|
| Ridge without PCA (Baseline) | 0.67 | 24.48 | 13 original |
| Ridge with PCA (2 components) | 0.25 | 55.02 | 2 PCA components |
| **Ridge with Polynomial Features (Degree 2)** | **0.81** | **14.14** | **104 polynomial** |

- **Train Size:** 404 samples
- **Test Size:** 102 samples

### PCA Analysis

| Component | Explained Variance | Cumulative |
|---|---|---|
| PC1 | 80.08% | 80.08% |
| PC2 | 16.68% | 96.76% |

**Key Insight:** Despite PC1+PC2 capturing 96.76% of total variance, the Ridge model trained on only 2 PCA components achieved R²=0.25 — significantly lower than the 13-feature baseline (R²=0.67). This demonstrates that **variance explained ≠ predictive power** for regression tasks.

### Polynomial Feature Engineering

```
Original features (13)
    ↓ PolynomialFeatures(degree=2, include_bias=False)
    ↓
Polynomial features (104)
    = 13 original
    + 13 squared terms (CRIM², RM², LSTAT², ...)
    + 78 pairwise interaction terms (RM×LSTAT, NOX×AGE, ...)
```

The polynomial transformation captured non-linear relationships between housing attributes, boosting R² from 0.67 → **0.81** and reducing MSE from 24.48 → **14.14**.

---

## Prediction Workflow

```python
# Input: 13 housing features from API request
features = [[crim, zn, indus, chas, nox, rm, age, dis, rad, tax, ptratio, b, lstat]]

# Step 1: Transform to 104 polynomial features
features_poly = poly_transformer.transform(features)   # shape: (1, 104)

# Step 2: Predict MEDV
predicted_medv = ridge_poly.predict(features_poly)     # shape: (1,)

# Output: predicted MEDV in $1,000s
return { "predicted_medv": float(predicted_medv[0]) }
```

---

## Current Limitations

- The model was trained on 506 samples, limiting generalizability to other US housing markets.
- No Probability Calibration: Ridge outputs continuous values, not probability intervals.
- No Database Logs: predictions are cached locally in browser local storage.

---

## Future Improvements

There are several potential options to scale the regression pipeline:

- **Model Exploration:** Test alternative regression algorithms like **Random Forest**, **XGBoost**, or **LightGBM** to capture complex non-linear feature relationships.
- **Hyperparameter Tuning:** Apply regularization strength grid search (e.g. `alpha` values in Ridge) and interaction term degree search to optimize performance.
- **Cross Validation:** Implement k-fold cross-validation on train splits to ensure more stable model evaluation.
- **Model Monitoring:** Track model inputs and outputs over time to detect feature distribution drift and improve model freshness.

---

## Conclusion

The Boston Housing Prediction System uses three Ridge Regression models to predict housing prices. Preprocessed via Pandas and serialized using joblib, the models integrate seamlessly with FastAPI, delivering fast predictions for local clinical housing screenings. The Polynomial Feature pipeline (R²=0.81) significantly outperforms both the baseline (R²=0.67) and PCA-compressed (R²=0.25) variants, confirming that feature engineering is the most impactful lever for this dataset.
