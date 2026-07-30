import { describe, expect, it } from "vitest";

import { MonthlyProjectionContextFactory } from "../factories/MonthlyProjectionContextFactory";
import { createPensionInputs } from "../test-data/createPensionInputs";
import { MonthlyClosingBalanceStep } from "./MonthlyClosingBalanceStep";

describe("MonthlyClosingBalanceStep", () => {
  it("calculates the monthly closing balance", () => {
    const inputs = createPensionInputs();

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        0,
        100000
      );

    context.totalContribution = 1250;
    context.investmentGrowth = 500;
    context.fees = 50;

    new MonthlyClosingBalanceStep()
      .execute(context);

    expect(context.closingBalance)
      .toBe(101700);
  });

  it("supports negative investment growth", () => {
    const inputs = createPensionInputs();

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        0,
        100000
      );

    context.totalContribution = 1000;
    context.investmentGrowth = -2000;
    context.fees = 50;

    new MonthlyClosingBalanceStep()
      .execute(context);

    expect(context.closingBalance)
      .toBe(98950);
  });
});