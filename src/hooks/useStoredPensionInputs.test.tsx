import { act, renderHook } from "@testing-library/react";

import { createDefaultPensionInputs } from "../config/defaultPensionInputs";
import type { PensionInputs } from "../engine/models/PensionInputs";
import {
  PLAN_STORAGE_KEY,
  PLAN_UPDATED_EVENT,
} from "../state/planStorage";
import { useStoredPensionInputs } from "./useStoredPensionInputs";

describe("useStoredPensionInputs", () => {
  function createPlan(overrides: Partial<PensionInputs> = {}): PensionInputs {
    return {
      ...createDefaultPensionInputs(),
      currentAge: 47,
      retirementAge: 68,
      currentPot: 194_420.91,
      monthlyEmployeeContribution: 863.91,
      monthlyEmployerContribution: 261.79,
      ...overrides,
    };
  }

  it("loads the saved plan on first render", () => {
    const savedPlan = createPlan();
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(savedPlan));

    const { result } = renderHook(() => useStoredPensionInputs());

    expect(result.current).toEqual(savedPlan);
  });

  it("updates immediately when the current tab dispatches a plan update", () => {
    const { result } = renderHook(() => useStoredPensionInputs());
    const updatedPlan = createPlan({ currentPot: 225_000 });

    act(() => {
      window.dispatchEvent(
        new CustomEvent<PensionInputs>(PLAN_UPDATED_EVENT, {
          detail: updatedPlan,
        }),
      );
    });

    expect(result.current).toEqual(updatedPlan);
    expect(result.current).not.toBe(updatedPlan);
  });

  it("reloads stored values after a cross-tab storage event", () => {
    const { result } = renderHook(() => useStoredPensionInputs());
    const updatedPlan = createPlan({ retirementAge: 65 });
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(updatedPlan));

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: PLAN_STORAGE_KEY,
          newValue: JSON.stringify(updatedPlan),
        }),
      );
    });

    expect(result.current).toEqual(updatedPlan);
  });

  it("ignores storage events for unrelated keys", () => {
    const { result } = renderHook(() => useStoredPensionInputs());
    const initial = result.current;

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "unrelated-key",
          newValue: "value",
        }),
      );
    });

    expect(result.current).toBe(initial);
  });
});
