import React from 'react'
import { motion } from 'framer-motion'
import { Database, Grid3X3, TrendingUp, Award } from 'lucide-react'
import KPICard from '../components/ui/KPICard'
import ModelComparison from '../components/charts/ModelComparison'
import FeatureEngineering from '../components/panels/FeatureEngineering'

const kpis = [
  { icon: Database,  label: 'Dataset Records',    value: 506,  suffix: '',   description: 'Boston housing samples (1978)',     color: 'primary', delay: 0    },
  { icon: Grid3X3,   label: 'Original Features',  value: 13,   suffix: '',   description: 'CRIM, ZN, INDUS, CHAS, NOX…',     color: 'purple',  delay: 0.1  },
  { icon: TrendingUp,label: 'Train / Test Split',  value: 80,   suffix: '%',  description: '405 train — 101 test samples',     color: 'warning', delay: 0.2  },
  { icon: Award,     label: 'Best R² Score',       value: 0.81, suffix: '',   description: 'Ridge + Polynomial Degree 2',       color: 'success', delay: 0.3  },
]

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary rounded-3xl p-8 text-white relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
            🏠 Boston Housing Dataset • Scikit-learn
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight">
            Dimensionality Reduction<br className="hidden sm:block" /> & Price Prediction
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
            Explore PCA and t-SNE dimensionality reduction, compare Ridge Regression models,
            and make real-time housing price predictions with polynomial feature engineering.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            {['PCA (2 components)', 't-SNE Embedding', 'Ridge Regression', 'Polynomial Degree 2'].map(tag => (
              <span key={tag} className="bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <section>
        <h2 className="section-title mb-6">Project Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} {...kpi} />
          ))}
        </div>
      </section>

      {/* Model Comparison */}
      <section>
        <h2 className="section-title">Model Performance Comparison</h2>
        <p className="section-subtitle">Ridge Regression — 3 variants with different feature strategies</p>
        <ModelComparison />
      </section>

      {/* Feature Engineering */}
      <section>
        <h2 className="section-title">Feature Engineering</h2>
        <p className="section-subtitle">How polynomial expansion boosts model performance</p>
        <FeatureEngineering />
      </section>
    </div>
  )
}
