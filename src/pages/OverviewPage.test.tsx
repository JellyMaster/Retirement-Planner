import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { createDefaultPensionInputs } from "../config/defaultPensionInputs";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredPensionInputs } from "../hooks/useStoredPensionInputs";
import { OverviewPage } from "./OverviewPage";

vi.mock("../hooks/usePensionProjection");
vi.mock("../hooks/useStoredPensionInputs");

const mockedUsePensionProjection = vi.mocked(usePensionProjection);
const mockedUseStoredPensionInputs = vi.mocked(useStoredPensionInputs);

const zeroMoney = { nominal: 0, real: 0 };

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

  function mockProjection(finalBalance = 750_000) {
    mockedUsePensionProjection.mockReturnValue({
      hasErrors: false,
      errors: {},
      projection: {
        years: [],
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

  it("shows the saved plan and projected pension pot", () => {
    mockedUseStoredPensionInputs.mockReturnValue(createPlan());
    mockProjection(750_000);

    renderPage();

    expect(screen.getByRole("heading", { name: "Your retirement at a glance" })).toBeInTheDocument();
    expect(screen.getByText("£194,421")).toBeInTheDocument();
    expect(screen.getByText("£1,126")).toBeInTheDocument();
    expect(screen.getByText("Age 68")).toBeInTheDocument();
    expect(screen.getByText("£750,000")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your baseline plan is available" })).toBeInTheDocument();
  });

  it("shows incomplete guidance when no pension balance is available", () => {
    mockedUseStoredPensionInputs.mockReturnValue(
      createPlan({
        currentPot: 0,
        monthlyEmployeeContribution: 0,
        monthlyEmployerContribution: 0,
      }),
    );
    mockProjection(0);

    renderPage();

    expect(screen.getByRole("heading", { name: "Add your pension details" })).toBeInTheDocument();
    expect(screen.getAllByText("Not added")).toHaveLength(2);
    expect(screen.getByText("Add this in My Plan")).toBeInTheDocument();
    expect(screen.getByText("Add employee and employer contributions")).toBeInTheDocument();
  });

  it("shows an unavailable projection when inputs contain errors", () => {
    mockedUseStoredPensionInputs.mockReturnValue(createPlan());
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

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("Review the plan inputs to calculate a projection")).toBeInTheDocument();
  });
});
