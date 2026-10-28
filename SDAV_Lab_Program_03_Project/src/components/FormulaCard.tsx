import React from 'react';

interface FormulaCardProps {
  title: string;
  formula: string;
  description: string;
  variables?: { symbol: string; meaning: string }[];
  theme?: 'dark' | 'light';
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  title,
  formula,
  description,
  variables,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col justify-between ${
        isDark
          ? 'bg-slate-900/60 border-slate-800'
          : 'bg-white border-slate-200 shadow-2xs'
      }`}
    >
      <div>
        <h4
          className={`text-sm font-semibold mb-2 ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}
        >
          {title}
        </h4>
        <div
          className={`px-3.5 py-2.5 rounded-lg font-mono text-xs sm:text-sm overflow-x-auto mb-3 border ${
            isDark
              ? 'bg-slate-950/90 border-slate-800/90 text-cyan-300'
              : 'bg-slate-50 border-slate-200 text-sky-900'
          }`}
        >
          {formula}
        </div>
        <p
          className={`text-xs leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {description}
        </p>
      </div>

      {variables && variables.length > 0 && (
        <div
          className={`mt-3 pt-2.5 border-t grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs ${
            isDark ? 'border-slate-800/70' : 'border-slate-200'
          }`}
        >
          {variables.map((v) => (
            <div key={v.symbol} className="flex items-baseline gap-1.5">
              <span
                className={`font-mono font-medium ${
                  isDark ? 'text-cyan-400' : 'text-sky-700'
                }`}
              >
                {v.symbol}:
              </span>
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                {v.meaning}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
