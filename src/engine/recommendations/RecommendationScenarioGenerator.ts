import type { PensionInputs } from "../models/PensionInputs";
import type { RecommendationScenario } from "./RecommendationTypes";

function contributionScenario(
  inputs: PensionInputs,
  amount: number,
): RecommendationScenario {
  return {
    id: `increase-contribution-${amount}`,
    category: "saving",
    title: `Save £${amount} more each month`,
    description: `Increase your employee pension contribution by £${amount} a month while keeping your planned retirement age unchanged.`,
    effort: amount <= 50 ? "low" : amount <= 100 ? "medium" : "high",
    inputs: {
      ...inputs,
      monthlyEmployeeContribution:
        inputs.monthlyEmployeeContribution + amount,
    },
    changeMagnitude: amount,
    changes: [`Employee contribution +£${amount} a month`],
  };
}

function retirementScenario(
  inputs: PensionInputs,
  years: number,
): RecommendationScenario {
  return {
    id: `retire-${years}-year${years === 1 ? "" : "s"}-later`,
    category: "retirement-timing",
    title: `Retire ${years === 1 ? "one year" : `${years} years`} later`,
    description: `Continue contributions and investment growth until age ${inputs.retirementAge + years}.`,
    effort: years === 1 ? "medium" : "high",
    inputs: {
      ...inputs,
      retirementAge: inputs.retirementAge + years,
    },
    changeMagnitude: years,
    changes: [`Retirement age +${years}`],
  };
}

function feeScenario(inputs: PensionInputs): RecommendationScenario | null {
  if (inputs.annualFee <= 0) return null;

  const reduction = Math.min(0.0025, inputs.annualFee);
  const nextFee = Math.max(0, inputs.annualFee - reduction);

  if (nextFee === inputs.annualFee) return null;

  return {
    id: "reduce-fees",
    category: "fees",
    title: "Reduce annual pension fees",
    description: `Illustrate the effect of reducing annual fees from ${(inputs.annualFee * 100).toFixed(2)}% to ${(nextFee * 100).toFixed(2)}%.`,
    effort: "medium",
    inputs: {
      ...inputs,
      annualFee: nextFee,
    },
    changeMagnitude: reduction * 10_000,
    changes: [
      `Annual fee −${(reduction * 100).toFixed(2)} percentage points`,
    ],
  };
}

function combinedScenario(inputs: PensionInputs): RecommendationScenario | null {
  if (inputs.retirementAge >= 100) return null;

  return {
    id: "save-50-retire-one-year-later",
    category: "combined",
    title: "Save £50 more and retire one year later",
    description:
      "Combine a modest contribution increase with one additional year of saving and investment growth.",
    effort: "high",
    inputs: {
      ...inputs,
      monthlyEmployeeContribution:
        inputs.monthlyEmployeeContribution + 50,
      retirementAge: inputs.retirementAge + 1,
    },
    changeMagnitude: 2,
    changes: ["Employee contribution +£50 a month", "Retirement age +1"],
  };
}

export function generateRecommendationScenarios(
  inputs: PensionInputs,
): RecommendationScenario[] {
  const scenarios: Array<RecommendationScenario | null> = [
    contributionScenario(inputs, 50),
    contributionScenario(inputs, 100),
    contributionScenario(inputs, 250),
    inputs.retirementAge < 100 ? retirementScenario(inputs, 1) : null,
    inputs.retirementAge < 99 ? retirementScenario(inputs, 2) : null,
    feeScenario(inputs),
    combinedScenario(inputs),
  ];

  return scenarios.filter(
    (scenario): scenario is RecommendationScenario => scenario !== null,
  );
}
