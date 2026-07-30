export function convertAnnualRateToMonthlyRate(
  annualRate: number
): number {
  if (annualRate <= -1) {
    throw new RangeError(
      "Annual rate must be greater than -100%."
    );
  }

  return Math.pow(1 + annualRate, 1 / 12) - 1;
}