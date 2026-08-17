import { describe, expect, it } from "vitest";

import {
  getRetirementLivingStandards,
  RETIREMENT_LIVING_STANDARDS_2026,
} from "./retirementLivingStandards";

describe("2026 Retirement Living Standards", () => {
  it("stores the published UK benchmarks for one-person households", () => {
    expect(getRetirementLivingStandards("one-person", "uk")).toEqual({
      minimum: 13_900,
      moderate: 32_700,
      comfortable: 45_400,
    });
  });

  it("stores the published UK benchmarks for two-person households", () => {
    expect(getRetirementLivingStandards("two-person", "uk")).toEqual({
      minimum: 22_500,
      moderate: 45_400,
      comfortable: 62_700,
    });
  });

  it("stores the published London benchmarks", () => {
    expect(getRetirementLivingStandards("one-person", "london")).toEqual({
      minimum: 14_600,
      moderate: 34_000,
      comfortable: 47_200,
    });
    expect(getRetirementLivingStandards("two-person", "london")).toEqual({
      minimum: 24_100,
      moderate: 47_000,
      comfortable: 64_800,
    });
  });

  it("records the benchmark year and housing assumption", () => {
    expect(RETIREMENT_LIVING_STANDARDS_2026.year).toBe(2026);
    expect(RETIREMENT_LIVING_STANDARDS_2026.assumesHomeOwnedOutright).toBe(true);
  });
});
