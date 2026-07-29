export function calculateAnnualFees(
  openingBalance: number,
  annualFee: number
): number {
  return openingBalance * annualFee;
}