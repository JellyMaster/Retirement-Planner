import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import {
  useScenarios,
  type ScenarioContextValue,
} from "../components/scenarios";
import { createDefaultPensionInputs } from "../config/defaultPensionInputs";
import type { Scenario } from "../domain/scenarios";
import type { PensionInputs } from "../engine/models/PensionInputs";
import type { ProjectionYear } from "../engine/models/ProjectionYear";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { OverviewPage } from "./OverviewPage";

vi.mock("../components/scenarios", async () => {
  const actual = await vi.importActual<typeof import("../components/scenarios")>(
    "../components/scenarios",
  );
  return {
    ...actual,
    useScenarios: vi.fn(),
  };
});
vi.mock("../hooks/usePensionProjection");

const mockedUsePensionProjection = vi.mocked(usePensionProjection);
const mockedUseScenarios = vi.mocked(useScenarios);

const zeroMoney = { nominal: 0, real: 0 };

function createProjectionYear(finalBalance: number): ProjectionYear {
  return {
    yearIndex: 1,
    age: 68,
    openingBalance: zeroMoney,
    contributions: zeroMoney,
    investmentGrowth: zeroMoney,
    fees: zeroMoney,
    closingBalance: {
      nominal: finalBalance,
      real: finalBalance,
    },
  };
}

describe("OverviewPage", () => {
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

  function createScenario(
    name = "Baseline Plan",
    inputs = createPlan(),
    isBaseline = true,
  ): Scenario {
    return {
      id: isBaseline ? "baseline" : "alternative",
      name,
      colour: "accent",
      isBaseline,
      createdAt: "2026-08-01T12:00:00.000Z",
      updatedAt: "2026-08-01T12:00:00.000Z",
      inputs,
    };
  }

  function mockActiveScenario(scenario: Scenario) {
    const context: ScenarioContextValue = {
      activeScenarioId: scenario.id,
      activeScenario: scenario,
      scenarios: [scenario],
      createScenario: vi.fn(),
      duplicateScenario: vi.fn(),
      renameScenario: vi.fn(),
      updateScenarioInputs: vi.fn(),
      setActiveScenario: vi.fn(),
      deleteScenario: vi.fn(),
    };
    mockedUseScenarios.mockReturnValue(context);
  }

  function mockProjection(finalBalance = 750_000) {
    mockedUsePensionProjection.mockReturnValue({
      hasErrors: false,
      errors: {},
      projection: {
        years: [createProjectionYear(finalBalance)],
        finalBalance: {
          nominal: finalBalance,
          real: finalBalance,
        },
        totalContributions: zeroMoney,
        totalInvestmentGrowth: zeroMoney,
        totalFees: zeroMoney,
      },
      comparison: null,
    });
  }

  function renderPage() {
    return render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>,
    );
  }

  it("shows the active baseline plan and projected pension pot", () => {
    mockActiveScenario(createScenario());
    mockProjection(750_000);

    renderPage();

    expect(
      screen.getByRole("heading", { name: "Your retirement at a glance" }),
    ).toBeInTheDocument();
    expect(screen.getByText("£194,421")).toBeInTheDocument();
    expect(screen.getByText("£1,126")).toBeInTheDocument();
    expect(screen.getByText("Age 68")).toBeInTheDocument();
    expect(screen.getByText("£750,000")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Baseline Plan is available" }),
    ).toBeInTheDocument();
  });

  it("shows values from a non-baseline active scenario", () => {
    mockActiveScenario(
      createScenario(
        "Retire at 65",
        createPlan({
          retirementAge: 65,
          currentPot: 250_000,
          monthlyEmployeeContribution: 1_000,
          monthlyEmployerContribution: 300,
        }),
        false,
      ),
    );
    mockProjection(820_000);

    renderPage();

    expect(
      screen.getByRole("heading", { name: "Retire at 65 is available" }),
    ).toBeInTheDocument();
    expect(screen.getByText("£250,000")).toBeInTheDocument();
    expect(screen.getByText("£1,300")).toBeInTheDocument();
    expect(screen.getByText("Age 65")).toBeInTheDocument();
    expect(screen.getByText("£820,000")).toBeInTheDocument();
  });

  it("shows incomplete guidance when no pension balance is available", () => {
    mockActiveScenario(
      createScenario(
        "Baseline Plan",
        createPlan({
          currentPot: 0,
          monthlyEmployeeContribution: 0,
          monthlyEmployerContribution: 0,
        }),
      ),
    );
    mockProjection(0);

    renderPage();

    expect(
      screen.getByRole("heading", {
        name: "Add pension details to Baseline Plan",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Not added")).toHaveLength(2);
    expect(screen.getByText("Add this in My Plan")).toBeInTheDocument();
    expect(
      screen.getByText("Add employee and employer contributions"),
    ).toBeInTheDocument();
  });

  it("shows an unavailable projection when inputs contain errors", () => {
    mockActiveScenario(createScenario());
    mockedUsePensionProjection.mockReturnValue({
      hasErrors: true,
      errors: {
        retirementAge: "Retirement age must be greater than current age",
      },
      projection: {
        years: [],
        finalBalance: zeroMoney,
        totalContributions: zeroMoney,
        totalInvestmentGrowth: zeroMoney,
        totalFees: zeroMoney,
      },
      comparison: null,
    });

    renderPage();

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(
      screen.getByText("Review the plan inputs to calculate a projection"),
    ).toBeInTheDocument();
  });
});
