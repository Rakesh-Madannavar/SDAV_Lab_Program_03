import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { RotateCcw } from 'lucide-react';
import {
  exponentialPDF,
  exponentialCDF,
  exponentialSurvival,
  exponentialIntervalProb,
  exponentialMoments,
  verifyMemorylessProperty,
} from '../utils/distributions';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { ParameterControl } from '../components/ParameterControl';

interface ExponentialDistributionProps {
  theme: 'dark' | 'light';
}

const RATE_CURVES = [
  { id: 'r05', label: 'λ = 0.5 (β = 2.0)', rate: 0.5, color: '#38bdf8' },
  { id: 'r10', label: 'λ = 1.0 (β = 1.0)', rate: 1.0, color: '#34d399' },
  { id: 'r20', label: 'λ = 2.0 (β = 0.5)', rate: 2.0, color: '#fbbf24' },
  { id: 'r30', label: 'λ = 3.0 (β = 0.33)', rate: 3.0, color: '#f472b6' },
] as const;

export const ExponentialDistribution: React.FC<
  ExponentialDistributionProps
> = ({ theme }) => {
  const isDark = theme === 'dark';

  // Primary rate parameter λ > 0
  const [rate, setRate] = useState<number>(1.0);

  // Threshold t for P(X > t) and P(X <= t)
  const [thresholdT, setThresholdT] = useState<number>(2.0);

  // Interval bounds [a, b]
  const [boundA, setBoundA] = useState<number>(0.5);
  const [boundB, setBoundB] = useState<number>(2.5);

  // Memoryless property controls: default λ = 1, s = 1, t = 2 -> P(X > 3 | X > 1) = P(X > 2)
  const [memLambda, setMemLambda] = useState<number>(1.0);
  const [memS, setMemS] = useState<number>(1.0);
  const [memT, setMemT] = useState<number>(2.0);

  // Toggleable comparison rate curves
  const [visibleRates, setVisibleRates] = useState<Record<string, boolean>>({
    r05: true,
    r10: true,
    r20: true,
    r30: true,
  });

  // Validation
  const rateError =
    !(rate > 0) || !Number.isFinite(rate)
      ? 'Rate parameter λ must be strictly greater than 0.'
      : undefined;
  const intervalError =
    boundA > boundB
      ? 'Lower bound a must not exceed upper bound b.'
      : boundA < 0
        ? 'Bounds must be non-negative (x ≥ 0).'
        : undefined;
  const memError =
    !(memLambda > 0)
      ? 'Memoryless rate λ must be > 0.'
      : memS < 0 || memT < 0
        ? 'Waiting times s and t must be ≥ 0.'
        : undefined;

  const safeRate = rateError ? 1.0 : rate;
  const safeT = Math.max(0, thresholdT);
  const safeA = Math.max(0, intervalError ? Math.min(boundA, boundB) : boundA);
  const safeB = Math.max(0, intervalError ? Math.max(boundA, boundB) : boundB);

  const safeMemLambda = memLambda > 0 ? memLambda : 1.0;
  const safeMemS = Math.max(0, memS);
  const safeMemT = Math.max(0, memT);

  const handleReset = () => {
    setRate(1.0);
    setThresholdT(2.0);
    setBoundA(0.5);
    setBoundB(2.5);
    setMemLambda(1.0);
    setMemS(1.0);
    setMemT(2.0);
    setVisibleRates({ r05: true, r10: true, r20: true, r30: true });
  };

  const toggleRateCurve = (id: string) => {
    setVisibleRates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const moments = useMemo(() => exponentialMoments(safeRate), [safeRate]);
  const probLeT = exponentialCDF(safeT, safeRate);
  const probGtT = exponentialSurvival(safeT, safeRate);
  const probInterval = exponentialIntervalProb(safeA, safeB, safeRate);

  const memoryless = useMemo(
    () => verifyMemorylessProperty(safeMemLambda, safeMemS, safeMemT),
    [safeMemLambda, safeMemS, safeMemT]
  );

  // PDF Chart Data
  const pdfData = useMemo(() => {
    const maxX = Math.max(6, Math.min(14, 5 / safeRate));
    const steps = 100;
    const dx = maxX / steps;
    const pts = [];

    for (let i = 0; i <= steps; i++) {
      const xv = Number((i * dx).toFixed(3));
      const activePdf = Number(exponentialPDF(xv, safeRate).toFixed(5));
      const inInterval = xv >= safeA && xv <= safeB;
      pts.push({
        x: xv,
        activePdf,
        shadedInterval: inInterval ? activePdf : null,
        r05: Number(exponentialPDF(xv, 0.5).toFixed(5)),
        r10: Number(exponentialPDF(xv, 1.0).toFixed(5)),
        r20: Number(exponentialPDF(xv, 2.0).toFixed(5)),
        r30: Number(exponentialPDF(xv, 3.0).toFixed(5)),
      });
    }
    return pts;
  }, [safeRate, safeA, safeB]);

  // CDF & Survival Chart Data
  const cdfSurvivalData = useMemo(() => {
    const maxX = Math.max(6, Math.min(14, 5 / safeRate));
    const steps = 90;
    const dx = maxX / steps;
    const pts = [];

    for (let i = 0; i <= steps; i++) {
      const xv = Number((i * dx).toFixed(3));
      pts.push({
        x: xv,
        cdf: Number(exponentialCDF(xv, safeRate).toFixed(5)),
        survival: Number(exponentialSurvival(xv, safeRate).toFixed(5)),
      });
    }
    return pts;
  }, [safeRate]);

  // Memoryless Property Chart Data
  const memorylessChartData = useMemo(() => {
    const maxX = Math.max(5, safeMemS + safeMemT + 2);
    const steps = 90;
    const dx = maxX / steps;
    const pts = [];

    for (let i = 0; i <= steps; i++) {
      const xv = Number((i * dx).toFixed(3));
      const unconditional = Number(
        exponentialSurvival(xv, safeMemLambda).toFixed(6)
      );
      const conditionalShifted =
        xv >= safeMemS
          ? Number(
              exponentialSurvival(xv - safeMemS, safeMemLambda).toFixed(6)
            )
          : null;
      pts.push({
        x: xv,
        unconditional,
        conditionalShifted,
      });
    }
    return pts;
  }, [safeMemLambda, safeMemS, safeMemT]);

  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const axisColor = isDark ? '#94a3b8' : '#475569';
  const tooltipStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#cbd5e1',
    color: isDark ? '#f1f5f9' : '#0f172a',
    fontSize: '12px',
    borderRadius: '8px',
  };

  return (
    <div className="space-y-8">
      {/* Header & Formula Banner */}
      <div
        className={`rounded-xl border p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          isDark
            ? 'bg-slate-900/60 border-slate-800'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div className="space-y-1">
          <h1
            className={`text-xl sm:text-2xl font-bold tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            Exponential Distribution &amp; Memoryless Property Explorer
          </h1>
          <p
            className={`text-xs sm:text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Continuous waiting-time model parameterized by event rate λ &gt; 0 (or scale β = 1/λ).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`px-3.5 py-2 rounded-lg font-mono text-xs sm:text-sm border ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-cyan-300'
                : 'bg-slate-50 border-slate-200 text-sky-900'
            }`}
          >
            f(x) = λ exp(−λx),  F(x) = 1 − exp(−λx),  S(x) = exp(−λx)
          </div>
          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Summary Moments & Rate/Scale Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Rate Parameter"
          formula="λ"
          value={moments.rate.toFixed(4)}
          subValue="Events per unit time"
          accent="cyan"
          theme={theme}
        />
        <StatCard
          label="Scale Parameter"
          formula="β = 1 / λ"
          value={moments.scale.toFixed(4)}
          subValue="SciPy scale convention"
          accent="blue"
          theme={theme}
        />
        <StatCard
          label="Mean Waiting Time"
          formula="E[X] = 1 / λ"
          value={moments.mean.toFixed(4)}
          subValue="Equals scale β"
          accent="default"
          theme={theme}
        />
        <StatCard
          label="Variance"
          formula="Var(X) = 1 / λ²"
          value={moments.variance.toFixed(4)}
          subValue="Squared scale β²"
          accent="default"
          theme={theme}
        />
        <StatCard
          label="Standard Deviation"
          formula="SD(X) = 1 / λ"
          value={moments.stdDev.toFixed(4)}
          subValue="Identical to mean 1/λ"
          accent="default"
          theme={theme}
        />
        <StatCard
          label="Interval P(a ≤ X ≤ b)"
          formula={`[${safeA.toFixed(2)}, ${safeB.toFixed(2)}]`}
          value={`${(probInterval * 100).toFixed(2)}%`}
          subValue={`Prob = ${probInterval.toFixed(5)}`}
          accent="emerald"
          theme={theme}
        />
      </div>

      {/* Main Sandbox: Controls + Interactive PDF & CDF/Survival */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column (4 cols) */}
        <div
          className={`lg:col-span-4 rounded-xl border p-5 space-y-6 ${
            isDark
              ? 'bg-slate-900/70 border-slate-800'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div>
            <h2
              className={`text-sm font-semibold mb-3 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              1. Rate &amp; Scale Parameterization
            </h2>
            <ParameterControl
              label="Rate Parameter"
              symbol="λ"
              value={rate}
              min={0.2}
              max={5.0}
              step={0.1}
              unit="events/t"
              helpText={`Scale β = 1/λ = ${moments.scale.toFixed(3)}`}
              error={rateError}
              onChange={setRate}
              theme={theme}
            />
          </div>

          <div
            className={`pt-4 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <h2
              className={`text-sm font-semibold mb-3 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              2. Cumulative &amp; Survival Threshold (t)
            </h2>
            <ParameterControl
              label="Time Threshold"
              symbol="t"
              value={thresholdT}
              min={0}
              max={8}
              step={0.1}
              unit="time"
              onChange={setThresholdT}
              theme={theme}
            />
            <div
              className={`mt-3 rounded-lg p-3 text-xs font-mono space-y-1.5 border ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex justify-between">
                <span>CDF P(X ≤ {safeT.toFixed(2)}):</span>
                <span className="font-semibold text-cyan-400">
                  {probLeT.toFixed(6)} ({(probLeT * 100).toFixed(2)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Survival P(X &gt; {safeT.toFixed(2)}):</span>
                <span className="font-semibold text-amber-400">
                  {probGtT.toFixed(6)} ({(probGtT * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          <div
            className={`pt-4 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <h2
              className={`text-sm font-semibold mb-3 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              3. Interval Probability Bounds P(a ≤ X ≤ b)
            </h2>
            <div className="space-y-4">
              <ParameterControl
                label="Lower Bound"
                symbol="a"
                value={boundA}
                min={0}
                max={8}
                step={0.1}
                onChange={setBoundA}
                theme={theme}
              />
              <ParameterControl
                label="Upper Bound"
                symbol="b"
                value={boundB}
                min={0}
                max={8}
                step={0.1}
                error={intervalError}
                onChange={setBoundB}
                theme={theme}
              />
            </div>
          </div>

          <div
            className={`pt-4 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <h2
              className={`text-sm font-semibold mb-2.5 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              4. Reference Rate Curves
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {RATE_CURVES.map((c) => {
                const active = visibleRates[c.id];
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleRateCurve(c.id)}
                    aria-pressed={active}
                    className={`px-3 py-2 rounded-lg text-xs font-mono text-left border transition-colors cursor-pointer flex items-center justify-between ${
                      active
                        ? isDark
                          ? 'bg-slate-800 border-slate-600 text-slate-100'
                          : 'bg-slate-100 border-slate-400 text-slate-900 font-semibold'
                        : isDark
                          ? 'bg-slate-950/60 border-slate-800 text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>{c.label}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{
                        backgroundColor: active ? c.color : 'transparent',
                        border: `1px solid ${c.color}`,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Charts Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <ChartCard
            title="Exponential Probability Density Function (PDF)"
            badgeText={`λ = ${safeRate.toFixed(2)}, β = ${moments.scale.toFixed(2)}`}
            subtitle={`Intercept at x = 0 equals f(0) = λ = ${safeRate.toFixed(2)}. Shaded area shows P(${safeA.toFixed(2)} ≤ X ≤ ${safeB.toFixed(2)}) = ${(probInterval * 100).toFixed(2)}%.`}
            theme={theme}
            footer="Vertical dashed line marks the mean waiting time E[X] = 1/λ, where F(1/λ) = 1 − e⁻¹ ≈ 63.21%."
          >
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={pdfData}
                  margin={{ top: 12, right: 18, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[0, 'dataMax']}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    label={{
                      value: 'Waiting Time x (x ≥ 0)',
                      position: 'insideBottomRight',
                      offset: -5,
                      fill: axisColor,
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11 }}
                    label={{
                      value: 'Density f(x)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 12,
                      fill: axisColor,
                      fontSize: 12,
                    }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />

                  <Area
                    type="monotone"
                    dataKey="shadedInterval"
                    name={`P(${safeA} ≤ X ≤ ${safeB})`}
                    fill="#06b6d4"
                    fillOpacity={0.35}
                    stroke="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="activePdf"
                    name={`Selected Exp(λ=${safeRate})`}
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={false}
                  />

                  {visibleRates.r05 && (
                    <Line
                      type="monotone"
                      dataKey="r05"
                      name="Ref: λ = 0.5"
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  )}
                  {visibleRates.r10 && (
                    <Line
                      type="monotone"
                      dataKey="r10"
                      name="Ref: λ = 1.0"
                      stroke="#34d399"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  )}
                  {visibleRates.r20 && (
                    <Line
                      type="monotone"
                      dataKey="r20"
                      name="Ref: λ = 2.0"
                      stroke="#fbbf24"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  )}
                  {visibleRates.r30 && (
                    <Line
                      type="monotone"
                      dataKey="r30"
                      name="Ref: λ = 3.0"
                      stroke="#f472b6"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  )}

                  <ReferenceLine
                    x={moments.mean}
                    stroke="#22d3ee"
                    strokeDasharray="3 3"
                    label={{
                      value: `μ = 1/λ = ${moments.mean.toFixed(2)}`,
                      position: 'top',
                      fill: '#22d3ee',
                      fontSize: 11,
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Cumulative Distribution F(x) &amp; Survival Function S(x)"
            badgeText="F(x) + S(x) = 1"
            subtitle={`At threshold t = ${safeT.toFixed(2)}, cumulative failure probability F(t) = ${probLeT.toFixed(4)} and survival probability S(t) = ${probGtT.toFixed(4)}.`}
            theme={theme}
            footer="The two curves intersect at the median waiting time x = ln(2)/λ, where F(x) = S(x) = 0.50."
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={cdfSurvivalData}
                  margin={{ top: 10, right: 18, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[0, 'dataMax']}
                    tick={{ fill: axisColor, fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    label={{
                      value: 'Probability',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 12,
                      fill: axisColor,
                      fontSize: 12,
                    }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="cdf"
                    name="CDF F(x) = 1 − exp(−λx)"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="survival"
                    name="Survival S(x) = P(X > x) = exp(−λx)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <ReferenceLine
                    x={safeT}
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    label={{
                      value: `t=${safeT}`,
                      position: 'top',
                      fill: axisColor,
                      fontSize: 11,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Memoryless Property Interactive Demonstration */}
      <section
        className={`rounded-xl border p-6 space-y-6 ${
          isDark
            ? 'bg-slate-900/70 border-slate-800'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2
              className={`text-lg font-bold tracking-tight ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              Interactive Memoryless Property Demonstration: P(X &gt; s + t | X &gt; s) = P(X &gt; t)
            </h2>
            <p
              className={`text-xs sm:text-sm ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              The Exponential distribution is the unique continuous distribution that "forgets" how much waiting time s has already elapsed.
            </p>
          </div>
          <div
            className={`px-3.5 py-2 rounded-lg font-mono text-xs border ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-amber-300'
                : 'bg-slate-50 border-slate-200 text-amber-900'
            }`}
          >
            Default Example (λ=1, s=1, t=2): P(X &gt; 2) = P(X &gt; 3 | X &gt; 1) = e⁻² ≈ 0.135335
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Memoryless Controls & Numerical Proof */}
          <div className="lg:col-span-5 space-y-4">
            <ParameterControl
              label="Memoryless Rate Parameter"
              symbol="λ"
              value={memLambda}
              min={0.2}
              max={4.0}
              step={0.1}
              error={memError}
              onChange={setMemLambda}
              theme={theme}
            />
            <ParameterControl
              label="Elapsed Waiting Time Already Survived"
              symbol="s"
              value={memS}
              min={0}
              max={5}
              step={0.25}
              unit="time units"
              onChange={setMemS}
              theme={theme}
            />
            <ParameterControl
              label="Additional Waiting Time Required"
              symbol="t"
              value={memT}
              min={0.25}
              max={5}
              step={0.25}
              unit="time units"
              onChange={setMemT}
              theme={theme}
            />

            <div
              className={`rounded-xl border p-4 space-y-2.5 text-xs font-mono tabular-nums ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex justify-between text-slate-400">
                <span>Base Survival P(X &gt; s = {safeMemS}):</span>
                <span>{memoryless.probWaitS.toFixed(6)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>
                  Joint Survival P(X &gt; s + t = {safeMemS + safeMemT}):
                </span>
                <span>{memoryless.probWaitSPlusT.toFixed(6)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-semibold text-amber-400">
                <span>
                  Conditional P(X &gt; {safeMemS + safeMemT} | X &gt; {safeMemS}):
                </span>
                <span>{memoryless.conditionalProb.toFixed(6)}</span>
              </div>
              <div className="flex justify-between font-semibold text-cyan-400">
                <span>Unconditional P(X &gt; t = {safeMemT}):</span>
                <span>{memoryless.unconditionalProb.toFixed(6)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-emerald-400">
                <span>Absolute Difference |Δ|:</span>
                <span>{memoryless.absDifference.toExponential(2)}</span>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                isDark
                  ? 'bg-slate-950/90 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <strong>Engineering Interpretation (Component Lifetimes):</strong> Suppose an electronic component has an exponentially distributed lifetime with rate <span className="font-mono">λ = {safeMemLambda}</span>. Even if the component has already operated without failure for <span className="font-mono">s = {safeMemS}</span> hours, the conditional probability that it survives at least another <span className="font-mono">t = {safeMemT}</span> hours (<span className="font-mono">X &gt; {safeMemS + safeMemT}</span>) is identical to the probability that a brand-new component survives <span className="font-mono">t = {safeMemT}</span> hours (<span className="font-mono">{memoryless.unconditionalProb.toFixed(6)}</span>). There is no aging or wear-out effect.
            </div>
          </div>

          {/* Memoryless Chart */}
          <div className="lg:col-span-7">
            <ChartCard
              title="Survival Curve Alignment: Unconditional vs. Conditioned at x = s"
              badgeText={`s = ${safeMemS}, t = ${safeMemT}`}
              subtitle={`Notice that the conditional curve starting at x = ${safeMemS} has the exact same height at x = ${
                safeMemS + safeMemT
              } as the unconditional curve at x = ${safeMemT}.`}
              theme={theme}
            >
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={memorylessChartData}
                    margin={{ top: 12, right: 18, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="x"
                      type="number"
                      domain={[0, 'dataMax']}
                      tick={{ fill: axisColor, fontSize: 11 }}
                      label={{
                        value: 'Waiting Time x',
                        position: 'insideBottomRight',
                        offset: -4,
                        fill: axisColor,
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      domain={[0, 1]}
                      tick={{ fill: axisColor, fontSize: 11 }}
                      label={{
                        value: 'Survival Probability',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 12,
                        fill: axisColor,
                        fontSize: 12,
                      }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />

                    <Line
                      type="monotone"
                      dataKey="unconditional"
                      name="Unconditional S(x) = P(X > x)"
                      stroke="#22d3ee"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="conditionalShifted"
                      name={`Conditional P(X > x | X > ${safeMemS})`}
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      strokeDasharray="6 4"
                      dot={false}
                    />

                    <ReferenceLine
                      y={memoryless.unconditionalProb}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                    />
                    <ReferenceDot
                      x={safeMemT}
                      y={Number(memoryless.unconditionalProb.toFixed(6))}
                      r={5}
                      fill="#22d3ee"
                      stroke="#fff"
                    />
                    <ReferenceDot
                      x={safeMemS + safeMemT}
                      y={Number(memoryless.conditionalProb.toFixed(6))}
                      r={5}
                      fill="#f59e0b"
                      stroke="#fff"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>
      </section>
    </div>
  );
};
