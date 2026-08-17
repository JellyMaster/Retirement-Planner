import type { ScenarioDrawdownPreferences } from "../../domain/scenarios";
import { DrawdownEngine } from "./DrawdownEngine";
import { calculateIncomeForEndingBalance } from "./calculateIncomeForEndingBalance";
import { createIncomeHeadroomAssessment, type IncomeHeadroomStatus } from "./createIncomeHeadroomAssessment";
import type { DrawdownInputs } from "./models/DrawdownInputs";
import { getRetirementLivingStandards, type RetirementLivingStandardLevel } from "./retirementLivingStandards";

const drawdownEngine = new DrawdownEngine();

export interface RetirementSpendingOutcome {
  targetNetSpending: number;
  sustainableNetSpending: number;
  annualHeadroom: number;
  headroomPercent: number | null;
  status: IncomeHeadroomStatus;
  targetEndingBalance: number;
  modelledEndingBalance: number;
  livingStandard: RetirementLivingStandardLevel | null;
}

export function createRetirementSpendingOutcome(
  inputs: DrawdownInputs,
  drawdown?: ScenarioDrawdownPreferences,
): RetirementSpendingOutcome {
  const retirementPot = Math.max(0, inputs.startingBalance - inputs.taxFreeCash);
  const endingMode = drawdown?.endingBalanceMode ?? "preserve";
  const savedPercentage = drawdown?.endingBalancePercentage ?? 1;
  const reservePercentage =
    endingMode === "preserve"
      ? 1
      : endingMode === "spend-to-zero"
        ? 0
        : Math.min(1, Math.max(0, savedPercentage));
  const targetEndingBalance = retirementPot * reservePercentage;

  const currentPlan = drawdownEngine.calculate(inputs);
  const targetNetSpending = currentPlan.years[0]?.netIncome ?? 0;

  const sustainable = calculateIncomeForEndingBalance(
    {
      ...inputs,
      withdrawalStrategy: "target-income",
      incomeTargetMode: "net",
    },
    targetEndingBalance,
  );
  const sustainableNetSpending = sustainable.annualIncome;
  const assessment = createIncomeHeadroomAssessment(
    targetNetSpending,
    sustainableNetSpending,
  );

  const household = drawdown?.retirementLivingStandardsHousehold ?? "one-person";
  const region = drawdown?.retirementLivingStandardsRegion ?? "uk";
  const standards = getRetirementLivingStandards(household, region);
  const livingStandard = getSupportedLivingStandard(
    sustainableNetSpending,
    standards,
  );

  return {
    targetNetSpending,
    sustainableNetSpending,
    annualHeadroom: assessment.annualHeadroom,
    headroomPercent: assessment.headroomPercent,
    status: assessment.status,
    targetEndingBalance,
    modelledEndingBalance: sustainable.result.finalBalance,
    livingStandard,
  };
}

function getSupportedLivingStandard(
  sustainableNetSpending: number,
  standards: ReturnType<typeof getRetirementLivingStandards>,
): RetirementLivingStandardLevel | null {
  if (sustainableNetSpending >= standards.comfortable) return "comfortable";
  if (sustainableNetSpending >= standards.moderate) return "moderate";
  if (sustainableNetSpending >= standards.minimum) return "minimum";
  return null;
}
