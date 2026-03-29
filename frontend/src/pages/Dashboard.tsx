import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Package, ShoppingCart, Truck, Users,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  DollarSign, BarChart3, RefreshCw
} from 'lucide-react'
import { api } from '../lib/api'
import { formatCurrency, formatNumber } from '../lib/format'

// ─── Types ────────────────────────────────────────────────────
interface KpiCard {
  label: string
  value: string
  change: number
  icon: React.ReactNode
  color: string
}

// ─── API Fetchers ─────────────────────────────────────────────
const fetchDashboardStats = async () => {
  const [inventory, orders, shipments, suppliers] = await Promise.all([
    api.get('/inventory/stats'),
    api.get('/orders/stats'),
    api.get('/logistics/stats'),
    api.get('/suppliers/stats'),
  ])
  return { inventory: inventory.data, orders: orders.data, shipments: shipments.data, suppliers: suppliers.data }
}

const fetchOrderTrend    = () => api.get('/orders/stats/trend?days=30').then(r => r.data)
const fetchInventoryFlow = () => api.get('/inventory/stats/flow?days=30').then(r => r.data)
const fetchTopProducts   = () => api.get('/inventory/top?limit=5').then(r => r.data)

// ─── Component ────────────────────────────────────────────────
export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: fetchDashboardStats, refetchInterval: 60_000 })
  const { data: orderTrend }       = useQuery({ queryKey: ['order-trend'],      queryFn: fetchOrderTrend })
  const { data: inventoryFlow }    = useQuery({ queryKey: ['inventory-flow'],   queryFn: fetchInventoryFlow })
  const { data: topProducts }      = useQuery({ queryKey: ['top-products'],     queryFn: fetchTopProducts })

  const kpis: KpiCard[] = [
    {
      label: 'Total Orders (30d)',
      value: formatNumber(stats?.orders?.total ?? 0),
      change: stats?.orders?.changePercent ?? 0,
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'blue',
    },
    {
      label: 'Inventory Value',
      value: formatCurrency(stats?.inventory?.totalValue ?? 0),
      change: stats?.inventory?.changePercent ?? 0,
      icon: <Package className="h-6 w-6" />,
      color: 'emerald',
    },
    {
      label: 'Active Shipments',
      value: formatNumber(stats?.shipments?.active ?? 0),
      change: stats?.shipments?.changePercent ?? 0,
      icon: <Truck className="h-6 w-6" />,
      color: 'violet',
    },
    {
      label: 'Active Suppliers',
      value: formatNumber(stats?.suppliers?.active ?? 0),
      change: stats?.suppliers?.changePercent ?? 0,
      icon: <Users className="h-6 w-6" />,
      color: 'amber',
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 animate-fade-in">
        {/* Skeleton header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-7 w-48 rounded-lg" />
            <div className="skeleton h-4 w-64 rounded" />
          </div>
          <div className="skeleton h-8 w-44 rounded-lg" />
        </div>
        {/* Skeleton KPI cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-3">
              <div className="flex justify-between">
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-9 w-9 rounded-lg" />
              </div>
              <div className="skeleton h-8 w-24 rounded" />
              <div className="skeleton h-3 w-32 rounded" />
            </div>
          ))}
        </div>
        {/* Skeleton charts */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <div className="skeleton h-5 w-40 rounded mb-4" />
              <div className="skeleton h-[220px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SCM Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Real-time supply chain overview</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-green-400 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          All systems operational
        </div>
      </div>

      {/* KPI Cards — staggered entrance */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`kpi-card animate-slide-up delay-${(i + 1) * 50}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">{kpi.label}</span>
              <div className={`rounded-lg p-2 bg-${kpi.color}-500/10 text-${kpi.color}-400 transition-transform duration-200 hover:scale-110`}>
                {kpi.icon}
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-white animate-count-up" style={{ animationDelay: `${i * 80}ms` }}>
              {kpi.value}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs">
              {kpi.change >= 0
                ? <TrendingUp className="h-3 w-3 text-green-400" />
                : <TrendingDown className="h-3 w-3 text-red-400" />}
              <span className={kpi.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                {Math.abs(kpi.change)}% vs last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 animate-slide-up delay-300">
        <AlertBadge
          label="Low Stock Items"
          count={stats?.inventory?.lowStockCount ?? 0}
          color="amber"
          href="/inventory?status=LOW_STOCK"
        />
        <AlertBadge
          label="Delayed Shipments"
          count={stats?.shipments?.delayedCount ?? 0}
          color="red"
          href="/logistics?status=DELAYED"
        />
        <AlertBadge
          label="Pending PO Approvals"
          count={stats?.orders?.pendingApproval ?? 0}
          color="blue"
          href="/orders?status=PENDING_APPROVAL"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Order Trend */}
        <div className="chart-card animate-slide-up delay-400">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-400" /> Order Trend (30 days)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={orderTrend ?? []}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                labelStyle={{ color: '#e5e7eb' }}
                cursor={{ stroke: '#374151' }}
              />
              <Area type="monotone" dataKey="orders" stroke="#3b82f6" fill="url(#colorOrders)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#3b82f6', stroke: '#1d4ed8', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Flow */}
        <div className="chart-card animate-slide-up delay-500">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-emerald-400" /> Inventory Flow (30 days)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={inventoryFlow ?? []} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                labelStyle={{ color: '#e5e7eb' }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              <Bar dataKey="in" fill="#10b981" name="Received"   radius={[4,4,0,0]} maxBarSize={32} />
              <Bar dataKey="out" fill="#6366f1" name="Dispatched" radius={[4,4,0,0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="chart-card animate-slide-up delay-600">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-amber-400" /> Top Products by Value
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-left">
                <th className="pb-3 font-medium text-xs uppercase tracking-wider">SKU</th>
                <th className="pb-3 font-medium text-xs uppercase tracking-wider">Product</th>
                <th className="pb-3 font-medium text-xs uppercase tracking-wider text-right">Stock</th>
                <th className="pb-3 font-medium text-xs uppercase tracking-wider text-right">Value</th>
                <th className="pb-3 font-medium text-xs uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {(topProducts ?? []).map((p: any, i: number) => (
                <tr
                  key={p.sku}
                  className="border-b border-gray-800/40 text-gray-300 hover:bg-gray-800/30 transition-colors duration-100 animate-slide-up"
                  style={{ animationDelay: `${650 + i * 50}ms` }}
                >
                  <td className="py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                  <td className="py-3 font-medium">{p.name}</td>
                  <td className="py-3 text-right">{formatNumber(p.quantityOnHand)}</td>
                  <td className="py-3 text-right">{formatCurrency(p.totalValue)}</td>
                  <td className="py-3 text-right">
                    <StatusBadge status={p.status} />
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

// ─── Sub-components ───────────────────────────────────────────
function AlertBadge({ label, count, color, href }: { label: string; count: number; color: string; href: string }) {
  return (
    <a
      href={href}
      className={`group flex items-center justify-between rounded-xl bg-${color}-500/10 border border-${color}-500/20 p-4 hover:bg-${color}-500/15 hover:border-${color}-500/40 transition-all duration-200`}
      style={{ transform: 'translateY(0)', transition: 'transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className={`h-5 w-5 text-${color}-400 transition-transform duration-200 group-hover:scale-110`} />
        <span className={`text-sm text-${color}-300`}>{label}</span>
      </div>
      <span className={`text-xl font-bold text-${color}-400 tabular-nums`}>{count}</span>
    </a>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    IN_STOCK:     'bg-green-500/10 text-green-400',
    LOW_STOCK:    'bg-amber-500/10 text-amber-400',
    OUT_OF_STOCK: 'bg-red-500/10 text-red-400',
    DISCONTINUED: 'bg-gray-500/10 text-gray-400',
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? 'bg-gray-500/10 text-gray-400'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
