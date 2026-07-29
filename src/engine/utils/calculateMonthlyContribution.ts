export interface ContributionInputs {
  currentAge: number;
  projectionAge: number;

  employeeContribution: number;
  employerContribution: number;

  annualIncrease: number;

  extraContributionAge?: number;
  extraMonthlyContribution?: number;
}

export function calculateMonthlyContribution(
  inputs: ContributionInputs
) {
  const yearsElapsed =
    inputs.projectionAge - inputs.currentAge;

  let employeeContribution =
    inputs.employeeContribution *
    Math.pow(
      1 + inputs.annualIncrease,
      yearsElapsed
    );

  if (
    inputs.extraContributionAge !== undefined &&
    inputs.extraMonthlyContribution !== undefined &&
    inputs.projectionAge >= inputs.extraContributionAge
  ) {
    employeeContribution +=
      inputs.extraMonthlyContribution;
  }

  return {
    employeeContribution,
    employerContribution:
      inputs.employerContribution,
  };
}