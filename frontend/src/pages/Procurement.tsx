import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Clock, CheckCircle, DollarSign, Search } from 'lucide-react'
import { formatCurrency, formatDate } from '../lib/format'

function usePurchaseOrders(status: string) {
  return useQuery({
    queryKey: ['purchase-orders', status],
    queryFn: async () => {
      const params = status !== 'all' ? `?status=${status}` : ''
      const res = await fetch(`/api/v1/purchase-orders${params}`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    refetchInterval: 60_000,
  })
}

function usePOStats() {
  return useQuery({
    queryKey: ['po-stats'],
    queryFn: async () => {
      const res = await fetch('/api/v1/purchase-orders/stats')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })
}

export default function Procurement() {
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const { data, isLoading } = usePurchaseOrders(status)
  const { data: stats } = usePOStats()

  const statusColor = (s: string) => {
    switch (s) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'ordered': return 'bg-indigo-100 text-indigo-800'
      case 'partially_received': return 'bg-purple-100 text-purple-800'
      case 'received': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const orders = (data?.items ?? []).filter((o: any) =>
    search === '' ||
    o.po_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.supplier_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Procurement</h1>
        <p className="text-gray-500 text-sm mt-1">Purchase orders, approvals, and supplier purchasing</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total POs', value: stats?.total ?? 0, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          { label: 'Pending Approval', value: stats?.pending_approval ?? 0, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Received', value: stats?.received ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Total Spend (YTD)', value: formatCurrency(stats?.total_spend_ytd ?? 0), icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
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

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search PO number or supplier..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="border border-gray-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Status</option>
          {['draft','pending_approval','approved','ordered','partially_received','received','cancelled'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['PO Number', 'Supplier', 'Items', 'Total Amount', 'Expected', 'Created', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading purchase orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No purchase orders found</td></tr>
              ) : orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">{o.po_number}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{o.supplier_name}</td>
                  <td className="px-4 py-3 text-gray-600">{o.total_items}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(o.total_amount)}</td>
                  <td className="px-4 py-3 text-gray-600">{o.expected_delivery ? formatDate(o.expected_delivery) : '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(o.status)}`}>
                      {o.status.replace(/_/g, ' ')}
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
