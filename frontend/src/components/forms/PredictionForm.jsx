import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, AlertCircle, DollarSign, Info } from 'lucide-react'
import { usePrediction } from '../../hooks/usePrediction'

const FEATURES = [
  { key: 'CRIM',    label: 'CRIM',    description: 'Per capita crime rate',               placeholder: '0.00632', min: 0,   max: 90,  step: 'any' },
  { key: 'ZN',      label: 'ZN',      description: 'Zoned residential land %',             placeholder: '18.0',    min: 0,   max: 100, step: 'any' },
  { key: 'INDUS',   label: 'INDUS',   description: 'Non-retail business acres %',          placeholder: '2.31',    min: 0,   max: 30,  step: 'any' },
  { key: 'CHAS',    label: 'CHAS',    description: 'Charles River dummy (0 or 1)',          placeholder: '0',       min: 0,   max: 1,   step: 1     },
  { key: 'NOX',     label: 'NOX',     description: 'Nitric oxides concentration',          placeholder: '0.538',   min: 0.3, max: 0.9, step: 'any' },
  { key: 'RM',      label: 'RM',      description: 'Avg rooms per dwelling',               placeholder: '6.575',   min: 3,   max: 9,   step: 'any' },
  { key: 'AGE',     label: 'AGE',     description: 'Owner-occupied units built pre-1940 %',placeholder: '65.2',    min: 0,   max: 100, step: 'any' },
  { key: 'DIS',     label: 'DIS',     description: 'Distances to employment centres',      placeholder: '4.09',    min: 1,   max: 12,  step: 'any' },
  { key: 'RAD',     label: 'RAD',     description: 'Accessibility to radial highways',     placeholder: '1',       min: 1,   max: 24,  step: 1     },
  { key: 'TAX',     label: 'TAX',     description: 'Full-value property tax rate /10k',    placeholder: '296',     min: 100, max: 800, step: 1     },
  { key: 'PTRATIO', label: 'PTRATIO', description: 'Pupil-teacher ratio',                  placeholder: '15.3',    min: 12,  max: 22,  step: 'any' },
  { key: 'B',       label: 'B',       description: '1000(Bk - 0.63)² — Black proportion', placeholder: '396.9',   min: 0,   max: 400, step: 'any' },
  { key: 'LSTAT',   label: 'LSTAT',   description: '% lower status population',            placeholder: '4.98',    min: 1,   max: 40,  step: 'any' },
]

const DEFAULT_VALUES = {
  CRIM: 0.00632, ZN: 18, INDUS: 2.31, CHAS: 0, NOX: 0.538, RM: 6.575,
  AGE: 65.2, DIS: 4.09, RAD: 1, TAX: 296, PTRATIO: 15.3, B: 396.9, LSTAT: 4.98,
}

export default function PredictionForm({ toast }) {
  const [values, setValues] = useState(DEFAULT_VALUES)
  const { result, loading, error, predict, reset } = usePrediction()

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val === '' ? '' : parseFloat(val) }))
    if (result) reset()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('API URL:', import.meta.env.VITE_API_URL)
    console.log('Submitting prediction...', values)
    try {
      await predict(values)
      console.log('Prediction complete!')
      toast?.success('Prediction complete!')
    } catch (err) {
      console.error('Prediction error:', err)
      toast?.error(err.userMessage || err.message || 'Backend offline — please start the FastAPI server.')
    }
  }

  const handleReset = () => {
    setValues(DEFAULT_VALUES)
    reset()
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-primary" />
            <h2 className="section-title text-xl">Live Price Prediction</h2>
          </div>
          <p className="section-subtitle">Enter 13 housing features to predict MEDV (Median House Value)</p>
        </div>
        <span className="badge badge-success">Ridge + Poly Deg-2</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {FEATURES.map(({ key, label, description, placeholder, min, max, step }) => (
            <div key={key}>
              <label className="label" htmlFor={`feat-${key}`}>
                {label}
              </label>
              <div className="relative group">
                <input
                  id={`feat-${key}`}
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={values[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="input-field pr-8"
                  required
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="relative">
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-5 right-0 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 w-44 z-10 shadow-lg">
                      {description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Predicting…
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Predict MEDV
              </>
            )}
          </button>
          <button type="button" onClick={handleReset} className="btn-secondary">Reset to Defaults</button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="gradient-primary rounded-2xl p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-blue-100 font-medium">Predicted Median House Value</p>
                  <p className="text-4xl font-extrabold tabular-nums">
                    ${(result * 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
              <p className="text-xs text-blue-200">
                MEDV = <strong>{typeof result === 'number' ? result.toFixed(2) : result}</strong> × $1,000 •
                Model: Ridge + Polynomial Features (Degree 2) • R² = 0.81
              </p>
            </motion.div>
          )}

          {error && !result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">Backend Offline</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}
