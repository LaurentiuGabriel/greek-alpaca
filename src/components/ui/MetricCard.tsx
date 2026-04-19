import type { ReactNode } from 'react';
import { classNames, getChangeColor } from '../../utils/formatters';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  icon?: ReactNode;
  accent?: 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate';
}

const accentStyles = {
  violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/20',
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
  amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
  rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20',
  sky: 'from-sky-500/20 to-sky-600/5 border-sky-500/20',
  slate: 'from-slate-500/10 to-slate-600/5 border-white/[0.08]',
};

const iconAccentStyles = {
  violet: 'bg-violet-500/15 text-violet-400',
  emerald: 'bg-emerald-500/15 text-emerald-400',
  amber: 'bg-amber-500/15 text-amber-400',
  rose: 'bg-rose-500/15 text-rose-400',
  sky: 'bg-sky-500/15 text-sky-400',
  slate: 'bg-slate-500/15 text-slate-400',
};

export default function MetricCard({ label, value, subValue, change, icon, accent = 'slate' }: MetricCardProps) {
  return (
    <div
      className={classNames(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-sm',
        accentStyles[accent]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
          <div className="flex items-center gap-2">
            {change !== undefined && (
              <span className={classNames('text-xs font-semibold', getChangeColor(change))}>
                {change > 0 ? '+' : ''}
                {change.toFixed(2)}%
              </span>
            )}
            {subValue && <span className="text-xs text-slate-500">{subValue}</span>}
          </div>
        </div>
        {icon && (
          <div className={classNames('p-2.5 rounded-xl', iconAccentStyles[accent])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
