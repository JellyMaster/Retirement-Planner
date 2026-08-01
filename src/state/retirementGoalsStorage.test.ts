import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultRetirementGoals } from "../config/defaultRetirementGoals";
import {
  loadStoredRetirementGoals,
  RETIREMENT_GOALS_STORAGE_KEY,
  RETIREMENT_GOALS_UPDATED_EVENT,
  saveRetirementGoals,
} from "./retirementGoalsStorage";

describe("retirementGoalsStorage", () => {
  beforeEach(() => {
    localStorage.removeItem(RETIREMENT_GOALS_STORAGE_KEY);
  });

  it("returns the fallback when no saved goals exist", () => {
    expect(loadStoredRetirementGoals(defaultRetirementGoals)).toEqual(
      defaultRetirementGoals,
    );
  });

  it("saves and reloads valid retirement goals", () => {
    const goals = {
      ...defaultRetirementGoals,
      desiredAnnualIncome: 42_000,
      emergencyReserve: 25_000,
    };

    saveRetirementGoals(goals);

    expect(loadStoredRetirementGoals(defaultRetirementGoals)).toEqual(goals);
  });

  it("falls back when saved goals are invalid", () => {
    localStorage.setItem(
      RETIREMENT_GOALS_STORAGE_KEY,
      JSON.stringify({ desiredAnnualIncome: "invalid" }),
    );

    expect(loadStoredRetirementGoals(defaultRetirementGoals)).toEqual(
      defaultRetirementGoals,
    );
  });

  it("dispatches an update event when goals are saved", () => {
    const listener = vi.fn();
    window.addEventListener(RETIREMENT_GOALS_UPDATED_EVENT, listener);

    saveRetirementGoals(defaultRetirementGoals);

    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(RETIREMENT_GOALS_UPDATED_EVENT, listener);
  });
});
