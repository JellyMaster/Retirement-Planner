export type RetirementLivingStandardLevel = "minimum" | "moderate" | "comfortable";
export type RetirementLivingStandardHousehold = "one-person" | "two-person";
export type RetirementLivingStandardRegion = "uk" | "london";

export interface RetirementLivingStandardsBenchmark {
  year: number;
  sourceName: string;
  sourceUrl: string;
  assumesHomeOwnedOutright: boolean;
  values: Record<
    RetirementLivingStandardHousehold,
    Record<RetirementLivingStandardRegion, Record<RetirementLivingStandardLevel, number>>
  >;
}

export const RETIREMENT_LIVING_STANDARDS_2026: RetirementLivingStandardsBenchmark = {
  year: 2026,
  sourceName: "Pensions UK Retirement Living Standards",
  sourceUrl: "https://www.retirementlivingstandards.org.uk/",
  assumesHomeOwnedOutright: true,
  values: {
    "one-person": {
      uk: {
        minimum: 13_900,
        moderate: 32_700,
        comfortable: 45_400,
      },
      london: {
        minimum: 14_600,
        moderate: 34_000,
        comfortable: 47_200,
      },
    },
    "two-person": {
      uk: {
        minimum: 22_500,
        moderate: 45_400,
        comfortable: 62_700,
      },
      london: {
        minimum: 24_100,
        moderate: 47_000,
        comfortable: 64_800,
      },
    },
  },
};

export function getRetirementLivingStandards(
  household: RetirementLivingStandardHousehold,
  region: RetirementLivingStandardRegion,
) {
  return RETIREMENT_LIVING_STANDARDS_2026.values[household][region];
}
