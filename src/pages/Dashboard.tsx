import {
  DollarSign,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePortfolio } from '../context/PortfolioContext';
import MetricCard from '../components/ui/MetricCard';
import GlassCard from '../components/ui/GlassCard';
import { formatCurrency, getChangeColor } from '../utils/formatters';
import { generateMockPortfolioHistory } from '../utils/mockData';

const portfolioHistory = generateMockPortfolioHistory(30);

const chartData = portfolioHistory.timestamps.map((ts, i) => ({
  date: new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  equity: portfolioHistory.equity[i],
  pl: portfolioHistory.profitLoss[i],
}));

export default function Dashboard() {
  const { account, positions, exposure, recommendations } = usePortfolio();

  const portfolioValue = account ? parseFloat(account.portfolio_value) : 0;
  const lastEquity = account ? parseFloat(account.last_equity) : 0;
  const dailyPL = portfolioValue - lastEquity;
  const dailyPLPct = lastEquity > 0 ? (dailyPL / lastEquity) * 100 : 0;
  const cash = account ? parseFloat(account.cash) : 0;
  const buyingPower = account ? parseFloat(account.buying_power) : 0;

  const criticalRecs = recommendations.filter((r) => r.urgency === 'critical' || r.urgency === 'high');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Portfolio overview and key metrics</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Portfolio Value"
          value={formatCurrency(portfolioValue)}
          change={dailyPLPct}
          subValue={`${dailyPL >= 0 ? '+' : ''}${formatCurrency(dailyPL)} today`}
          icon={<DollarSign className="w-5 h-5" />}
          accent="violet"
        />
        <MetricCard
          label="Buying Power"
          value={formatCurrency(buyingPower)}
          subValue={`${formatCurrency(cash)} cash`}
          icon={<TrendingUp className="w-5 h-5" />}
          accent="emerald"
        />
        <MetricCard
          label="Net Exposure"
          value={exposure ? formatCurrency(exposure.netExposure) : '$0'}
          subValue={exposure ? `${((exposure.netExposure / exposure.totalValue) * 100).toFixed(0)}% of portfolio` : ''}
          icon={<BarChart3 className="w-5 h-5" />}
          accent="sky"
        />
        <MetricCard
          label="Active Alerts"
          value={`${criticalRecs.length}`}
          subValue={`${recommendations.length} total recommendations`}
          icon={
            criticalRecs.length > 0 ? (
              <ArrowDownRight className="w-5 h-5" />
            ) : (
              <ArrowUpRight className="w-5 h-5" />
            )
          }
          accent={criticalRecs.length > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Chart + Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Chart */}
        <GlassCard title="Portfolio Equity" subtitle="30-day performance" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                  labelStyle={{ color: '#94a3b8', fontSize: 12 }}
                  itemStyle={{ color: '#a78bfa', fontSize: 13, fontWeight: 600 }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Equity']}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#equityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Portfolio Greeks Summary */}
        <GlassCard title="Portfolio Greeks" subtitle="Aggregate risk metrics">
          <div className="space-y-4">
            {exposure && (
              <>
                <GreekRow label="Delta" value={exposure.portfolioGreeks.delta.toFixed(1)} desc="Directional exposure" color="text-violet-400" />
                <GreekRow label="Gamma" value={exposure.portfolioGreeks.gamma.toFixed(4)} desc="Delta acceleration" color="text-sky-400" />
                <GreekRow label="Theta" value={`$${exposure.portfolioGreeks.theta.toFixed(2)}`} desc="Daily time decay" color="text-amber-400" />
                <GreekRow label="Vega" value={`$${exposure.portfolioGreeks.vega.toFixed(2)}`} desc="Volatility sensitivity" color="text-emerald-400" />
                <GreekRow label="Rho" value={`$${exposure.portfolioGreeks.rho.toFixed(2)}`} desc="Rate sensitivity" color="text-rose-400" />
                <div className="pt-3 mt-3 border-t border-white/[0.06]">
                  <GreekRow
                    label="Beta-Wtd Delta"
                    value={exposure.betaWeightedDelta.toFixed(1)}
                    desc="SPY-equivalent shares"
                    color="text-indigo-400"
                  />
                </div>
              </>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Positions Table */}
      <GlassCard title="Positions" subtitle={`${positions.length} active positions`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 pr-4">Symbol</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 px-4">Qty</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 px-4">Price</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 px-4">Market Value</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 px-4">Unrealized P&L</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 px-4">Today</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 pl-4">% of Portfolio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {positions.map((pos) => {
                const mv = parseFloat(pos.market_value);
                const pl = parseFloat(pos.unrealized_pl);
                const plPct = parseFloat(pos.unrealized_plpc) * 100;
                const todayPct = parseFloat(pos.change_today) * 100;
                const weight = exposure ? (Math.abs(mv) / exposure.totalValue) * 100 : 0;

                return (
                  <tr key={pos.symbol} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-violet-300">{pos.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{pos.symbol}</p>
                          <p className="text-[10px] text-slate-500">{pos.exchange}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-300 font-mono">{parseFloat(pos.qty).toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-300 font-mono">${parseFloat(pos.current_price).toFixed(2)}</td>
                    <td className="text-right py-3 px-4 text-sm text-white font-mono font-medium">{formatCurrency(mv)}</td>
                    <td className="text-right py-3 px-4">
                      <span className={`text-sm font-mono font-medium ${getChangeColor(pl)}`}>
                        {pl >= 0 ? '+' : ''}{formatCurrency(pl)}
                      </span>
                      <span className={`block text-[10px] font-mono ${getChangeColor(plPct)}`}>
                        {plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className={`text-sm font-mono ${getChangeColor(todayPct)}`}>
                        {todayPct >= 0 ? '+' : ''}{todayPct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-right py-3 pl-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                            style={{ width: `${Math.min(weight, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 font-mono w-12 text-right">{weight.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function GreekRow({ label, value, desc, color }: { label: string; value: string; desc: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-semibold ${color}`}>{label}</p>
        <p className="text-[10px] text-slate-500">{desc}</p>
      </div>
      <p className="text-sm font-bold text-white font-mono">{value}</p>
    </div>
  );
}
