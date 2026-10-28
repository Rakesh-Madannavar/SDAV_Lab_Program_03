import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import {
  normalPDF,
  standardNormalCDF,
  standardNormalQuantile,
  exponentialPDF,
  exponentialSurvival,
} from '../utils/distributions';
import { simulateCLTSampleMeans } from '../utils/statistics';
import {
  buildHistogram,
  buildMultiSampleSizeComparison,
} from '../utils/histogram';
import { ChartCard } from './ChartCard';

interface NineChartGridProps {
  theme: 'dark' | 'light';
}

export const NineChartGrid: React.FC<NineChartGridProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const axisColor = isDark ? '#94a3b8' : '#475569';
  const tooltipStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#cbd5e1',
    color: isDark ? '#f1f5f9' : '#0f172a',
    fontSize: '12px',
    borderRadius: '8px',
  };

  // Chart 1: Normal PDFs for 4 parameter combinations
  const chart1Data = useMemo(() => {
    const pts = [];
    for (let x = -6; x <= 6.001; x += 0.15) {
      const xv = Number(x.toFixed(2));
      pts.push({
        x: xv,
        n0_1: Number(normalPDF(xv, 0, 1).toFixed(5)),
        n2_1: Number(normalPDF(xv, 2, 1).toFixed(5)),
        n0_2: Number(normalPDF(xv, 0, 2).toFixed(5)),
        nm2_05: Number(normalPDF(xv, -2, 0.5).toFixed(5)),
      });
    }
    return pts;
  }, []);

  // Chart 2: Standard Normal 68-95-99.7 Rule with non-overlapping bands
  const chart2Data = useMemo(() => {
    const pts = [];
    for (let z = -3.8; z <= 3.801; z += 0.08) {
      const zv = Number(z.toFixed(2));
      const pdf = Number(normalPDF(zv, 0, 1).toFixed(5));
      const absZ = Math.abs(zv);
      pts.push({
        z: zv,
        pdf,
        band1: absZ <= 1.01 ? pdf : null,
        band2: absZ >= 0.99 && absZ <= 2.01 ? pdf : null,
        band3: absZ >= 1.99 && absZ <= 3.01 ? pdf : null,
      });
    }
    return pts;
  }, []);

  // Chart 3: Standard Normal CDF with 25th, 50th, 75th, 95th percentile markers
  const chart3Data = useMemo(() => {
    const pts = [];
    for (let z = -3.5; z <= 3.501; z += 0.1) {
      const zv = Number(z.toFixed(2));
      pts.push({
        z: zv,
        cdf: Number(standardNormalCDF(zv).toFixed(5)),
      });
    }
    return pts;
  }, []);

  const percentiles = useMemo(
    () => [
      { p: 0.25, label: 'P25', z: Number(standardNormalQuantile(0.25).toFixed(2)) },
      { p: 0.5, label: 'P50', z: 0 },
      { p: 0.75, label: 'P75', z: Number(standardNormalQuantile(0.75).toFixed(2)) },
      { p: 0.95, label: 'P95', z: Number(standardNormalQuantile(0.95).toFixed(2)) },
    ],
    []
  );

  // Chart 4: Exponential PDFs for λ = 0.5, 1.0, 2.0, 3.0
  const chart4Data = useMemo(() => {
    const pts = [];
    for (let x = 0; x <= 6.001; x += 0.1) {
      const xv = Number(x.toFixed(2));
      pts.push({
        x: xv,
        l05: Number(exponentialPDF(xv, 0.5).toFixed(5)),
        l10: Number(exponentialPDF(xv, 1.0).toFixed(5)),
        l20: Number(exponentialPDF(xv, 2.0).toFixed(5)),
        l30: Number(exponentialPDF(xv, 3.0).toFixed(5)),
      });
    }
    return pts;
  }, []);

  // Chart 5: Exponential Memoryless Property (λ = 1, P(X > 2) vs P(X > 3 | X > 1))
  const chart5Data = useMemo(() => {
    const pts = [];
    for (let x = 0; x <= 5.001; x += 0.1) {
      const xv = Number(x.toFixed(2));
      const surv = Number(exponentialSurvival(xv, 1.0).toFixed(5));
      // Conditional survival given X > 1 for x >= 1 is exp(-(x-1))
      const condSurv =
        xv >= 1 ? Number(exponentialSurvival(xv - 1, 1.0).toFixed(5)) : null;
      pts.push({
        x: xv,
        survival: surv,
        conditionalGivengt1: condSurv,
      });
    }
    return pts;
  }, []);

  // Chart 6: Sample-mean density histograms for Exponential(1) with n = 1, 5, 30, 100
  const chart6Data = useMemo(() => {
    const s1 = simulateCLTSampleMeans('exponential', 1, 1500, 101).sampleMeans;
    const s5 = simulateCLTSampleMeans('exponential', 5, 1500, 102).sampleMeans;
    const s30 = simulateCLTSampleMeans('exponential', 30, 1500, 103).sampleMeans;
    const s100 = simulateCLTSampleMeans('exponential', 100, 1500, 104).sampleMeans;
    return buildMultiSampleSizeComparison(
      { 1: s1, 5: s5, 30: s30, 100: s100 },
      26,
      0,
      3.0
    );
  }, []);

  // Chart 7: CLT Histogram for Uniform(0, 1), n = 30
  const chart7Data = useMemo(() => {
    const sim = simulateCLTSampleMeans('uniform', 30, 2000, 42);
    return buildHistogram(sim.sampleMeans, 24, {
      normalMean: sim.theoretical.populationMean,
      normalStdDev: sim.theoretical.standardError,
    }).bins;
  }, []);

  // Chart 8: CLT Histogram for Exponential(1), n = 30
  const chart8Data = useMemo(() => {
    const sim = simulateCLTSampleMeans('exponential', 30, 2000, 42);
    return buildHistogram(sim.sampleMeans, 24, {
      normalMean: sim.theoretical.populationMean,
      normalStdDev: sim.theoretical.standardError,
    }).bins;
  }, []);

  // Chart 9: CLT Histogram for Binomial(10, 0.3), n = 30
  const chart9Data = useMemo(() => {
    const sim = simulateCLTSampleMeans('binomial', 30, 2000, 42);
    return buildHistogram(sim.sampleMeans, 24, {
      normalMean: sim.theoretical.populationMean,
      normalStdDev: sim.theoretical.standardError,
    }).bins;
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2
            className={`text-lg sm:text-xl font-bold tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            Program 3 Reference Grid: Nine-Chart Statistical Visualization Suite
          </h2>
          <p
            className={`text-xs sm:text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Interactive web reproduction of the 3 × 3 composite figure with probability density normalization across all continuous and sampling comparisons.
          </p>
        </div>
        <span
          className={`text-xs font-mono ${
            isDark ? 'text-cyan-400' : 'text-sky-700'
          }`}
        >
          ∫ f(x) dx = 1.0 Normalized Density Scale
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Chart 1 */}
        <ChartCard
          title="1. Normal Distribution PDFs"
          badgeText="f(x)"
          subtitle="Effect of location μ and scale σ on Gaussian density curves"
          theme={theme}
          footer="Higher σ flattens the peak; changing μ shifts horizontal center without altering shape."
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart1Data} margin={{ top: 10, right: 12, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[-6, 6]}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'x', position: 'insideBottomRight', offset: -4, fill: axisColor, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'Density f(x)', angle: -90, position: 'insideLeft', offset: 18, fill: axisColor, fontSize: 11 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="n0_1" name="μ=0, σ=1" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="n2_1" name="μ=2, σ=1" stroke="#34d399" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="n0_2" name="μ=0, σ=2" stroke="#fbbf24" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="nm2_05" name="μ=-2, σ=0.5" stroke="#f472b6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 2 */}
        <ChartCard
          title="2. Empirical 68–95–99.7 Rule"
          badgeText="N(0, 1)"
          subtitle="Disjoint 1σ, 2σ, and 3σ standard normal probability regions"
          theme={theme}
          footer="P(|Z|<1) ≈ 68.27% · P(|Z|<2) ≈ 95.45% · P(|Z|<3) ≈ 99.73%"
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart2Data} margin={{ top: 10, right: 12, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="z"
                  type="number"
                  domain={[-3.8, 3.8]}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'z (σ units)', position: 'insideBottomRight', offset: -4, fill: axisColor, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'Density φ(z)', angle: -90, position: 'insideLeft', offset: 18, fill: axisColor, fontSize: 11 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="band1" name="|Z| ≤ 1 (68.27%)" stroke="none" fill="#06b6d4" fillOpacity={0.45} />
                <Area type="monotone" dataKey="band2" name="1 < |Z| ≤ 2 (+27.18%)" stroke="none" fill="#3b82f6" fillOpacity={0.35} />
                <Area type="monotone" dataKey="band3" name="2 < |Z| ≤ 3 (+4.28%)" stroke="none" fill="#6366f1" fillOpacity={0.28} />
                <Area type="monotone" dataKey="pdf" name="φ(z)" stroke="#38bdf8" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 3 */}
        <ChartCard
          title="3. Standard Normal CDF & Quantiles"
          badgeText="Φ(z)"
          subtitle="Cumulative probability with 25th, 50th, 75th, and 95th percentiles"
          theme={theme}
          footer="P25: z = -0.67 · P50: z = 0.00 · P75: z = +0.67 · P95: z = +1.64"
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart3Data} margin={{ top: 10, right: 12, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="z"
                  type="number"
                  domain={[-3.5, 3.5]}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'z', position: 'insideBottomRight', offset: -4, fill: axisColor, fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 1]}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'Φ(z)', angle: -90, position: 'insideLeft', offset: 18, fill: axisColor, fontSize: 11 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="cdf" name="CDF Φ(z)" stroke="#22d3ee" strokeWidth={2.2} dot={false} />
                {percentiles.map((pt) => (
                  <ReferenceDot
                    key={pt.label}
                    x={pt.z}
                    y={pt.p}
                    r={4}
                    fill="#f59e0b"
                    stroke="#fff"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 4 */}
        <ChartCard
          title="4. Exponential PDFs by Rate λ"
          badgeText="λ exp(-λx)"
          subtitle="Comparison of decay rates λ = 0.5, 1.0, 2.0, and 3.0"
          theme={theme}
          footer="Higher rate λ increases initial density at x = 0 and shortens mean waiting time 1/λ."
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart4Data} margin={{ top: 10, right: 12, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[0, 6]}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'x (time)', position: 'insideBottomRight', offset: -4, fill: axisColor, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'Density f(x)', angle: -90, position: 'insideLeft', offset: 18, fill: axisColor, fontSize: 11 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="l05" name="λ = 0.5" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="l10" name="λ = 1.0" stroke="#34d399" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="l20" name="λ = 2.0" stroke="#fbbf24" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="l30" name="λ = 3.0" stroke="#f472b6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 5 */}
        <ChartCard
          title="5. Exponential Memoryless Property"
          badgeText="λ = 1.0"
          subtitle="Survival S(x) = exp(-x) vs Conditional P(X > x | X > 1)"
          theme={theme}
          footer="P(X > 2) = P(X > 3 | X > 1) = exp(-2) ≈ 0.135335"
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart5Data} margin={{ top: 10, right: 12, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[0, 5]}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'x (time)', position: 'insideBottomRight', offset: -4, fill: axisColor, fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 1]}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'Survival Prob', angle: -90, position: 'insideLeft', offset: 18, fill: axisColor, fontSize: 11 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="survival" name="Unconditional P(X > x)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="conditionalGivengt1" name="Conditional P(X > x | X > 1)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                <ReferenceDot x={2} y={Number(Math.exp(-2).toFixed(5))} r={4} fill="#38bdf8" stroke="#fff" />
                <ReferenceDot x={3} y={Number(Math.exp(-2).toFixed(5))} r={4} fill="#f59e0b" stroke="#fff" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 6 */}
        <ChartCard
          title="6. Exponential(1) Sample Means by n"
          badgeText="n ∈ {1, 5, 30, 100}"
          subtitle="Convergence from right-skewed exponential to Gaussian bell curve"
          theme={theme}
          footer="As n grows from 1 to 100, variance shrinks as 1/n and skewness vanishes."
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart6Data} margin={{ top: 10, right: 12, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="binCenter"
                  type="number"
                  domain={[0, 3]}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'Sample Mean x̄', position: 'insideBottomRight', offset: -4, fill: axisColor, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'Density', angle: -90, position: 'insideLeft', offset: 18, fill: axisColor, fontSize: 11 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="n1Density" name="n = 1" stroke="#94a3b8" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="n5Density" name="n = 5" stroke="#fbbf24" strokeWidth={1.8} dot={false} />
                <Line type="monotone" dataKey="n30Density" name="n = 30" stroke="#34d399" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="n100Density" name="n = 100" stroke="#22d3ee" strokeWidth={2.2} dot={false} />
                <ReferenceLine x={1} stroke="#f43f5e" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 7 */}
        <ChartCard
          title="7. CLT: Uniform(0, 1)"
          badgeText="n = 30 · μ = 0.5"
          subtitle="Sample mean density histogram vs theoretical Normal(0.5, 1/360)"
          theme={theme}
          footer="Population: μ = 0.5000, σ² = 1/12 ≈ 0.0833 · SE(x̄) ≈ 0.0527"
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chart7Data} margin={{ top: 10, right: 12, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="binCenter"
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'Sample Mean x̄', position: 'insideBottomRight', offset: -4, fill: axisColor, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'Density', angle: -90, position: 'insideLeft', offset: 18, fill: axisColor, fontSize: 11 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="density" name="Simulated Density" fill="#0ea5e9" fillOpacity={0.55} />
                <Line type="monotone" dataKey="normalApproxDensity" name="Normal Approx" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 8 */}
        <ChartCard
          title="8. CLT: Exponential(λ = 1)"
          badgeText="n = 30 · μ = 1.0"
          subtitle="Sample mean density histogram vs theoretical Normal(1.0, 1/30)"
          theme={theme}
          footer="Population: μ = 1.0000, σ² = 1.0000 · SE(x̄) ≈ 0.1826"
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chart8Data} margin={{ top: 10, right: 12, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="binCenter"
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'Sample Mean x̄', position: 'insideBottomRight', offset: -4, fill: axisColor, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'Density', angle: -90, position: 'insideLeft', offset: 18, fill: axisColor, fontSize: 11 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="density" name="Simulated Density" fill="#10b981" fillOpacity={0.55} />
                <Line type="monotone" dataKey="normalApproxDensity" name="Normal Approx" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 9 */}
        <ChartCard
          title="9. CLT: Binomial(n = 10, p = 0.3)"
          badgeText="n = 30 · μ = 3.0"
          subtitle="Sample mean density histogram vs theoretical Normal(3.0, 2.1/30)"
          theme={theme}
          footer="Population: μ = 3.0000, σ² = 2.1000 · SE(x̄) ≈ 0.2646"
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chart9Data} margin={{ top: 10, right: 12, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="binCenter"
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'Sample Mean x̄', position: 'insideBottomRight', offset: -4, fill: axisColor, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'Density', angle: -90, position: 'insideLeft', offset: 18, fill: axisColor, fontSize: 11 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="density" name="Simulated Density" fill="#6366f1" fillOpacity={0.55} />
                <Line type="monotone" dataKey="normalApproxDensity" name="Normal Approx" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};
