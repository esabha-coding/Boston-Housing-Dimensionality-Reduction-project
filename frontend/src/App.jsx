import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import { ToastContainer } from './components/ui/Toast'
import { useToast } from './hooks/useToast'
import Dashboard from './pages/Dashboard'
import Visualizations from './pages/Visualizations'
import Predict from './pages/Predict'
import Dataset from './pages/Dataset'

export default function App() {
  const { toasts, toast, removeToast } = useToast()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background dark:bg-dark-bg transition-colors duration-300">
        <Navbar />

        <main>
          <Routes>
            <Route path="/"               element={<Dashboard />} />
            <Route path="/visualizations" element={<Visualizations />} />
            <Route path="/predict"        element={<Predict toast={toast} />} />
            <Route path="/dataset"        element={<Dataset toast={toast} />} />
          </Routes>
        </main>

        {/* Global footer */}
        <footer className="mt-16 border-t border-gray-200 dark:border-dark-border py-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Boston Housing ML Dashboard • Dimensionality Reduction & Price Prediction •{' '}
            <span className="text-primary font-semibold">Ridge + Polynomial Degree 2 — Best R² = 0.81</span>
          </p>
        </footer>

        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </BrowserRouter>
  )
}
