import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Treemap,
} from 'recharts';
import { usePortfolio } from '../context/PortfolioContext';
import GlassCard from '../components/ui/GlassCard';
import MetricCard from '../components/ui/MetricCard';
import { ArrowUpRight, ArrowDownRight, Scale, Layers } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { getSector } from '../utils/exposure';
const SECTOR_COLORS: Record<string, string> = {
  Technology: '#8b5cf6',
  'Consumer Discretionary': '#f59e0b',
  Financials: '#10b981',
  Healthcare: '#06b6d4',
  Energy: '#ef4444',
  'Consumer Staples': '#84cc16',
  Industrials: '#f97316',
  'Communication Services': '#ec4899',
  Utilities: '#6366f1',
  'Real Estate': '#14b8a6',
  Materials: '#a855f7',
  'Index/ETF': '#3b82f6',
  Volatility: '#dc2626',
  Other: '#64748b',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomizedContent = (props: any) => {
  const { x, y, width, height, name, value } = props as {
    x: number; y: number; width: number; height: number;
    name: string; value: number;
  };
  if (width < 40 || height < 30) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={4}
        style={{ fill: SECTOR_COLORS[name] || '#64748b', fillOpacity: 0.7, stroke: '#0a0a0f', strokeWidth: 2 }}
      />
      {width > 60 && height > 40 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle"
            fill="#fff" fontSize={11} fontWeight={600}>
            {name}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle"
            fill="rgba(255,255,255,0.6)" fontSize={10}>
            {formatCurrency(value)}
          </text>
        </>
      )}
    </g>
  );
};

export default function ExposurePage() {
  const { positions, exposure } = usePortfolio();

  if (!exposure) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-500">
        Loading exposure data...
      </div>
    );
  }

  // Pie chart data
  const pieData = exposure.sectorExposures.map((s) => ({
    name: s.sector,
    value: Math.abs(s.value),
    color: SECTOR_COLORS[s.sector] || '#64748b',
  }));

  // Position-level treemap data
  const treemapData = positions.map((p) => ({
    name: p.symbol,
    size: Math.abs(parseFloat(p.market_value)),
    sector: getSector(p.symbol),
  }));

  // Sector data for treemap
  const sectorTreemap = exposure.sectorExposures.map((s) => ({
    name: s.sector,
    value: Math.abs(s.value),
  }));

  // Long vs short bar data
  const exposureBarData = [
    { name: 'Long', value: exposure.longExposure, fill: '#10b981' },
    { name: 'Short', value: exposure.shortExposure, fill: '#ef4444' },
    { name: 'Net', value: exposure.netExposure, fill: '#8b5cf6' },
    { name: 'Gross', value: exposure.grossExposure, fill: '#f59e0b' },
  ];

  const netRatio = exposure.totalValue > 0 ? (exposure.netExposure / exposure.totalValue) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Portfolio Exposure</h2>
        <p className="text-sm text-slate-500 mt-1">Analyze concentration, sector allocation, and directional risk</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Long Exposure"
          value={formatCurrency(exposure.longExposure)}
          icon={<ArrowUpRight className="w-5 h-5" />}
          accent="emerald"
        />
        <MetricCard
          label="Short Exposure"
          value={formatCurrency(exposure.shortExposure)}
          icon={<ArrowDownRight className="w-5 h-5" />}
          accent="rose"
        />
        <MetricCard
          label="Net Exposure"
          value={formatCurrency(exposure.netExposure)}
          subValue={`${netRatio.toFixed(0)}% of portfolio`}
          icon={<Scale className="w-5 h-5" />}
          accent="violet"
        />
        <MetricCard
          label="Leverage Ratio"
          value={`${exposure.leverageRatio.toFixed(2)}x`}
          subValue={formatCurrency(exposure.grossExposure) + ' gross'}
          icon={<Layers className="w-5 h-5" />}
          accent="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Pie */}
        <GlassCard title="Sector Allocation" subtitle="Percentage of total portfolio">
          <div className="h-80 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/2 space-y-2 pl-4">
              {exposure.sectorExposures.map((s) => (
                <div key={s.sector} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: SECTOR_COLORS[s.sector] || '#64748b' }}
                  />
                  <span className="text-xs text-slate-400 truncate flex-1">{s.sector}</span>
                  <span className="text-xs font-mono text-white font-medium">{s.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Exposure Bars */}
        <GlassCard title="Exposure Breakdown" subtitle="Long, short, net, and gross">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exposureBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), 'Value']}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={48}>
                  {exposureBarData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Treemap */}
      <GlassCard title="Position Treemap" subtitle="Visual representation of portfolio weights by sector">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={sectorTreemap}
              dataKey="value"
              aspectRatio={4 / 3}
              content={<CustomizedContent />}
            />
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Sector Details Table */}
      <GlassCard title="Sector Breakdown" subtitle="Detailed sector exposure">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Sector</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Value</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">% of Portfolio</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 pl-6">Positions</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {exposure.sectorExposures.map((sector) => (
                <tr key={sector.sector} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: SECTOR_COLORS[sector.sector] || '#64748b' }}
                      />
                      <span className="text-sm font-medium text-white">{sector.sector}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-sm text-slate-300 font-mono">{formatCurrency(sector.value)}</td>
                  <td className="py-3 text-right text-sm text-white font-mono font-medium">{sector.percentage.toFixed(1)}%</td>
                  <td className="py-3 pl-6">
                    <div className="flex flex-wrap gap-1.5">
                      {sector.positions.map((sym) => (
                        <span
                          key={sym}
                          className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-white/[0.06] text-slate-300 border border-white/[0.08]"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(sector.percentage, 100)}%`,
                            backgroundColor: SECTOR_COLORS[sector.sector] || '#64748b',
                            opacity: 0.8,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Hidden reference to prevent unused variable warning */}
        <div className="hidden">{treemapData.length}</div>
      </GlassCard>
    </div>
  );
}
