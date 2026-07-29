export function calculateInvestmentGrowth(
  openingBalance: number,
  annualReturn: number
): number {
  return openingBalance * annualReturn;
}