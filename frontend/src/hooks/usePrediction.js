import { useState, useCallback } from 'react'
import { predictPrice } from '../api/predictions'

export function usePrediction() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const predict = useCallback(async (features) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await predictPrice(features)
      setResult(data.predicted_price ?? data.prediction ?? data)
      return data
    } catch (err) {
      setError(err.userMessage || 'Prediction failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, loading, error, predict, reset }
}
