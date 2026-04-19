import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Target,
  DollarSign,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import GlassCard from '../components/ui/GlassCard';
import { formatCurrency, getUrgencyColor, classNames } from '../utils/formatters';
import type { HedgeRecommendation, HedgeUrgency } from '../types';

const urgencyLabels: Record<HedgeUrgency, string> = {
  critical: 'Critical',
  high: 'High Priority',
  medium: 'Medium',
  low: 'Low',
};

const urgencyIcons: Record<HedgeUrgency, typeof AlertTriangle> = {
  critical: AlertTriangle,
  high: AlertTriangle,
  medium: Shield,
  low: Shield,
};

const strategyIcons: Record<string, typeof Shield> = {
  protective_put: Shield,
  covered_call: DollarSign,
  collar: Target,
  spread: TrendingDown,
  index_hedge: TrendingDown,
  pair_trade: ArrowRight,
  reduce_position: TrendingDown,
};

function RecommendationCard({ rec }: { rec: HedgeRecommendation }) {
  const [expanded, setExpanded] = useState(false);

  const UrgencyIcon = urgencyIcons[rec.urgency];
  const StrategyIcon = strategyIcons[rec.strategy] || Shield;

  return (
    <div
      className={classNames(
        'rounded-2xl border transition-all duration-300',
        getUrgencyColor(rec.urgency),
        expanded ? 'shadow-lg' : ''
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 p-5 text-left"
      >
        <div
          className={classNames(
            'p-2.5 rounded-xl shrink-0 mt-0.5',
            rec.urgency === 'critical'
              ? 'bg-rose-500/20'
              : rec.urgency === 'high'
              ? 'bg-amber-500/20'
              : rec.urgency === 'medium'
              ? 'bg-sky-500/20'
              : 'bg-slate-500/20'
          )}
        >
          <StrategyIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={classNames(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                getUrgencyColor(rec.urgency)
              )}
            >
              <UrgencyIcon className="w-3 h-3" />
              {urgencyLabels[rec.urgency]}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
              {rec.strategy.replace(/_/g, ' ')}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-white">{rec.title}</h4>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{rec.description}</p>

          {/* Quick stats */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Target className="w-3 h-3" />
              <span>
                Target: <span className="text-slate-300 font-medium">{rec.targetGreek}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <TrendingDown className="w-3 h-3" />
              <span>
                Risk reduction: <span className="text-emerald-400 font-medium">{rec.riskReduction.toFixed(0)}%</span>
              </span>
            </div>
            {rec.estimatedCost > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <DollarSign className="w-3 h-3" />
                <span>
                  Est. cost: <span className="text-slate-300 font-medium">{formatCurrency(rec.estimatedCost)}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 text-slate-500">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expanded Actions */}
      {expanded && (
        <div className="px-5 pb-5 pt-0">
          <div className="border-t border-white/[0.06] pt-4 space-y-3">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Recommended Actions</p>
            {rec.actions.map((action, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              >
                <div
                  className={classNames(
                    'px-2 py-1 rounded-lg text-[10px] font-bold uppercase shrink-0',
                    action.action === 'buy'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-rose-500/15 text-rose-400'
                  )}
                >
                  {action.action}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{action.instrument}</span>
                    <span className="text-xs text-slate-500">x{action.quantity}</span>
                    <span className="text-xs text-slate-500">@ ~${action.estimatedPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{action.rationale}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono font-medium text-white">
                    {formatCurrency(action.estimatedPrice * action.quantity)}
                  </p>
                  <p className="text-[10px] text-slate-500">est. notional</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HedgingPage() {
  const { recommendations, exposure } = usePortfolio();
  const [filter, setFilter] = useState<'all' | HedgeUrgency>('all');

  const filtered =
    filter === 'all' ? recommendations : recommendations.filter((r) => r.urgency === filter);

  const criticalCount = recommendations.filter((r) => r.urgency === 'critical').length;
  const highCount = recommendations.filter((r) => r.urgency === 'high').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Hedging Recommendations</h2>
        <p className="text-sm text-slate-500 mt-1">AI-powered suggestions to reduce portfolio risk</p>
      </div>

      {/* Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-500/15">
              <Zap className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total Recommendations</p>
              <p className="text-2xl font-bold text-white mt-1">{recommendations.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-500/15">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Critical / High</p>
              <p className="text-2xl font-bold text-white mt-1">
                {criticalCount + highCount}
                <span className="text-sm text-slate-500 ml-2">
                  {criticalCount > 0 && `${criticalCount} critical`}
                  {criticalCount > 0 && highCount > 0 && ', '}
                  {highCount > 0 && `${highCount} high`}
                </span>
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/15">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Portfolio Risk Score</p>
              <p className="text-2xl font-bold text-white mt-1">
                {exposure
                  ? Math.min(100, Math.round(
                      (Math.abs(exposure.portfolioGreeks.delta) / 10 +
                        criticalCount * 25 +
                        highCount * 15) *
                        0.8
                    ))
                  : 0}
                <span className="text-sm text-slate-500 ml-1">/ 100</span>
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={classNames(
              'px-4 py-2 rounded-xl text-xs font-medium transition-all',
              filter === f
                ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
            )}
          >
            {f === 'all' ? 'All' : urgencyLabels[f]}
            <span className="ml-1.5 text-slate-500">
              ({f === 'all' ? recommendations.length : recommendations.filter((r) => r.urgency === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <GlassCard>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="w-12 h-12 text-emerald-400/50 mb-4" />
              <p className="text-sm font-medium text-white">No recommendations in this category</p>
              <p className="text-xs text-slate-500 mt-1">Your portfolio looks well-hedged for this risk level</p>
            </div>
          </GlassCard>
        ) : (
          filtered.map((rec) => <RecommendationCard key={rec.id} rec={rec} />)
        )}
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-amber-400">Disclaimer</p>
            <p className="text-xs text-amber-400/60 mt-1">
              These recommendations are generated algorithmically based on portfolio Greeks and exposure analysis.
              They are not financial advice. Always consult with a qualified financial advisor before making
              hedging decisions. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
