import { useQuery } from '@tanstack/react-query'
import { Warehouse as WarehouseIcon, MapPin, Package, Thermometer } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatNumber, formatPercent } from '../lib/format'

// Warehouse data is served from the inventory stats endpoint
function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await fetch('/api/v1/warehouses')
      if (!res.ok) throw new Error('Failed to fetch warehouses')
      return res.json()
    },
    refetchInterval: 60_000,
  })
}

export default function Warehouse() {
  const { data, isLoading } = useWarehouses()
  const warehouses: any[] = data?.items ?? []

  const chartData = warehouses.map((w: any) => ({
    name: w.name?.split(' ')[0] ?? w.code,
    used: w.used_capacity ?? 0,
    available: (w.total_capacity ?? 0) - (w.used_capacity ?? 0),
    utilization: w.utilization_rate ?? 0,
  }))

  const utilColor = (rate: number) => {
    if (rate >= 0.9) return 'bg-red-500'
    if (rate >= 0.75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
        <p className="text-gray-500 text-sm mt-1">Capacity utilization and operations across all facilities</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg text-blue-600 bg-blue-50"><WarehouseIcon className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-gray-500">Total Warehouses</p>
            <p className="text-xl font-bold text-gray-900">{formatNumber(warehouses.length)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg text-green-600 bg-green-50"><Package className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-gray-500">Total Capacity (units)</p>
            <p className="text-xl font-bold text-gray-900">
              {formatNumber(warehouses.reduce((s: number, w: any) => s + (w.total_capacity ?? 0), 0))}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg text-orange-600 bg-orange-50"><Thermometer className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-gray-500">Avg Utilization</p>
            <p className="text-xl font-bold text-gray-900">
              {warehouses.length
                ? formatPercent(warehouses.reduce((s: number, w: any) => s + (w.utilization_rate ?? 0), 0) / warehouses.length)
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Capacity Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Capacity Utilization by Warehouse</h2>
        {isLoading ? (
          <div className="h-56 flex items-center justify-center text-gray-400">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="used" name="Used" fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="available" name="Available" fill="#e5e7eb" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 text-center py-12 text-gray-400">Loading warehouses...</div>
        ) : warehouses.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-400">No warehouses found</div>
        ) : warehouses.map((w: any) => {
          const util = w.utilization_rate ?? 0
          return (
            <div key={w.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{w.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />{w.city}, {w.country}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${w.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {w.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Utilization</span>
                  <span className="font-medium">{formatPercent(util)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${utilColor(util)}`}
                    style={{ width: `${Math.min(100, util * 100)}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-400">Total Capacity</p>
                  <p className="font-semibold text-gray-800">{formatNumber(w.total_capacity ?? 0)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-400">Used</p>
                  <p className="font-semibold text-gray-800">{formatNumber(w.used_capacity ?? 0)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
