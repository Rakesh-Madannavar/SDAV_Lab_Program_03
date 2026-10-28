/**
 * Mathematical probability distribution functions for Normal, Exponential, and CLT models.
 * Implements high-accuracy numerical approximations with strict parameter validation.
 */

const SQRT_2PI = Math.sqrt(2 * Math.PI);
const SQRT_2 = Math.sqrt(2);

/**
 * High-accuracy complementary error function erfc(x) for x >= 0,
 * used to guarantee exact symmetry Φ(-z) = 1 - Φ(z) and Φ(0) = 0.5.
 * Uses Karagiannidis & Lioumpas / Numerical Recipes Chebyshev rational form
 * with maximum absolute error < 1.2e-7, and exact at x = 0.
 */
export function erfcPositive(x: number): number {
  if (x === 0) return 1.0;
  const z = Math.abs(x);
  const t = 1.0 / (1.0 + 0.5 * z);
  const ans =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t *
                      (-0.18628806 +
                        t *
                          (0.27886807 +
                            t *
                              (-1.13520398 +
                                t *
                                  (1.48851587 +
                                    t * (-0.82215223 + t * 0.17087277))))))))
    );
  return ans;
}

/**
 * Error function erf(x) with odd symmetry erf(-x) = -erf(x) and erf(0) = 0.
 */
export function erf(x: number): number {
  if (x === 0) return 0;
  const val = 1.0 - erfcPositive(Math.abs(x));
  return x >= 0 ? val : -val;
}

/**
 * Normal Probability Density Function (PDF):
 * f(x) = [1 / (σ√(2π))] exp[-(x - μ)² / (2σ²)]
 */
export function normalPDF(x: number, mean = 0, stdDev = 1): number {
  if (!(stdDev > 0) || !Number.isFinite(stdDev)) {
    throw new Error('Normal distribution requires standard deviation σ > 0.');
  }
  if (!Number.isFinite(x) || !Number.isFinite(mean)) {
    throw new Error('Normal PDF inputs x and μ must be finite numbers.');
  }
  const z = (x - mean) / stdDev;
  return Math.exp(-0.5 * z * z) / (stdDev * SQRT_2PI);
}

/**
 * Standard Normal Cumulative Distribution Function Φ(z).
 * Guarantees exact Φ(0) = 0.5 and exact symmetry Φ(-z) = 1 - Φ(z).
 */
export function standardNormalCDF(z: number): number {
  if (!Number.isFinite(z)) {
    if (z === Number.POSITIVE_INFINITY) return 1;
    if (z === Number.NEGATIVE_INFINITY) return 0;
    throw new Error('standardNormalCDF requires a finite number.');
  }
  if (z === 0) return 0.5;
  const halfErfc = 0.5 * erfcPositive(Math.abs(z) / SQRT_2);
  return z > 0 ? 1.0 - halfErfc : halfErfc;
}

/**
 * Normal Cumulative Distribution Function (CDF):
 * F(x) = Φ((x - μ) / σ)
 */
export function normalCDF(x: number, mean = 0, stdDev = 1): number {
  if (!(stdDev > 0) || !Number.isFinite(stdDev)) {
    throw new Error('Normal distribution requires standard deviation σ > 0.');
  }
  if (!Number.isFinite(mean)) {
    throw new Error('Normal distribution requires a finite mean μ.');
  }
  const z = (x - mean) / stdDev;
  return standardNormalCDF(z);
}

/**
 * Standard Normal Quantile Function Φ⁻¹(p) (Inverse CDF).
 * Uses Peter J. Acklam's rational approximation for central and tail regions
 * followed by one Halley/Newton refinement step for high precision across (0, 1).
 */
export function standardNormalQuantile(p: number): number {
  if (!(p >= 0 && p <= 1) || Number.isNaN(p)) {
    throw new Error('Probability p must lie in the interval [0, 1].');
  }
  if (p === 0) return Number.NEGATIVE_INFINITY;
  if (p === 1) return Number.POSITIVE_INFINITY;
  if (p === 0.5) return 0;

  // Coefficients in rational approximations
  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.383577518672690e2,
    -3.066479806614716e1,
    2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838e0,
    -2.549732539343734e0,
    4.374664141464968e0,
    2.938163982698783e0,
  ];
  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996e0,
    3.754408661907416e0,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let z: number;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    z =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    z =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    z =
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  // One Newton-Raphson refinement step against our standardNormalCDF
  const err = standardNormalCDF(z) - p;
  const pdf = normalPDF(z, 0, 1);
  if (pdf > 1e-15) {
    z = z - err / pdf;
  }
  return z;
}

