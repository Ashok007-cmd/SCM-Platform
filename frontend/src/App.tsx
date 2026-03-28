import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'

// Lazy-load all 12 SCM modules for code splitting
const Dashboard        = lazy(() => import('./pages/Dashboard'))
const Inventory        = lazy(() => import('./pages/Inventory'))
const Suppliers        = lazy(() => import('./pages/Suppliers'))
const Orders           = lazy(() => import('./pages/Orders'))
const Logistics        = lazy(() => import('./pages/Logistics'))
const Warehouse        = lazy(() => import('./pages/Warehouse'))
const Forecasting      = lazy(() => import('./pages/Forecasting'))
const Procurement      = lazy(() => import('./pages/Procurement'))
const Quality          = lazy(() => import('./pages/Quality'))
const Finance          = lazy(() => import('./pages/Finance'))
const Compliance       = lazy(() => import('./pages/Compliance'))
const Analytics        = lazy(() => import('./pages/Analytics'))
const Settings         = lazy(() => import('./pages/Settings'))
const NotFound         = lazy(() => import('./pages/NotFound'))

// Layout
import MainLayout from './layouts/MainLayout'

// Loading fallback
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-gray-950">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      <p className="text-sm text-gray-400">Loading SCM Platform...</p>
    </div>
  </div>
)

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Default redirect */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Core SCM Modules */}
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="inventory"   element={<Inventory />} />
          <Route path="suppliers"   element={<Suppliers />} />
          <Route path="orders"      element={<Orders />} />
          <Route path="logistics"   element={<Logistics />} />
          <Route path="warehouse"   element={<Warehouse />} />
          <Route path="forecasting" element={<Forecasting />} />
          <Route path="procurement" element={<Procurement />} />
          <Route path="quality"     element={<Quality />} />
          <Route path="finance"     element={<Finance />} />
          <Route path="compliance"  element={<Compliance />} />
          <Route path="analytics"   element={<Analytics />} />
          <Route path="settings"    element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
