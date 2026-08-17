import { describe, expect, it } from "vitest";

import { createLivingStandardsProgression } from "./createLivingStandardsProgression";

const standards = {
  minimum: 13_900,
  moderate: 32_700,
  comfortable: 45_400,
};

describe("createLivingStandardsProgression", () => {
  it("links the target, sustainable income and next lifestyle benchmark", () => {
    expect(createLivingStandardsProgression(30_000, 36_068, standards)).toEqual({
      targetSpending: 30_000,
      sustainableSpending: 36_068,
      targetHeadroom: 6_068,
      supportedLevel: "moderate",
      supportedAmount: 32_700,
      nextLevel: "comfortable",
      nextAmount: 45_400,
      nextLevelGap: 9_332,
    });
  });

  it("identifies minimum as the next benchmark when none is reached", () => {
    const result = createLivingStandardsProgression(10_000, 12_000, standards);

    expect(result.supportedLevel).toBeNull();
    expect(result.nextLevel).toBe("minimum");
    expect(result.nextLevelGap).toBe(1_900);
  });

  it("has no next benchmark after comfortable is reached", () => {
    const result = createLivingStandardsProgression(40_000, 50_000, standards);

    expect(result.supportedLevel).toBe("comfortable");
    expect(result.nextLevel).toBeNull();
    expect(result.nextAmount).toBeNull();
    expect(result.nextLevelGap).toBe(0);
  });

  it("reports a target shortfall when sustainable spending is below the target", () => {
    expect(createLivingStandardsProgression(35_000, 32_000, standards).targetHeadroom).toBe(-3_000);
  });

  it("rejects invalid values", () => {
    expect(() => createLivingStandardsProgression(-1, 20_000, standards)).toThrow(/finite and non-negative/i);
  });
});
