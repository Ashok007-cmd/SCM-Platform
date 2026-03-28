import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Truck, MapPin, Clock, AlertTriangle, Search } from 'lucide-react'
import { scmApi } from '../lib/api'
import { formatDate, formatDateTime } from '../lib/format'

export default function Logistics() {
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['shipments', status],
    queryFn: () => scmApi.logistics.list({ status: status === 'all' ? undefined : status }),
    refetchInterval: 30_000,
  })

  const { data: stats } = useQuery({
    queryKey: ['logistics-stats'],
    queryFn: () => scmApi.logistics.stats(),
    refetchInterval: 60_000,
  })

  const { data: delayed } = useQuery({
    queryKey: ['delayed-shipments'],
    queryFn: () => scmApi.logistics.delayed(),
  })

  const statusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'picked_up': return 'bg-blue-100 text-blue-800'
      case 'in_transit': return 'bg-indigo-100 text-indigo-800'
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'failed_delivery': return 'bg-red-100 text-red-800'
      case 'returned': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const shipments = (data?.items ?? []).filter((s: any) =>
    search === '' ||
    s.tracking_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.carrier?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Logistics & Shipment Tracking</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time visibility across all carriers and shipments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Shipments', value: stats?.total ?? 0, icon: Truck, color: 'text-blue-600 bg-blue-50' },
          { label: 'In Transit', value: stats?.in_transit ?? 0, icon: MapPin, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Delayed', value: delayed?.length ?? 0, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
          { label: 'Avg Transit (days)', value: stats?.avg_transit_days?.toFixed(1) ?? '—', icon: Clock, color: 'text-green-600 bg-green-50' },
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
          <input type="text" placeholder="Search by tracking number or carrier..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="border border-gray-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Status</option>
          {['pending','picked_up','in_transit','out_for_delivery','delivered','failed_delivery','returned'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Tracking #', 'Carrier', 'Origin', 'Destination', 'Shipped', 'Est. Delivery', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading shipments...</td></tr>
              ) : shipments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No shipments found</td></tr>
              ) : shipments.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">{s.tracking_number}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.carrier}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.origin_address}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.destination_address}</td>
                  <td className="px-4 py-3 text-gray-600">{s.shipped_at ? formatDate(s.shipped_at) : '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.estimated_delivery ? formatDate(s.estimated_delivery) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(s.status)}`}>
                      {s.status.replace(/_/g, ' ')}
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
