/**
 * Seeded Pseudorandom Number Generator (Mulberry32) and random variate generators.
 * Ensures 100% deterministic, reproducible statistical simulations in the browser.
 */

export type PRNG = () => number;

/**
 * Creates a seeded Mulberry32 PRNG returning uniform values in [0, 1).
 */
export function createSeededRNG(seed: number): PRNG {
  let state = Math.floor(seed) >>> 0;
  return function (): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a Uniform(min, max) random variate.
 */
export function randomUniform(rng: PRNG, min = 0, max = 1): number {
  if (max < min) {
    throw new Error('randomUniform: max must be >= min');
  }
  return min + (max - min) * rng();
}

/**
 * Generates a Standard Normal N(0, 1) random variate using the Box-Muller transform.
 */
export function randomStandardNormal(rng: PRNG): number {
  let u1 = 0;
  let u2 = 0;
  // Avoid log(0)
  while (u1 <= Number.EPSILON) {
    u1 = rng();
  }
  u2 = rng();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * Generates a Normal(mean, stdDev) random variate where stdDev > 0 is the standard deviation.
 */
export function randomNormal(rng: PRNG, mean = 0, stdDev = 1): number {
  if (!(stdDev > 0) || !Number.isFinite(stdDev)) {
    throw new Error('randomNormal: stdDev (σ) must be greater than 0');
  }
  return mean + stdDev * randomStandardNormal(rng);
}

/**
 * Generates an Exponential(rate) random variate using inverse transform sampling.
 */
export function randomExponential(rng: PRNG, rate = 1): number {
  if (!(rate > 0) || !Number.isFinite(rate)) {
    throw new Error('randomExponential: rate (λ) must be greater than 0');
  }
  let u = rng();
  // Ensure 1 - u > 0
  while (u >= 1 - Number.EPSILON) {
    u = rng();
  }
  return -Math.log(1 - u) / rate;
}

/**
 * Generates a Binomial(n, p) random variate using exact Bernoulli trial summation.
 */
export function randomBinomial(rng: PRNG, n: number, p: number): number {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error('randomBinomial: n must be a positive integer');
  }
  if (p < 0 || p > 1 || !Number.isFinite(p)) {
    throw new Error('randomBinomial: p must be between 0 and 1');
  }
  let successes = 0;
  for (let i = 0; i < n; i++) {
    if (rng() < p) {
      successes++;
    }
  }
  return successes;
}
