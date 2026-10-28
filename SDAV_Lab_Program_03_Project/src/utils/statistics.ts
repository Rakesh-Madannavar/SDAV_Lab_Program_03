/**
 * Statistical moment calculations, sample estimators, and reproducible Monte Carlo simulations.
 */

import {
  CLTSourceDistribution,
  CLTTheoreticalStats,
  getTheoreticalCLTStats,
} from './distributions';
import {
  createSeededRNG,
  randomBinomial,
  randomExponential,
  randomNormal,
  randomUniform,
} from './random';

/**
 * Calculates the arithmetic mean of a numeric array.
 */
export function sampleMean(data: readonly number[]): number {
  if (data.length === 0) {
    throw new Error('Cannot compute sample mean of an empty dataset.');
  }
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }
  return sum / data.length;
}

/**
 * Calculates the sample variance with configurable degrees of freedom delta (ddof = 0 for population/MLE, ddof = 1 for unbiased sample variance).
 */
export function sampleVariance(data: readonly number[], ddof = 0): number {
  if (data.length <= ddof) {
    throw new Error('Dataset length must be greater than ddof.');
  }
  const mean = sampleMean(data);
  let sumSq = 0;
  for (let i = 0; i < data.length; i++) {
    const diff = data[i] - mean;
    sumSq += diff * diff;
  }
  return sumSq / (data.length - ddof);
}

/**
 * Calculates the sample standard deviation.
 */
export function sampleStdDev(data: readonly number[], ddof = 0): number {
  return Math.sqrt(sampleVariance(data, ddof));
}

/**
 * Calculates the k-th sample raw moment: (1/N) Σ x_i^k
 */
export function rawMoment(data: readonly number[], k: number): number {
  if (data.length === 0) {
    throw new Error('Cannot compute raw moment of an empty dataset.');
  }
  if (!Number.isInteger(k) || k < 1) {
    throw new Error('Moment order k must be a positive integer.');
  }
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += Math.pow(data[i], k);
  }
  return sum / data.length;
}

/**
 * Calculates the k-th sample central moment:
 * μ̂_k = (1/N) Σ (x_i - x̄)^k
 */
export function centralMoment(data: readonly number[], k: number): number {
  if (data.length === 0) {
    throw new Error('Cannot compute central moment of an empty dataset.');
  }
  if (!Number.isInteger(k) || k < 1) {
    throw new Error('Moment order k must be a positive integer.');
  }
  if (k === 1) return 0; // Numerically 0 by definition of sample mean, though we compute explicitly if needed
  const mean = sampleMean(data);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += Math.pow(data[i] - mean, k);
  }
  return sum / data.length;
}

/**
 * Computes the exact k=1 raw central moment sum (1/N) Σ (x_i - x̄) to show floating-point precision (~0).
 */
export function centralMomentRawFirst(data: readonly number[]): number {
  if (data.length === 0) {
    throw new Error('Cannot compute central moment of an empty dataset.');
  }
  const mean = sampleMean(data);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] - mean;
  }
  const val = sum / data.length;
  return Math.abs(val) < 1e-12 ? 0 : val;
}

/**
 * Exact theoretical raw moments E[X^k] for Standard Normal X ~ N(0, 1), k = 1, 2, 3, 4.
 */
export function theoreticalStandardNormalRawMoments(): {
  m1: number;
  m2: number;
  m3: number;
  m4: number;
} {
  return {
    m1: 0,
    m2: 1,
    m3: 0,
    m4: 3,
  };
}

/**
 * Exact theoretical raw moments E[X^k] for arbitrary Normal X ~ N(μ, σ²), k = 1, 2, 3, 4.
 * - E[X] = μ
 * - E[X²] = μ² + σ²
 * - E[X³] = μ³ + 3μσ²
 * - E[X⁴] = μ⁴ + 6μ²σ² + 3σ⁴
 */
export function theoreticalNormalRawMoments(
  mean = 0,
  stdDev = 1
): {
  m1: number;
  m2: number;
  m3: number;
  m4: number;
} {
  if (!(stdDev > 0) || !Number.isFinite(stdDev)) {
    throw new Error('Standard deviation σ must be greater than 0.');
  }
  const s2 = stdDev * stdDev;
  const m2 = mean * mean;
  return {
    m1: mean,
    m2: m2 + s2,
    m3: m2 * mean + 3 * mean * s2,
    m4: m2 * m2 + 6 * m2 * s2 + 3 * s2 * s2,
  };
}

/**
 * Exact theoretical population central moments E[(X - μ)^k] for X ~ N(μ, σ²), k = 1, 2, 3, 4.
 * For σ = 2 (N(5, 2)):
 * - First central moment μ_1 = 0
 * - Second central moment μ_2 = σ² = 4
 * - Third central moment μ_3 = 0
 * - Fourth central moment μ_4 = 3σ⁴ = 48
 */
export function theoreticalNormalCentralMoments(stdDev: number): {
  mu1: number;
  mu2: number;
  mu3: number;
  mu4: number;
  skewness: number;
  excessKurtosis: number;
  pearsonKurtosis: number;
} {
  if (!(stdDev > 0) || !Number.isFinite(stdDev)) {
    throw new Error('Standard deviation σ must be greater than 0.');
  }
  const sigma2 = stdDev * stdDev;
  return {
    mu1: 0,
    mu2: sigma2,
    mu3: 0,
    mu4: 3 * sigma2 * sigma2,
    skewness: 0,
    excessKurtosis: 0, // SciPy Fisher convention: E[(X-μ)^4]/σ^4 - 3 = 0
    pearsonKurtosis: 3,
  };
}

