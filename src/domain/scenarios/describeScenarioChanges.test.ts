import { describe, expect, it } from "vitest";

import { createDefaultPensionInputs } from "../../config/defaultPensionInputs";
import { describeScenarioChanges } from "./describeScenarioChanges";

describe("describeScenarioChanges", () => {
  it("describes age, contribution and percentage changes", () => {
    const activeInputs = createDefaultPensionInputs();
    const inputs = {
      ...activeInputs,
      retirementAge: 65,
      monthlyEmployeeContribution: 250,
      annualReturn: 0.06,
    };

    expect(describeScenarioChanges(inputs, activeInputs)).toEqual([
      "Retires 3 years earlier",
      "Employee contribution is £150/month higher",
      "Expected return changes from 5% to 6%",
    ]);
  });

  it("describes a newly added future extra contribution", () => {
    const activeInputs = createDefaultPensionInputs();
    const inputs = {
      ...activeInputs,
      extraContributionAge: 50,
      extraMonthlyContribution: 300,
    };

    expect(describeScenarioChanges(inputs, activeInputs)).toContain(
      "Adds an extra £300/month from age 50",
    );
  });

  it("returns no changes for identical inputs", () => {
    const activeInputs = createDefaultPensionInputs();

    expect(describeScenarioChanges({ ...activeInputs }, activeInputs)).toEqual([]);
  });
});
