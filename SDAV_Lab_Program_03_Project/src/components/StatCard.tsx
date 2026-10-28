import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  formula?: string;
  accent?: 'default' | 'cyan' | 'blue' | 'emerald' | 'amber';
  theme?: 'dark' | 'light';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  formula,
  accent = 'default',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const valueColor = (() => {
    if (accent === 'cyan') return isDark ? 'text-cyan-300' : 'text-sky-700';
    if (accent === 'blue') return isDark ? 'text-blue-300' : 'text-blue-700';
    if (accent === 'emerald') return isDark ? 'text-emerald-300' : 'text-emerald-700';
    if (accent === 'amber') return isDark ? 'text-amber-300' : 'text-amber-700';
    return isDark ? 'text-slate-100' : 'text-slate-900';
  })();

  const formattedValue =
    typeof value === 'string' && value === '-0.0000' ? '0.0000' : value;

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col justify-between transition-colors ${
        isDark
          ? 'bg-slate-900/70 border-slate-800'
          : 'bg-white border-slate-200 shadow-2xs'
      }`}
    >
      <div>
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <span
            title={label}
            className={`text-xs font-medium truncate ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {label}
          </span>
          {formula && (
            <span
              className={`text-[11px] font-mono whitespace-nowrap shrink-0 ${
                isDark ? 'text-slate-500' : 'text-slate-500'
              }`}
            >
              {formula}
            </span>
          )}
        </div>
        <div
          className={`text-xl sm:text-2xl font-semibold font-mono tabular-nums tracking-tight ${valueColor}`}
        >
          {formattedValue}
        </div>
      </div>
      {subValue && (
        <p
          className={`mt-1.5 text-xs leading-snug ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {subValue}
        </p>
      )}
    </div>
  );
};
