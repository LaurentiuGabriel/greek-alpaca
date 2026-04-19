import type { ReactNode } from 'react';
import { classNames } from '../../utils/formatters';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function GlassCard({ children, className, title, subtitle, action }: GlassCardProps) {
  return (
    <div
      className={classNames(
        'rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm',
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
