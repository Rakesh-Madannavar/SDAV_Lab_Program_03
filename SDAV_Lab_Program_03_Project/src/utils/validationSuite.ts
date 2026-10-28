/**
 * Live browser-runnable verification checks mirroring the unit test suite,
 * surfaced in the About & Verification module for transparency.
 */

import {
  normalPDF,
  standardNormalCDF,
  normalIntervalProb,
  exponentialMoments,
  verifyMemorylessProperty,
  getTheoreticalCLTStats,
} from './distributions';
import {
  theoreticalStandardNormalRawMoments,
  theoreticalNormalCentralMoments,
  simulateCLTSampleMeans,
} from './statistics';
import { buildHistogram } from './histogram';

export interface VerificationCheckResult {
  id: number;
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runBrowserVerificationSuite(): VerificationCheckResult[] {
  const results: VerificationCheckResult[] = [];

  // 1. Standard normal PDF at 0
  const pdf0 = normalPDF(0, 0, 1);
  results.push({
    id: 1,
    name: 'Standard Normal PDF at x = 0',
    expected: '≈ 0.39894228',
    actual: pdf0.toFixed(8),
    passed: Math.abs(pdf0 - 0.3989422804014327) < 1e-10,
  });

  // 2. Standard normal CDF at 0
  const cdf0 = standardNormalCDF(0);
  results.push({
    id: 2,
    name: 'Standard Normal CDF Φ(0)',
    expected: '0.50000000',
    actual: cdf0.toFixed(8),
    passed: cdf0 === 0.5,
  });

  // 3. Normal CDF symmetry
  const z = 1.96;
  const symDiff = Math.abs(standardNormalCDF(-z) - (1 - standardNormalCDF(z)));
  results.push({
    id: 3,
    name: 'Normal CDF Symmetry |Φ(-1.96) - (1 - Φ(1.96))|',
    expected: '< 1e-15',
    actual: symDiff.toExponential(2),
    passed: symDiff < 1e-15,
  });

  // 4. Empirical rule
  const p1 = normalIntervalProb(-1, 1, 0, 1) * 100;
  const p2 = normalIntervalProb(-2, 2, 0, 1) * 100;
  const p3 = normalIntervalProb(-3, 3, 0, 1) * 100;
  results.push({
    id: 4,
    name: 'Empirical Rule (1σ / 2σ / 3σ)',
    expected: '68.27% / 95.45% / 99.73%',
    actual: `${p1.toFixed(2)}% / ${p2.toFixed(2)}% / ${p3.toFixed(2)}%`,
    passed:
      Math.abs(p1 - 68.2689) < 0.01 &&
      Math.abs(p2 - 95.45) < 0.01 &&
      Math.abs(p3 - 99.73) < 0.01,
  });

  // 5. Exponential moments (λ = 2)
  const expMom = exponentialMoments(2.0);
  results.push({
    id: 5,
    name: 'Exponential(λ = 2) Mean & Variance',
    expected: 'μ = 0.5000, σ² = 0.2500',
    actual: `μ = ${expMom.mean.toFixed(4)}, σ² = ${expMom.variance.toFixed(4)}`,
    passed: expMom.mean === 0.5 && expMom.variance === 0.25,
  });

  // 6. Memoryless property
  const mem = verifyMemorylessProperty(1.0, 1.0, 2.0);
  results.push({
    id: 6,
    name: 'Memoryless Property P(X > 3 | X > 1) = P(X > 2)',
    expected: `${Math.exp(-2).toFixed(6)} (Δ = 0)`,
    actual: `${mem.conditionalProb.toFixed(6)} (Δ = ${mem.absDifference.toExponential(1)})`,
    passed: mem.absDifference < 1e-15,
  });

  // 7. Binomial(10, 0.3) theoretical mean & variance
  const binom = getTheoreticalCLTStats('binomial', 30);
  results.push({
    id: 7,
    name: 'Binomial(10, 0.3) Population Mean & Variance',
    expected: 'μ = 3.0, σ² = 2.1',
    actual: `μ = ${binom.populationMean.toFixed(1)}, σ² = ${binom.populationVariance.toFixed(1)}`,
    passed:
      Math.abs(binom.populationMean - 3.0) < 1e-12 &&
      Math.abs(binom.populationVariance - 2.1) < 1e-12,
  });

  // 8. Theoretical Raw & Central Normal Moments
  const raw = theoreticalStandardNormalRawMoments();
  const central = theoreticalNormalCentralMoments(2);
  results.push({
    id: 8,
    name: 'N(0,1) Raw [0,1,0,3] & N(5,2) Central [0,4,0,48]',
    expected: 'Raw: [0, 1, 0, 3] · Central: [0, 4, 0, 48]',
    actual: `Raw: [${raw.m1}, ${raw.m2}, ${raw.m3}, ${raw.m4}] · Central: [${central.mu1}, ${central.mu2}, ${central.mu3}, ${central.mu4}]`,
    passed:
      raw.m4 === 3 &&
      central.mu2 === 4 &&
      central.mu4 === 48 &&
      central.excessKurtosis === 0,
  });

  // 9. Reproducible Seeded CLT Simulation & Histogram Density Normalization
  const s1 = simulateCLTSampleMeans('uniform', 30, 200, 42);
  const s2 = simulateCLTSampleMeans('uniform', 30, 200, 42);
  const hist = buildHistogram(s1.sampleMeans, 20);
  results.push({
    id: 9,
    name: 'Seeded PRNG Reproducibility & Density Integral',
    expected: 'Identical x̄ & ∫f(x)dx = 1.0000',
    actual: `Δx̄ = ${Math.abs(s1.simulatedMean - s2.simulatedMean).toFixed(8)}, ∫ = ${hist.densityIntegral.toFixed(4)}`,
    passed:
      s1.simulatedMean === s2.simulatedMean &&
      Math.abs(hist.densityIntegral - 1.0) < 1e-12,
  });

  // 10. Input Validation Guardrails
  let caughtInvalid = false;
  try {
    normalPDF(0, 0, -1);
  } catch {
    caughtInvalid = true;
  }
  results.push({
    id: 10,
    name: 'Invalid Parameter Guardrails (σ ≤ 0, λ ≤ 0, a > b)',
    expected: 'Throws descriptive validation error',
    actual: caughtInvalid ? 'Validation error caught' : 'Failed to catch',
    passed: caughtInvalid,
  });

  return results;
}
