import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { createDefaultPensionInputs } from "../config/defaultPensionInputs";
import type { PensionInputs } from "../engine/models/PensionInputs";
import type { Scenario } from "../domain/scenarios";
import { useScenarios } from "../components/scenarios";
import { savePensionInputs } from "../state/planStorage";
import { RetirementPlannerPage } from "./RetirementPlannerPage";

vi.mock("../components/scenarios", () => ({
  useScenarios: vi.fn(),
}));

vi.mock("../state/planStorage", () => ({
  savePensionInputs: vi.fn(),
}));

vi.mock("../hooks/usePensionProjection", () => ({
  usePensionProjection: () => ({
    errors: {},
    hasErrors: false,
    projection: {
      years: [
        {
          yearIndex: 1,
          age: 68,
          openingBalance: { nominal: 0, real: 0 },
          contributions: { nominal: 0, real: 0 },
          investmentGrowth: { nominal: 0, real: 0 },
          fees: { nominal: 0, real: 0 },
          closingBalance: { nominal: 500_000, real: 500_000 },
        },
      ],
      finalBalance: { nominal: 500_000, real: 500_000 },
      totalContributions: { nominal: 0, real: 0 },
      totalInvestmentGrowth: { nominal: 0, real: 0 },
      totalFees: { nominal: 0, real: 0 },
    },
    comparison: null,
  }),
}));

vi.mock("../components/inputs/guided", () => ({
  GuidedPensionInputsForm: ({
    value,
    onChange,
    onReset,
  }: {
    value: PensionInputs;
    onChange: (inputs: PensionInputs) => void;
    onReset: () => void;
  }) => (
    <section aria-label="Mock plan form">
      <output aria-label="Current pension value">{value.currentPot}</output>
      <button
        type="button"
        onClick={() => onChange({ ...value, currentPot: value.currentPot + 10_000 })}
      >
        Change plan
      </button>
      <button type="button" onClick={onReset}>
        Reset plan
      </button>
    </section>
  ),
}));

vi.mock("../components/workspace", () => ({
  isWorkspaceSectionId: (value: string) => value === "overview",
  RetirementWorkspace: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  WorkspaceSummaryRibbon: () => null,
}));

vi.mock("../components/overview", () => ({
  RetirementCoach: () => null,
  RetirementOverview: () => null,
  RetirementScoreBreakdown: () => null,
}));
vi.mock("../components/goals/RetirementGoalsForm", () => ({
  RetirementGoalsForm: () => null,
}));
vi.mock("../components/goals/RetirementHealthDashboard", () => ({
  RetirementHealthDashboard: () => null,
}));
vi.mock("../components/action-centre", () => ({ ActionCentre: () => null }));
vi.mock("../components/comparison/RetirementComparisonDashboard", () => ({
  RetirementComparisonDashboard: () => null,
}));
vi.mock("../components/fee-impact", () => ({ FeeImpactDashboard: () => null }));
vi.mock("../components/goals/RetirementRecommendations", () => ({
  RetirementRecommendations: () => null,
}));
vi.mock("../components/goals/RetirementWhatIfAnalysis", () => ({
  RetirementWhatIfAnalysis: () => null,
}));
vi.mock("../components/journey", () => ({ RetirementJourney: () => null }));
vi.mock("../components/monte-carlo", () => ({
  MonteCarloConfidenceDashboard: () => null,
  MonteCarloConfidenceExplorer: () => null,
}));
vi.mock("../components/projection/ContributionGrowthChart", () => ({
  ContributionGrowthChart: () => null,
}));
vi.mock("../components/projection/PensionBalanceChart", () => ({
  PensionBalanceChart: () => null,
}));
vi.mock("../components/projection/ProjectionTable", () => ({
  ProjectionTable: () => null,
}));
vi.mock("../components/retirement/RetirementInsights", () => ({
  RetirementInsights: () => null,
}));
vi.mock("../components/summary/ProjectionAssumptions", () => ({
  ProjectionAssumptions: () => null,
}));
vi.mock("../components/summary/ProjectionMilestones", () => ({
  ProjectionMilestones: () => null,
}));
vi.mock("../components/summary/ProjectionSummary", () => ({
  ProjectionSummary: () => null,
}));
vi.mock("../components/sustainability", () => ({
  RetirementSustainabilityDashboard: () => null,
}));

const mockedUseScenarios = vi.mocked(useScenarios);
const mockedSavePensionInputs = vi.mocked(savePensionInputs);

function createScenario(
  isBaseline: boolean,
  overrides: Partial<PensionInputs> = {},
): Scenario {
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
      ...overrides,
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
  return render(
    <MemoryRouter>
      <RetirementPlannerPage />
    </MemoryRouter>,
  );
}

describe("RetirementPlannerPage scenario integration", () => {
  it("shows the active scenario being edited", () => {
    arrange(createScenario(false));

    renderPage();

    expect(screen.getByText("Editing scenario")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Retire at 65" })).toBeInTheDocument();
    expect(
      screen.getByText("This is an alternative scenario. Your baseline plan remains unchanged."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Current pension value")).toHaveTextContent("180000");
  });

  it("updates an alternative without overwriting baseline storage", async () => {
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

  it("keeps legacy baseline storage synchronised for baseline edits", async () => {
    const user = userEvent.setup();
    const scenario = createScenario(true);
    const updateScenarioInputs = arrange(scenario);
    renderPage();

    await user.click(screen.getByRole("button", { name: "Change plan" }));

    const expected = expect.objectContaining({ currentPot: 210_000 });
    expect(updateScenarioInputs).toHaveBeenCalledWith(scenario.id, expected);
    expect(mockedSavePensionInputs).toHaveBeenCalledWith(expected);
  });

  it("resets only the active scenario to factory defaults", async () => {
    const user = userEvent.setup();
    const scenario = createScenario(false);
    const updateScenarioInputs = arrange(scenario);
    renderPage();

    await user.click(screen.getByRole("button", { name: "Reset plan" }));

    expect(updateScenarioInputs).toHaveBeenCalledWith(
      scenario.id,
      createDefaultPensionInputs(),
    );
    expect(mockedSavePensionInputs).not.toHaveBeenCalled();
  });
});
