import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TabId } from '../components/Navigation';
import { FormulaCard } from '../components/FormulaCard';
import { NineChartGrid } from '../components/NineChartGrid';

interface OverviewProps {
  onSelectTab: (tab: TabId) => void;
  theme: 'dark' | 'light';
}

export const Overview: React.FC<OverviewProps> = ({ onSelectTab, theme }) => {
  const isDark = theme === 'dark';

  const moduleCards: {
    id: TabId;
    number: string;
    title: string;
    keyFormula: string;
    summary: string;
    highlights: string;
    ctaLabel: string;
  }[] = [
    {
      id: 'normal',
      number: '01',
      title: 'Normal Distribution',
      keyFormula: 'f(x) = [1 / (σ√(2π))] exp[-(x − μ)² / (2σ²)]',
      summary:
        'Explore the Gaussian distribution, compare location and scale shifts, verify the 68–95–99.7 empirical rule, standardize exam scores, and inspect Xavier/Glorot neural network weight initialization.',
      highlights: 'PDF & CDF · Z-Scores · Empirical Rule · Xavier Init',
      ctaLabel: 'Open Normal Distribution',
    },
    {
      id: 'exponential',
      number: '02',
      title: 'Exponential Distribution',
      keyFormula: 'f(x) = λ exp(−λx),  F(x) = 1 − exp(−λx),  x ≥ 0',
      summary:
        'Analyze continuous waiting times between independent Poisson events. Compare decay rates λ, distinguish rate λ from scale β = 1/λ, and verify the memoryless property numerically.',
      highlights: 'Rate vs Scale · Survival S(x) · Memoryless Proof',
      ctaLabel: 'Open Exponential Distribution',
    },
    {
      id: 'clt',
      number: '03',
      title: 'Central Limit Theorem',
      keyFormula: 'X̄_n ~ N(μ, σ² / n)  as  n → ∞',
      summary:
        'Run reproducible seeded Monte Carlo sampling experiments on Uniform(0,1), Exponential(1), and Binomial(10, 0.3) populations across sample sizes n ∈ {1, 5, 30, 100}.',
      highlights: 'Seeded PRNG · Standard Error σ/√n · Multi-n Overlay',
      ctaLabel: 'Open CLT Simulation',
    },
    {
      id: 'moments',
      number: '04',
      title: 'Moments Analysis',
      keyFormula: 'E[X^k]  and  μ̂_k = (1/N) Σ (x_i − x̄)^k',
      summary:
        'Compare exact theoretical raw moments of N(0,1) with empirical central moments from a seeded N = 1,000 sample drawn from N(μ = 5, σ = 2), including skewness and Fisher excess kurtosis.',
      highlights: 'Raw Moments [0,1,0,3] · Central [0,4,0,48] · Kurtosis',
      ctaLabel: 'Open Moments Analysis',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Introduction Section */}
      <section
        className={`rounded-2xl border p-6 sm:p-8 ${
          isDark
            ? 'bg-slate-900/60 border-slate-800'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div className="max-w-3xl space-y-3">
          <div
            className={`text-xs font-mono ${
              isDark ? 'text-cyan-400' : 'text-sky-700'
            }`}
          >
            Undergraduate Engineering Statistics &amp; Machine Learning Foundations
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold tracking-tight text-balance ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            Continuous Probability Distributions, Sampling Behaviour &amp; Statistical Moments
          </h1>
          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            Unlike discrete random variables that assign positive probability mass to individual points, a continuous random variable{' '}
            <span className="font-mono">X</span> is governed by a{' '}
            <strong>Probability Density Function (PDF)</strong>{' '}
            <span className="font-mono">f(x) ≥ 0</span>. At any exact real value,{' '}
            <span className="font-mono">P(X = x) = 0</span>; probabilities are defined over intervals by integrating density:{' '}
            <span className="font-mono">P(a ≤ X ≤ b) = ∫_a^b f(x) dx = F(b) − F(a)</span>, where{' '}
            <span className="font-mono">F(x) = P(X ≤ x)</span> is the{' '}
            <strong>Cumulative Distribution Function (CDF)</strong>.
          </p>
        </div>
      </section>

      {/* Module Summary Cards */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2
            className={`text-lg sm:text-xl font-bold tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            Interactive Laboratory Modules
          </h2>
          <span
            className={`text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Select any module to launch interactive parameter controls
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {moduleCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-6 flex flex-col justify-between transition-colors ${
                isDark
                  ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`text-lg font-semibold tracking-tight ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    {card.number}. {card.title}
                  </h3>
                  <span
                    className={`text-xs font-mono ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {card.highlights}
                  </span>
                </div>

                <div
                  className={`px-3 py-2 rounded-lg font-mono text-xs border overflow-x-auto ${
                    isDark
                      ? 'bg-slate-950 border-slate-800/80 text-cyan-300'
                      : 'bg-slate-50 border-slate-200 text-sky-900'
                  }`}
                >
                  {card.keyFormula}
                </div>

                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {card.summary}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/40 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onSelectTab(card.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25'
                      : 'bg-sky-600 text-white hover:bg-sky-700'
                  }`}
                >
                  <span>{card.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formula Reference Section */}
      <section className="space-y-4">
        <div>
          <h2
            className={`text-lg sm:text-xl font-bold tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            Core Mathematical Formula Reference
          </h2>
          <p
            className={`text-xs sm:text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Exact analytical definitions implemented in the TypeScript mathematical engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormulaCard
            title="Normal PDF & Standardization"
            formula="f(x) = [1/(σ√(2π))] exp[−(x−μ)²/(2σ²)],  z = (x−μ)/σ"
            description="Symmetric bell-shaped density parameterized by mean μ and standard deviation σ > 0. Any normal variate maps to N(0,1) via Z-score standardization."
            variables={[
              { symbol: 'μ', meaning: 'Location (mean, median, mode)' },
              { symbol: 'σ', meaning: 'Scale (standard deviation > 0)' },
            ]}
            theme={theme}
          />
          <FormulaCard
            title="Exponential PDF, CDF & Survival"
            formula="f(x) = λe^(−λx),  F(x) = 1 − e^(−λx),  S(x) = e^(−λx)"
            description="Models waiting time until the next continuous Poisson event. Satisfies the memoryless property P(X > s + t | X > s) = P(X > t)."
            variables={[
              { symbol: 'λ', meaning: 'Rate parameter (events per unit time)' },
              { symbol: 'β = 1/λ', meaning: 'Scale parameter (mean waiting time)' },
            ]}
            theme={theme}
          />
          <FormulaCard
            title="Central Limit Theorem & Standard Error"
            formula="SE(X̄) = σ / √n,   Z_n = (X̄_n − μ) / (σ / √n) → N(0,1)"
            description="For independent and identically distributed draws with finite mean μ and finite variance σ², the sampling distribution of the sample mean converges to a Normal distribution."
            variables={[
              { symbol: 'n', meaning: 'Sample size per repetition' },
              { symbol: 'SE(X̄)', meaning: 'Standard deviation of sample mean' },
            ]}
            theme={theme}
          />
          <FormulaCard
            title="Raw & Central Moments"
            formula="m_k = E[X^k],   μ_k = E[(X − μ)^k]"
            description="Raw moments measure power expectations about zero; central moments measure shape about the mean μ (variance at k=2, skewness at k=3, tail weight at k=4)."
            variables={[
              { symbol: 'N(0,1) Raw', meaning: 'E[X]=0, E[X²]=1, E[X³]=0, E[X⁴]=3' },
              { symbol: 'N(μ,σ²) Central', meaning: 'μ₁=0, μ₂=σ², μ₃=0, μ₄=3σ⁴' },
            ]}
            theme={theme}
          />
          <FormulaCard
            title="Skewness & Fisher Excess Kurtosis"
            formula="Skew = μ₃ / σ³,   Excess Kurtosis = (μ₄ / σ⁴) − 3"
            description="Standardized third and fourth central moments. Following SciPy's Fisher convention, subtracting 3 centers the normal distribution's excess kurtosis at exactly 0."
            variables={[
              { symbol: 'Skew = 0', meaning: 'Symmetric distribution tails' },
              { symbol: 'Kurt = 0', meaning: 'Mesokurtic (Gaussian baseline)' },
            ]}
            theme={theme}
          />
          <FormulaCard
            title="Xavier / Glorot Weight Initialization"
            formula="Var(W) = 2 / (n_in + n_out),   σ = √[2 / (n_in + n_out)]"
            description="Balances forward activation variance and backward gradient variance across neural network layers by scaling normal weight standard deviation inversely with layer width."
            variables={[
              { symbol: 'n_in', meaning: 'Fan-in (input units, e.g., 784)' },
              { symbol: 'n_out', meaning: 'Fan-out (output units, e.g., 128)' },
            ]}
            theme={theme}
          />
        </div>
      </section>

      {/* Nine-Chart Visualization Dashboard */}
      <section className="pt-2">
        <NineChartGrid theme={theme} />
      </section>
    </div>
  );
};
