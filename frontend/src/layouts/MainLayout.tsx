import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, Users, ShoppingCart, Truck,
  Warehouse, TrendingUp, ClipboardList, ShieldCheck,
  DollarSign, Scale, BarChart3, Settings, ChevronRight,
  Boxes
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

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-gray-800 bg-gray-900">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <Boxes className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">SCM Platform</p>
            <p className="text-xs text-gray-500">v1.0.0 · Production</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-800 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
              AK
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">Ashok Kumar</p>
              <p className="text-xs text-gray-500 truncate">Platform Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
