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
})

// ─── Request interceptor — attach JWT ─────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('scm_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor — handle 401 / errors ──────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Clear session and redirect to login
      localStorage.removeItem('scm_access_token')
      window.location.replace('/#/login')
    }

    if (status === 403) {
      console.warn('[SCM API] Forbidden — insufficient permissions')
    }

    if (status >= 500) {
      console.error('[SCM API] Server error', error.response?.data)
    }

    return Promise.reject(error)
  }
)

// ─── Typed helper wrappers ────────────────────────────────────
export const scmApi = {
  inventory: {
    list:      (params?: object) => api.get('/inventory', { params }),
    getById:   (id: string)      => api.get(`/inventory/${id}`),
    lowStock:  (params?: object) => api.get('/inventory/low-stock', { params }),
    stats:     ()                => api.get('/inventory/stats'),
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
}
