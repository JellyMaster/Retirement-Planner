import { defaultPensionInputs } from "../config/defaultPensionInputs";
import { defaultRetirementGoals } from "../config/defaultRetirementGoals";
import { RetirementProjectionEngine } from "../engine/services/RetirementProjectionEngine";

export function createTestPensionInputs() {
  return {
    ...defaultPensionInputs,
    currentAge: 47,
    retirementAge: 68,
    currentPot: 194_420.91,
    monthlyEmployeeContribution: 850,
    monthlyEmployerContribution: 275,
    annualContributionIncrease: 0.03,
    annualReturn: 0.06,
    annualFee: 0.005,
    inflation: 0.025,
    extraContributionAge: 53,
    extraMonthlyContribution: 250,
  };
}

export function createTestRetirementGoals() {
  return {
    ...defaultRetirementGoals,
    desiredAnnualIncome: 40_000,
    emergencyReserve: 20_000,
    includeStatePension: true,
    statePensionAnnualAmount: 12_000,
    statePensionAge: 68,
  };
}

export function createTestProjection() {
  return RetirementProjectionEngine.calculate(createTestPensionInputs());
}
