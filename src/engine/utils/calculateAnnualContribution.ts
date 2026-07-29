export function calculateAnnualContribution(
  employeeMonthlyContribution: number,
  employerMonthlyContribution: number
): number {
  return (
    employeeMonthlyContribution +
    employerMonthlyContribution
  ) * 12;
}