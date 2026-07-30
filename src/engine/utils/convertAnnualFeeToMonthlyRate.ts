export function convertAnnualFeeToMonthlyRate(
  annualFee: number
): number {
  if (!Number.isFinite(annualFee)) {
    throw new TypeError(
      "Annual fee must be a finite number."
    );
  }

  if (annualFee < 0 || annualFee >= 1) {
    throw new RangeError(
      "Annual fee must be at least 0 and below 100%."
    );
  }

  return 1 - Math.pow(1 - annualFee, 1 / 12);
}