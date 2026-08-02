import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { useScenarios } from "../components/scenarios";
import { createDefaultPensionInputs } from "../config/defaultPensionInputs";
import type { Scenario } from "../domain/scenarios";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { savePensionInputs } from "../state/planStorage";
import { RetirementPlannerPage } from "./RetirementPlannerPage";

vi.mock("../components/scenarios", () => ({ useScenarios: vi.fn() }));
vi.mock("../state/planStorage", () => ({ savePensionInputs: vi.fn() }));
vi.mock("../hooks/useStoredRetirementGoals", () => ({
  useStoredRetirementGoals: () => [{
    desiredAnnualIncome: 30_000,
    includeStatePension: true,
    statePensionAnnualAmount: 12_000,
    statePensionAge: 67,
    emergencyReserve: 0,
  }, vi.fn()],
}));
vi.mock("../hooks/usePensionProjection", () => ({
  usePensionProjection: () => ({
    errors: {},
    hasErrors: false,
    projection: {
      years: [],
      finalBalance: { nominal: 500_000, real: 500_000 },
      totalContributions: { nominal: 0, real: 0 },
      totalInvestmentGrowth: { nominal: 0, real: 0 },
      totalFees: { nominal: 0, real: 0 },
    },
    comparison: null,
  }),
}));
vi.mock("../components/inputs/guided", () => ({
  GuidedPensionInputsForm: ({ value, onChange, onReset }: {
    value: PensionInputs;
    onChange: (inputs: PensionInputs) => void;
    onReset: () => void;
  }) => (
    <section aria-label="Mock plan form">
      <output aria-label="Current pension value">{value.currentPot}</output>
      <button type="button" onClick={() => onChange({ ...value, currentPot: value.currentPot + 10_000 })}>Change plan</button>
      <button type="button" onClick={onReset}>Reset plan</button>
    </section>
  ),
}));

const mockedUseScenarios = vi.mocked(useScenarios);
const mockedSavePensionInputs = vi.mocked(savePensionInputs);

function createScenario(isBaseline: boolean): Scenario {
  return {
    id: isBaseline ? "baseline" : "alternative",
    name: isBaseline ? "Baseline Plan" : "Retire at 65",
    colour: "accent",
    isBaseline,
    createdAt: "2026-08-01T20:00:00.000Z",
    updatedAt: "2026-08-01T20:00:00.000Z",
    inputs: {
      ...createDefaultPensionInputs(),
      currentAge: 47,
      retirementAge: isBaseline ? 68 : 65,
      currentPot: isBaseline ? 200_000 : 180_000,
    },
  };
}

function arrange(activeScenario: Scenario) {
  const updateScenarioInputs = vi.fn();
  mockedUseScenarios.mockReturnValue({
    activeScenario,
    activeScenarioId: activeScenario.id,
    scenarios: [activeScenario],
    createScenario: vi.fn(),
    duplicateScenario: vi.fn(),
    renameScenario: vi.fn(),
    updateScenarioInputs,
    updateScenarioPlan: vi.fn(),
    setActiveScenario: vi.fn(),
    deleteScenario: vi.fn(),
  });
  return updateScenarioInputs;
}

function renderPage() {
  return render(<MemoryRouter><RetirementPlannerPage /></MemoryRouter>);
}

describe("RetirementPlannerPage scenario integration", () => {
  it("identifies an alternative as a saved scenario", () => {
    arrange(createScenario(false));
    renderPage();

    expect(screen.getByText("Saved scenario")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Retire at 65" })).toBeInTheDocument();
    expect(screen.getByText(/baseline plan remains unchanged/i)).toBeInTheDocument();
  });

  it("updates only the selected alternative", async () => {
    const user = userEvent.setup();
    const scenario = createScenario(false);
    const updateScenarioInputs = arrange(scenario);
    renderPage();

    await user.click(screen.getByRole("button", { name: "Change plan" }));
    expect(updateScenarioInputs).toHaveBeenCalledWith(
      scenario.id,
      expect.objectContaining({ currentPot: 190_000 }),
    );
    expect(mockedSavePensionInputs).not.toHaveBeenCalled();
  });

  it("keeps baseline compatibility storage synchronised", async () => {
    const user = userEvent.setup();
    const scenario = createScenario(true);
    const updateScenarioInputs = arrange(scenario);
    renderPage();

    await user.click(screen.getByRole("button", { name: "Change plan" }));
    const expected = expect.objectContaining({ currentPot: 210_000 });
    expect(updateScenarioInputs).toHaveBeenCalledWith(scenario.id, expected);
    expect(mockedSavePensionInputs).toHaveBeenCalledWith(expected);
  });

  it("resets only the active scenario", async () => {
    const user = userEvent.setup();
    const scenario = createScenario(false);
    const updateScenarioInputs = arrange(scenario);
    renderPage();

    await user.click(screen.getByRole("button", { name: "Reset plan" }));
    expect(updateScenarioInputs).toHaveBeenCalledWith(
      scenario.id,
      createDefaultPensionInputs(),
    );
  });
});