# User Guide

## Introduction

Welcome to the **Boston Housing Prediction System User Guide**. This platform is an interactive analytics dashboard designed to explore housing price prediction through dimensionality reduction and machine learning — powered by a pre-trained Ridge Regression model and a React + FastAPI stack.

This application is designed for **data science students, ML practitioners, and analytics enthusiasts** seeking to understand PCA, t-SNE, polynomial feature engineering, and regression model evaluation through a professional interactive interface.

---

## Prediction Workflow

```
[ Open Portal ] → [ Enter Housing Parameters ] → [ View Predicted MEDV ]
       ↓
[ Review Metrics ] → [ Explore PCA / t-SNE ] → [ Compare Models ]
```

---

## Application Overview

The platform is designed as a single-page SaaS dashboard integrating five main workspace sections:

1. **Dashboard** — The central hub, aggregating live KPI cards, model performance comparison charts, and polynomial feature breakdown.
2. **PCA Visualization** — Interactive 2D scatter plot showing housing samples projected onto the first two Principal Components, color-coded by MEDV using the viridis colormap.
3. **t-SNE Visualization** — Non-linear neighbourhood structure scatter plot using t-SNE (n_components=2, random_state=42), showing clustering patterns in the housing data.
4. **Predict** — Live prediction form where users input 13 housing attributes and receive an estimated median home value.
5. **Dataset Explorer** — Full paginated dataset table with filters, correlation heatmap, distribution histograms, and CSV export.

---

## Dashboard

Upon launching the application, you are presented with the central **Analytics Dashboard**:

- **KPI Cards:** Six summary panels displaying:
  - Total Records: 506 housing samples
  - Total Features: 13 input features + 1 target (MEDV)
  - Train/Test Split: 404 / 102 (80% / 20%)
  - Target Range: $5,000 – $50,000
  - Missing Values: 0 (complete dataset)
  - Best Model R²: 0.81 (Ridge + Polynomial Features)
- **Model Comparison Charts:** Bar charts showing R² scores and MSE for all three models side by side.
- **Feature Engineering Panel:** Visual explanation of how 13 original features expand to 104 polynomial features.
- **Dashboard Navigation:** Controls to move between Dashboard, Visualizations, Predict, and Dataset sections.

---

## PCA Visualization Page

The **PCA Scatter Plot** visualises the Boston Housing data projected onto two principal components:

- **Scatter Plot:** Each point represents one of the 404 training housing samples.
  - X-axis: `Principal Component 1` — explains 80.08% of total variance
  - Y-axis: `Principal Component 2` — explains 16.68% of total variance
  - Color: continuous MEDV value mapped through the **viridis** colormap (purple = low price, yellow = high price)
- **Scree Plot:** Bar + line chart showing explained variance ratio per component with cumulative overlay — helps determine how many components to retain.
- **Feature Loading Biplot:** Toggle to show arrows indicating which original features contribute most to PC1 and PC2.
- **Component Selector:** Dropdown to switch between PC1 vs PC2, PC1 vs PC3, PC2 vs PC3 scatter pairs.

**What to look for:** A visible price gradient from purple (low MEDV) to yellow (high MEDV) along PC1 confirms that the first principal component captures the dominant variance related to housing value.

---

## t-SNE Visualization Page

The **t-SNE Scatter Plot** uses non-linear dimensionality reduction to reveal neighbourhood structure in the training data:

- **Scatter Plot:** t-SNE Component 1 vs t-SNE Component 2, all 404 training samples
- **Color:** MEDV values through viridis colormap — matching the PCA scatter exactly for direct comparison
- **Info Note:** *"t-SNE is used for visualization only — not used in model training or prediction"*
- **Side-by-Side Toggle:** View PCA scatter and t-SNE scatter together to compare linear vs non-linear structure

**What to look for:** Clusters of similarly priced homes grouped together indicate the features carry genuine neighbourhood structure.

---

## Predict Page

The **Predict Page** exposes the live prediction form and the real-time MEDV estimation panel.

### Performing a Prediction

Enter the patient parameter values into the form fields:

- **CRIM** — Per capita crime rate by town. Float value between 0.006 and 88.98.
- **ZN** — Proportion of residential land zoned for 25k+ sq ft lots. Float between 0 and 100.
- **INDUS** — Proportion of non-retail business acres per town. Float between 0.46 and 27.74.
- **CHAS** — Charles River dummy variable. Integer: 0 (does not bound river) or 1 (bounds river).
- **NOX** — Nitric oxide concentration (parts per 10 million). Float between 0.385 and 0.871.
- **RM** — Average number of rooms per dwelling. Float between 3.56 and 8.78.
- **AGE** — Proportion of owner-occupied units built before 1940. Float between 2.9 and 100.
- **DIS** — Weighted distance to five Boston employment centres. Float between 1.13 and 12.13.
- **RAD** — Index of accessibility to radial highways. Integer between 1 and 24.
- **TAX** — Full-value property-tax rate per $10,000. Float between 187 and 711.
- **PTRATIO** — Pupil-teacher ratio by town. Float between 12.6 and 22.
- **B** — 1000(Bk - 0.63)² where Bk is the proportion of Black population. Float between 0.32 and 396.9.
- **LSTAT** — Percentage lower status of the population. Float between 1.73 and 37.97.

Click the **Predict** button to submit. If any field fails validation (e.g. a string entered for CRIM, or a value outside the valid range), the system displays a field-level error message on the corresponding fields before submission.

### Loading State

Upon successful submission, the system displays an *"Evaluating Housing Parameters..."* status overlay. The backend API processes the request in under 5ms, yielding near-instant results.

