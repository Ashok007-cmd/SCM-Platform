import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatPercent, formatDate } from '../lib/format'

function useQualityData() {
  return useQuery({
    queryKey: ['quality-inspections'],
    queryFn: async () => {
      const res = await fetch('/api/v1/quality-inspections?limit=50')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    refetchInterval: 60_000,
  })
}

const RESULT_COLORS: Record<string, string> = {
  passed: '#22c55e',
  failed: '#ef4444',
  conditional_pass: '#f59e0b',
  pending: '#94a3b8',
}

export default function Quality() {
  const { data, isLoading } = useQualityData()
  const inspections: any[] = data?.items ?? []

  const counts = inspections.reduce((acc: any, i: any) => {
    acc[i.result] = (acc[i.result] ?? 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(counts).map(([name, value]) => ({ name, value }))

  const resultIcon = (r: string) => {
    switch (r) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
      case 'conditional_pass': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default: return <ShieldCheck className="w-4 h-4 text-gray-400" />
    }
  }

  const passRate = inspections.length
    ? inspections.filter(i => i.result === 'passed').length / inspections.length
    : 0

  const avgDefectRate = inspections.length
    ? inspections.reduce((s, i) => s + (i.defect_rate ?? 0), 0) / inspections.length
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quality Management</h1>
        <p className="text-gray-500 text-sm mt-1">Incoming goods inspections, defect tracking, and quality metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Inspections', value: inspections.length, icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
          { label: 'Pass Rate', value: formatPercent(passRate), icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Avg Defect Rate', value: formatPercent(avgDefectRate), icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Failed', value: counts['failed'] ?? 0, icon: XCircle, color: 'text-red-600 bg-red-50' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Results Distribution</h2>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-gray-400">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={RESULT_COLORS[entry.name] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Product', 'Supplier', 'Inspector', 'Qty', 'Defect Rate', 'Inspection Date', 'Result'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
                ) : inspections.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">No inspections found</td></tr>
                ) : inspections.map((i: any) => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{i.product_name ?? i.product_id}</td>
                    <td className="px-4 py-3 text-gray-600">{i.supplier_name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{i.inspector_name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{i.quantity_inspected}</td>
                    <td className="px-4 py-3">{i.defect_rate != null ? formatPercent(i.defect_rate) : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(i.inspection_date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {resultIcon(i.result)}
                        <span className="text-xs capitalize">{i.result?.replace('_', ' ')}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
