import { describe, expect, it } from "vitest";

import { ProjectionResultFactory } from "./ProjectionResultFactory";
import type { ProjectionYear } from "../models/ProjectionYear";

describe("ProjectionResultFactory", () => {
  it("returns an empty result when there are no projection years", () => {
    const result = ProjectionResultFactory.create([]);

    expect(result).toEqual({
      years: [],

      finalBalance: {
        nominal: 0,
        real: 0,
      },

      totalContributions: {
        nominal: 0,
        real: 0,
      },

      totalInvestmentGrowth: {
        nominal: 0,
        real: 0,
      },

      totalFees: {
        nominal: 0,
        real: 0,
      },
    });
  });

  it("creates a result from a single projection year", () => {
    const year = createProjectionYear({
      closingBalance: {
        nominal: 115_000,
        real: 112_745.1,
      },

      contributions: {
        nominal: 9_000,
        real: 8_900,
      },

      investmentGrowth: {
        nominal: 7_000,
        real: 6_850,
      },

      fees: {
        nominal: 1_000,
        real: 980,
      },
    });

    const result =
      ProjectionResultFactory.create([year]);

    expect(result.years).toEqual([year]);

    expect(result.finalBalance).toEqual({
      nominal: 115_000,
      real: 112_745.1,
    });

    expect(result.totalContributions).toEqual({
      nominal: 9_000,
      real: 8_900,
    });

    expect(result.totalInvestmentGrowth).toEqual({
      nominal: 7_000,
      real: 6_850,
    });

    expect(result.totalFees).toEqual({
      nominal: 1_000,
      real: 980,
    });
  });

  it("sums values across multiple projection years", () => {
    const firstYear = createProjectionYear({
      yearIndex: 0,
      age: 47,

      contributions: {
        nominal: 9_000,
        real: 8_900,
      },

      investmentGrowth: {
        nominal: 5_000,
        real: 4_900,
      },

      fees: {
        nominal: 1_000,
        real: 980,
      },

      closingBalance: {
        nominal: 113_000,
        real: 110_784.31,
      },
    });

    const secondYear = createProjectionYear({
      yearIndex: 1,
      age: 48,

      openingBalance: {
        nominal: 113_000,
        real: 110_784.31,
      },

      contributions: {
        nominal: 10_000,
        real: 9_700,
      },

      investmentGrowth: {
        nominal: 6_500,
        real: 6_250,
      },

      fees: {
        nominal: 1_200,
        real: 1_150,
      },

      closingBalance: {
        nominal: 128_300,
        real: 123_318.92,
      },
    });

    const result =
      ProjectionResultFactory.create([
        firstYear,
        secondYear,
      ]);

    expect(result.totalContributions).toEqual({
      nominal: 19_000,
      real: 18_600,
    });

    expect(result.totalInvestmentGrowth).toEqual({
      nominal: 11_500,
      real: 11_150,
    });

    expect(result.totalFees).toEqual({
      nominal: 2_200,
      real: 2_130,
    });
  });

  it("uses the closing balance of the final year", () => {
    const firstYear = createProjectionYear({
      yearIndex: 0,

      closingBalance: {
        nominal: 110_000,
        real: 107_843.14,
      },
    });

    const secondYear = createProjectionYear({
      yearIndex: 1,

      closingBalance: {
        nominal: 125_000,
        real: 120_146.1,
      },
    });

    const result =
      ProjectionResultFactory.create([
        firstYear,
        secondYear,
      ]);

    expect(result.finalBalance).toEqual(
      secondYear.closingBalance
    );
  });

  it("creates a copy of the final balance", () => {
    const year = createProjectionYear({
      closingBalance: {
        nominal: 125_000,
        real: 120_000,
      },
    });

    const result =
      ProjectionResultFactory.create([year]);

    expect(result.finalBalance).toEqual(
      year.closingBalance
    );

    expect(result.finalBalance).not.toBe(
      year.closingBalance
    );
  });

  it("does not mutate the projection years", () => {
    const years = [
      createProjectionYear({
        yearIndex: 0,

        contributions: {
          nominal: 9_000,
          real: 8_900,
        },
      }),

      createProjectionYear({
        yearIndex: 1,

        contributions: {
          nominal: 10_000,
          real: 9_700,
        },
      }),
    ];

    const originalYears = structuredClone(years);

    ProjectionResultFactory.create(years);

    expect(years).toEqual(originalYears);
  });

  it("preserves the supplied years array", () => {
    const years = [
      createProjectionYear({
        yearIndex: 0,
      }),
    ];

    const result =
      ProjectionResultFactory.create(years);

    expect(result.years).toBe(years);
  });
});

function createProjectionYear(
  overrides: Partial<ProjectionYear> = {}
): ProjectionYear {
  return {
    yearIndex: 0,
    age: 47,

    openingBalance: {
      nominal: 100_000,
      real: 100_000,
    },

    contributions: {
      nominal: 0,
      real: 0,
    },

    investmentGrowth: {
      nominal: 0,
      real: 0,
    },

    fees: {
      nominal: 0,
      real: 0,
    },

    closingBalance: {
      nominal: 100_000,
      real: 100_000,
    },

    ...overrides,
  };
}