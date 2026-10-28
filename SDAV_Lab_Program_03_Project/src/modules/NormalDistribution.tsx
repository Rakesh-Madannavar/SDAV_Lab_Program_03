import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { RotateCcw } from 'lucide-react';
import {
  normalPDF,
  normalCDF,
  standardNormalCDF,
  standardNormalQuantile,
  normalQuantile,
  normalIntervalProb,
  calculateZScore,
  xavierInitStats,
} from '../utils/distributions';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { ParameterControl } from '../components/ParameterControl';

interface NormalDistributionProps {
  theme: 'dark' | 'light';
}

const DEFAULT_CURVES = [
  { id: 'c1', label: 'N(μ=0, σ=1)', mean: 0, stdDev: 1, color: '#38bdf8' },
  { id: 'c2', label: 'N(μ=2, σ=1)', mean: 2, stdDev: 1, color: '#34d399' },
  { id: 'c3', label: 'N(μ=0, σ=2)', mean: 0, stdDev: 2, color: '#fbbf24' },
  { id: 'c4', label: 'N(μ=−2, σ=0.5)', mean: -2, stdDev: 0.5, color: '#f472b6' },
] as const;

const EXAM_SCORES = [60, 70, 80, 90];
const EXAM_MEAN = 70;
const EXAM_STD = 10;

