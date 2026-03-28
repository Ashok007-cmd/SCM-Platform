import { useState } from 'react'
import { Settings as SettingsIcon, Bell, Shield, Database, Globe, Key } from 'lucide-react'

type Tab = 'general' | 'notifications' | 'security' | 'integrations' | 'data'

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [saved, setSaved] = useState(false)

  const tabs: { id: Tab; label: string; icon: typeof SettingsIcon }[] = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'data', label: 'Data & Privacy', icon: Database },
  ]

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage platform configuration, integrations, and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <nav className="w-48 flex-shrink-0 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'general' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">General Settings</h2>
              {[
                { label: 'Platform Name', value: 'SCM Platform', type: 'text' },
                { label: 'Default Currency', value: 'USD', type: 'text' },
                { label: 'Timezone', value: 'America/New_York', type: 'text' },
                { label: 'Date Format', value: 'MM/DD/YYYY', type: 'text' },
              ].map(({ label, value, type }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} defaultValue={value}
                    className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Notification Preferences</h2>
              {[
                { label: 'Low Stock Alerts', desc: 'Notify when inventory falls below reorder point' },
                { label: 'Delayed Shipments', desc: 'Alert when shipments exceed estimated delivery' },
                { label: 'Supplier Risk Changes', desc: 'Notify when supplier risk level changes' },
                { label: 'Compliance Expiry', desc: 'Alert 30 days before certificates expire' },
                { label: 'Order Status Updates', desc: 'Real-time updates on order state changes' },
                { label: 'AI Forecast Alerts', desc: 'Demand anomaly and reorder recommendations' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Security Settings</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                Authentication is managed via OAuth 2.0 / OIDC. Session tokens expire after 8 hours of inactivity.
              </div>
              {[
                { label: 'Session Timeout (minutes)', value: '480' },
                { label: 'Max Failed Login Attempts', value: '5' },
                { label: 'Password Min Length', value: '12' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type="number" defaultValue={value}
                    className="w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key Management</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 max-w-md px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50 font-mono">
                    ••••••••••••••••••••••••••••••••
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                    <Key className="w-3.5 h-3.5" /> Regenerate
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">External Integrations</h2>
              {[
                { name: 'Kafka / Confluent Cloud', status: 'connected', color: 'text-green-600 bg-green-50' },
                { name: 'Datadog APM', status: 'connected', color: 'text-green-600 bg-green-50' },
                { name: 'AWS S3 (Document Storage)', status: 'connected', color: 'text-green-600 bg-green-50' },
                { name: 'ERP System (SAP)', status: 'not configured', color: 'text-gray-500 bg-gray-50' },
                { name: 'EDI Partner Gateway', status: 'not configured', color: 'text-gray-500 bg-gray-50' },
              ].map(({ name, status, color }) => (
                <div key={name} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-medium text-gray-900">{name}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{status}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Data & Privacy</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <p>All data is stored in encrypted AWS RDS (PostgreSQL 16) with AES-256 at rest and TLS 1.3 in transit.</p>
                <p>Data retention: transactional records are retained for 7 years per compliance requirements.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                  Export My Data (GDPR)
                </button>
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                  Download Audit Log
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center gap-3">
            <button onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
