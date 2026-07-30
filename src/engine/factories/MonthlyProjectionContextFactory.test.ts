import { describe, expect, it } from "vitest";

import { MonthlyProjectionContextFactory } from "./MonthlyProjectionContextFactory";
import { createPensionInputs } from "../test-data/createPensionInputs";

describe("MonthlyProjectionContextFactory", () => {
  it("creates a monthly projection context", () => {
    const inputs = createPensionInputs({
      currentAge: 47,
      inflation: 0,
    });

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        0,
        100_000
      );

    expect(context).toEqual({
      inputs,
      monthIndex: 0,
      age: 47,

      openingBalance: 100_000,

      employeeContribution: 0,
      employerContribution: 0,
      totalContribution: 0,

      investmentGrowth: 0,
      fees: 0,

      closingBalance: 100_000,

      inflationFactor: 1,
    });
  });

  it("preserves the supplied opening balance", () => {
    const inputs = createPensionInputs();

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        0,
        245_678.91
      );

    expect(context.openingBalance).toBe(
      245_678.91
    );

    expect(context.closingBalance).toBe(
      245_678.91
    );
  });

  it("keeps the current age throughout the first twelve months", () => {
    const inputs = createPensionInputs({
      currentAge: 47,
    });

    for (
      let monthIndex = 0;
      monthIndex < 12;
      monthIndex += 1
    ) {
      const context =
        MonthlyProjectionContextFactory.create(
          inputs,
          monthIndex,
          100_000
        );

      expect(context.age).toBe(47);
    }
  });

  it("increases the age after every twelve months", () => {
    const inputs = createPensionInputs({
      currentAge: 47,
    });

    const monthEleven =
      MonthlyProjectionContextFactory.create(
        inputs,
        11,
        100_000
      );

    const monthTwelve =
      MonthlyProjectionContextFactory.create(
        inputs,
        12,
        100_000
      );

    const monthTwentyFour =
      MonthlyProjectionContextFactory.create(
        inputs,
        24,
        100_000
      );

    expect(monthEleven.age).toBe(47);
    expect(monthTwelve.age).toBe(48);
    expect(monthTwentyFour.age).toBe(49);
  });

  it("uses an end-of-month inflation factor", () => {
    const inputs = createPensionInputs({
      inflation: 0.12,
    });

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        0,
        100_000
      );

    expect(context.inflationFactor).toBeCloseTo(
      Math.pow(1.12, 1 / 12),
      10
    );
  });

  it("uses one full year of inflation at the end of month twelve", () => {
    const inputs = createPensionInputs({
      inflation: 0.02,
    });

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        11,
        100_000
      );

    expect(context.inflationFactor).toBeCloseTo(
      1.02,
      10
    );
  });

  it("uses thirteen months of inflation for month index twelve", () => {
    const inputs = createPensionInputs({
      inflation: 0.02,
    });

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        12,
        100_000
      );

    expect(context.inflationFactor).toBeCloseTo(
      Math.pow(1.02, 13 / 12),
      10
    );
  });

  it("returns an inflation factor of one when inflation is zero", () => {
    const inputs = createPensionInputs({
      inflation: 0,
    });

    const context =
      MonthlyProjectionContextFactory.create(
        inputs,
        36,
        100_000
      );

    expect(context.inflationFactor).toBe(1);
  });

  it("creates independent contexts", () => {
    const inputs = createPensionInputs();

    const firstContext =
      MonthlyProjectionContextFactory.create(
        inputs,
        0,
        100_000
      );

    const secondContext =
      MonthlyProjectionContextFactory.create(
        inputs,
        0,
        100_000
      );

    firstContext.investmentGrowth = 500;
    firstContext.fees = 50;
    firstContext.closingBalance = 100_450;

    expect(secondContext.investmentGrowth).toBe(0);
    expect(secondContext.fees).toBe(0);
    expect(secondContext.closingBalance).toBe(
      100_000
    );
  });

  it("does not mutate the pension inputs", () => {
    const inputs = createPensionInputs({
      currentAge: 47,
      inflation: 0.02,
    });

    const originalInputs = {
      ...inputs,
    };

    MonthlyProjectionContextFactory.create(
      inputs,
      12,
      100_000
    );

    expect(inputs).toEqual(originalInputs);
  });

it("rejects a non-finite month index", () => {
  const inputs = createPensionInputs();

  expect(() =>
    MonthlyProjectionContextFactory.create(
      inputs,
      Number.NaN,
      100_000
    )
  ).toThrow(
    "Month index must be a finite number."
  );
});

  it("rejects a negative month index", () => {
    const inputs = createPensionInputs();

    expect(() =>
      MonthlyProjectionContextFactory.create(
        inputs,
        -1,
        100000
      )
    ).toThrow(
      "Month index must be a non-negative whole number."
    );
  });

  it("rejects a fractional month index", () => {
    const inputs = createPensionInputs();

    expect(() =>
      MonthlyProjectionContextFactory.create(
        inputs,
        1.5,
        100000
      )
    ).toThrow(
      "Month index must be a non-negative whole number."
    );
  });

  it("rejects a non-finite opening balance", () => {
    const inputs = createPensionInputs();

    expect(() =>
      MonthlyProjectionContextFactory.create(
        inputs,
        0,
        Number.NaN
      )
    ).toThrow(
      "Opening balance must be a finite number."
    );
  });

  it("rejects a negative opening balance", () => {
    const inputs = createPensionInputs({
            currentPot:-1

    } );

    expect(() =>
      MonthlyProjectionContextFactory.create(
        inputs,
        0,
        -1
      )
    ).toThrow(
      "Opening balance cannot be negative."
    );
  });
});