/**
 * Normal Quantile Function for arbitrary mean μ and standard deviation σ > 0.
 */
export function normalQuantile(p: number, mean = 0, stdDev = 1): number {
  if (!(stdDev > 0) || !Number.isFinite(stdDev)) {
    throw new Error('Normal distribution requires standard deviation σ > 0.');
  }
  return mean + stdDev * standardNormalQuantile(p);
}

/**
 * Calculates P(a <= X <= b) for X ~ N(mean, stdDev²).
 */
export function normalIntervalProb(
  a: number,
  b: number,
  mean = 0,
  stdDev = 1
): number {
  if (!(stdDev > 0) || !Number.isFinite(stdDev)) {
    throw new Error('Normal distribution requires standard deviation σ > 0.');
  }
  if (a > b) {
    throw new Error('Lower bound a must not exceed upper bound b.');
  }
  if (a === b) return 0;
  return Math.max(0, Math.min(1, normalCDF(b, mean, stdDev) - normalCDF(a, mean, stdDev)));
}

/**
 * Calculates Z-score z = (x - μ) / σ.
 */
export function calculateZScore(x: number, mean = 0, stdDev = 1): number {
  if (!(stdDev > 0) || !Number.isFinite(stdDev)) {
    throw new Error('Standard deviation σ must be greater than 0.');
  }
  return (x - mean) / stdDev;
}

/**
 * Calculates Xavier/Glorot Normal initialization variance and standard deviation:
 * Var(W) = 2 / (fanIn + fanOut), σ = sqrt(2 / (fanIn + fanOut))
 */
export function xavierInitStats(fanIn: number, fanOut: number): {
  fanIn: number;
  fanOut: number;
  variance: number;
  stdDev: number;
} {
  if (!Number.isInteger(fanIn) || fanIn < 1 || !Number.isInteger(fanOut) || fanOut < 1) {
    throw new Error('fanIn and fanOut must be positive integers.');
  }
  const variance = 2 / (fanIn + fanOut);
  const stdDev = Math.sqrt(variance);
  return { fanIn, fanOut, variance, stdDev };
}

/**
 * Exponential Probability Density Function (PDF):
 * f(x) = λ exp(-λx) for x >= 0, and 0 for x < 0.
 */
export function exponentialPDF(x: number, rate: number): number {
  if (!(rate > 0) || !Number.isFinite(rate)) {
    throw new Error('Exponential distribution requires rate parameter λ > 0.');
  }
  if (x < 0) return 0;
  return rate * Math.exp(-rate * x);
}

/**
 * Exponential Cumulative Distribution Function (CDF):
 * F(x) = 1 - exp(-λx) for x >= 0, and 0 for x < 0.
 */
export function exponentialCDF(x: number, rate: number): number {
  if (!(rate > 0) || !Number.isFinite(rate)) {
    throw new Error('Exponential distribution requires rate parameter λ > 0.');
  }
  if (x <= 0) return 0;
  return 1 - Math.exp(-rate * x);
}

/**
 * Exponential Survival Function:
 * S(x) = P(X > x) = exp(-λx) for x >= 0, and 1 for x < 0.
 */
export function exponentialSurvival(x: number, rate: number): number {
  if (!(rate > 0) || !Number.isFinite(rate)) {
    throw new Error('Exponential distribution requires rate parameter λ > 0.');
  }
  if (x <= 0) return 1;
  return Math.exp(-rate * x);
}

/**
 * Exponential Interval Probability P(a <= X <= b).
 */
export function exponentialIntervalProb(a: number, b: number, rate: number): number {
  if (!(rate > 0) || !Number.isFinite(rate)) {
    throw new Error('Exponential distribution requires rate parameter λ > 0.');
  }
  if (a > b) {
    throw new Error('Lower bound a must not exceed upper bound b.');
  }
  const lower = Math.max(0, a);
  const upper = Math.max(0, b);
  if (lower === upper) return 0;
  return exponentialCDF(upper, rate) - exponentialCDF(lower, rate);
}

/**
 * Exponential Theoretical Moments & Parameters:
 * Mean = 1/λ, Scale β = 1/λ, Variance = 1/λ², StdDev = 1/λ, Skewness = 2, Excess Kurtosis = 6.
 */
