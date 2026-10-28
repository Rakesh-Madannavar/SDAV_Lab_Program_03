import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalPDF,
  normalCDF,
  standardNormalCDF,
  standardNormalQuantile,
  normalQuantile,
  normalIntervalProb,
  calculateZScore,
  xavierInitStats,
  exponentialPDF,
  exponentialCDF,
  exponentialSurvival,
  exponentialIntervalProb,
  exponentialMoments,
  verifyMemorylessProperty,
  getTheoreticalCLTStats,
} from './distributions';
import {
  createSeededRNG,
  randomUniform,
  randomNormal,
  randomExponential,
  randomBinomial,
} from './random';
import {
  sampleMean,
  sampleVariance,
  rawMoment,
  centralMoment,
  theoreticalStandardNormalRawMoments,
  theoreticalNormalCentralMoments,
  generateMomentsAnalysisSample,
  simulateCLTSampleMeans,
} from './statistics';
import { buildHistogram } from './histogram';

test('1. Standard normal PDF at zero is approximately 0.39894228', () => {
  const pdf0 = normalPDF(0, 0, 1);
  assert.ok(
    Math.abs(pdf0 - 0.3989422804014327) < 1e-12,
    `Expected ~0.39894228, got ${pdf0}`
  );
});

test('2. Standard normal CDF at zero is exactly 0.5', () => {
  assert.equal(standardNormalCDF(0), 0.5);
  assert.equal(normalCDF(0, 0, 1), 0.5);
  assert.equal(normalCDF(5, 5, 2), 0.5);
});

test('3. Normal CDF symmetry: Φ(-z) = 1 - Φ(z) across central and tail values', () => {
  const testZ = [0.1, 0.5, 1.0, 1.96, 2.5, 3.0, 4.0];
  for (const z of testZ) {
    const left = standardNormalCDF(-z);
    const right = 1 - standardNormalCDF(z);
    assert.ok(
      Math.abs(left - right) < 1e-15,
      `Symmetry failed at z=${z}: Φ(-z)=${left}, 1-Φ(z)=${right}`
    );
  }
});

test('4. Empirical rule values match expected probabilities (68.27%, 95.45%, 99.73%)', () => {
  const p1 = normalIntervalProb(-1, 1, 0, 1);
  const p2 = normalIntervalProb(-2, 2, 0, 1);
  const p3 = normalIntervalProb(-3, 3, 0, 1);

  assert.ok(Math.abs(p1 - 0.68268949) < 1e-6, `1σ prob was ${p1}`);
  assert.ok(Math.abs(p2 - 0.95449974) < 1e-6, `2σ prob was ${p2}`);
  assert.ok(Math.abs(p3 - 0.99730020) < 1e-6, `3σ prob was ${p3}`);
});

test('4b. Standard normal quantiles invert standardNormalCDF accurately', () => {
  const probs = [0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.975, 0.99];
  for (const p of probs) {
    const q = standardNormalQuantile(p);
    const recoveredP = standardNormalCDF(q);
    assert.ok(
      Math.abs(recoveredP - p) < 1e-7,
      `Quantile inversion failed at p=${p}: q=${q}, Φ(q)=${recoveredP}`
    );
  }
  const q5 = normalQuantile(0.95, 10, 2);
  assert.ok(Math.abs(normalCDF(q5, 10, 2) - 0.95) < 1e-6);
});

test('4c. Z-scores and Xavier/Glorot initialization calculations', () => {
  assert.equal(calculateZScore(60, 70, 10), -1);
  assert.equal(calculateZScore(70, 70, 10), 0);
  assert.equal(calculateZScore(80, 70, 10), 1);
  assert.equal(calculateZScore(90, 70, 10), 2);

  const xavier = xavierInitStats(784, 128);
  assert.ok(Math.abs(xavier.variance - 2 / 912) < 1e-12);
  assert.ok(Math.abs(xavier.stdDev - Math.sqrt(2 / 912)) < 1e-12);
});

test('5. Exponential mean, variance, scale, PDF, CDF, and survival calculations are correct', () => {
  const m = exponentialMoments(2.0);
  assert.equal(m.mean, 0.5);
  assert.equal(m.scale, 0.5);
  assert.equal(m.variance, 0.25);
  assert.equal(m.stdDev, 0.5);

  assert.equal(exponentialPDF(0, 2.0), 2.0);
  assert.equal(exponentialCDF(0, 2.0), 0);
  assert.equal(exponentialSurvival(0, 2.0), 1);

  const t = 1.5;
  assert.ok(Math.abs(exponentialCDF(t, 2.0) + exponentialSurvival(t, 2.0) - 1) < 1e-15);
  assert.ok(
    Math.abs(
      exponentialIntervalProb(1, 3, 0.5) -
        (exponentialCDF(3, 0.5) - exponentialCDF(1, 0.5))
    ) < 1e-15
  );
});

test('6. Memoryless property holds numerically: P(X > s + t | X > s) = P(X > t)', () => {
  // Default example: λ = 1, s = 1, t = 2 => P(X > 2) = P(X > 3 | X > 1) = exp(-2) ≈ 0.135335
  const mem = verifyMemorylessProperty(1.0, 1.0, 2.0);
  assert.ok(Math.abs(mem.unconditionalProb - Math.exp(-2)) < 1e-15);
  assert.ok(Math.abs(mem.conditionalProb - Math.exp(-2)) < 1e-15);
  assert.ok(mem.absDifference < 1e-15);

  // Test across multiple rates and times
  const mem2 = verifyMemorylessProperty(2.5, 1.4, 0.8);
  assert.ok(mem2.absDifference < 1e-15);
});

