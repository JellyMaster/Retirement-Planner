import { act, renderHook } from "@testing-library/react";

import {
  createDefaultPensionInputs,
  defaultPensionInputs,
} from "../../config/defaultPensionInputs";
import type { PensionInputs } from "../../engine/models/PensionInputs";
import { usePlanPreview } from "./usePlanPreview";

describe("usePlanPreview", () => {
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

  it("commits an update when no preview is active", () => {
    const committedInputs = createPlan();
    const onCommit = vi.fn();
    const { result } = renderHook(() =>
      usePlanPreview({ committedInputs, onCommit }),
    );
    const updated = createPlan({ currentPot: 210_000 });

    act(() => result.current.updateEffectiveInputs(updated));

    expect(onCommit).toHaveBeenCalledWith(updated);
  });

  it("keeps preview changes and delegates the commit", () => {
    const committedInputs = createPlan();
    const previewInputs = createPlan({ retirementAge: 65 });
    const onCommit = vi.fn();
    const { result } = renderHook(() =>
      usePlanPreview({ committedInputs, onCommit }),
    );

    act(() => result.current.startPreview("Retire earlier", previewInputs));
    expect(result.current.isPreviewing).toBe(true);
    expect(result.current.effectiveInputs).toEqual(previewInputs);

    act(() => result.current.keepPreview());

    expect(result.current.isPreviewing).toBe(false);
    expect(onCommit).toHaveBeenCalledWith(previewInputs);
  });

  it("discards preview changes without committing", () => {
    const committedInputs = createPlan();
    const onCommit = vi.fn();
    const { result } = renderHook(() =>
      usePlanPreview({ committedInputs, onCommit }),
    );

    act(() =>
      result.current.startPreview(
        "Increase contributions",
        createPlan({ monthlyEmployeeContribution: 1_200 }),
      ),
    );
    act(() => result.current.discardPreview());

    expect(result.current.isPreviewing).toBe(false);
    expect(result.current.effectiveInputs).toBe(committedInputs);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("does not mutate factory defaults when a plan is committed", () => {
    const originalDefaults = { ...defaultPensionInputs };
    const committedInputs = createPlan();
    const onCommit = vi.fn();
    const { result } = renderHook(() =>
      usePlanPreview({ committedInputs, onCommit }),
    );

    act(() =>
      result.current.updateEffectiveInputs(
        createPlan({ currentAge: 50, currentPot: 250_000 }),
      ),
    );

    expect(defaultPensionInputs).toEqual(originalDefaults);
    expect(createDefaultPensionInputs()).toEqual(originalDefaults);
  });
});
