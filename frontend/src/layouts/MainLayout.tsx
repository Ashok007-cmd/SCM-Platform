import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import {
  LayoutDashboard, Package, Users, ShoppingCart, Truck,
  Warehouse, TrendingUp, ClipboardList, ShieldCheck,
  DollarSign, Scale, BarChart3, Settings,
  Boxes, Bell, Search
} from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/dashboard',   icon: LayoutDashboard },
  { label: 'Inventory',   href: '/inventory',   icon: Package },
  { label: 'Suppliers',   href: '/suppliers',   icon: Users },
  { label: 'Orders',      href: '/orders',      icon: ShoppingCart },
  { label: 'Logistics',   href: '/logistics',   icon: Truck },
  { label: 'Warehouse',   href: '/warehouse',   icon: Warehouse },
  { label: 'Forecasting', href: '/forecasting', icon: TrendingUp },
  { label: 'Procurement', href: '/procurement', icon: ClipboardList },
  { label: 'Quality',     href: '/quality',     icon: ShieldCheck },
  { label: 'Finance',     href: '/finance',     icon: DollarSign },
  { label: 'Compliance',  href: '/compliance',  icon: Scale },
  { label: 'Analytics',   href: '/analytics',   icon: BarChart3 },
  { label: 'Settings',    href: '/settings',    icon: Settings },
]

// Page labels for the topbar
const PAGE_LABELS: Record<string, string> = NAV_ITEMS.reduce(
  (acc, { href, label }) => ({ ...acc, [href.slice(1)]: label }),
  {}
)

function AnimatedPage({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.animation = 'none'
      // Trigger reflow
      void ref.current.offsetHeight
      ref.current.style.animation = ''
    }
  }, [location.pathname])

  return (
    <div ref={ref} className="page-enter h-full">
      {children}
    </div>
  )
}

export default function MainLayout() {
  const location = useLocation()
  const currentPage = location.pathname.split('/')[1] ?? 'dashboard'

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="flex w-60 flex-col border-r border-gray-800/80 bg-gray-900 animate-slide-in-left">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800/80">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shrink-0"
               style={{ boxShadow: '0 0 16px rgba(59,130,246,0.4)' }}>
            <Boxes className="h-5 w-5 text-white" />
            {/* Animated pulse ring */}
            <span className="absolute inset-0 rounded-lg border-2 border-blue-400 opacity-0"
                  style={{ animation: 'pulse-ring 2.5s ease-out infinite' }} />
          </div>
          <div className="animate-fade-in delay-100">
            <p className="text-sm font-bold text-white tracking-tight">SCM Platform</p>
            <p className="text-xs text-gray-500">v1.0.0 · Production</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }, i) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                clsx(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 animate-slide-in-left',
                  isActive
                    ? 'nav-indicator bg-blue-600/15 text-blue-400 font-medium'
                    : 'text-gray-400 hover:bg-gray-800/70 hover:text-white'
                )
              }
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <Icon className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
              <span className="flex-1 truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Status indicator */}
        <div className="px-4 py-3 border-t border-gray-800/80">
          <div className="flex items-center gap-2 rounded-lg bg-green-500/8 border border-green-500/15 px-3 py-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs text-green-400">All systems operational</span>
          </div>
        </div>

        {/* User footer */}
        <div className="border-t border-gray-800/80 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold shrink-0"
                 style={{ boxShadow: '0 0 10px rgba(99,102,241,0.3)' }}>
              AK
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">Ashok Kumar</p>
              <p className="text-xs text-gray-500 truncate">Platform Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between h-14 px-6 border-b border-gray-800/80 bg-gray-900/60 backdrop-blur-sm shrink-0 animate-fade-in">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">SCM Platform</span>
            <span className="text-gray-700">/</span>
            <span className="text-white font-medium capitalize">
              {PAGE_LABELS[currentPage] ?? currentPage}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-150">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-150">
              <Search className="h-4 w-4" />
            </button>
            <div className="h-5 w-px bg-gray-800" />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              Live
            </div>
          </div>
        </header>

        {/* Page content with animated transition */}
        <main className="flex-1 overflow-y-auto">
          <AnimatedPage>
            <Outlet />
          </AnimatedPage>
        </main>
      </div>
    </div>
  )
}
