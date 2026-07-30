import { describe, expect, it } from "vitest";

import { ProjectionYearAccumulatorFactory } from "./ProjectionYearAccumulatorFactory";
import { createPensionInputs } from "../test-data/createPensionInputs";

describe("ProjectionYearAccumulatorFactory", () => {
  it("creates an empty accumulator for the first projection year", () => {
    const inputs = createPensionInputs({
      currentAge: 47,
    });

    const accumulator =
      ProjectionYearAccumulatorFactory.create(
        inputs,
        0,
        100_000,
        1
      );

    expect(accumulator).toEqual({
      inputs,

      yearIndex: 0,
      age: 47,

      openingBalance: 100_000,
      closingBalance: 100_000,

      openingInflationFactor: 1,
      closingInflationFactor: 1,

      contributionsNominal: 0,
      contributionsReal: 0,

      investmentGrowthNominal: 0,
      investmentGrowthReal: 0,

      feesNominal: 0,
      feesReal: 0,
    });
  });

  it("calculates the year index from the starting month", () => {
    const inputs = createPensionInputs();

    const firstYear =
      ProjectionYearAccumulatorFactory.create(
        inputs,
        0,
        100_000,
        1
      );

    const secondYear =
      ProjectionYearAccumulatorFactory.create(
        inputs,
        12,
        100_000,
        1.02
      );

    const thirdYear =
      ProjectionYearAccumulatorFactory.create(
        inputs,
        24,
        100_000,
        1.0404
      );

    expect(firstYear.yearIndex).toBe(0);
    expect(secondYear.yearIndex).toBe(1);
    expect(thirdYear.yearIndex).toBe(2);
  });

  it("calculates the age from the starting month", () => {
    const inputs = createPensionInputs({
      currentAge: 47,
    });

    const firstYear =
      ProjectionYearAccumulatorFactory.create(
        inputs,
        0,
        100_000,
        1
      );

    const secondYear =
      ProjectionYearAccumulatorFactory.create(
        inputs,
        12,
        100_000,
        1.02
      );

    const thirdYear =
      ProjectionYearAccumulatorFactory.create(
        inputs,
        24,
        100_000,
        1.0404
      );

    expect(firstYear.age).toBe(47);
    expect(secondYear.age).toBe(48);
    expect(thirdYear.age).toBe(49);
  });

  it("initialises the closing balance from the opening balance", () => {
    const inputs = createPensionInputs();

    const accumulator =
      ProjectionYearAccumulatorFactory.create(
        inputs,
        12,
        234_567.89,
        1.02
      );

    expect(accumulator.openingBalance).toBe(
      234_567.89
    );

    expect(accumulator.closingBalance).toBe(
      234_567.89
    );
  });

  it("initialises the closing inflation factor from the opening factor", () => {
    const inputs = createPensionInputs();

    const accumulator =
      ProjectionYearAccumulatorFactory.create(
        inputs,
        12,
        100_000,
        1.02
      );

    expect(accumulator.openingInflationFactor)
      .toBe(1.02);

    expect(accumulator.closingInflationFactor)
      .toBe(1.02);
  });

  it("initialises all yearly totals to zero", () => {
    const inputs = createPensionInputs();

    const accumulator =
      ProjectionYearAccumulatorFactory.create(
        inputs,
        0,
        100_000,
        1
      );

    expect(accumulator.contributionsNominal).toBe(0);
    expect(accumulator.contributionsReal).toBe(0);

    expect(accumulator.investmentGrowthNominal).toBe(0);
    expect(accumulator.investmentGrowthReal).toBe(0);

    expect(accumulator.feesNominal).toBe(0);
    expect(accumulator.feesReal).toBe(0);
  });

  it("creates independent accumulators", () => {
    const inputs = createPensionInputs();

    const first =
      ProjectionYearAccumulatorFactory.create(
        inputs,
        0,
        100_000,
        1
      );

    const second =
      ProjectionYearAccumulatorFactory.create(
        inputs,
        0,
        100_000,
        1
      );

    first.contributionsNominal = 9_000;
    first.closingBalance = 109_000;

    expect(second.contributionsNominal).toBe(0);
    expect(second.closingBalance).toBe(100_000);
  });
});