export const NormalDistribution: React.FC<NormalDistributionProps> = ({
  theme,
}) => {
  const isDark = theme === 'dark';

  // Primary distribution parameters
  const [mean, setMean] = useState<number>(0);
  const [stdDev, setStdDev] = useState<number>(1);

  // Probability interval bounds [a, b]
  const [boundA, setBoundA] = useState<number>(-1);
  const [boundB, setBoundB] = useState<number>(1);

  // Z-score & Percentile calculator inputs
  const [rawScoreX, setRawScoreX] = useState<number>(1.0);
  const [percentileInput, setPercentileInput] = useState<number>(0.95);

  // Comparison curves visibility
  const [visibleCurves, setVisibleCurves] = useState<Record<string, boolean>>({
    c1: true,
    c2: true,
    c3: true,
    c4: true,
  });

  // Xavier/Glorot neural network layer dimensions
  const [fanIn, setFanIn] = useState<number>(784);
  const [fanOut, setFanOut] = useState<number>(128);

  // Validation
  const sigmaError =
    !(stdDev > 0) || !Number.isFinite(stdDev)
      ? 'Standard deviation σ must be strictly greater than 0.'
      : undefined;
  const intervalError =
    boundA > boundB
      ? 'Lower bound a must not exceed upper bound b.'
      : undefined;
  const percentileError =
    !(percentileInput > 0 && percentileInput < 1)
      ? 'Percentile p must lie strictly between 0 and 1 (e.g., 0.01 to 0.99).'
      : undefined;

  const safeSigma = sigmaError ? 1 : stdDev;
  const safeA = intervalError ? Math.min(boundA, boundB) : boundA;
  const safeB = intervalError ? Math.max(boundA, boundB) : boundB;
  const safeP = percentileError
    ? Math.max(0.001, Math.min(0.999, percentileInput || 0.5))
    : percentileInput;

  const handleReset = () => {
    setMean(0);
    setStdDev(1);
    setBoundA(-1);
    setBoundB(1);
    setRawScoreX(1.0);
    setPercentileInput(0.95);
    setVisibleCurves({ c1: true, c2: true, c3: true, c4: true });
    setFanIn(784);
    setFanOut(128);
  };

  const toggleCurve = (id: string) => {
    setVisibleCurves((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Derived metrics
  const variance = safeSigma * safeSigma;
  const intervalProbability = normalIntervalProb(safeA, safeB, mean, safeSigma);
  const zScoreOfX = calculateZScore(rawScoreX, mean, safeSigma);
  const cdfAtX = normalCDF(rawScoreX, mean, safeSigma);
  const stdQuantileAtP = standardNormalQuantile(safeP);
  const xQuantileAtP = normalQuantile(safeP, mean, safeSigma);

  // Interactive PDF + Shaded Interval + Comparison Curves data
  const pdfChartData = useMemo(() => {
    const minX = Math.min(-6, mean - 4 * safeSigma);
    const maxX = Math.max(6, mean + 4 * safeSigma);
    const steps = 120;
    const dx = (maxX - minX) / steps;
    const pts = [];

    for (let i = 0; i <= steps; i++) {
      const xv = Number((minX + i * dx).toFixed(3));
      const activePdf = Number(normalPDF(xv, mean, safeSigma).toFixed(5));
      const inInterval = xv >= safeA && xv <= safeB;
      pts.push({
        x: xv,
        activePdf,
        shadedInterval: inInterval ? activePdf : null,
        c1: Number(normalPDF(xv, 0, 1).toFixed(5)),
        c2: Number(normalPDF(xv, 2, 1).toFixed(5)),
        c3: Number(normalPDF(xv, 0, 2).toFixed(5)),
        c4: Number(normalPDF(xv, -2, 0.5).toFixed(5)),
      });
    }
    return pts;
  }, [mean, safeSigma, safeA, safeB]);

  // Interactive CDF data
  const cdfChartData = useMemo(() => {
    const minX = Math.min(-6, mean - 4 * safeSigma);
    const maxX = Math.max(6, mean + 4 * safeSigma);
    const steps = 100;
    const dx = (maxX - minX) / steps;
    const pts = [];

    for (let i = 0; i <= steps; i++) {
      const xv = Number((minX + i * dx).toFixed(3));
      pts.push({
        x: xv,
        activeCdf: Number(normalCDF(xv, mean, safeSigma).toFixed(5)),
        stdCdf: Number(standardNormalCDF(xv).toFixed(5)),
      });
    }
    return pts;
  }, [mean, safeSigma]);

  // Empirical Rule (68.27 - 95.45 - 99.73) non-overlapping nested bands
  const empiricalRuleData = useMemo(() => {
    const pts = [];
    for (let z = -3.8; z <= 3.801; z += 0.06) {
      const zv = Number(z.toFixed(2));
      const pdf = Number(normalPDF(zv, 0, 1).toFixed(5));
      const absZ = Math.abs(zv);
      pts.push({
        z: zv,
        pdf,
        sigma1Band: absZ <= 1.02 ? pdf : null,
        sigma2Band: absZ >= 0.98 && absZ <= 2.02 ? pdf : null,
        sigma3Band: absZ >= 1.98 && absZ <= 3.02 ? pdf : null,
      });
    }
    return pts;
  }, []);

  const empiricalStats = useMemo(() => {
    const p1 = normalIntervalProb(-1, 1, 0, 1);
    const p2 = normalIntervalProb(-2, 2, 0, 1);
    const p3 = normalIntervalProb(-3, 3, 0, 1);
    return { p1, p2, p3 };
  }, []);

  // Exam Z-score table
  const examRows = useMemo(() => {
    return EXAM_SCORES.map((score) => {
      const z = calculateZScore(score, EXAM_MEAN, EXAM_STD);
      const cdf = standardNormalCDF(z);
      return {
        score,
        z,
        percentile: cdf * 100,
      };
    });
  }, []);

  // Xavier/Glorot calculation
  const safeFanIn = Math.max(1, Math.floor(fanIn || 784));
  const safeFanOut = Math.max(1, Math.floor(fanOut || 128));
  const xavier = useMemo(
    () => xavierInitStats(safeFanIn, safeFanOut),
    [safeFanIn, safeFanOut]
  );

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
          <div className="flex items-center gap-2">
            <h1
              className={`text-xl sm:text-2xl font-bold tracking-tight ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              Normal (Gaussian) Distribution Explorer
            </h1>
          </div>
          <p
            className={`text-xs sm:text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Continuous symmetric probability model defined by location mean μ and standard deviation scale σ &gt; 0.
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
            f(x) = [1 / (σ√(2π))] exp[−(x − μ)² / (2σ²)]
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

      {/* Summary Moments Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Mean (Location)"
          formula="E[X] = μ"
          value={mean.toFixed(4)}
          subValue="Center of symmetry"
          accent="cyan"
          theme={theme}
        />
        <StatCard
          label="Variance"
          formula="Var(X) = σ²"
          value={variance.toFixed(4)}
          subValue="Squared dispersion"
          accent="blue"
          theme={theme}
        />
        <StatCard
          label="Standard Deviation"
          formula="SD(X) = σ"
          value={safeSigma.toFixed(4)}
          subValue="Inflection distance μ ± σ"
          accent="default"
          theme={theme}
        />
        <StatCard
          label="Skewness"
          formula="μ₃ / σ³"
          value="0.0000"
          subValue="Exact bilateral symmetry"
          accent="default"
          theme={theme}
        />
        <StatCard
          label="Excess Kurtosis"
          formula="μ₄ / σ⁴ − 3"
          value="0.0000"
          subValue="SciPy Fisher convention"
          accent="default"
          theme={theme}
        />
        <StatCard
          label="Interval P(a ≤ X ≤ b)"
          formula={`[${safeA.toFixed(2)}, ${safeB.toFixed(2)}]`}
          value={`${(intervalProbability * 100).toFixed(2)}%`}
          subValue={`Prob = ${intervalProbability.toFixed(5)}`}
          accent="emerald"
          theme={theme}
        />
      </div>

      {/* Main Sandbox: Controls Deck + Interactive PDF & CDF */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Control Column (4 cols) */}
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
              1. Distribution Parameters
            </h2>
            <div className="space-y-4">
              <ParameterControl
                label="Mean"
                symbol="μ"
                value={mean}
                min={-5}
                max={5}
                step={0.1}
                helpText="Horizontal shift"
                onChange={setMean}
                theme={theme}
              />
              <ParameterControl
                label="Standard Deviation"
                symbol="σ"
                value={stdDev}
                min={0.2}
                max={4}
                step={0.1}
                helpText="Spread σ > 0"
                error={sigmaError}
                onChange={setStdDev}
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
              className={`text-sm font-semibold mb-3 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              2. Probability Interval Bounds P(a ≤ X ≤ b)
            </h2>
            <div className="space-y-4">
              <ParameterControl
                label="Lower Bound"
                symbol="a"
                value={boundA}
                min={-6}
                max={6}
                step={0.1}
                onChange={setBoundA}
                theme={theme}
              />
              <ParameterControl
                label="Upper Bound"
                symbol="b"
                value={boundB}
                min={-6}
                max={6}
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
              className={`text-sm font-semibold mb-3 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              3. Z-Score &amp; Percentile Calculator
            </h2>
            <div className="space-y-4">
              <ParameterControl
                label="Observation Value"
                symbol="x"
                value={rawScoreX}
                min={-6}
                max={6}
                step={0.1}
                onChange={setRawScoreX}
                theme={theme}
              />
              <div
                className={`rounded-lg p-3 text-xs font-mono space-y-1 border ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex justify-between">
                  <span>Z-score z = (x − μ)/σ:</span>
                  <span className="font-semibold text-cyan-400">
                    {zScoreOfX.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cumulative Φ(z) = P(X ≤ x):</span>
                  <span className="font-semibold text-emerald-400">
                    {(cdfAtX * 100).toFixed(2)}% ({cdfAtX.toFixed(4)})
                  </span>
                </div>
              </div>

              <ParameterControl
                label="Target Cumulative Probability"
                symbol="p"
                value={percentileInput}
                min={0.01}
                max={0.99}
                step={0.01}
                error={percentileError}
                onChange={setPercentileInput}
                theme={theme}
              />
              <div
                className={`rounded-lg p-3 text-xs font-mono space-y-1 border ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex justify-between">
                  <span>Standard Quantile Φ⁻¹(p):</span>
                  <span className="font-semibold text-cyan-400">
                    z = {stdQuantileAtP.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Value x_p = μ + z·σ:</span>
                  <span className="font-semibold text-amber-400">
                    x = {xQuantileAtP.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Toggleable Reference Curves */}
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
              4. Reference Comparison Curves
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_CURVES.map((c) => {
                const active = visibleCurves[c.id];
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCurve(c.id)}
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

        {/* Right/Charts Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <ChartCard
            title="Probability Density Function (PDF) & Interval Shading"
            badgeText={`N(μ=${mean.toFixed(1)}, σ=${safeSigma.toFixed(1)})`}
            subtitle={`Shaded area represents P(${safeA.toFixed(2)} ≤ X ≤ ${safeB.toFixed(2)}) = ${(
              intervalProbability * 100
            ).toFixed(2)}%. Dashed vertical line marks mean μ = ${mean.toFixed(2)}.`}
            theme={theme}
            footer="Toggle the four Program 3 reference distributions in the control panel to compare location and scale shifts."
          >
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={pdfChartData}
                  margin={{ top: 12, right: 18, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    label={{
                      value: 'x',
                      position: 'insideBottomRight',
                      offset: -5,
                      fill: axisColor,
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11 }}
                    label={{
                      value: 'Probability Density f(x)',
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
                    name={`Selected N(${mean}, ${safeSigma})`}
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={false}
                  />

                  {visibleCurves.c1 && (
                    <Line
                      type="monotone"
                      dataKey="c1"
                      name="Ref: μ=0, σ=1"
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  )}
                  {visibleCurves.c2 && (
                    <Line
                      type="monotone"
                      dataKey="c2"
                      name="Ref: μ=2, σ=1"
                      stroke="#34d399"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  )}
                  {visibleCurves.c3 && (
                    <Line
                      type="monotone"
                      dataKey="c3"
                      name="Ref: μ=0, σ=2"
                      stroke="#fbbf24"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  )}
                  {visibleCurves.c4 && (
                    <Line
                      type="monotone"
                      dataKey="c4"
                      name="Ref: μ=−2, σ=0.5"
                      stroke="#f472b6"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  )}

                  <ReferenceLine
                    x={mean}
                    stroke="#22d3ee"
                    strokeDasharray="3 3"
                    label={{
                      value: `μ=${mean}`,
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
            title="Cumulative Distribution Function (CDF)"
            badgeText="F(x) = P(X ≤ x)"
            subtitle="Monotonically increasing S-curve mapping real values x to cumulative probability in [0, 1]."
            theme={theme}
            footer={`At x = ${rawScoreX.toFixed(2)}, z = ${zScoreOfX.toFixed(2)} and cumulative probability F(x) = ${cdfAtX.toFixed(4)}.`}
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={cdfChartData}
                  margin={{ top: 10, right: 18, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tick={{ fill: axisColor, fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    label={{
                      value: 'Cumulative Prob F(x)',
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
                    dataKey="activeCdf"
                    name={`Selected CDF F(x; μ=${mean}, σ=${safeSigma})`}
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="stdCdf"
                    name="Standard Normal Φ(x)"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <ReferenceLine
                    x={rawScoreX}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                  />
                  <ReferenceLine
                    y={cdfAtX}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Empirical Rule (68-95-99.7) Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <ChartCard
            title="Empirical Rule (68–95–99.7) Verification"
            badgeText="Disjoint σ Bands"
            subtitle="Non-overlapping shaded regions showing exact probability mass within ±1σ, ±2σ, and ±3σ."
            theme={theme}
            footer="Each region is shaded separately without overlapping fills so visual area corresponds directly to probability."
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={empiricalRuleData}
                  margin={{ top: 10, right: 16, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="z"
                    type="number"
                    domain={[-3.8, 3.8]}
                    ticks={[-3, -2, -1, 0, 1, 2, 3]}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    label={{
                      value: 'Standardized Z-Score (σ units from μ)',
                      position: 'insideBottomRight',
                      offset: -5,
                      fill: axisColor,
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11 }}
                    label={{
                      value: 'φ(z)',
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
                    dataKey="sigma1Band"
                    name="Core |Z| < 1 (68.27%)"
                    stroke="none"
                    fill="#06b6d4"
                    fillOpacity={0.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="sigma2Band"
                    name="Shoulders 1 ≤ |Z| < 2 (+27.18% → 95.45%)"
                    stroke="none"
                    fill="#3b82f6"
                    fillOpacity={0.38}
                  />
                  <Area
                    type="monotone"
                    dataKey="sigma3Band"
                    name="Tails 2 ≤ |Z| < 3 (+4.28% → 99.73%)"
                    stroke="none"
                    fill="#6366f1"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="pdf"
                    name="Standard Normal φ(z)"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div
          className={`lg:col-span-5 rounded-xl border p-5 flex flex-col justify-between ${
            isDark
              ? 'bg-slate-900/70 border-slate-800'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="space-y-4">
            <div>
              <h3
                className={`text-base font-semibold ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Numerical Verification of the 68–95–99.7 Rule
              </h3>
              <p
                className={`mt-1 text-xs ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Computed directly from the Standard Normal CDF Φ(z) − Φ(−z):
              </p>
            </div>

            <div className="space-y-3">
              <div
                className={`p-3.5 rounded-lg border flex items-center justify-between ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="text-xs font-mono font-semibold text-cyan-400">
                    P(−1 &lt; Z &lt; 1) = P(μ − σ &lt; X &lt; μ + σ)
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Within 1 standard deviation of the mean
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-base font-bold text-cyan-300">
                    {(empiricalStats.p1 * 100).toFixed(2)}%
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {empiricalStats.p1.toFixed(6)}
                  </div>
                </div>
              </div>

              <div
                className={`p-3.5 rounded-lg border flex items-center justify-between ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="text-xs font-mono font-semibold text-blue-400">
                    P(−2 &lt; Z &lt; 2) = P(μ − 2σ &lt; X &lt; μ + 2σ)
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Within 2 standard deviations of the mean
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-base font-bold text-blue-300">
                    {(empiricalStats.p2 * 100).toFixed(2)}%
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {empiricalStats.p2.toFixed(6)}
                  </div>
                </div>
              </div>

              <div
                className={`p-3.5 rounded-lg border flex items-center justify-between ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="text-xs font-mono font-semibold text-indigo-400">
                    P(−3 &lt; Z &lt; 3) = P(μ − 3σ &lt; X &lt; μ + 3σ)
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Within 3 standard deviations of the mean
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-base font-bold text-indigo-300">
                    {(empiricalStats.p3 * 100).toFixed(2)}%
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {empiricalStats.p3.toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p
            className={`mt-4 pt-3 border-t text-xs ${
              isDark
                ? 'border-slate-800 text-slate-400'
                : 'border-slate-200 text-slate-600'
            }`}
          >
            Observations beyond ±3σ occur with probability{' '}
            <span className="font-mono">
              1 − 0.9973 = 0.0027 (0.27%)
            </span>
            , motivating 3σ quality control limits in manufacturing and anomaly detection.
          </p>
        </div>
      </div>

      {/* Z-Score Exam Examples & ML Xavier Initialization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Z-Scores Card */}
        <div
          className={`rounded-xl border p-5 space-y-4 ${
            isDark
              ? 'bg-slate-900/70 border-slate-800'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <h3
                className={`text-base font-semibold ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Standardization Example: Exam Score Z-Scores &amp; Percentiles
              </h3>
              <span className="text-xs font-mono text-cyan-400">
                μ = 70, σ = 10
              </span>
            </div>
            <p
              className={`mt-1 text-xs ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Evaluating raw exam scores [60, 70, 80, 90] under an assumed Normal(70, 10²) model:
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm font-mono tabular-nums">
              <thead>
                <tr
                  className={`border-b ${
                    isDark
                      ? 'border-slate-800 text-slate-400'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <th className="py-2.5 px-3 font-sans font-semibold">Raw Score (x)</th>
                  <th className="py-2.5 px-3 font-sans font-semibold">Z-Score (x − 70)/10</th>
                  <th className="py-2.5 px-3 font-sans font-semibold">Standard Normal Φ(z)</th>
                  <th className="py-2.5 px-3 font-sans font-semibold text-right">
                    Model Percentile
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? 'divide-slate-800/70' : 'divide-slate-200'
                }`}
              >
                {examRows.map((row) => (
                  <tr key={row.score}>
                    <td className="py-2.5 px-3 font-semibold">{row.score}</td>
                    <td
                      className={`py-2.5 px-3 ${
                        row.z < 0
                          ? 'text-amber-400'
                          : row.z > 0
                            ? 'text-cyan-400'
                            : ''
                      }`}
                    >
                      {row.z >= 0 ? `+${row.z.toFixed(2)}` : row.z.toFixed(2)}σ
                    </td>
                    <td className="py-2.5 px-3">
                      {(row.percentile / 100).toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">
                      {row.percentile.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
              isDark
                ? 'bg-slate-950/90 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <strong>Model Assumption Note:</strong> Each percentile above is calculated using the continuous <em>assumed normal model</em>{' '}
            <span className="font-mono">Φ((x − 70)/10)</span>, not an empirical rank order of finite classroom test scores. If actual exam scores are skewed or bounded at 100, empirical percentiles will differ from theoretical Gaussian percentiles.
          </div>
        </div>

        {/* Machine Learning Connection: Xavier/Glorot Initialization */}
        <div
          className={`rounded-xl border p-5 space-y-4 ${
            isDark
              ? 'bg-slate-900/70 border-slate-800'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <h3
                className={`text-base font-semibold ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                AI / Machine Learning Connection: Xavier (Glorot) Initialization
              </h3>
              <span className="text-xs font-mono text-cyan-400">
                W ~ N(0, σ²)
              </span>
            </div>
            <p
              className={`mt-1 text-xs ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              In deep neural networks, initializing layer weights with too large a variance causes exploding activations/gradients, while too small a variance causes vanishing signals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ParameterControl
              label="Layer Fan-In (Input Units)"
              symbol="n_in"
              value={fanIn}
              min={16}
              max={2048}
              step={16}
              onChange={(v) => setFanIn(Math.max(1, Math.round(v)))}
              theme={theme}
            />
            <ParameterControl
              label="Layer Fan-Out (Output Units)"
              symbol="n_out"
              value={fanOut}
              min={16}
              max={2048}
              step={16}
              onChange={(v) => setFanOut(Math.max(1, Math.round(v)))}
              theme={theme}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className={`p-3.5 rounded-lg border ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-xs text-slate-400">
                Xavier Weight <strong>Variance (σ²)</strong>
              </div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                Var(W) = 2 / ({xavier.fanIn} + {xavier.fanOut}) = 2 /{' '}
                {xavier.fanIn + xavier.fanOut}
              </div>
              <div className="mt-1.5 text-lg font-mono font-bold text-blue-400 tabular-nums">
                σ² = {xavier.variance.toFixed(6)}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-lg border ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-xs text-slate-400">
                Xavier Weight <strong>Standard Deviation (σ)</strong>
              </div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                σ = √[2 / ({xavier.fanIn} + {xavier.fanOut})]
              </div>
              <div className="mt-1.5 text-lg font-mono font-bold text-cyan-400 tabular-nums">
                σ = {xavier.stdDev.toFixed(6)}
              </div>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
              isDark
                ? 'bg-slate-950/90 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <strong>Variance vs. Standard Deviation Distinction:</strong> For an MNIST input layer (<span className="font-mono">fan-in = 784, fan-out = 128</span>), the target variance is{' '}
            <span className="font-mono">σ² = 2/912 ≈ 0.002193</span>, whereas the standard deviation passed to a normal random number generator <span className="font-mono">N(0, σ)</span> is its square root{' '}
            <span className="font-mono">σ = √(2/912) ≈ 0.046829</span>. Confusing <span className="font-mono">σ²</span> with <span className="font-mono">σ</span> shrinks initial weights by a factor of ~21×!
          </div>
        </div>
      </div>
    </div>
  );
};
