import type { PensionInputs } from "../../engine/models/PensionInputs";
import { formatCurrency } from "../../utils/formatters";

export function describeScenarioChanges(
  inputs: PensionInputs,
  activeInputs: PensionInputs,
): string[] {
  const changes: string[] = [];

  addAgeChange(
    changes,
    inputs.currentAge,
    activeInputs.currentAge,
    "Current age",
    "older",
    "younger",
  );
  addAgeChange(
    changes,
    inputs.retirementAge,
    activeInputs.retirementAge,
    "Retires",
    "later",
    "earlier",
  );
  addCurrencyChange(
    changes,
    inputs.currentPot,
    activeInputs.currentPot,
    "Current pension",
  );
  addMonthlyCurrencyChange(
    changes,
    inputs.monthlyEmployeeContribution,
    activeInputs.monthlyEmployeeContribution,
    "Employee contribution",
  );
  addMonthlyCurrencyChange(
    changes,
    inputs.monthlyEmployerContribution,
    activeInputs.monthlyEmployerContribution,
    "Employer contribution",
  );
  addPercentageChange(
    changes,
    inputs.annualContributionIncrease,
    activeInputs.annualContributionIncrease,
    "Annual contribution increase",
  );
  addExtraContributionChanges(changes, inputs, activeInputs);
  addPercentageChange(
    changes,
    inputs.annualReturn,
    activeInputs.annualReturn,
    "Expected return",
  );
  addPercentageChange(
    changes,
    inputs.annualFee,
    activeInputs.annualFee,
    "Annual fee",
  );
  addPercentageChange(
    changes,
    inputs.inflation,
    activeInputs.inflation,
    "Inflation",
  );

  return changes;
}

function addAgeChange(
  changes: string[],
  value: number,
  activeValue: number,
  label: string,
  greaterWord: string,
  lesserWord: string,
): void {
  const difference = value - activeValue;
  if (difference === 0) return;

  const amount = Math.abs(difference);
  changes.push(
    `${label} ${amount} ${amount === 1 ? "year" : "years"} ${
      difference > 0 ? greaterWord : lesserWord
    }`,
  );
}

function addCurrencyChange(
  changes: string[],
  value: number,
  activeValue: number,
  label: string,
): void {
  const difference = value - activeValue;
  if (Math.abs(difference) < 0.5) return;

  changes.push(
    `${label} is ${formatCurrency(Math.abs(difference))} ${
      difference > 0 ? "higher" : "lower"
    }`,
  );
}

function addMonthlyCurrencyChange(
  changes: string[],
  value: number,
  activeValue: number,
  label: string,
): void {
  const difference = value - activeValue;
  if (Math.abs(difference) < 0.5) return;

  changes.push(
    `${label} is ${formatCurrency(Math.abs(difference))}/month ${
      difference > 0 ? "higher" : "lower"
    }`,
  );
}

function addPercentageChange(
  changes: string[],
  value: number,
  activeValue: number,
  label: string,
): void {
  if (Math.abs(value - activeValue) < 0.00005) return;

  changes.push(
    `${label} changes from ${formatPercentage(activeValue)} to ${formatPercentage(value)}`,
  );
}

function addExtraContributionChanges(
  changes: string[],
  inputs: PensionInputs,
  activeInputs: PensionInputs,
): void {
  const amount = inputs.extraMonthlyContribution ?? 0;
  const activeAmount = activeInputs.extraMonthlyContribution ?? 0;
  const age = inputs.extraContributionAge;
  const activeAge = activeInputs.extraContributionAge;

  if (amount <= 0 && activeAmount <= 0) return;

  if (amount > 0 && activeAmount <= 0) {
    changes.push(
      `Adds an extra ${formatCurrency(amount)}/month${
        age === undefined ? "" : ` from age ${age}`
      }`,
    );
    return;
  }

  if (amount <= 0 && activeAmount > 0) {
    changes.push("Removes the future extra contribution");
    return;
  }

  if (Math.abs(amount - activeAmount) >= 0.5) {
    const difference = amount - activeAmount;
    changes.push(
      `Extra contribution is ${formatCurrency(Math.abs(difference))}/month ${
        difference > 0 ? "higher" : "lower"
      }`,
    );
  }

  if (age !== activeAge) {
    if (age === undefined) {
      changes.push("Extra contribution start age is not set");
    } else if (activeAge === undefined) {
      changes.push(`Extra contribution starts at age ${age}`);
    } else {
      changes.push(
        `Extra contribution starts ${Math.abs(age - activeAge)} ${
          Math.abs(age - activeAge) === 1 ? "year" : "years"
        } ${age > activeAge ? "later" : "earlier"}`,
      );
    }
  }
}

function formatPercentage(value: number): string {
  return `${(value * 100).toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
}
