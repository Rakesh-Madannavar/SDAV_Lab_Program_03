import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Play, RotateCcw } from 'lucide-react';
import {
  CLTSourceDistribution,
  getTheoreticalCLTStats,
} from '../utils/distributions';
import { simulateCLTSampleMeans } from '../utils/statistics';
import {
  buildHistogram,
  buildMultiSampleSizeComparison,
} from '../utils/histogram';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { ParameterControl } from '../components/ParameterControl';

interface CLTSimulationProps {
  theme: 'dark' | 'light';
}

const SAMPLE_SIZES = [1, 5, 30, 100] as const;

export const CLTSimulation: React.FC<CLTSimulationProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  const [sourceDist, setSourceDist] =
    useState<CLTSourceDistribution>('exponential');
  const [sampleSize, setSampleSize] = useState<1 | 5 | 30 | 100>(30);
  const [repetitions, setRepetitions] = useState<number>(2000);
  const [seed, setSeed] = useState<number>(42);
  const [numBins, setNumBins] = useState<number>(30);
  const [showNormalApprox, setShowNormalApprox] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Validation
  const repError =
    !Number.isInteger(repetitions) || repetitions < 50 || repetitions > 20000
      ? 'Repetitions must be an integer between 50 and 20,000.'
      : undefined;
  const binError =
    !Number.isInteger(numBins) || numBins < 5 || numBins > 100
      ? 'Histogram bins must be an integer between 5 and 100.'
      : undefined;

  const safeReps = repError
    ? Math.max(50, Math.min(20000, Math.round(repetitions || 2000)))
    : repetitions;
  const safeBins = binError
    ? Math.max(5, Math.min(100, Math.round(numBins || 30)))
    : numBins;
  const safeSeed = Number.isFinite(seed) ? Math.floor(seed) : 42;

  const handleReset = () => {
    setSourceDist('exponential');
    setSampleSize(30);
    setRepetitions(2000);
    setSeed(42);
    setNumBins(30);
    setShowNormalApprox(true);
  };

  const handleReseedAndRun = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSeed((prev) => prev + 1);
      setIsSimulating(false);
    }, 80);
  };

  // Primary simulation for selected (sourceDist, sampleSize, safeReps, safeSeed)
  const primarySim = useMemo(() => {
    return simulateCLTSampleMeans(sourceDist, sampleSize, safeReps, safeSeed);
  }, [sourceDist, sampleSize, safeReps, safeSeed]);

  const primaryHistogram = useMemo(() => {
    return buildHistogram(primarySim.sampleMeans, safeBins, {
      normalMean: primarySim.theoretical.populationMean,
      normalStdDev: primarySim.theoretical.standardError,
    });
  }, [primarySim, safeBins]);

  // Multi-sample-size comparison across n = 1, 5, 30, 100 for the chosen source distribution
  const multiSizeComparison = useMemo(() => {
    const compareReps = Math.min(safeReps, 2500);
    const s1 = simulateCLTSampleMeans(sourceDist, 1, compareReps, safeSeed);
    const s5 = simulateCLTSampleMeans(sourceDist, 5, compareReps, safeSeed + 10);
    const s30 = simulateCLTSampleMeans(
      sourceDist,
      30,
      compareReps,
      safeSeed + 20
    );
    const s100 = simulateCLTSampleMeans(
      sourceDist,
      100,
      compareReps,
      safeSeed + 30
    );

    const rows = buildMultiSampleSizeComparison(
      {
        1: s1.sampleMeans,
        5: s5.sampleMeans,
        30: s30.sampleMeans,
        100: s100.sampleMeans,
      },
      26
    );

    return {
      rows,
      summaries: [s1, s5, s30, s100],
    };
  }, [sourceDist, safeReps, safeSeed]);

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
            Central Limit Theorem (CLT) Interactive Simulator
          </h1>
          <p
            className={`text-xs sm:text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Observe how the sampling distribution of the sample mean X̄_n converges toward N(μ, σ²/n) regardless of population shape.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleReseedAndRun}
            disabled={isSimulating}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isDark
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25'
                : 'bg-sky-600 border-sky-600 text-white hover:bg-sky-700'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Simulating...' : 'New Seed Draw'}</span>
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
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Summary Theoretical vs Simulated Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Theoretical Pop. Mean"
          formula="μ"
          value={primarySim.theoretical.populationMean.toFixed(4)}
          subValue={primarySim.theoretical.label}
          accent="cyan"
          theme={theme}
        />
        <StatCard
          label="Simulated Mean of X̄"
          formula="x̄_sim"
          value={primarySim.simulatedMean.toFixed(4)}
          subValue={`|Δ| = ${Math.abs(
            primarySim.simulatedMean - primarySim.theoretical.populationMean
          ).toFixed(4)}`}
          accent="emerald"
          theme={theme}
        />
        <StatCard
          label="Theoretical SE(X̄)"
          formula="σ / √n"
          value={primarySim.theoretical.standardError.toFixed(4)}
          subValue={`Pop σ = ${primarySim.theoretical.populationStdDev.toFixed(4)}`}
          accent="blue"
          theme={theme}
        />
        <StatCard
          label="Simulated SD of X̄"
          formula="s_x̄"
          value={primarySim.simulatedStdDev.toFixed(4)}
          subValue={`|Δ| = ${Math.abs(
            primarySim.simulatedStdDev - primarySim.theoretical.standardError
          ).toFixed(4)}`}
          accent="amber"
          theme={theme}
        />
        <StatCard
          label="Sample Size"
          formula="n"
          value={sampleSize}
          subValue="Observations per mean"
          accent="default"
          theme={theme}
        />
        <StatCard
          label="Repeated Samples"
          formula="R"
          value={safeReps.toLocaleString()}
          subValue={`Seed = ${safeSeed}`}
          accent="default"
          theme={theme}
        />
      </div>

      {/* Main Sandbox: Controls + Active Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column (4 cols) */}
        <div
          className={`lg:col-span-4 rounded-xl border p-5 space-y-6 ${
            isDark
              ? 'bg-slate-900/70 border-slate-800'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          {/* 1. Source Distribution Selector */}
          <div>
            <h2
              className={`text-sm font-semibold mb-2.5 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              1. Source Population Distribution
            </h2>
            <div className="space-y-2">
              {(
                [
                  {
                    id: 'uniform',
                    title: 'Uniform(0, 1)',
                    desc: 'μ = 0.5, σ² = 1/12 ≈ 0.0833 (Bounded flat)',
                  },
                  {
                    id: 'exponential',
                    title: 'Exponential(rate = 1)',
                    desc: 'μ = 1.0, σ² = 1.0 (Strongly right-skewed)',
                  },
                  {
                    id: 'binomial',
                    title: 'Binomial(n = 10, p = 0.3)',
                    desc: 'μ = 3.0, σ² = 2.1 (Discrete trial counts)',
                  },
                ] as const
              ).map((item) => {
                const active = sourceDist === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSourceDist(item.id)}
                    aria-pressed={active}
                    className={`w-full p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      active
                        ? isDark
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-slate-100'
                          : 'bg-sky-50 border-sky-500 text-slate-900'
                        : isDark
                          ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-semibold font-mono">
                      {item.title}
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      {item.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Sample Size Selector */}
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
              2. Sample Size per Repetition (n)
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {SAMPLE_SIZES.map((nVal) => {
                const active = sampleSize === nVal;
                return (
                  <button
                    key={nVal}
                    type="button"
                    onClick={() => setSampleSize(nVal)}
                    aria-pressed={active}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                      active
                        ? isDark
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-sky-600 border-sky-600 text-white'
                        : isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    n = {nVal}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Simulation Configuration */}
          <div
            className={`pt-4 border-t space-y-4 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <h2
              className={`text-sm font-semibold ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              3. Monte Carlo &amp; Histogram Controls
            </h2>

            <ParameterControl
              label="Number of Repetitions"
              symbol="R"
              value={repetitions}
              min={100}
              max={20000}
              step={100}
              helpText="Default 2,000"
              error={repError}
              onChange={(v) => setRepetitions(Math.round(v))}
              theme={theme}
            />

            <ParameterControl
              label="Histogram Bins"
              symbol="bins"
              value={numBins}
              min={10}
              max={60}
              step={2}
              error={binError}
              onChange={(v) => setNumBins(Math.round(v))}
              theme={theme}
            />

            <ParameterControl
              label="Random Seed (Mulberry32)"
              symbol="seed"
              value={seed}
              min={1}
              max={99999}
              step={1}
              helpText="Deterministic PRNG"
              onChange={(v) => setSeed(Math.round(v))}
              theme={theme}
            />

            <label className="flex items-center justify-between pt-2 cursor-pointer text-xs">
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                Overlay Theoretical Normal Curve N(μ, σ²/n)
              </span>
              <input
                type="checkbox"
                checked={showNormalApprox}
                onChange={(e) => setShowNormalApprox(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Charts Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <ChartCard
            title={`Sampling Distribution of Sample Means: ${primarySim.theoretical.label} (n = ${sampleSize})`}
            badgeText={`SE(X̄) = ${primarySim.theoretical.standardError.toFixed(4)}`}
            subtitle={`Density-normalized histogram of ${safeReps.toLocaleString()} simulated sample means (seed ${safeSeed}) vs. theoretical CLT normal approximation N(${primarySim.theoretical.populationMean}, ${primarySim.theoretical.standardError.toFixed(4)}²).`}
            theme={theme}
            footer="Note: The Central Limit Theorem governs the distribution of sample means X̄_n, not individual observations. For skewed populations like Exponential(1), n = 1 retains the exponential skew, whereas n ≥ 30 closely matches the Gaussian bell curve."
          >
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={primaryHistogram.bins}
                  margin={{ top: 12, right: 18, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="binCenter"
                    tickFormatter={(v) => Number(v).toFixed(2)}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    label={{
                      value: 'Sample Mean x̄',
                      position: 'insideBottomRight',
                      offset: -5,
                      fill: axisColor,
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11 }}
                    label={{
                      value: 'Probability Density',
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
                    name={`Simulated Density (n = ${sampleSize})`}
                    fill="#06b6d4"
                    fillOpacity={0.55}
                  />
                  {showNormalApprox && (
                    <Line
                      type="monotone"
                      dataKey="normalApproxDensity"
                      name="Theoretical Normal N(μ, σ²/n)"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  )}
                  <ReferenceLine
                    x={primarySim.theoretical.populationMean}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    label={{
                      value: `μ=${primarySim.theoretical.populationMean}`,
                      position: 'top',
                      fill: '#f43f5e',
                      fontSize: 11,
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Multi-Sample-Size Comparison Chart (n = 1, 5, 30, 100) */}
          <ChartCard
            title={`Sample Size Convergence Comparison: n ∈ {1, 5, 30, 100} for ${primarySim.theoretical.label}`}
            badgeText="SE(X̄) = σ / √n"
            subtitle="Common-axis density profiles showing concentration around population mean μ and reduction in standard error as n increases."
            theme={theme}
            footer="Increasing sample size from n = 1 to n = 100 reduces the standard error SE(X̄) = σ/√n by a factor of √100 = 10×."
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={multiSizeComparison.rows}
                  margin={{ top: 10, right: 18, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="binCenter"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    label={{
                      value: 'Sample Mean x̄',
                      position: 'insideBottomRight',
                      offset: -5,
                      fill: axisColor,
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11 }}
                    label={{
                      value: 'Normalized Density',
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
                    dataKey="n1Density"
                    name="n = 1 (Raw Pop)"
                    stroke="#94a3b8"
                    strokeWidth={1.8}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="n5Density"
                    name="n = 5"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="n30Density"
                    name="n = 30"
                    stroke="#34d399"
                    strokeWidth={2.2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="n100Density"
                    name="n = 100"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <ReferenceLine
                    x={primarySim.theoretical.populationMean}
                    stroke="#f43f5e"
                    strokeDasharray="3 3"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Quantitative Comparison Table Across n = 1, 5, 30, 100 */}
      <div
        className={`rounded-xl border p-5 space-y-3 ${
          isDark
            ? 'bg-slate-900/70 border-slate-800'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3
            className={`text-base font-semibold ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            Theoretical vs. Simulated Convergence Table across Sample Sizes ({primarySim.theoretical.label})
          </h3>
          <span className="text-xs font-mono text-cyan-400">
            Population σ² = {primarySim.theoretical.populationVariance.toFixed(4)}
          </span>
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
                <th className="py-2.5 px-3 font-sans font-semibold">Sample Size (n)</th>
                <th className="py-2.5 px-3 font-sans font-semibold">Theoretical Mean (μ)</th>
                <th className="py-2.5 px-3 font-sans font-semibold">Simulated Mean (x̄)</th>
                <th className="py-2.5 px-3 font-sans font-semibold">
                  Theoretical SE (σ / √n)
                </th>
                <th className="py-2.5 px-3 font-sans font-semibold">
                  Simulated SD (s_x̄)
                </th>
                <th className="py-2.5 px-3 font-sans font-semibold text-right">
                  SE Error |Δ|
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? 'divide-slate-800/70' : 'divide-slate-200'
              }`}
            >
              {multiSizeComparison.summaries.map((sim) => {
                const seDiff = Math.abs(
                  sim.simulatedStdDev - sim.theoretical.standardError
                );
                return (
                  <tr
                    key={sim.sampleSize}
                    className={
                      sim.sampleSize === sampleSize
                        ? isDark
                          ? 'bg-cyan-500/10'
                          : 'bg-sky-50'
                        : ''
                    }
                  >
                    <td className="py-2.5 px-3 font-semibold">
                      n = {sim.sampleSize}
                    </td>
                    <td className="py-2.5 px-3">
                      {sim.theoretical.populationMean.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400">
                      {sim.simulatedMean.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3">
                      {sim.theoretical.standardError.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 text-amber-400">
                      {sim.simulatedStdDev.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">
                      {seDiff.toFixed(4)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
