import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart2, TrendingUp, Activity } from 'lucide-react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { formatCurrency, formatNumber } from '../lib/format'
import { scmApi } from '../lib/api'

type Period = '7d' | '30d' | '90d' | '1y'

function useAnalytics(period: Period) {
  return useQuery({
    queryKey: ['analytics', period],
    queryFn: () => scmApi.analytics.overview(period).then(r => r.data),
    refetchInterval: 300_000,
    refetchIntervalInBackground: false,
  })
}

export default function Analytics() {
  const [period, setPeriod] = useState<Period>('30d')
  const { data, isLoading } = useAnalytics(period)

  const orderTrend = data?.order_trend ?? []
  const supplierPerf = data?.supplier_performance ?? []
  const inventoryTurnover = data?.inventory_turnover ?? []

  const kpis = [
    { label: 'Order Fulfillment Rate', value: ((data?.fulfillment_rate ?? 0) * 100).toFixed(1) + '%', icon: Activity },
    { label: 'Perfect Order Rate', value: ((data?.perfect_order_rate ?? 0) * 100).toFixed(1) + '%', icon: TrendingUp },
    { label: 'Inventory Turnover', value: (data?.inventory_turns ?? 0).toFixed(1) + 'x', icon: BarChart2 },
    { label: 'OTIF Rate', value: ((data?.otif_rate ?? 0) * 100).toFixed(1) + '%', icon: Activity },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-500 text-sm mt-1">Cross-module KPIs, trends, and operational intelligence</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['7d', '30d', '90d', '1y'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${period === p ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{isLoading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Order Trend + Revenue */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Orders & Revenue Trend</h2>
        {isLoading ? (
          <div className="h-56 flex items-center justify-center text-gray-400">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={orderTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }}
                tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip formatter={(v: any, name: string) => name === 'Revenue' ? formatCurrency(v) : formatNumber(v)} />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" fill="#93c5fd" name="Orders" radius={[4,4,0,0]} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Supplier Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Top Supplier Performance</h2>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-gray-400">Loading...</div>
          ) : supplierPerf.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400">No data</div>
          ) : (
            <div className="space-y-3">
              {supplierPerf.slice(0, 6).map((s: any) => (
                <div key={s.supplier_id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-32 truncate">{s.name}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(s.on_time_rate ?? 0) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{((s.on_time_rate ?? 0) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Inventory Turnover by Category</h2>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-gray-400">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={inventoryTurnover} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="turns" fill="#6366f1" radius={[0,4,4,0]} name="Turns" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
