import React, { useId } from 'react';

interface ParameterControlProps {
  label: string;
  symbol?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  helpText?: string;
  error?: string;
  onChange: (newValue: number) => void;
  theme?: 'dark' | 'light';
}

export const ParameterControl: React.FC<ParameterControlProps> = ({
  label,
  symbol,
  value,
  min,
  max,
  step,
  unit,
  helpText,
  error,
  onChange,
  theme = 'dark',
}) => {
  const id = useId();
  const numInputId = `${id}-num`;
  const rangeInputId = `${id}-range`;
  const isDark = theme === 'dark';

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  // Clamp slider position safely within [min, max] even if user typed outside range
  const sliderVal = Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={numInputId}
          className={`text-xs sm:text-sm font-medium flex items-center gap-1.5 ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}
        >
          <span>{label}</span>
          {symbol && (
            <span
              className={`font-mono text-xs ${
                isDark ? 'text-cyan-400' : 'text-sky-700'
              }`}
            >
              ({symbol})
            </span>
          )}
        </label>

        <div className="flex items-center gap-1.5">
          <input
            id={numInputId}
            type="number"
            value={Number.isFinite(value) ? value : ''}
            min={min}
            max={max}
            step={step}
            onChange={handleNumberChange}
            className={`w-24 px-2.5 py-1 text-right text-xs sm:text-sm font-mono tabular-nums rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-cyan-500 ${
              error
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : isDark
                  ? 'bg-slate-950 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
          {unit && (
            <span
              className={`text-xs font-mono ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      <input
        id={rangeInputId}
        type="range"
        aria-label={`${label} slider`}
        min={min}
        max={max}
        step={step}
        value={sliderVal}
        onChange={handleRangeChange}
        className="w-full h-1.5 rounded-lg cursor-pointer"
      />

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>Min: {min}</span>
        {helpText && <span className="font-sans text-slate-400">{helpText}</span>}
        <span>Max: {max}</span>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};
