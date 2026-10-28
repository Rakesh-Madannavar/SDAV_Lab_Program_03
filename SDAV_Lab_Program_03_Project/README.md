# Interactive Continuous Probability Distributions Lab

An interactive academic web application built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Recharts**, implementing **Program 3 — Continuous Distributions: Normal, Exponential, CLT and Moments Analysis** for undergraduate engineering students studying Probability, Statistics, and AI/ML.

---

## Key Features & Modules

### 1. Overview & Nine-Chart Reference Dashboard
- Quick-start summary cards for all four core modules.
- Core mathematical formula reference cards with parameter annotations.
- Complete **3 × 3 Nine-Chart Statistical Visualization Suite** reproducing the original Matplotlib composite figure with interactive tooltips, legends, and probability density normalization ($\sum \text{density} \cdot \Delta x = 1.0$).

### 2. Normal (Gaussian) Distribution Explorer
- Interactive sliders and numeric inputs for mean $\mu$ and standard deviation $\sigma > 0$.
- Live PDF $f(x)$ and CDF $F(x)$ charts with shaded interval probability $P(a \le X \le b)$ and mean reference line.
- Toggleable reference curves for $(\mu=0,\sigma=1)$, $(\mu=2,\sigma=1)$, $(\mu=0,\sigma=2)$, and $(\mu=-2,\sigma=0.5)$.
- Z-score $z = (x - \mu)/\sigma$ and inverse normal quantile $\Phi^{-1}(p)$ calculator.
- **Empirical Rule (68–95–99.7)** verification with non-overlapping shaded $\pm 1\sigma$, $\pm 2\sigma$, and $\pm 3\sigma$ bands.
- **Exam Score Standardization** table for scores $[60, 70, 80, 90]$ with $\mu = 70, \sigma = 10$.
- **AI / Machine Learning Connection**: Xavier/Glorot weight initialization calculator ($\text{fan-in} = 784, \text{fan-out} = 128$, $\text{Var}(W) = \frac{2}{\text{fan-in} + \text{fan-out}}$, $\sigma = \sqrt{\text{Var}(W)}$).

### 3. Exponential Distribution & Memoryless Property
- Rate parameter $\lambda > 0$ and explicit scale parameter $\beta = 1/\lambda$.
- Interactive PDF, CDF, and Survival function $S(x) = P(X > x) = \exp(-\lambda x)$ charts with toggleable rate curves ($\lambda \in \{0.5, 1.0, 2.0, 3.0\}$).
- **Interactive Memoryless Property Verifier**: Demonstrates $P(X > s + t \mid X > s) = P(X > t) = \exp(-\lambda t)$ with default $s=1, t=2, \lambda=1 \implies \exp(-2) \approx 0.135335$.

### 4. Central Limit Theorem (CLT) Simulator
- Reproducible seeded Monte Carlo sampling using a deterministic **Mulberry32** pseudorandom number generator.
- Source populations:
  - $\text{Uniform}(0, 1)$ ($\mu = 0.5, \sigma^2 = 1/12$)
  - $\text{Exponential}(\lambda = 1)$ ($\mu = 1.0, \sigma^2 = 1.0$)
  - $\text{Binomial}(n = 10, p = 0.3)$ ($\mu = 3.0, \sigma^2 = 2.1$)
- Sample sizes $n \in \{1, 5, 30, 100\}$, repetitions configurable up to $20,000$, customizable seed and histogram bins.
- Overlaid theoretical normal approximation $N(\mu, \sigma^2/n)$ and multi-$n$ convergence comparison.

### 5. Statistical Moments Analysis
- **Raw Moments**: Exact theoretical raw moments $E[X^k]$ for $N(0, 1)$ ($k = 1, 2, 3, 4 \implies [0, 1, 0, 3]$) alongside empirical sample raw moments.
- **Central Moments**: Seeded random sample of $N = 1,000$ observations from $N(\mu = 5, \sigma = 2)$ comparing empirical central moments $\hat{\mu}_k = \frac{1}{N}\sum(x_i - \bar{x})^k$ against exact theoretical population central moments $[0, 4, 0, 48]$.
- Skewness and **Excess Kurtosis** using SciPy's Fisher convention (Normal excess kurtosis $= 0$).

---

## Project Architecture

```text
src/
  components/
    ChartCard.tsx
    FormulaCard.tsx
    Layout.tsx
    Navigation.tsx
    NineChartGrid.tsx
    ParameterControl.tsx
    StatCard.tsx
  modules/
    About.tsx
    CLTSimulation.tsx
    ExponentialDistribution.tsx
    MomentsAnalysis.tsx
    NormalDistribution.tsx
    Overview.tsx
  utils/
    distributions.ts
    histogram.ts
    math.test.ts
    random.ts
    statistics.ts
    validationSuite.ts
  App.tsx
  index.css
  main.tsx
```

---

## Local Installation & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Run Mathematical Unit Tests
```bash
npm test
# or directly:
npx --yes tsx --test src/utils/math.test.ts
```

### 4. Create Production Build
```bash
npm run lint
npm run build
```

---

## License

Released under the [MIT License](./LICENSE).
