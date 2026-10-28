import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { RotateCcw, Play } from 'lucide-react';
import {
  theoreticalStandardNormalRawMoments,
  generateMomentsAnalysisSample,
  rawMoment,
} from '../utils/statistics';
import { createSeededRNG, randomStandardNormal } from '../utils/random';
import { buildHistogram } from '../utils/histogram';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { ParameterControl } from '../components/ParameterControl';

interface MomentsAnalysisProps {
  theme: 'dark' | 'light';
}

export const MomentsAnalysis: React.FC<MomentsAnalysisProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  // Default matches Program 3: N = 1,000 from N(μ = 5, σ = 2)
  const [sampleSize, setSampleSize] = useState<number>(1000);
  const [popMean, setPopMean] = useState<number>(5.0);
  const [popStdDev, setPopStdDev] = useState<number>(2.0);
  const [seed, setSeed] = useState<number>(42);

  // Validation
  const sigmaError =
    !(popStdDev > 0) || !Number.isFinite(popStdDev)
      ? 'Standard deviation σ must be strictly greater than 0.'
      : undefined;
  const nError =
    !Number.isInteger(sampleSize) || sampleSize < 10 || sampleSize > 20000
      ? 'Sample size N must be an integer between 10 and 20,000.'
      : undefined;

  const safeN = nError
    ? Math.max(10, Math.min(20000, Math.round(sampleSize || 1000)))
    : sampleSize;
  const safeSigma = sigmaError ? 2.0 : popStdDev;
  const safeSeed = Number.isFinite(seed) ? Math.floor(seed) : 42;

  const handleReset = () => {
    setSampleSize(1000);
    setPopMean(5.0);
    setPopStdDev(2.0);
    setSeed(42);
  };

  // 1. Theoretical & empirical raw moments for N(0, 1)
  const rawTheoretical = useMemo(
    () => theoreticalStandardNormalRawMoments(),
    []
  );

  const stdNormalEmpiricalRaw = useMemo(() => {
    const rng = createSeededRNG(safeSeed);
    const zData = new Array<number>(safeN);
    for (let i = 0; i < safeN; i++) {
      zData[i] = randomStandardNormal(rng);
    }
    return {
      m1: rawMoment(zData, 1),
      m2: rawMoment(zData, 2),
      m3: rawMoment(zData, 3),
      m4: rawMoment(zData, 4),
    };
  }, [safeN, safeSeed]);

  // 2. Central moments analysis for N(popMean, safeSigma) (default N(5, 2), N = 1,000)
  const centralSampleResult = useMemo(
    () => generateMomentsAnalysisSample(safeN, popMean, safeSigma, safeSeed),
    [safeN, popMean, safeSigma, safeSeed]
  );

  const sampleHistogram = useMemo(
    () =>
      buildHistogram(centralSampleResult.observations, 28, {
        normalMean: popMean,
        normalStdDev: safeSigma,
      }),
    [centralSampleResult.observations, popMean, safeSigma]
  );

  const centralComparisonBarData = useMemo(() => {
    const { sampleCentralMoments, theoreticalCentralMoments } =
      centralSampleResult;
    return [
      {
        order: 'k = 1 (Mean Dev)',
        Theoretical: theoreticalCentralMoments.mu1,
        Simulated: Number(sampleCentralMoments.mu1.toFixed(4)),
      },
      {
        order: 'k = 2 (Variance)',
        Theoretical: Number(theoreticalCentralMoments.mu2.toFixed(4)),
        Simulated: Number(sampleCentralMoments.mu2.toFixed(4)),
      },
      {
        order: 'k = 3 (Skew Term)',
        Theoretical: theoreticalCentralMoments.mu3,
        Simulated: Number(sampleCentralMoments.mu3.toFixed(4)),
      },
      {
        order: 'k = 4 (Tail Term)',
        Theoretical: Number(theoreticalCentralMoments.mu4.toFixed(4)),
        Simulated: Number(sampleCentralMoments.mu4.toFixed(4)),
      },
    ];
  }, [centralSampleResult]);

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
      {/* Header & Academic Definition */}
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
            Statistical Moments Analysis: Raw Moments, Central Moments &amp; Kurtosis
          </h1>
          <p
            className={`text-xs sm:text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Characterize probability distributions by their power expectations about the origin (raw) and about the mean (central).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isDark
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25'
                : 'bg-sky-600 border-sky-600 text-white hover:bg-sky-700'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Resample Seed</span>
          </button>
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
            <span>Reset Program 3 Defaults</span>
          </button>
        </div>
      </div>

      {/* Academic Concept Overview: Raw vs Central Moments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`rounded-xl border p-5 space-y-2.5 ${
            isDark
              ? 'bg-slate-900/70 border-slate-800'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <h2
              className={`text-base font-semibold ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              Raw Moments (Moments About Zero)
            </h2>
            <span className="text-xs font-mono text-cyan-400">
              m_k = E[X^k]
            </span>
          </div>
          <p
            className={`text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            The <span className="font-mono">k</span>-th <strong>raw moment</strong> measures the expected value of{' '}
            <span className="font-mono">X^k</span> relative to the coordinate origin <span className="font-mono">0</span>:{' '}
            <span className="font-mono">E[X^k] = ∫ x^k f(x) dx</span>. The first raw moment <span className="font-mono">E[X] = μ</span> defines the population mean (center of mass). Higher raw moments mix location and spread together unless the distribution is already centered at zero.
          </p>
        </div>

        <div
          className={`rounded-xl border p-5 space-y-2.5 ${
            isDark
              ? 'bg-slate-900/70 border-slate-800'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <h2
              className={`text-base font-semibold ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              Central Moments (Moments About the Mean)
            </h2>
            <span className="text-xs font-mono text-amber-400">
              μ_k = E[(X − μ)^k]
            </span>
          </div>
          <p
            className={`text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            The <span className="font-mono">k</span>-th <strong>central moment</strong> subtracts the mean before raising to the power <span className="font-mono">k</span>, isolating pure shape and spread from horizontal location: <span className="font-mono">μ₁ = 0</span>, <span className="font-mono">μ₂ = σ²</span> (variance), <span className="font-mono">μ₃</span> measures asymmetry (skewness), and <span className="font-mono">μ₄</span> measures tail heaviness (kurtosis).
          </p>
        </div>
      </div>

      {/* Section 1: Standard Normal N(0, 1) Raw Moments */}
      <section
        className={`rounded-xl border p-6 space-y-5 ${
          isDark
            ? 'bg-slate-900/70 border-slate-800'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2
              className={`text-lg font-bold tracking-tight ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              Part A: Standard Normal N(0, 1) Raw Moments E[X^k] for k = 1, 2, 3, 4
            </h2>
            <p
              className={`text-xs sm:text-sm ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Because N(0, 1) has mean μ = 0, its raw moments E[X^k] and central moments E[(X − 0)^k] coincide exactly.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            Exact Analytical Values: [0, 1, 0, 3]
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="First Raw Moment (k = 1)"
            formula="E[X¹]"
            value={rawTheoretical.m1.toFixed(4)}
            subValue={`Simulated (N=${safeN}): ${stdNormalEmpiricalRaw.m1.toFixed(4)} · Odd power vanishes by symmetry`}
            accent="cyan"
            theme={theme}
          />
          <StatCard
            label="Second Raw Moment (k = 2)"
            formula="E[X²]"
            value={rawTheoretical.m2.toFixed(4)}
            subValue={`Simulated (N=${safeN}): ${stdNormalEmpiricalRaw.m2.toFixed(4)} · Unit variance σ² = 1`}
            accent="blue"
            theme={theme}
          />
          <StatCard
            label="Third Raw Moment (k = 3)"
            formula="E[X³]"
            value={rawTheoretical.m3.toFixed(4)}
            subValue={`Simulated (N=${safeN}): ${stdNormalEmpiricalRaw.m3.toFixed(4)} · Zero skewness`}
            accent="cyan"
            theme={theme}
          />
          <StatCard
            label="Fourth Raw Moment (k = 4)"
            formula="E[X⁴]"
            value={rawTheoretical.m4.toFixed(4)}
            subValue={`Simulated (N=${safeN}): ${stdNormalEmpiricalRaw.m4.toFixed(4)} · Gaussian baseline 3σ⁴ = 3`}
            accent="emerald"
            theme={theme}
          />
        </div>
      </section>

      {/* Section 2: Central Moments for N(5, 2) Sample vs Theoretical Population */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2
              className={`text-lg sm:text-xl font-bold tracking-tight ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              Part B: Central Moments Analysis — Seeded Sample from N(μ = {popMean}, σ = {safeSigma})
            </h2>
            <p
              className={`text-xs sm:text-sm ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Comparing sample central moments μ̂_k = (1/N) Σ(x_i − x̄)^k against theoretical population central moments μ_k = E[(X − μ)^k].
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400">
            Default Program 3 Spec: N = 1,000, μ = 5, σ = 2 → Theoretical [0, 4, 0, 48]
          </span>
        </div>

        {/* Summary Cards for Sample vs Theoretical */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Sample Size"
            formula="N"
            value={centralSampleResult.sampleSize.toLocaleString()}
            subValue={`Seed = ${safeSeed}`}
            accent="default"
            theme={theme}
          />
          <StatCard
            label="Sample Mean vs Pop μ"
            formula="x̄ vs μ"
            value={centralSampleResult.sampleMeanVal.toFixed(4)}
            subValue={`Theoretical μ = ${popMean.toFixed(4)}`}
            accent="cyan"
            theme={theme}
          />
          <StatCard
            label="1st Central Moment"
            formula="μ̂₁ vs μ₁"
            value={centralSampleResult.sampleCentralMoments.mu1.toFixed(4)}
            subValue={`Theoretical μ₁ = ${centralSampleResult.theoreticalCentralMoments.mu1.toFixed(4)}`}
            accent="default"
            theme={theme}
          />
          <StatCard
            label="2nd Central Moment (Var)"
            formula="μ̂₂ vs σ²"
            value={centralSampleResult.sampleCentralMoments.mu2.toFixed(4)}
            subValue={`Theoretical μ₂ = ${centralSampleResult.theoreticalCentralMoments.mu2.toFixed(4)}`}
            accent="blue"
            theme={theme}
          />
          <StatCard
            label="3rd Central Moment"
            formula="μ̂₃ vs μ₃"
            value={centralSampleResult.sampleCentralMoments.mu3.toFixed(4)}
            subValue={`Theoretical μ₃ = ${centralSampleResult.theoreticalCentralMoments.mu3.toFixed(4)}`}
            accent="default"
            theme={theme}
          />
          <StatCard
            label="4th Central Moment"
            formula="μ̂₄ vs 3σ⁴"
            value={centralSampleResult.sampleCentralMoments.mu4.toFixed(4)}
            subValue={`Theoretical μ₄ = ${centralSampleResult.theoreticalCentralMoments.mu4.toFixed(4)}`}
            accent="amber"
            theme={theme}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls & Comparison Table (5 cols) */}
          <div
            className={`lg:col-span-5 rounded-xl border p-5 space-y-6 ${
              isDark
                ? 'bg-slate-900/70 border-slate-800'
                : 'bg-white border-slate-200 shadow-2xs'
            }`}
          >
            <div>
              <h3
                className={`text-sm font-semibold mb-3 ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                Sample Generation Parameters
              </h3>
              <div className="space-y-4">
                <ParameterControl
                  label="Sample Size"
                  symbol="N"
                  value={sampleSize}
                  min={50}
                  max={10000}
                  step={50}
                  helpText="Default 1,000"
                  error={nError}
                  onChange={(v) => setSampleSize(Math.round(v))}
                  theme={theme}
                />
                <ParameterControl
                  label="Population Mean"
                  symbol="μ"
                  value={popMean}
                  min={-5}
                  max={15}
                  step={0.5}
                  helpText="Default 5.0"
                  onChange={setPopMean}
                  theme={theme}
                />
                <ParameterControl
                  label="Population Standard Deviation"
                  symbol="σ"
                  value={popStdDev}
                  min={0.5}
                  max={4.0}
                  step={0.25}
                  helpText="Default σ = 2.0 (σ² = 4)"
                  error={sigmaError}
                  onChange={setPopStdDev}
                  theme={theme}
                />
                <ParameterControl
                  label="Random Seed"
                  symbol="seed"
                  value={seed}
                  min={1}
                  max={99999}
                  step={1}
                  onChange={(v) => setSeed(Math.round(v))}
                  theme={theme}
                />
              </div>
            </div>

            {/* Side-by-Side Comparison Table */}
            <div
              className={`pt-4 border-t ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <h3
                className={`text-sm font-semibold mb-2.5 ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                Simulated Sample Estimates vs. Theoretical Population Values
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                  <thead>
                    <tr
                      className={`border-b ${
                        isDark
                          ? 'border-slate-800 text-slate-400'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <th className="py-2 px-2 font-sans font-semibold">Statistic / Moment</th>
                      <th className="py-2 px-2 font-sans font-semibold text-right">
                        Theoretical (Pop)
                      </th>
                      <th className="py-2 px-2 font-sans font-semibold text-right">
                        Simulated (Sample)
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isDark ? 'divide-slate-800/70' : 'divide-slate-200'
                    }`}
                  >
                    <tr>
                      <td className="py-2 px-2 font-sans">Mean (μ vs x̄)</td>
                      <td className="py-2 px-2 text-right">
                        {popMean.toFixed(4)}
                      </td>
                      <td className="py-2 px-2 text-right text-cyan-400">
                        {centralSampleResult.sampleMeanVal.toFixed(4)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-sans">1st Central (μ₁ vs μ̂₁)</td>
                      <td className="py-2 px-2 text-right">0.0000</td>
                      <td className="py-2 px-2 text-right text-cyan-400">
                        {centralSampleResult.sampleCentralMoments.mu1.toFixed(4)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-sans">
                        2nd Central / Var (σ² vs μ̂₂)
                      </td>
                      <td className="py-2 px-2 text-right font-semibold">
                        {centralSampleResult.theoreticalCentralMoments.mu2.toFixed(
                          4
                        )}
                      </td>
                      <td className="py-2 px-2 text-right text-cyan-400 font-semibold">
                        {centralSampleResult.sampleCentralMoments.mu2.toFixed(4)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-sans">3rd Central (μ₃ vs μ̂₃)</td>
                      <td className="py-2 px-2 text-right">0.0000</td>
                      <td className="py-2 px-2 text-right text-cyan-400">
                        {centralSampleResult.sampleCentralMoments.mu3.toFixed(4)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-sans">
                        4th Central (3σ⁴ vs μ̂₄)
                      </td>
                      <td className="py-2 px-2 text-right font-semibold">
                        {centralSampleResult.theoreticalCentralMoments.mu4.toFixed(
                          4
                        )}
                      </td>
                      <td className="py-2 px-2 text-right text-amber-400 font-semibold">
                        {centralSampleResult.sampleCentralMoments.mu4.toFixed(4)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-sans">Skewness (μ₃ / σ³)</td>
                      <td className="py-2 px-2 text-right">0.0000</td>
                      <td className="py-2 px-2 text-right text-emerald-400">
                        {centralSampleResult.sampleShape.skewness.toFixed(4)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-sans">
                        Excess Kurtosis (SciPy Fisher)
                      </td>
                      <td className="py-2 px-2 text-right font-semibold">
                        0.0000
                      </td>
                      <td className="py-2 px-2 text-right text-emerald-400 font-semibold">
                        {centralSampleResult.sampleShape.excessKurtosis.toFixed(
                          4
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Charts Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <ChartCard
              title={`Central Moments Comparison: Theoretical N(${popMean}, ${safeSigma}) vs. Sample (N = ${safeN})`}
              badgeText="μ_k vs μ̂_k"
              subtitle={`For σ = ${safeSigma}, theoretical central moments are μ₁ = 0, μ₂ = σ² = ${centralSampleResult.theoreticalCentralMoments.mu2.toFixed(2)}, μ₃ = 0, and μ₄ = 3σ⁴ = ${centralSampleResult.theoreticalCentralMoments.mu4.toFixed(2)}.`}
              theme={theme}
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={centralComparisonBarData}
                    margin={{ top: 10, right: 18, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="order"
                      tick={{ fill: axisColor, fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fill: axisColor, fontSize: 11 }}
                      label={{
                        value: 'Moment Value',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 12,
                        fill: axisColor,
                        fontSize: 12,
                      }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar
                      dataKey="Theoretical"
                      name="Theoretical Population Moment (μ_k)"
                      fill="#38bdf8"
                    />
                    <Bar
                      dataKey="Simulated"
                      name="Simulated Sample Moment (μ̂_k)"
                      fill="#f59e0b"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title={`Simulated Sample Histogram from N(μ = ${popMean}, σ = ${safeSigma})`}
              badgeText={`x̄ = ${centralSampleResult.sampleMeanVal.toFixed(3)}, s = ${centralSampleResult.sampleStdDevVal.toFixed(3)}`}
              subtitle="Empirical density distribution of the seeded random sample overlaid with the exact population Gaussian curve."
              theme={theme}
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={sampleHistogram.bins}
                    margin={{ top: 10, right: 18, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="binCenter"
                      tickFormatter={(v) => Number(v).toFixed(2)}
                      tick={{ fill: axisColor, fontSize: 11 }}
                      label={{
                        value: 'x',
                        position: 'insideBottomRight',
                        offset: -4,
                        fill: axisColor,
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      tick={{ fill: axisColor, fontSize: 11 }}
                      label={{
                        value: 'Density',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 12,
                        fill: axisColor,
                        fontSize: 12,
                      }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar
                      dataKey="density"
                      name="Sample Histogram Density"
                      fill="#06b6d4"
                      fillOpacity={0.5}
                    />
                    <Line
                      type="monotone"
                      dataKey="normalApproxDensity"
                      name={`Population PDF N(${popMean}, ${safeSigma})`}
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <ReferenceLine
                      x={centralSampleResult.sampleMeanVal}
                      stroke="#22d3ee"
                      strokeDasharray="3 3"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Skewness & Excess Kurtosis Academic Explanation */}
        <div
          className={`rounded-xl border p-5 space-y-3 ${
            isDark
              ? 'bg-slate-900/70 border-slate-800'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <h3
            className={`text-base font-semibold ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            Standardized Shape Descriptors: Skewness &amp; Excess Kurtosis (SciPy Fisher Convention)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm leading-relaxed">
            <div
              className={`p-4 rounded-lg border ${
                isDark
                  ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-mono font-semibold text-cyan-400 mb-1">
                Skewness: γ₁ = E[(X − μ)³] / σ³ = μ₃ / (μ₂)^(3/2)
              </div>
              Dividing the third central moment by <span className="font-mono">σ³</span> creates a dimensionless measure of asymmetry. Any symmetric distribution (including every Normal distribution <span className="font-mono">N(μ, σ²)</span>) has theoretical skewness <span className="font-mono">γ₁ = 0</span>. Positive skewness indicates a longer right tail (such as <span className="font-mono">Exponential(λ)</span> where <span className="font-mono">γ₁ = 2</span>).
            </div>

            <div
              className={`p-4 rounded-lg border ${
                isDark
                  ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-mono font-semibold text-amber-400 mb-1">
                Excess Kurtosis (Fisher): γ₂ = [E[(X − μ)⁴] / σ⁴] − 3 = (μ₄ / μ₂²) − 3
              </div>
              For any Normal distribution, Pearson's standardized fourth moment is <span className="font-mono">μ₄ / σ⁴ = 3σ⁴ / σ⁴ = 3</span>. Following <strong>SciPy's default Fisher convention</strong> (<code className="font-mono">scipy.stats.kurtosis(..., fisher=True)</code>), we subtract <span className="font-mono">3</span> so that a Normal distribution has <strong>excess kurtosis = 0</strong> (mesokurtic). Heavy-tailed (leptokurtic) distributions have excess kurtosis &gt; 0; light-tailed (platykurtic) distributions have excess kurtosis &lt; 0.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
