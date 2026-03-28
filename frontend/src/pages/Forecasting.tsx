import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Brain, TrendingUp, BarChart2, RefreshCw } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { scmApi } from '../lib/api'
import { formatNumber, formatDate } from '../lib/format'

export default function Forecasting() {
  const [productId, setProductId] = useState('SKU-001')
  const [horizon, setHorizon] = useState(90)

  const { data: forecast, isLoading, refetch } = useQuery({
    queryKey: ['forecast', productId, horizon],
    queryFn: () => scmApi.forecast.demand({ product_id: productId, horizon_days: horizon }),
    enabled: !!productId,
  })

  const chartData = forecast?.forecast?.map((f: any) => ({
    date: formatDate(f.ds),
    predicted: Math.round(f.yhat),
    lower: Math.round(f.yhat_lower),
    upper: Math.round(f.yhat_upper),
  })) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Demand Forecasting</h1>
          <p className="text-gray-500 text-sm mt-1">Prophet + XGBoost ensemble predictions with confidence intervals</p>
        </div>
        <button onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Product SKU</label>
          <input type="text" value={productId} onChange={e => setProductId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter product SKU..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Forecast Horizon</label>
          <select value={horizon} onChange={e => setHorizon(Number(e.target.value))}
            className="border border-gray-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
            <option value={180}>180 days</option>
          </select>
        </div>
      </div>

      {/* Forecast Summary Cards */}
      {forecast && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Avg Daily Demand', value: formatNumber(Math.round(forecast.avg_daily_demand ?? 0)), icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
            { label: 'Reorder Point', value: formatNumber(forecast.reorder_point ?? 0), icon: BarChart2, color: 'text-orange-600 bg-orange-50' },
            { label: 'Model Accuracy (MAPE)', value: ((1 - (forecast.mape ?? 0)) * 100).toFixed(1) + '%', icon: Brain, color: 'text-green-600 bg-green-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${color}`}><Icon className="w-5 h-5" /></div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Demand Forecast — {productId} ({horizon}d)
        </h2>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">Running AI model...</div>
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400">No forecast data</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={Math.floor(chartData.length / 6)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="upper" stroke="transparent" fill="#dbeafe" name="Upper Bound" />
              <Area type="monotone" dataKey="predicted" stroke="#3b82f6" fill="#93c5fd" name="Predicted" />
              <Area type="monotone" dataKey="lower" stroke="transparent" fill="white" name="Lower Bound" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {forecast?.reorder_recommendation && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-900">Reorder Recommendation</p>
            <p className="text-sm text-amber-700 mt-1">{forecast.reorder_recommendation}</p>
          </div>
        </div>
      )}
    </div>
  )
}