export function exponentialMoments(rate: number): {
  rate: number;
  scale: number;
  mean: number;
  variance: number;
  stdDev: number;
  median: number;
  skewness: number;
  excessKurtosis: number;
} {
  if (!(rate > 0) || !Number.isFinite(rate)) {
    throw new Error('Exponential distribution requires rate parameter λ > 0.');
  }
  const scale = 1 / rate;
  return {
    rate,
    scale,
    mean: scale,
    variance: 1 / (rate * rate),
    stdDev: scale,
    median: Math.LN2 / rate,
    skewness: 2,
    excessKurtosis: 6,
  };
}

/**
 * Verifies the Memoryless Property of the Exponential Distribution:
 * P(X > s + t | X > s) = P(X > s + t) / P(X > s) = P(X > t) = exp(-λt).
 */
export function verifyMemorylessProperty(
  rate: number,
  s: number,
  t: number
): {
  rate: number;
  s: number;
  t: number;
  probWaitS: number; // P(X > s)
  probWaitSPlusT: number; // P(X > s + t)
  conditionalProb: number; // P(X > s + t | X > s) = P(X > s + t) / P(X > s)
  unconditionalProb: number; // P(X > t)
  absDifference: number;
} {
  if (!(rate > 0) || !Number.isFinite(rate)) {
    throw new Error('Rate parameter λ must be greater than 0.');
  }
  if (s < 0 || t < 0 || !Number.isFinite(s) || !Number.isFinite(t)) {
    throw new Error('Elapsed time s and additional time t must be non-negative.');
  }
  const probWaitS = exponentialSurvival(s, rate);
  const probWaitSPlusT = exponentialSurvival(s + t, rate);
  const conditionalProb = probWaitSPlusT / probWaitS;
  const unconditionalProb = exponentialSurvival(t, rate);
  const absDifference = Math.abs(conditionalProb - unconditionalProb);

  return {
    rate,
    s,
    t,
    probWaitS,
    probWaitSPlusT,
    conditionalProb,
    unconditionalProb,
    absDifference,
  };
}

export type CLTSourceDistribution = 'uniform' | 'exponential' | 'binomial';

export interface CLTTheoreticalStats {
  distribution: CLTSourceDistribution;
  label: string;
  parameterSummary: string;
  populationMean: number;
  populationVariance: number;
  populationStdDev: number;
  sampleSize: number;
  standardError: number;
  sampleMeanVariance: number;
}

/**
 * Returns exact theoretical population and sampling distribution parameters
 * for the three Central Limit Theorem source distributions:
 * - Uniform(0, 1): μ = 0.5, σ² = 1/12
 * - Exponential(1): μ = 1.0, σ² = 1.0
 * - Binomial(10, 0.3): μ = 3.0, σ² = 2.1
 */
export function getTheoreticalCLTStats(
  distribution: CLTSourceDistribution,
  sampleSize: number
): CLTTheoreticalStats {
  if (!Number.isInteger(sampleSize) || sampleSize < 1) {
    throw new Error('Sample size n must be a positive integer.');
  }

  let populationMean = 0;
  let populationVariance = 0;
  let label = '';
  let parameterSummary = '';

  switch (distribution) {
    case 'uniform':
      populationMean = 0.5;
      populationVariance = 1 / 12;
      label = 'Uniform(0, 1)';
      parameterSummary = 'a = 0, b = 1';
      break;
    case 'exponential':
      populationMean = 1.0;
      populationVariance = 1.0;
      label = 'Exponential(λ = 1)';
      parameterSummary = 'λ = 1.0';
      break;
    case 'binomial':
      populationMean = 10 * 0.3; // 3.0
      populationVariance = 10 * 0.3 * 0.7; // 2.1
      label = 'Binomial(n = 10, p = 0.3)';
      parameterSummary = 'n = 10, p = 0.3';
      break;
    default:
      throw new Error(`Unsupported CLT distribution: ${String(distribution)}`);
  }

  const populationStdDev = Math.sqrt(populationVariance);
  const sampleMeanVariance = populationVariance / sampleSize;
  const standardError = populationStdDev / Math.sqrt(sampleSize);

  return {
    distribution,
    label,
    parameterSummary,
    populationMean,
    populationVariance,
    populationStdDev,
    sampleSize,
    standardError,
    sampleMeanVariance,
  };
}