### Understanding the AI Prediction Result Card

Once prediction completes, a result card displays the following:

- **Predicted MEDV:** The estimated median home value in $1,000s (e.g. `$30,200`)
- **Model Used:** `Ridge with Polynomial Features (Degree 2)`
- **Polynomial Features Applied:** 104 features used for this prediction
- **Confidence Note:** The model achieved R²=0.81 on the 20% held-out test set

### Try Example

Click the **"Try Example"** button to auto-fill all 13 fields with a representative Boston suburb record, then click Predict to see an immediate result.

---

## Model Comparison Panel

The **Model Comparison Panel** on the Dashboard displays performance metrics for all three models evaluated in Google Colab:

| Classification | R² Score | MSE | Verdict |
|---|---|---|---|
| Ridge without PCA | 0.67 | 24.48 | Moderate baseline |
| Ridge with PCA (2 components) | 0.25 | 55.02 | Significant information loss |
| **Ridge + Polynomial Features** | **0.81** | **14.14** | **Best model ✓** |

> ⚠️ **Key Insight:** Despite PCA capturing 96.76% of total variance with only 2 components, the PCA model achieved the lowest R² score (0.25). This demonstrates that variance explained does not directly translate to predictive power for regression tasks.

---

## Dataset Explorer Page

The **Dataset Explorer** provides a full paginated view of all 506 Boston Housing records:

- **Table:** All 506 records with all 14 columns (13 features + MEDV target), sortable by any column
- **Correlation Heatmap:** 13×13 Pearson correlation matrix showing which features are most correlated with MEDV (RM: positive, LSTAT: negative)
- **Distribution Histograms:** Individual feature distributions with MEDV colour overlay
- **Filters:**
  - Price range slider (min/max MEDV)
  - CHAS toggle (Charles River adjacency: all / river adjacent / not adjacent)
  - RAD index range selector
  - Crime rate range slider
- **Export CSV:** Downloads current filtered dataset as a CSV file

---

## Quick Actions

Three quick action buttons help streamline the exploration workflow:

1. **New Prediction** — Routes you to the Predict page to start a new prediction
2. **View Visualizations** — Takes you to the PCA and t-SNE scatter plot section
3. **Explore Dataset** — Opens the full 506-record dataset explorer

---

## Prediction Results Table

The system categorizes prediction results as follows:

| Price Range | MEDV | Assessment |
|---|---|---|
| Low Value | < $15,000 | Lower-priced suburb — typically high LSTAT, high CRIM |
| Mid Value | $15,000 – $30,000 | Average Boston suburb pricing |
| High Value | > $30,000 | Premium suburb — typically high RM, low LSTAT |

---

## Common Errors

| Error Symptom | Possible Cause | Recommended Resolution |
|---|---|---|
| "Failed to connect to API" | The FastAPI backend is offline or not running | Verify `uvicorn main:app --reload --port 8000` is running in the backend terminal |
| "Red validation label under inputs" | An input is missing or outside the valid clinical bounds | Check input values against the feature ranges specified in the Predict page |
| "Charts show mock data" | Backend is offline — app has fallen back to demo mode | Start the backend server — charts will auto-refresh with live data |
| CORS block warnings in console | Missing CORS headers on the FastAPI server | Ensure `CORSMiddleware` allows origin `http://localhost:5173` |

---

## Frequently Asked Questions (FAQ)

**Q: How is the prediction generated?**
The system passes the 13 input housing features through a pre-trained `PolynomialFeatures(degree=2)` transformer (expanding to 104 features), then runs `Ridge(alpha=1.0).predict()` on the expanded feature matrix. The model was trained and serialized in Google Colab — the backend only performs inference, never retraining.

**Q: Where is prediction history stored?**
Prediction history is stored locally in your browser's `localStorage`. No housing data or parameters are transmitted to external databases.

**Q: Can I delete prediction history?**
Yes. Navigate to the **Dataset Explorer** page, click the **Clear Predictions** history icon, and confirm the action.

**Q: Does the app work without an internet connection?**
Yes — when tested locally, both the React client and FastAPI server operate fully offline. The app also works with mock data if the backend is not running.

**Q: What does a negative R² score mean for the PCA model?**
It means the PCA model performed worse than simply predicting the mean MEDV for all samples. This can happen when important information is lost during dimensionality reduction — especially when only 2 components are retained.

---

## Best Practices

- **Valid Input Ranges:** Ensure parameters match the expected ranges (e.g. RM between 3.56 and 8.78, LSTAT between 1.73 and 37.97) before submitting the form.
- **Regular Backups:** If you use the model regularly, copy predictions from history to a CSV periodically, as clearing browser data will delete all local prediction history.
- **Use the Try Example Button:** Before entering custom values, use the pre-filled example to confirm the backend is connected and returning live predictions correctly.

---

## Future Enhancements

Future platform versions plan to integrate:

- **User Authentication:** Secure portals to prevent unauthorized access.
- **Export PDF Reports:** Generate downloadable prediction reports with full feature inputs, MEDV estimate, and model explanation.
- **Doctor Referral Panel:** Dedicated analytics panels to compare predictions across different housing submarkets over time.
- **Notifications:** Toast alerts for model version changes and validation errors.
- **System Dark Mode:** A dedicated full/light toggle theming mode.

---

## Conclusion

The Boston Housing Prediction System provides a fast, responsive analytics dashboard. By pairing a simple prediction form with a lightweight FastAPI microservice, the application helps data science students explore dimensionality reduction workflows and regression model comparisons in a professional, production-ready interface.
