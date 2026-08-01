import { createDefaultPensionInputs } from "../config/defaultPensionInputs";
import type { PensionInputs } from "../engine/models/PensionInputs";
import {
  loadStoredPensionInputs,
  PLAN_STORAGE_KEY,
  PLAN_UPDATED_EVENT,
  savePensionInputs,
} from "./planStorage";

describe("planStorage", () => {
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

  it("returns a fresh fallback when no plan has been saved", () => {
    const fallback = createDefaultPensionInputs();

    const result = loadStoredPensionInputs(fallback);

    expect(result).toEqual(fallback);
    expect(result).not.toBe(fallback);
  });

  it("loads a valid saved plan", () => {
    const savedPlan = createPlan();
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(savedPlan));

    expect(loadStoredPensionInputs(createDefaultPensionInputs())).toEqual(savedPlan);
  });

  it("merges an older partial plan with current defaults", () => {
    localStorage.setItem(
      PLAN_STORAGE_KEY,
      JSON.stringify({
        currentAge: 47,
        retirementAge: 65,
        currentPot: 200_000,
        monthlyEmployeeContribution: 1_000,
        monthlyEmployerContribution: 250,
        annualContributionIncrease: 0.03,
        annualReturn: 0.05,
        annualFee: 0.0027,
        inflation: 0.02,
      }),
    );

    expect(loadStoredPensionInputs(createDefaultPensionInputs())).toEqual({
      ...createDefaultPensionInputs(),
      currentAge: 47,
      retirementAge: 65,
      currentPot: 200_000,
      monthlyEmployeeContribution: 1_000,
      monthlyEmployerContribution: 250,
      annualContributionIncrease: 0.03,
    });
  });

  it("falls back when saved JSON is malformed", () => {
    const fallback = createDefaultPensionInputs();
    localStorage.setItem(PLAN_STORAGE_KEY, "{not-valid-json");

    expect(loadStoredPensionInputs(fallback)).toEqual(fallback);
  });

  it("falls back when a required value is not finite", () => {
    const fallback = createDefaultPensionInputs();
    localStorage.setItem(
      PLAN_STORAGE_KEY,
      JSON.stringify(createPlan({ currentPot: Number.NaN })),
    );

    expect(loadStoredPensionInputs(fallback)).toEqual(fallback);
  });

  it("saves the plan and dispatches a copied update payload", () => {
    const plan = createPlan();
    const listener = vi.fn();
    window.addEventListener(PLAN_UPDATED_EVENT, listener);

    savePensionInputs(plan);

    expect(JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY) ?? "null")).toEqual(plan);
    expect(listener).toHaveBeenCalledTimes(1);

    const event = listener.mock.calls[0][0] as CustomEvent<PensionInputs>;
    expect(event.detail).toEqual(plan);
    expect(event.detail).not.toBe(plan);

    window.removeEventListener(PLAN_UPDATED_EVENT, listener);
  });
});
