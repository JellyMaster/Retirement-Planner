import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { defaultRetirementGoals } from "../config/defaultRetirementGoals";
import { RETIREMENT_GOALS_STORAGE_KEY } from "../state/retirementGoalsStorage";
import { useStoredRetirementGoals } from "./useStoredRetirementGoals";

describe("useStoredRetirementGoals", () => {
  beforeEach(() => {
    localStorage.removeItem(RETIREMENT_GOALS_STORAGE_KEY);
  });

  it("loads defaults and persists updates", () => {
    const { result } = renderHook(() => useStoredRetirementGoals());

    expect(result.current[0]).toEqual(defaultRetirementGoals);

    act(() => {
      result.current[1]({
        ...result.current[0],
        desiredAnnualIncome: 45_000,
      });
    });

    expect(result.current[0].desiredAnnualIncome).toBe(45_000);
    expect(
      JSON.parse(localStorage.getItem(RETIREMENT_GOALS_STORAGE_KEY) ?? "null")
        .desiredAnnualIncome,
    ).toBe(45_000);
  });
});