/**
 * Computes sample skewness and sample excess kurtosis (Fisher's definition, matching SciPy's default).
 * Skewness = μ̂_3 / (μ̂_2)^(3/2)
 * Excess Kurtosis = μ̂_4 / (μ̂_2)^2 - 3
 */
export function sampleSkewnessAndKurtosis(data: readonly number[]): {
  skewness: number;
  excessKurtosis: number;
  pearsonKurtosis: number;
} {
  const m2 = centralMoment(data, 2);
  const m3 = centralMoment(data, 3);
  const m4 = centralMoment(data, 4);
  if (m2 <= 0) {
    return { skewness: 0, excessKurtosis: 0, pearsonKurtosis: 0 };
  }
  const skewness = m3 / Math.pow(m2, 1.5);
  const pearsonKurtosis = m4 / (m2 * m2);
  const excessKurtosis = pearsonKurtosis - 3;
  return { skewness, excessKurtosis, pearsonKurtosis };
}

export interface MomentsSampleResult {
  sampleSize: number;
  mean: number;
  stdDev: number;
  seed: number;
  observations: number[];
  sampleMeanVal: number;
  sampleStdDevVal: number;
  sampleCentralMoments: {
    mu1: number;
    mu2: number;
    mu3: number;
    mu4: number;
  };
  theoreticalCentralMoments: {
    mu1: number;
    mu2: number;
    mu3: number;
    mu4: number;
    skewness: number;
    excessKurtosis: number;
    pearsonKurtosis: number;
  };
  sampleRawMoments: {
    m1: number;
    m2: number;
    m3: number;
    m4: number;
  };
  sampleShape: {
    skewness: number;
    excessKurtosis: number;
    pearsonKurtosis: number;
  };
}

/**
 * Generates a seeded random sample of N observations from N(mean, stdDev)
 * and computes both sample central moments and theoretical population central moments.
 * Default matches Program 3 specification: N = 1,000 from N(5, 2) where σ = 2.
 */
export function generateMomentsAnalysisSample(
  sampleSize = 1000,
  mean = 5,
  stdDev = 2,
  seed = 42
): MomentsSampleResult {
  if (!Number.isInteger(sampleSize) || sampleSize < 2) {
    throw new Error('Sample size must be an integer >= 2.');
  }
  if (!(stdDev > 0) || !Number.isFinite(stdDev)) {
    throw new Error('Standard deviation σ must be greater than 0.');
  }

  const rng = createSeededRNG(seed);
  const observations = new Array<number>(sampleSize);
  for (let i = 0; i < sampleSize; i++) {
    observations[i] = randomNormal(rng, mean, stdDev);
  }

  const sampleMeanVal = sampleMean(observations);
  const mu1 = centralMomentRawFirst(observations);
  const mu2 = centralMoment(observations, 2);
  const mu3 = centralMoment(observations, 3);
  const mu4 = centralMoment(observations, 4);

  const m1 = rawMoment(observations, 1);
  const m2 = rawMoment(observations, 2);
  const m3 = rawMoment(observations, 3);
  const m4 = rawMoment(observations, 4);

  const sampleShape = sampleSkewnessAndKurtosis(observations);
  const theoreticalCentralMoments = theoreticalNormalCentralMoments(stdDev);

  return {
    sampleSize,
    mean,
    stdDev,
    seed,
    observations,
    sampleMeanVal,
    sampleStdDevVal: Math.sqrt(mu2),
    sampleCentralMoments: { mu1, mu2, mu3, mu4 },
    theoreticalCentralMoments,
    sampleRawMoments: { m1, m2, m3, m4 },
    sampleShape,
  };
}

export interface CLTSimulationResult {
  distribution: CLTSourceDistribution;
  sampleSize: number;
  repetitions: number;
  seed: number;
  sampleMeans: number[];
  simulatedMean: number;
  simulatedStdDev: number;
  simulatedVariance: number;
  theoretical: CLTTheoreticalStats;
}

/**
 * Runs a seeded Central Limit Theorem simulation for the specified source distribution,
 * sample size n, and number of repeated samples.
 */
export function simulateCLTSampleMeans(
  distribution: CLTSourceDistribution,
  sampleSize: number,
  repetitions: number,
  seed: number
): CLTSimulationResult {
  if (!Number.isInteger(sampleSize) || sampleSize < 1) {
    throw new Error('Sample size must be a positive integer.');
  }
  if (!Number.isInteger(repetitions) || repetitions < 10 || repetitions > 20000) {
    throw new Error('Repetitions must be an integer between 10 and 20,000.');
  }

  const rng = createSeededRNG(seed);
  const sampleMeans = new Array<number>(repetitions);

  for (let rep = 0; rep < repetitions; rep++) {
    let sum = 0;
    if (distribution === 'uniform') {
      for (let i = 0; i < sampleSize; i++) {
        sum += randomUniform(rng, 0, 1);
      }
    } else if (distribution === 'exponential') {
      for (let i = 0; i < sampleSize; i++) {
        sum += randomExponential(rng, 1.0);
      }
    } else if (distribution === 'binomial') {
      for (let i = 0; i < sampleSize; i++) {
        sum += randomBinomial(rng, 10, 0.3);
      }
    } else {
      throw new Error(`Unsupported distribution: ${String(distribution)}`);
    }
    sampleMeans[rep] = sum / sampleSize;
  }

  const simulatedMean = sampleMean(sampleMeans);
  const simulatedVariance = sampleVariance(sampleMeans, 0);
  const simulatedStdDev = Math.sqrt(simulatedVariance);
  const theoretical = getTheoreticalCLTStats(distribution, sampleSize);

  return {
    distribution,
    sampleSize,
    repetitions,
    seed,
    sampleMeans,
    simulatedMean,
    simulatedStdDev,
    simulatedVariance,
    theoretical,
  };
}
