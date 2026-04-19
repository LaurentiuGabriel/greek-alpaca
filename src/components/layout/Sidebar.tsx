import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  Shield,
  Settings,
  Activity,
  Zap,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/greeks', icon: TrendingUp, label: 'Greeks' },
  { to: '/exposure', icon: PieChart, label: 'Exposure' },
  { to: '/hedging', icon: Shield, label: 'Hedging' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { isConnected, useMockData, isLoading, refresh } = usePortfolio();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0c0c14] border-r border-white/[0.06] flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">GreekFlow</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Portfolio Analytics</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-violet-500/10 text-violet-400 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-[18px] h-[18px] transition-colors ${
                    isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status & Refresh */}
      <div className="px-4 py-4 border-t border-white/[0.06] space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                : 'bg-rose-400 shadow-sm shadow-rose-400/50'
            }`}
          />
          <span className="text-slate-400">
            {useMockData ? 'Demo Mode' : isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <button
          onClick={refresh}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all disabled:opacity-50"
        >
          <Activity className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </aside>
  );
}
