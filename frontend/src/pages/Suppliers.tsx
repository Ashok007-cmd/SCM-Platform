import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Star, AlertCircle, Search, Globe } from 'lucide-react'
import { scmApi } from '../lib/api'
import { formatNumber, formatPercent } from '../lib/format'

export default function Suppliers() {
  const [search, setSearch] = useState('')
  const [riskLevel, setRiskLevel] = useState('all')
  const [status, setStatus] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', riskLevel, status, search],
    queryFn: () => scmApi.suppliers.list({
      search: search || undefined,
      risk_level: riskLevel === 'all' ? undefined : riskLevel,
      status: status === 'all' ? undefined : status,
    }),
    refetchInterval: 60_000,
  })

  const { data: stats } = useQuery({
    queryKey: ['supplier-stats'],
    queryFn: () => scmApi.suppliers.stats(),
  })

  const riskColor = (r: string) => {
    switch (r) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const suppliers = data?.items ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor performance, risk, and compliance across all suppliers</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Suppliers', value: formatNumber(stats?.total ?? 0), icon: Building2, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active', value: formatNumber(stats?.active ?? 0), icon: Building2, color: 'text-green-600 bg-green-50' },
          { label: 'High/Critical Risk', value: formatNumber((stats?.high_risk ?? 0) + (stats?.critical_risk ?? 0)), icon: AlertCircle, color: 'text-red-600 bg-red-50' },
          { label: 'Avg Rating', value: (stats?.avg_rating ?? 0).toFixed(1) + ' / 5', icon: Star, color: 'text-yellow-600 bg-yellow-50' },
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

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="border border-gray-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="under_review">Under Review</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)}
          className="border border-gray-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Risk Levels</option>
          <option value="low">Low Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="high">High Risk</option>
          <option value="critical">Critical Risk</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Supplier', 'Country', 'Category', 'Rating', 'On-Time %', 'Risk Level', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading suppliers...</td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No suppliers found</td></tr>
              ) : suppliers.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.contact_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Globe className="w-3 h-3" />{s.country}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{s.quality_rating?.toFixed(1) ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{s.on_time_delivery_rate != null ? formatPercent(s.on_time_delivery_rate) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor(s.risk_level)}`}>
                      {s.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(s.status)}`}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
