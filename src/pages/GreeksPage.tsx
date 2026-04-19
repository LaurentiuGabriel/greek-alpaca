import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from 'recharts';
import { usePortfolio } from '../context/PortfolioContext';
import GlassCard from '../components/ui/GlassCard';
import MetricCard from '../components/ui/MetricCard';
import { TrendingUp, Gauge, Clock, Waves, Percent } from 'lucide-react';

export default function GreeksPage() {
  const { positionGreeks, exposure } = usePortfolio();

  const pg = exposure?.portfolioGreeks;

  // Per-position delta chart data
  const deltaData = positionGreeks.map((p) => ({
    symbol: p.symbol,
    delta: p.greeks.delta * p.quantity,
    fill: p.greeks.delta * p.quantity >= 0 ? '#8b5cf6' : '#f43f5e',
  }));

  // Radar chart for portfolio Greeks (normalized)
  const maxAbsGreek = pg
    ? Math.max(
        Math.abs(pg.delta),
        Math.abs(pg.gamma * 1000),
        Math.abs(pg.theta),
        Math.abs(pg.vega),
        Math.abs(pg.rho)
      ) || 1
    : 1;

  const radarData = pg
    ? [
        { greek: 'Delta', value: Math.abs(pg.delta) / maxAbsGreek * 100, raw: pg.delta.toFixed(1) },
        { greek: 'Gamma', value: Math.abs(pg.gamma * 1000) / maxAbsGreek * 100, raw: pg.gamma.toFixed(4) },
        { greek: 'Theta', value: Math.abs(pg.theta) / maxAbsGreek * 100, raw: `$${pg.theta.toFixed(2)}` },
        { greek: 'Vega', value: Math.abs(pg.vega) / maxAbsGreek * 100, raw: `$${pg.vega.toFixed(2)}` },
        { greek: 'Rho', value: Math.abs(pg.rho) / maxAbsGreek * 100, raw: `$${pg.rho.toFixed(2)}` },
      ]
    : [];

  // Beta-weighted delta per position
  const betaData = positionGreeks.map((p) => ({
    symbol: p.symbol,
    betaDelta: p.greeks.delta * p.quantity * p.beta,
    beta: p.beta,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Greeks Analysis</h2>
        <p className="text-sm text-slate-500 mt-1">Option Greeks and risk sensitivities across your portfolio</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard
          label="Portfolio Delta"
          value={pg?.delta.toFixed(1) ?? '0'}
          subValue="Directional risk"
          icon={<TrendingUp className="w-5 h-5" />}
          accent="violet"
        />
        <MetricCard
          label="Portfolio Gamma"
          value={pg?.gamma.toFixed(4) ?? '0'}
          subValue="Convexity"
          icon={<Gauge className="w-5 h-5" />}
          accent="sky"
        />
        <MetricCard
          label="Portfolio Theta"
          value={`$${pg?.theta.toFixed(2) ?? '0'}`}
          subValue="Per day"
          icon={<Clock className="w-5 h-5" />}
          accent="amber"
        />
        <MetricCard
          label="Portfolio Vega"
          value={`$${pg?.vega.toFixed(2) ?? '0'}`}
          subValue="Per 1% vol"
          icon={<Waves className="w-5 h-5" />}
          accent="emerald"
        />
        <MetricCard
          label="Portfolio Rho"
          value={`$${pg?.rho.toFixed(2) ?? '0'}`}
          subValue="Per 1% rate"
          icon={<Percent className="w-5 h-5" />}
          accent="rose"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delta per Position */}
        <GlassCard title="Delta by Position" subtitle="Dollar delta contribution">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deltaData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="symbol"
                  tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                  labelStyle={{ color: '#94a3b8', fontSize: 12 }}
                  formatter={(value) => [Number(value).toFixed(1), 'Delta']}
                />
                <Bar dataKey="delta" radius={[0, 6, 6, 0]} barSize={20}>
                  {deltaData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Greeks Radar */}
        <GlassCard title="Greeks Profile" subtitle="Normalized portfolio risk shape">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="greek"
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  tick={{ fill: '#475569', fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="Greeks"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                  formatter={(_value, _name, props) => [(props as unknown as { payload: { raw: string } }).payload.raw, 'Value']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Beta-weighted Delta */}
      <GlassCard title="Beta-Weighted Delta" subtitle="Market-risk adjusted delta (SPY-equivalent)">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={betaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="symbol"
                tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value, name) => {
                  if (name === 'betaDelta') return [Number(value).toFixed(1), 'Beta-Weighted Delta'];
                  return [Number(value).toFixed(2), 'Beta'];
                }}
              />
              <Bar dataKey="betaDelta" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Greeks Table */}
      <GlassCard title="Per-Position Greeks" subtitle="Detailed breakdown by position">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Symbol</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Qty</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Beta</th>
                <th className="text-right text-xs font-medium text-violet-400/70 uppercase tracking-wider pb-3">Delta</th>
                <th className="text-right text-xs font-medium text-sky-400/70 uppercase tracking-wider pb-3">Gamma</th>
                <th className="text-right text-xs font-medium text-amber-400/70 uppercase tracking-wider pb-3">Theta</th>
                <th className="text-right text-xs font-medium text-emerald-400/70 uppercase tracking-wider pb-3">Vega</th>
                <th className="text-right text-xs font-medium text-rose-400/70 uppercase tracking-wider pb-3">Rho</th>
                <th className="text-right text-xs font-medium text-indigo-400/70 uppercase tracking-wider pb-3">Beta-Wtd Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {positionGreeks.map((pg) => (
                <tr key={pg.symbol} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 text-sm font-semibold text-white">{pg.symbol}</td>
                  <td className="py-3 text-right text-sm text-slate-300 font-mono">{pg.quantity}</td>
                  <td className="py-3 text-right text-sm text-slate-300 font-mono">{pg.beta.toFixed(2)}</td>
                  <td className="py-3 text-right text-sm text-violet-400 font-mono font-medium">
                    {(pg.greeks.delta * pg.quantity).toFixed(1)}
                  </td>
                  <td className="py-3 text-right text-sm text-sky-400 font-mono">
                    {(pg.greeks.gamma * pg.quantity).toFixed(4)}
                  </td>
                  <td className="py-3 text-right text-sm text-amber-400 font-mono">
                    ${(pg.greeks.theta * pg.quantity).toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-sm text-emerald-400 font-mono">
                    ${(pg.greeks.vega * pg.quantity).toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-sm text-rose-400 font-mono">
                    ${(pg.greeks.rho * pg.quantity).toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-sm text-indigo-400 font-mono font-medium">
                    {(pg.greeks.delta * pg.quantity * pg.beta).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-white/[0.08]">
                <td className="py-3 text-sm font-bold text-white" colSpan={3}>Portfolio Total</td>
                <td className="py-3 text-right text-sm text-violet-400 font-mono font-bold">
                  {exposure?.portfolioGreeks.delta.toFixed(1)}
                </td>
                <td className="py-3 text-right text-sm text-sky-400 font-mono font-bold">
                  {exposure?.portfolioGreeks.gamma.toFixed(4)}
                </td>
                <td className="py-3 text-right text-sm text-amber-400 font-mono font-bold">
                  ${exposure?.portfolioGreeks.theta.toFixed(2)}
                </td>
                <td className="py-3 text-right text-sm text-emerald-400 font-mono font-bold">
                  ${exposure?.portfolioGreeks.vega.toFixed(2)}
                </td>
                <td className="py-3 text-right text-sm text-rose-400 font-mono font-bold">
                  ${exposure?.portfolioGreeks.rho.toFixed(2)}
                </td>
                <td className="py-3 text-right text-sm text-indigo-400 font-mono font-bold">
                  {exposure?.betaWeightedDelta.toFixed(1)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
