import React from 'react'
import { NavLink } from 'react-router-dom'
import { Moon, Sun, BarChart3, ScatterChart, Brain, Database, Home } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

const navItems = [
  { to: '/',              label: 'Dashboard',       icon: Home },
  { to: '/visualizations', label: 'Visualizations', icon: ScatterChart },
  { to: '/predict',       label: 'Predict',          icon: Brain },
  { to: '/dataset',       label: 'Dataset',          icon: Database },
]

export default function Navbar() {
  const { isDark, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-dark-border
                       bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-sm leading-none">Boston Housing</span>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-none mt-0.5">ML Dashboard</p>
            </div>
          </div>

          {/* Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex md:hidden gap-1 pb-3 overflow-x-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
