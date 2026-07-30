import { describe, expect, it } from "vitest";

import { createProjectionYearFromAccumulator } from "./createProjectionYearFromAccumulator";
import { createPensionInputs } from "../test-data/createPensionInputs";

describe("createProjectionYearFromAccumulator", () => {
  it("creates a projection year from an accumulator", () => {
    const inputs = createPensionInputs();

    const accumulator = {
      inputs,

      yearIndex: 0,
      age: 47,

      openingBalance: 100000,
      closingBalance: 112000,

      openingInflationFactor: 1,
      closingInflationFactor: 1.02,

      contributionsNominal: 9000,
      contributionsReal: 8900,

      investmentGrowthNominal: 4000,
      investmentGrowthReal: 3950,

      feesNominal: 1000,
      feesReal: 980,
    };

    const year =
      createProjectionYearFromAccumulator(
        accumulator
      );

    expect(year).toEqual({
      yearIndex: 0,
      age: 47,

      openingBalance: {
        nominal: 100_000,
        real: 100_000,
      },

      contributions: {
        nominal: 9_000,
        real: 8_900,
      },

      investmentGrowth: {
        nominal: 4_000,
        real: 3_950,
      },

      fees: {
        nominal: 1_000,
        real: 980,
      },

      closingBalance: {
        nominal: 112_000,
        real: 112_000 / 1.02,
      },
    });
  });

  it("uses the opening inflation factor for the opening balance", () => {
    const inputs = createPensionInputs();

    const accumulator = {
      inputs,

      yearIndex: 1,
      age: 48,

      openingBalance: 120_000,
      closingBalance: 130_000,

      openingInflationFactor: 1.02,
      closingInflationFactor: 1.0404,

      contributionsNominal: 0,
      contributionsReal: 0,

      investmentGrowthNominal: 0,
      investmentGrowthReal: 0,

      feesNominal: 0,
      feesReal: 0,
    };

    const year =
      createProjectionYearFromAccumulator(
        accumulator
      );

    expect(year.openingBalance.real)
      .toBeCloseTo(
        120_000 / 1.02,
        10
      );
  });

  it("uses the closing inflation factor for the closing balance", () => {
    const inputs = createPensionInputs();

    const accumulator = {
      inputs,

      yearIndex: 1,
      age: 48,

      openingBalance: 120_000,
      closingBalance: 130_000,

      openingInflationFactor: 1.02,
      closingInflationFactor: 1.0404,

      contributionsNominal: 0,
      contributionsReal: 0,

      investmentGrowthNominal: 0,
      investmentGrowthReal: 0,

      feesNominal: 0,
      feesReal: 0,
    };

    const year =
      createProjectionYearFromAccumulator(
        accumulator
      );

    expect(year.closingBalance.real)
      .toBeCloseTo(
        130_000 / 1.0404,
        10
      );
  });

  it("copies the accumulated real flow values directly", () => {
    const inputs = createPensionInputs();

    const accumulator = {
      inputs,

      yearIndex: 0,
      age: 47,

      openingBalance: 100_000,
      closingBalance: 108_000,

      openingInflationFactor: 1,
      closingInflationFactor: 1.02,

      contributionsNominal: 9_000,
      contributionsReal: 8_850,

      investmentGrowthNominal: 3_000,
      investmentGrowthReal: 2_940,

      feesNominal: 1_000,
      feesReal: 980,
    };

    const year =
      createProjectionYearFromAccumulator(
        accumulator
      );

    expect(year.contributions.real).toBe(
      8_850
    );

    expect(year.investmentGrowth.real).toBe(
      2_940
    );

    expect(year.fees.real).toBe(980);
  });

  it("does not mutate the accumulator", () => {
    const inputs = createPensionInputs();

    const accumulator = {
      inputs,

      yearIndex: 0,
      age: 47,

      openingBalance: 100_000,
      closingBalance: 110_000,

      openingInflationFactor: 1,
      closingInflationFactor: 1.02,

      contributionsNominal: 9_000,
      contributionsReal: 8_900,

      investmentGrowthNominal: 2_000,
      investmentGrowthReal: 1_950,

      feesNominal: 1_000,
      feesReal: 980,
    };

    const original = {
      ...accumulator,
    };

    createProjectionYearFromAccumulator(
      accumulator
    );

    expect(accumulator).toEqual(original);
  });
});