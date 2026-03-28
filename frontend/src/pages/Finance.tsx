import { useQuery } from '@tanstack/react-query'
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { formatCurrency } from '../lib/format'

function useFinanceStats() {
  return useQuery({
    queryKey: ['finance-stats'],
    queryFn: async () => {
      const res = await fetch('/api/v1/finance/stats')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    refetchInterval: 120_000,
  })
}

export default function Finance() {
  const { data: stats, isLoading } = useFinanceStats()

  const monthlyData = stats?.monthly_cashflow ?? []
  const categorySpend = stats?.spend_by_category ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Revenue, procurement spend, and cash flow analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue (YTD)', value: formatCurrency(stats?.revenue_ytd ?? 0), icon: TrendingUp, color: 'text-green-600 bg-green-50', trend: '+12.4%' },
          { label: 'Procurement Spend', value: formatCurrency(stats?.procurement_spend_ytd ?? 0), icon: CreditCard, color: 'text-blue-600 bg-blue-50', trend: '+5.1%' },
          { label: 'Gross Margin', value: ((stats?.gross_margin ?? 0) * 100).toFixed(1) + '%', icon: DollarSign, color: 'text-purple-600 bg-purple-50', trend: '+0.8pp' },
          { label: 'Outstanding Payables', value: formatCurrency(stats?.outstanding_payables ?? 0), icon: TrendingDown, color: 'text-red-600 bg-red-50', trend: '-3.2%' },
        ].map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${color}`}><Icon className="w-4 h-4" /></div>
              <span className="text-sm text-gray-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-green-600 mt-1">{trend} vs last year</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Monthly Cash Flow</h2>
          {isLoading ? (
            <div className="h-56 flex items-center justify-center text-gray-400">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue" dot={false} />
                <Line type="monotone" dataKey="spend" stroke="#ef4444" strokeWidth={2} name="Spend" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Spend by Category</h2>
          {isLoading ? (
            <div className="h-56 flex items-center justify-center text-gray-400">Loading...</div>
          ) : categorySpend.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-400">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categorySpend} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[0,4,4,0]} name="Spend" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
