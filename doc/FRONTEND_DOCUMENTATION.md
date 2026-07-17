# Frontend Documentation

## Overview

The frontend of the **Boston Housing Prediction System** is a modern single-page React application built with Vite. It provides an interactive analytics dashboard that visualises the complete Google Colab ML pipeline — PCA scatter plots, t-SNE embeddings, Ridge model comparisons, polynomial feature breakdowns, and a live prediction form — all wired to the FastAPI backend via Axios.

**Key Frontend Responsibilities**
- **Data Visualization:** Renders PCA and t-SNE 2D scatter plots using D3.js with viridis colormaps, matching the original Colab matplotlib output.
- **Model Comparison:** Displays R² and MSE bar charts for all three Ridge models using Recharts with viridis and magma palettes.
- **Live Prediction:** Collects 13 housing attribute inputs, posts them to `/predict`, and renders the estimated MEDV result card.
- **Dataset Explorer:** Renders a paginated, filterable, exportable table of all 506 Boston Housing records.
- **Offline Fallback:** If the backend is offline, all charts automatically fall back to realistic mock data so the app remains fully usable as a standalone demo.

---

## Frontend Folder Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── axios.js            # Axios instance with baseURL: http://localhost:8000
│   │   └── predictions.js      # API call functions for all endpoints
│   ├── components/
│   │   ├── Dashboard.jsx       # Hero + KPI cards + model comparison charts
│   │   ├── Visualizations.jsx  # PCA scatter + t-SNE scatter (D3.js + viridis)
│   │   ├── Predict.jsx         # Live prediction form (13 fields → MEDV result)
│   │   └── Dataset.jsx         # Dataset explorer: table, filters, CSV export
│   ├── App.jsx                 # React Router + theme provider + layout wrapper
│   └── index.css               # Tailwind base + CSS variables for light/dark themes
├── index.html                  # HTML structure and Google Fonts (Inter) loading
├── tailwind.config.js          # Custom color palette (Royal Blue, Sky Blue, etc.)
├── vite.config.js              # Vite server config + proxy /api → localhost:8000
├── postcss.config.js           # PostCSS configuration for Tailwind
└── package.json                # Node dependencies
```

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18+ | Component-based UI framework |
| Vite | 4+ | Lightning-fast build tool and dev server |
| Tailwind CSS | 3+ | Utility-first styling with custom color palette |
| shadcn/ui | latest | Pre-built accessible UI components |
| Recharts | latest | Bar charts and line charts (model comparison) |
| D3.js | latest | PCA biplot, t-SNE scatter, viridis/magma colormaps |
| Framer Motion | latest | Page transitions and chart entrance animations |
| Axios | latest | HTTP client for FastAPI requests with mock fallback |
| React Router | 6+ | Client-side routing between dashboard sections |
| Lucide React | latest | Icon library for UI elements |

---

## Dashboard Sections

### Section 1 — KPI Cards (Dashboard.jsx)

Six animated metric cards at the top of the dashboard:
- Total Records: 506 | Total Features: 13 + 1 target | Train/Test: 404/102
- Target Range: $5,000–$50,000 | Missing Values: 0 | Best R²: 0.81

### Section 2 — PCA Visualization (Visualizations.jsx)

Replicates the `plt.scatter` PCA plot from the Colab notebook:
- 2D scatter: PC1 vs PC2, each point = one housing sample, colored by MEDV (viridis)
- Info cards: PC1=80.08% variance | PC2=16.68% | Total=96.76%
- Scree plot, feature loading biplot toggle, component selector dropdown

### Section 3 — t-SNE Visualization (Visualizations.jsx)

Replicates the `TSNE(n_components=2, random_state=42)` scatter plot:
- 2D scatter: t-SNE Component 1 vs t-SNE Component 2, MEDV viridis-colored
- Info note: *"t-SNE is used for visualization only — not used in model training"*
- Side-by-side toggle with PCA scatter for comparison

### Section 4 — Model Comparison (Dashboard.jsx)

Replicates the seaborn barplot comparisons from the Colab notebook:
- R² Bar Chart: viridis palette. MSE Bar Chart: magma palette. X-axis rotated 45°.
- Ridge without PCA: R²=0.67, MSE=24.48 | Ridge+PCA: R²=0.25, MSE=55.02 | Ridge+Poly: R²=0.81, MSE=14.14
- Color-coded results table: green=best, red=worst

### Section 5 — Live Prediction Form (Predict.jsx)

- 13 labeled input fields for all Boston Housing features
- "Try Example" button pre-fills with a sample record
- Result card: `$XX,XXX estimated home value` + model badge + poly features count

### Section 6 — Feature Engineering Panel (Dashboard.jsx)

- 13 → 104 counter cards with expansion breakdown
- `104 = 13 original + 13 squared + 78 pairwise interactions`
- R² improvement chart: 0.67 → 0.81

### Section 7 — Dataset Explorer (Dataset.jsx)

- Paginated 506-record table, sortable columns
- Correlation heatmap (13×13 Pearson matrix)
- Filters: price range, CHAS toggle, RAD range, crime rate range
- Export CSV button

---

## Color Palette

| Role | Name | Hex |
|---|---|---|
| Primary | Royal Blue | `#1A56DB` |
| Secondary | Sky Blue | `#3B82F6` |
| Accent | Indigo | `#6366F1` |
| Success / Best Model | Emerald Green | `#059669` |
| Warning / Mid Model | Amber | `#D97706` |
| Danger / Worst Model | Red | `#DC2626` |
| Chart — Viridis Start | Deep Purple | `#440154` |
| Chart — Viridis End | Yellow | `#FDE725` |
| Background | Off White | `#F8FAFC` |
| Surface | White | `#FFFFFF` |
| Muted Text | Slate 500 | `#64748B` |
| Dark Text | Gray 900 | `#111827` |

---

## API Integration

All API calls managed through `src/api/axios.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export default api;
```

Each component uses `src/api/predictions.js` which wraps endpoint calls with try/catch and mock fallback:

```javascript
export const fetchPCA = async () => {
  try {
    const res = await api.get('/pca');
    return res.data;
  } catch {
    return MOCK_PCA_DATA; // fallback if backend offline
  }
};
```

---

## Offline Mock Data Fallback

| Endpoint | Mock Fallback |
|---|---|
| `/pca` | 404 pre-computed PC1/PC2/MEDV data points |
| `/tsne` | 404 pre-computed t-SNE component values |
| `/model-comparison` | R²=[0.67, 0.25, 0.81], MSE=[24.48, 55.02, 14.14] |
| `/meta` | Static dataset stats object |
| `/predict` | Returns `$24,000` as a placeholder MEDV |

---

## Performance Notes

- Vite HMR enables instant browser updates during development
- D3.js scatter plots wrapped in React `useEffect` with cleanup to prevent memory leaks
- Framer Motion animations lazy-loaded to avoid blocking initial paint
- Recharts components memoized to prevent unnecessary re-renders during filter changes

---

## Future Frontend Improvements

- **TypeScript Migration:** Convert all `.jsx` to `.tsx` for type safety across component props
- **React Query:** Replace raw `useEffect` fetching with React Query for caching and background refetching
- **Accessibility:** Add ARIA labels to all D3.js SVG elements for screen reader support
- **Export Reports:** Generate downloadable PDF prediction reports with feature inputs and model explanation
