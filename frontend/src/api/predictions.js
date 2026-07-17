import api from './axios'

// ─── Prediction ───────────────────────────────────────────────────
/**
 * POST /predict
 * @param {Object} features - { CRIM, ZN, INDUS, CHAS, NOX, RM, AGE, DIS, RAD, TAX, PTRATIO, B, LSTAT }
 * @returns {Promise<{ predicted_price: number }>}
 */
export const predictPrice = (features) =>
  api.post('/predict', features).then((r) => r.data)

// ─── PCA Data ─────────────────────────────────────────────────────
/**
 * GET /pca
 * @returns {Promise<Array<{ pc1, pc2, medv }>>}
 */
export const getPCAData = () =>
  api.get('/pca').then((r) => r.data)

// ─── t-SNE Data ───────────────────────────────────────────────────
/**
 * GET /tsne
 * @returns {Promise<Array<{ x, y, medv }>>}
 */
export const getTSNEData = () =>
  api.get('/tsne').then((r) => r.data)

// ─── Dataset ──────────────────────────────────────────────────────
/**
 * GET /dataset
 * @returns {Promise<Array<Record<string, number>>>}
 */
export const getDataset = () =>
  api.get('/dataset').then((r) => r.data)

// ─── Health check ─────────────────────────────────────────────────
export const healthCheck = () =>
  api.get('/health').then((r) => r.data)
