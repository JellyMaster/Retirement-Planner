import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";

import {
  useScenarios,
  type ScenarioContextValue,
} from "../components/scenarios";
import { createDefaultPensionInputs } from "../config/defaultPensionInputs";
import { defaultRetirementGoals } from "../config/defaultRetirementGoals";
import type { Scenario } from "../domain/scenarios";
import type { PensionInputs } from "../engine/models/PensionInputs";
import type { ProjectionYear } from "../engine/models/ProjectionYear";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { RETIREMENT_GOALS_STORAGE_KEY } from "../state/retirementGoalsStorage";
import { OverviewPage } from "./OverviewPage";

vi.mock("../components/scenarios", async () => {
  const actual = await vi.importActual<typeof import("../components/scenarios")>(
    "../components/scenarios",
  );
  return { ...actual, useScenarios: vi.fn() };
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
    closingBalance: { nominal: finalBalance, real: finalBalance },
  };
}

describe("OverviewPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

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
      updateScenarioPlan: vi.fn(),
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
        finalBalance: { nominal: finalBalance, real: finalBalance },
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

  it("shows the active retirement dashboard and modelled retirement journey", () => {
    mockActiveScenario(createScenario());
    mockProjection(750_000);

    renderPage();

    expect(screen.getByRole("heading", { name: "Your retirement" })).toBeInTheDocument();
    expect(screen.getByText("Overview · Baseline Plan")).toBeInTheDocument();
    expect(screen.getAllByText("Age 68").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("£750,000")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How your pension could grow" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Projected pension growth by age in today's money",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How this plan is set to work" })).toBeInTheDocument();
    expect(screen.getByText("Income strategy")).toBeInTheDocument();
    expect(screen.getByText("Tax-free cash")).toBeInTheDocument();
    expect(screen.getByText("State Pension")).toBeInTheDocument();
    expect(screen.getByText("Spending pattern")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit My Plan" })).toHaveAttribute("href", "/plan");
  });

  it("shows when State Pension is not included", () => {
    localStorage.setItem(
      RETIREMENT_GOALS_STORAGE_KEY,
      JSON.stringify({ ...defaultRetirementGoals, includeStatePension: false }),
    );
    mockActiveScenario(createScenario());
    mockProjection(750_000);

    renderPage();

    expect(screen.getByText("Not included")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "State Pension is not included" })).toBeInTheDocument();
  });

  it("uses advanced retirement strategy values from the active scenario", () => {
    const scenario = createScenario("Percentage plan");
    scenario.drawdown = {
      planningAge: 100,
      withdrawalStrategy: "percentage",
      withdrawalRate: 0.045,
      desiredAnnualIncome: 30_000,
      incomeTargetMode: "net",
      taxFreeCash: 0,
      taxFreeCashMode: "custom",
      includeStatePension: true,
      statePensionAnnualAmount: 14_500,
      statePensionAge: 69,
      spendingPhases: [
        {
          startAge: 68,
          annualIncome: 30_000,
          withdrawalRate: 0.05,
          label: "Active retirement",
        },
        {
          startAge: 80,
          annualIncome: 30_000,
          withdrawalRate: 0.035,
          label: "Later life",
        },
      ],
    };
    mockActiveScenario(scenario);
    mockProjection(820_000);

    renderPage();

    expect(screen.getByText("Age 100")).toBeInTheDocument();
    expect(screen.getByText(/4.5% of the remaining pension each year/i)).toBeInTheDocument();
    expect(screen.getByText("£14,500/year from age 69")).toBeInTheDocument();
    expect(screen.getByText("Not taken")).toBeInTheDocument();
    expect(screen.getByText(/Active retirement from 68 · Later life from 80/i)).toBeInTheDocument();
    expect(screen.getByText(/Percentage drawdown · average across retirement/i)).toBeInTheDocument();
  });

  it("uses the non-baseline active scenario in the dashboard", () => {
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

    expect(screen.getByText("Overview · Retire at 65")).toBeInTheDocument();
    expect(screen.getAllByText("Age 65").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("£820,000")).toBeInTheDocument();
    expect(screen.getByText(/Target spending · average across retirement/i)).toBeInTheDocument();
  });

  it("shows incomplete guidance when there is no usable retirement projection", () => {
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

    expect(screen.getByRole("heading", { name: "Complete your plan" })).toBeInTheDocument();
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review plan details" })).toHaveAttribute("href", "/plan");
  });

  it("shows unavailable guidance for invalid inputs", () => {
    mockActiveScenario(createScenario());
    mockedUsePensionProjection.mockReturnValue({
      hasErrors: true,
      errors: { retirementAge: "Retirement age must be greater than current age" },
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

    expect(screen.getAllByText("Unavailable")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Complete your plan" })).toBeInTheDocument();
    expect(
      screen.getByText("Add the missing plan details to restore your retirement projection."),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Complete the active plan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Complete My Plan" })).toBeInTheDocument();
  });
});
