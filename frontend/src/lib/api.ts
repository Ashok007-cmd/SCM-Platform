import axios from 'axios'

/**
 * Axios instance pre-configured for the SCM Platform backend.
 * Base URL is injected at build time via VITE_API_BASE_URL env var,
 * falling back to the nginx proxy path /api for production.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

// ─── Request interceptor — attach JWT ─────────────────────────
// ─── Request interceptor ──────────────────────────────────────
api.interceptors.request.use((config) => {
  // Manual header injection removed in favor of httpOnly cookies (Finding 3.1)
  return config
})

// ─── Response interceptor — handle 401 / errors ──────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status

    if (status === 401) {
      window.location.replace('/#/login')
    }

    if (status === 403) {
      _showToast('You do not have permission to perform this action.', 'error')
    }

    if (status >= 500) {
      _showToast('Server error. Please try again or contact support.', 'error')
      console.error('[SCM API] Server error', error.response?.data)
    }

    if (!status && error.message === 'Network Error') {
      _showToast('Network unavailable. Check your connection.', 'error')
    }

    return Promise.reject(error)
  }
)

function _showToast(message: string, type: 'error' | 'info') {
  const toast = document.createElement('div')
  toast.textContent = message
  toast.style.cssText = [
    'position:fixed', 'bottom:24px', 'right:24px', 'z-index:9999',
    'padding:12px 20px', 'border-radius:8px', 'font-size:14px',
    'font-family:system-ui,sans-serif', 'max-width:360px',
    'box-shadow:0 4px 12px rgba(0,0,0,0.15)',
    type === 'error'
      ? 'background:#fef2f2;color:#991b1b;border:1px solid #fecaca'
      : 'background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe',
  ].join(';')
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 5000)
}

// ─── Typed helper wrappers ────────────────────────────────────
export const scmApi = {
  inventory: {
    list:      (params?: object) => api.get('/inventory', { params }),
    getById:   (id: string)      => api.get(`/inventory/${id}`),
    lowStock:  (params?: object) => api.get('/inventory/low-stock', { params }),
    stats:     ()                => api.get('/inventory/stats'),
    flow:      (days: number = 30) => api.get('/inventory/stats/flow', { params: { days } }),
    top:       (limit: number = 5) => api.get('/inventory/top', { params: { limit } }),
    adjust:    (id: string, body: object) => api.patch(`/inventory/${id}/adjust`, body),
    reserve:   (id: string, qty: number) => api.post(`/inventory/${id}/reserve`, null, { params: { quantity: qty } }),
  },
  orders: {
    list:    (params?: object)          => api.get('/orders', { params }),
    getById: (id: string)               => api.get(`/orders/${id}`),
    create:  (body: object)             => api.post('/orders', body),
    confirm: (id: string)               => api.post(`/orders/${id}/confirm`),
    ship:    (id: string, tracking: string) => api.post(`/orders/${id}/ship`, null, { params: { trackingNumber: tracking } }),
    deliver: (id: string)               => api.post(`/orders/${id}/deliver`),
    cancel:  (id: string, reason?: string) => api.post(`/orders/${id}/cancel`, null, { params: { reason } }),
    stats:   (params?: object)          => api.get('/orders/stats', { params }),
    trend:   (days: number = 30)        => api.get('/orders/stats/trend', { params: { days } }),
  },
  suppliers: {
    list:    (params?: object) => api.get('/suppliers', { params }),
    getById: (id: string)     => api.get(`/suppliers/${id}`),
    create:  (body: object)   => api.post('/suppliers', body),
    update:  (id: string, body: object) => api.put(`/suppliers/${id}`, body),
    approve: (id: string)     => api.post(`/suppliers/${id}/approve`),
    stats:   ()               => api.get('/suppliers/stats'),
  },
  logistics: {
    list:     (params?: object)         => api.get('/logistics/shipments', { params }),
    getById:  (id: string)              => api.get(`/logistics/shipments/${id}`),
    track:    (trackingNo: string)      => api.get(`/logistics/track/${trackingNo}`),
    create:   (body: object)            => api.post('/logistics/shipments', body),
    deliver:  (id: string)              => api.post(`/logistics/shipments/${id}/deliver`),
    delayed:  (params?: object)         => api.get('/logistics/shipments/delayed', { params }),
    stats:    ()                        => api.get('/logistics/stats'),
  },
  forecast: {
    demand:  (body: object) => api.post('/forecast/demand', body),
    batch:   (body: object) => api.post('/forecast/demand/batch', body),
    accuracy:(productId: string, days?: number) => api.get(`/forecast/demand/accuracy/${productId}`, { params: { days } }),
  },
  analytics: {
    overview: (period: string) => api.get('/analytics/overview', { params: { period } }),
  },
  finance: {
    stats: () => api.get('/finance/stats'),
  },
  quality: {
    inspections: (limit = 50) => api.get('/quality-inspections', { params: { limit } }),
  },
  compliance: {
    records: (limit = 50) => api.get('/compliance-records', { params: { limit } }),
  },
  warehouses: {
    list: () => api.get('/warehouses'),
  },
  procurement: {
    list:  (status?: string) => api.get('/purchase-orders', { params: status && status !== 'all' ? { status } : undefined }),
    stats: ()                => api.get('/purchase-orders/stats'),
  },
}
