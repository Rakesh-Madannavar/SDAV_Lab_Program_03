import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  theme?: 'dark' | 'light';
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  badgeText,
  actions,
  footer,
  children,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <section
      className={`rounded-xl border p-5 flex flex-col justify-between transition-colors ${
        isDark
          ? 'bg-slate-900/70 border-slate-800'
          : 'bg-white border-slate-200 shadow-2xs'
      }`}
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3
                className={`text-base font-semibold tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                {title}
              </h3>
              {badgeText && (
                <>
                  <span
                    aria-hidden="true"
                    className={isDark ? 'text-slate-600' : 'text-slate-400'}
                  >
                    ·
                  </span>
                  <span
                    className={`text-xs font-mono ${
                      isDark ? 'text-cyan-400' : 'text-sky-700'
                    }`}
                  >
                    {badgeText}
                  </span>
                </>
              )}
            </div>
            {subtitle && (
              <p
                className={`mt-1 text-xs sm:text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
        <div className="w-full">{children}</div>
      </div>

      {footer && (
        <div
          className={`mt-4 pt-3 border-t text-xs ${
            isDark
              ? 'border-slate-800/80 text-slate-400'
              : 'border-slate-200 text-slate-600'
          }`}
        >
          {footer}
        </div>
      )}
    </section>
  );
};
