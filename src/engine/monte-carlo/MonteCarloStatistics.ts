import type { MonteCarloPercentiles } from "./MonteCarloTypes";

export function percentile(values: readonly number[], probability: number): number {
  if (values.length === 0) {
    throw new RangeError("Cannot calculate a percentile from an empty collection.");
  }

  if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
    throw new RangeError("Percentile probability must be between 0 and 1.");
  }

  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * probability;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);

  if (lowerIndex === upperIndex) {
    return sorted[lowerIndex];
  }

  const fraction = position - lowerIndex;
  return sorted[lowerIndex] + (sorted[upperIndex] - sorted[lowerIndex]) * fraction;
}

export function calculatePercentiles(
  values: readonly number[]
): MonteCarloPercentiles {
  return {
    p10: percentile(values, 0.1),
    p25: percentile(values, 0.25),
    p50: percentile(values, 0.5),
    p75: percentile(values, 0.75),
    p90: percentile(values, 0.9),
  };
}
