import React, { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { runBrowserVerificationSuite } from '../utils/validationSuite';

interface AboutProps {
  theme: 'dark' | 'light';
}

export const About: React.FC<AboutProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const verificationResults = useMemo(() => runBrowserVerificationSuite(), []);
  const allPassed = verificationResults.every((r) => r.passed);

  return (
    <div className="space-y-8">
      {/* Overview Card */}
      <section
        className={`rounded-xl border p-6 space-y-4 ${
          isDark
            ? 'bg-slate-900/70 border-slate-800'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div className="space-y-1">
          <div className="text-xs font-mono text-cyan-400">
            Program 3 — Continuous Distributions: Normal, Exponential, CLT and Moments Analysis
          </div>
          <h1
            className={`text-xl sm:text-2xl font-bold tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            About This Laboratory &amp; Numerical Methodology
          </h1>
        </div>

        <p
          className={`text-xs sm:text-sm leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          This interactive web application translates <strong>Program 3 (Continuous Probability Distributions, Central Limit Theorem &amp; Statistical Moments)</strong> into a self-contained browser laboratory for undergraduate engineering students studying Probability, Statistics, and Artificial Intelligence / Machine Learning. All probability density evaluations, cumulative integrals, quantile inversions, and Monte Carlo sampling experiments execute directly in TypeScript within the browser.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div
            className={`p-4 rounded-lg border space-y-1.5 ${
              isDark
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h3 className="text-xs font-semibold font-mono text-cyan-400">
              1. Numerical Integration &amp; Quantiles
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              The Standard Normal CDF <span className="font-mono">Φ(z)</span> is evaluated via complementary error function Chebyshev rational expansion (<span className="font-mono">|ε| &lt; 1.2×10⁻⁷</span>) enforcing exact <span className="font-mono">Φ(0) = 0.5</span> and <span className="font-mono">Φ(−z) = 1 − Φ(z)</span>. Inverse normal quantiles use Acklam's rational approximation refined with a Newton-Raphson step.
            </p>
          </div>

          <div
            className={`p-4 rounded-lg border space-y-1.5 ${
              isDark
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h3 className="text-xs font-semibold font-mono text-emerald-400">
              2. Reproducible Seeded PRNG
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              All random variate generators use a deterministic 32-bit <strong>Mulberry32</strong> pseudorandom number generator paired with exact Box-Muller transformation for Gaussian draws, inverse transform sampling for Exponential draws, and Bernoulli trials for Binomial draws.
            </p>
          </div>

          <div
            className={`p-4 rounded-lg border space-y-1.5 ${
              isDark
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h3 className="text-xs font-semibold font-mono text-amber-400">
              3. Density-Normalized Histograms
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              To compare empirical histograms across sample sizes <span className="font-mono">n ∈ {'{1, 5, 30, 100}'}</span> and overlay continuous PDF curves without bin-width scale distortion, all histograms normalize height as <span className="font-mono">density = count / (N · Δx)</span> so <span className="font-mono">∑ density · Δx = 1.0</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Automated Mathematical Verification Suite */}
      <section
        className={`rounded-xl border p-6 space-y-4 ${
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
              Live Mathematical Verification Suite (10/10 Checks)
            </h2>
            <p
              className={`text-xs sm:text-sm ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Real-time browser verification of the 10 mandatory mathematical invariants tested in <code className="font-mono">src/utils/math.test.ts</code>.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {allPassed
                ? 'All 10 Mathematical Invariants Verified'
                : 'Check Failures Detected'}
            </span>
          </div>
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
                <th className="py-2.5 px-3 font-sans font-semibold">#</th>
                <th className="py-2.5 px-3 font-sans font-semibold">Mathematical Invariant</th>
                <th className="py-2.5 px-3 font-sans font-semibold">Expected Benchmark</th>
                <th className="py-2.5 px-3 font-sans font-semibold">Computed Result</th>
                <th className="py-2.5 px-3 font-sans font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? 'divide-slate-800/70' : 'divide-slate-200'
              }`}
            >
              {verificationResults.map((check) => (
                <tr key={check.id}>
                  <td className="py-2.5 px-3 text-slate-500">{check.id}</td>
                  <td className="py-2.5 px-3 font-sans font-medium">
                    {check.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {check.expected}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-400">{check.actual}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={
                        check.passed ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'
                      }
                    >
                      {check.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Local Execution & Build Instructions */}
      <section
        className={`rounded-xl border p-6 space-y-4 ${
          isDark
            ? 'bg-slate-900/70 border-slate-800'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <h2
          className={`text-lg font-bold tracking-tight ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}
        >
          Local Installation, Testing &amp; Production Build Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div
            className={`p-4 rounded-lg border space-y-2 ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="font-sans font-semibold text-slate-300">
              1. Install &amp; Start Development Server
            </div>
            <pre className="text-cyan-400 overflow-x-auto">
{`npm install
npm run dev`}
            </pre>
            <p className="font-sans text-slate-400">
              Starts the Vite development server on port 3000.
            </p>
          </div>

          <div
            className={`p-4 rounded-lg border space-y-2 ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="font-sans font-semibold text-slate-300">
              2. Run Automated Unit Tests
            </div>
            <pre className="text-emerald-400 overflow-x-auto">
{`npm test
# or directly:
npx --yes tsx --test src/utils/math.test.ts`}
            </pre>
            <p className="font-sans text-slate-400">
              Executes all 10+ mathematical unit test assertions.
            </p>
          </div>

          <div
            className={`p-4 rounded-lg border space-y-2 ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="font-sans font-semibold text-slate-300">
              3. Production Bundle &amp; Typecheck
            </div>
            <pre className="text-amber-400 overflow-x-auto">
{`npm run lint
npm run build`}
            </pre>
            <p className="font-sans text-slate-400">
              Verifies zero TypeScript errors and outputs optimized static assets to <code className="font-mono">dist/</code>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
