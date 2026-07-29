export interface PensionInputs {
  currentAge: number;
  retirementAge: number;

  currentPot: number;

  monthlyEmployeeContribution: number;
  monthlyEmployerContribution: number;

  annualContributionIncrease: number;

  extraContributionAge?: number;
  extraMonthlyContribution?: number;

  annualReturn: number;

  annualFee: number;

  inflation: number;
}