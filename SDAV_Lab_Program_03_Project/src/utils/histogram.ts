/**
 * Histogram binning and probability density normalization utilities.
 * Ensures that Σ (density * binWidth) = 1.0 so histograms can be accurately compared
 * across different sample sizes and overlaid with theoretical PDF curves.
 */

import { normalPDF } from './distributions';

export interface HistogramBin {
  binIndex: number;
  binStart: number;
  binEnd: number;
  binCenter: number;
  binLabel: string;
  count: number;
  probability: number;
  density: number;
  normalApproxDensity?: number;
}

export interface HistogramResult {
  bins: HistogramBin[];
  min: number;
  max: number;
  binWidth: number;
  totalCount: number;
  densityIntegral: number;
}

/**
 * Constructs a density-normalized histogram from raw numeric observations.
 * Optionally evaluates a theoretical Normal(mean, stdDev) PDF at each bin center.
 */
export function buildHistogram(
  data: readonly number[],
  numBins = 30,
  options?: {
    min?: number;
    max?: number;
    normalMean?: number;
    normalStdDev?: number;
  }
): HistogramResult {
  if (data.length === 0) {
    throw new Error('Cannot construct histogram from empty data array.');
  }
  if (!Number.isInteger(numBins) || numBins < 2 || numBins > 200) {
    throw new Error('Number of histogram bins must be an integer between 2 and 200.');
  }

  let dataMin = Number.POSITIVE_INFINITY;
  let dataMax = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v < dataMin) dataMin = v;
    if (v > dataMax) dataMax = v;
  }

  let min = options?.min !== undefined ? options.min : dataMin;
  let max = options?.max !== undefined ? options.max : dataMax;

  // Handle degenerate case where all values are identical
  if (max <= min) {
    min = dataMin - 0.5;
    max = dataMax + 0.5;
  }

  const binWidth = (max - min) / numBins;
  const counts = new Array<number>(numBins).fill(0);
  const totalCount = data.length;

  for (let i = 0; i < totalCount; i++) {
    const v = data[i];
    if (v < min || v > max) continue;
    let idx = Math.floor((v - min) / binWidth);
    if (idx >= numBins) idx = numBins - 1;
    if (idx < 0) idx = 0;
    counts[idx]++;
  }

  const hasNormalOverlay =
    options?.normalMean !== undefined &&
    options?.normalStdDev !== undefined &&
    options.normalStdDev > 0;

  let densityIntegral = 0;
  const bins: HistogramBin[] = counts.map((count, i) => {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const binCenter = binStart + 0.5 * binWidth;
    const probability = count / totalCount;
    const density = probability / binWidth;
    densityIntegral += density * binWidth;

    const normalApproxDensity = hasNormalOverlay
      ? normalPDF(binCenter, options!.normalMean!, options!.normalStdDev!)
      : undefined;

    return {
      binIndex: i,
      binStart,
      binEnd,
      binCenter: Number(binCenter.toFixed(4)),
      binLabel: `${binStart.toFixed(2)}–${binEnd.toFixed(2)}`,
      count,
      probability,
      density,
      normalApproxDensity,
    };
  });

  return {
    bins,
    min,
    max,
    binWidth,
    totalCount,
    densityIntegral,
  };
}

export interface MultiSeriesHistogramRow {
  binCenter: number;
  binLabel: string;
  n1Density: number;
  n5Density: number;
  n30Density: number;
  n100Density: number;
}

/**
 * Builds a unified common-domain density histogram table for sample sizes n = 1, 5, 30, 100
 * so they can be compared on a single chart or small-multiple grid without misleading scale distortion.
 */
export function buildMultiSampleSizeComparison(
  samplesByN: {
    1: readonly number[];
    5: readonly number[];
    30: readonly number[];
    100: readonly number[];
  },
  numBins = 28,
  domainMin?: number,
  domainMax?: number
): MultiSeriesHistogramRow[] {
  const allValues = [
    ...samplesByN[1],
    ...samplesByN[5],
    ...samplesByN[30],
    ...samplesByN[100],
  ];
  let min = domainMin ?? Math.min(...allValues);
  let max = domainMax ?? Math.max(...allValues);
  if (max <= min) {
    min -= 0.5;
    max += 0.5;
  }

  const h1 = buildHistogram(samplesByN[1], numBins, { min, max });
  const h5 = buildHistogram(samplesByN[5], numBins, { min, max });
  const h30 = buildHistogram(samplesByN[30], numBins, { min, max });
  const h100 = buildHistogram(samplesByN[100], numBins, { min, max });

  return h1.bins.map((bin, idx) => ({
    binCenter: bin.binCenter,
    binLabel: bin.binLabel,
    n1Density: h1.bins[idx].density,
    n5Density: h5.bins[idx].density,
    n30Density: h30.bins[idx].density,
    n100Density: h100.bins[idx].density,
  }));
}
