import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package, AlertTriangle, TrendingDown, Search, Filter } from 'lucide-react'
import { scmApi } from '../lib/api'
import { formatNumber, formatCurrency } from '../lib/format'

type InventoryStatus = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'reserved'

export default function Inventory() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<InventoryStatus>('all')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', status, page],
    queryFn: () => scmApi.inventory.list({ status: status === 'all' ? undefined : status, page, pageSize }),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })

  const { data: stats } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: () => scmApi.inventory.stats(),
    refetchInterval: 60_000,
  })

  const { data: lowStock } = useQuery({
    queryKey: ['inventory-low-stock'],
    queryFn: () => scmApi.inventory.lowStock(),
  })

  const filtered = data?.items?.filter((item: any) =>
    search === '' ||
    item.sku?.toLowerCase().includes(search.toLowerCase()) ||
    item.product_name?.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const statusColor = (s: string) => {
    switch (s) {
      case 'in_stock': return 'bg-green-100 text-green-800'
      case 'low_stock': return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
      case 'reserved': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time stock levels across all warehouses</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total SKUs', value: formatNumber(stats?.total_skus ?? 0), icon: Package, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Value', value: formatCurrency(stats?.total_value ?? 0), icon: TrendingDown, color: 'text-green-600 bg-green-50' },
          { label: 'Low Stock Items', value: formatNumber(lowStock?.length ?? 0), icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Out of Stock', value: formatNumber(stats?.out_of_stock ?? 0), icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
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
            placeholder="Search by SKU or product name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={status}
            onChange={e => { setStatus(e.target.value as InventoryStatus); setPage(1) }}
            className="border border-gray-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['SKU', 'Product', 'Warehouse', 'Qty Available', 'Qty Reserved', 'Unit Cost', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading inventory...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No items found</td></tr>
              ) : filtered.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.sku}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.product_name}</td>
                  <td className="px-4 py-3 text-gray-600">{item.warehouse_name ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold">{formatNumber(item.quantity_available)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatNumber(item.quantity_reserved)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatCurrency(item.unit_cost)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.total_pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
            <span>Page {page} of {data.total_pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <button onClick={() => setPage(p => Math.min(data.total_pages, p + 1))} disabled={page === data.total_pages}
                className="px-3 py-1 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