test('7. CLT theoretical moments: Binomial(10, 0.3) has mean 3 and variance 2.1, Uniform(0,1) and Exp(1) match', () => {
  const binom = getTheoreticalCLTStats('binomial', 30);
  assert.ok(Math.abs(binom.populationMean - 3.0) < 1e-12);
  assert.ok(Math.abs(binom.populationVariance - 2.1) < 1e-12);
  assert.ok(Math.abs(binom.standardError - Math.sqrt(2.1 / 30)) < 1e-12);

  const unif = getTheoreticalCLTStats('uniform', 100);
  assert.equal(unif.populationMean, 0.5);
  assert.ok(Math.abs(unif.populationVariance - 1 / 12) < 1e-12);
  assert.ok(Math.abs(unif.standardError - Math.sqrt(1 / 12) / 10) < 1e-12);

  const exp = getTheoreticalCLTStats('exponential', 5);
  assert.equal(exp.populationMean, 1.0);
  assert.equal(exp.populationVariance, 1.0);
  assert.ok(Math.abs(exp.standardError - 1 / Math.sqrt(5)) < 1e-12);
});

test('8. Theoretical raw and central normal moments are exact', () => {
  const raw = theoreticalStandardNormalRawMoments();
  assert.equal(raw.m1, 0);
  assert.equal(raw.m2, 1);
  assert.equal(raw.m3, 0);
  assert.equal(raw.m4, 3);

  const central = theoreticalNormalCentralMoments(2);
  assert.equal(central.mu1, 0);
  assert.equal(central.mu2, 4);
  assert.equal(central.mu3, 0);
  assert.equal(central.mu4, 48);
  assert.equal(central.skewness, 0);
  assert.equal(central.excessKurtosis, 0);
});

test('9. Seeded random simulations and Moments sample are 100% reproducible', () => {
  const simA = simulateCLTSampleMeans('exponential', 30, 500, 12345);
  const simB = simulateCLTSampleMeans('exponential', 30, 500, 12345);
  assert.equal(simA.simulatedMean, simB.simulatedMean);
  assert.equal(simA.simulatedStdDev, simB.simulatedStdDev);
  assert.deepEqual(simA.sampleMeans.slice(0, 10), simB.sampleMeans.slice(0, 10));

  const momA = generateMomentsAnalysisSample(1000, 5, 2, 42);
  const momB = generateMomentsAnalysisSample(1000, 5, 2, 42);
  assert.equal(momA.sampleMeanVal, momB.sampleMeanVal);
  assert.equal(momA.sampleCentralMoments.mu2, momB.sampleCentralMoments.mu2);
  assert.equal(momA.sampleCentralMoments.mu4, momB.sampleCentralMoments.mu4);

  // Verify sample estimates for N=1000 from N(5,2) are reasonably close to population values (mean~5, mu2~4)
  assert.ok(Math.abs(momA.sampleMeanVal - 5) < 0.2);
  assert.ok(Math.abs(momA.sampleCentralMoments.mu1) < 1e-13);
  assert.ok(Math.abs(momA.sampleCentralMoments.mu2 - 4) < 0.5);

  // Histogram density integral equals 1.0
  const hist = buildHistogram(simA.sampleMeans, 25, {
    normalMean: simA.theoretical.populationMean,
    normalStdDev: simA.theoretical.standardError,
  });
  assert.ok(Math.abs(hist.densityIntegral - 1.0) < 1e-12);
});

test('10. Invalid user inputs throw descriptive validation errors without crashing silently', () => {
  assert.throws(() => normalPDF(0, 0, 0), /σ > 0/);
  assert.throws(() => normalCDF(0, 0, -2), /σ > 0/);
  assert.throws(() => normalIntervalProb(5, 2, 0, 1), /Lower bound a must not exceed upper bound b/);
  assert.throws(() => standardNormalQuantile(-0.1), /\[0, 1\]/);
  assert.throws(() => standardNormalQuantile(1.1), /\[0, 1\]/);
  assert.throws(() => exponentialPDF(1, 0), /λ > 0/);
  assert.throws(() => exponentialCDF(1, -1), /λ > 0/);
  assert.throws(() => exponentialIntervalProb(4, 1, 1), /Lower bound a must not exceed upper bound b/);
  assert.throws(() => getTheoreticalCLTStats('uniform', 0), /positive integer/);
  assert.throws(() => buildHistogram([1, 2, 3], 1), /between 2 and 200/);

  const rng = createSeededRNG(1);
  assert.throws(() => randomNormal(rng, 0, 0), /σ/);
  assert.throws(() => randomExponential(rng, -0.5), /λ/);
  assert.throws(() => randomBinomial(rng, 0, 0.5), /positive integer/);
  assert.throws(() => randomBinomial(rng, 10, 1.5), /between 0 and 1/);
  assert.throws(() => randomUniform(rng, 5, 2), /max must be >= min/);
  assert.throws(() => sampleMean([]), /empty/);
  assert.throws(() => sampleVariance([1], 1), /greater than ddof/);
  assert.throws(() => rawMoment([], 1), /empty/);
  assert.throws(() => centralMoment([1, 2], 0), /positive integer/);
});
