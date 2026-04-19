export function formatCurrency(value: number, decimals = 2): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (abs >= 1_000) {
    return `$${(value / 1_000).toFixed(decimals)}K`;
  }
  return `$${value.toFixed(decimals)}`;
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatGreek(value: number, decimals = 4): string {
  if (Math.abs(value) < 0.0001) return '~0';
  return value.toFixed(decimals);
}

export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getChangeColor(value: number): string {
  if (value > 0) return 'text-emerald-400';
  if (value < 0) return 'text-rose-400';
  return 'text-slate-400';
}

export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'critical': return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
    case 'high': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    case 'medium': return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
    case 'low': return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
  }
}
