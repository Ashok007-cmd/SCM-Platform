import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react'
import { formatDate } from '../lib/format'

function useComplianceRecords() {
  return useQuery({
    queryKey: ['compliance-records'],
    queryFn: async () => {
      const res = await fetch('/api/v1/compliance-records?limit=50')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    refetchInterval: 120_000,
  })
}

const STATUS_COLORS: Record<string, string> = {
  compliant: 'bg-green-100 text-green-800',
  non_compliant: 'bg-red-100 text-red-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-gray-100 text-gray-700',
  expired: 'bg-orange-100 text-orange-800',
}

const STATUS_ICON: Record<string, JSX.Element> = {
  compliant: <CheckCircle className="w-4 h-4 text-green-500" />,
  non_compliant: <XCircle className="w-4 h-4 text-red-500" />,
  under_review: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  pending: <Clock className="w-4 h-4 text-gray-400" />,
  expired: <AlertTriangle className="w-4 h-4 text-orange-500" />,
}

export default function Compliance() {
  const { data, isLoading } = useComplianceRecords()
  const records: any[] = data?.items ?? []

  const counts = records.reduce((acc: any, r: any) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance & Regulatory</h1>
        <p className="text-gray-500 text-sm mt-1">
          ESG, trade compliance, supplier certifications, and regulatory adherence tracking
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {['compliant', 'non_compliant', 'under_review', 'pending', 'expired'].map(s => (
          <div key={s} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="flex justify-center mb-2">{STATUS_ICON[s] ?? <ShieldCheck className="w-4 h-4 text-gray-400" />}</div>
            <p className="text-2xl font-bold text-gray-900">{counts[s] ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1 capitalize">{s.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>

      {/* Expiring soon alert */}
      {records.filter((r: any) => {
        if (!r.expiry_date) return false
        const days = (new Date(r.expiry_date).getTime() - Date.now()) / 86400000
        return days >= 0 && days <= 30
      }).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Certificates Expiring Soon</p>
            <p className="text-sm text-amber-700 mt-1">
              {records.filter((r: any) => {
                if (!r.expiry_date) return false
                const days = (new Date(r.expiry_date).getTime() - Date.now()) / 86400000
                return days >= 0 && days <= 30
              }).length} compliance record(s) expire within 30 days. Review and renew to avoid disruptions.
            </p>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Entity', 'Type', 'Regulation / Standard', 'Issued', 'Expires', 'Auditor', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading compliance records...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No records found</td></tr>
              ) : records.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.entity_name ?? r.supplier_name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{r.record_type?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-gray-600">{r.regulation_standard}</td>
                  <td className="px-4 py-3 text-gray-600">{r.issued_date ? formatDate(r.issued_date) : '—'}</td>
                  <td className="px-4 py-3">
                    {r.expiry_date ? (
                      <span className={
                        (new Date(r.expiry_date).getTime() - Date.now()) / 86400000 <= 30
                          ? 'text-red-600 font-medium' : 'text-gray-600'
                      }>{formatDate(r.expiry_date)}</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.auditor ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {STATUS_ICON[r.status] ?? <ShieldCheck className="w-4 h-4 text-gray-400" />}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {r.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
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
