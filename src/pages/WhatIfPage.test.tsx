import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useScenarios } from "../components/scenarios";
import { createDefaultPensionInputs } from "../config/defaultPensionInputs";
import { createDefaultScenarioDrawdownPreferences } from "../domain/scenarios";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { WhatIfPage } from "./WhatIfPage";

vi.mock("../components/scenarios", async () => {
  const actual = await vi.importActual<typeof import("../components/scenarios")>(
    "../components/scenarios",
  );
  return { ...actual, useScenarios: vi.fn() };
});

vi.mock("../hooks/usePensionProjection");

const mockedUseScenarios = vi.mocked(useScenarios);
const mockedUsePensionProjection = vi.mocked(usePensionProjection);
const zeroMoney = { nominal: 0, real: 0 };

function createProjection(inputs: PensionInputs) {
  const contributionEffect =
    (inputs.monthlyEmployeeContribution - 800) * 100;
  const extraEffect = (inputs.extraMonthlyContribution ?? 0) * 50;
  const finalBalance =
    inputs.retirementAge === inputs.currentAge
      ? inputs.currentPot
      : 500_000 +
        (inputs.retirementAge - 65) * 50_000 +
        contributionEffect +
        extraEffect;

  return {
    hasErrors: false,
    errors: {},
    projection: {
      years: [
        {
          yearIndex: inputs.retirementAge === inputs.currentAge ? 0 : 1,
          age: inputs.retirementAge,
          openingBalance: zeroMoney,
          contributions: zeroMoney,
          investmentGrowth: zeroMoney,
          fees: zeroMoney,
          closingBalance: { nominal: finalBalance, real: finalBalance },
        },
      ],
      finalBalance: { nominal: finalBalance, real: finalBalance },
      totalContributions: zeroMoney,
      totalInvestmentGrowth: zeroMoney,
      totalFees: zeroMoney,
    },
    comparison: null,
  };
}

describe("WhatIfPage", () => {
  const createScenario = vi.fn(() => ({
    id: "saved-experiment",
    name: "Saved experiment",
    colour: "accent",
    isBaseline: false,
    createdAt: "2026-08-02T12:00:00.000Z",
    updatedAt: "2026-08-02T12:00:00.000Z",
    inputs: createDefaultPensionInputs(),
  }));
  const updateScenarioPlan = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    const inputs = {
      ...createDefaultPensionInputs(),
      currentAge: 47,
      retirementAge: 65,
      currentPot: 200_000,
      monthlyEmployeeContribution: 800,
      monthlyEmployerContribution: 200,
      extraContributionAge: 56,
      extraMonthlyContribution: 500,
    };

    mockedUseScenarios.mockReturnValue({
      activeScenarioId: "baseline",
      activeScenario: {
        id: "baseline",
        name: "Main Plan",
        colour: "accent",
        isBaseline: true,
        createdAt: "2026-08-02T12:00:00.000Z",
        updatedAt: "2026-08-02T12:00:00.000Z",
        inputs,
        drawdown: createDefaultScenarioDrawdownPreferences(),
      },
      scenarios: [],
      createScenario,
      duplicateScenario: vi.fn(),
      renameScenario: vi.fn(),
      updateScenarioInputs: vi.fn(),
      updateScenarioPlan,
      setActiveScenario: vi.fn(),
      deleteScenario: vi.fn(),
    });

    mockedUsePensionProjection.mockImplementation((projectionInputs) =>
      createProjection(projectionInputs),
    );
  });

  it("shows both available decision experiments", () => {
    render(<WhatIfPage />);

    expect(
      screen.getByRole("heading", {
        name: "What would happen if you changed one decision?",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retirement age/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /save more/i })).toBeEnabled();
    expect(
      screen.getByRole("slider", { name: "Experimental retirement age" }),
    ).toHaveValue("65");
    expect(screen.getByText("Main Plan is unchanged")).toBeInTheDocument();
  });

  it("updates the retirement story as the age slider moves", () => {
    render(<WhatIfPage />);

    fireEvent.change(
      screen.getByRole("slider", { name: "Experimental retirement age" }),
      { target: { value: "63" } },
    );

    expect(screen.getByText("Age 63")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /retiring 2 years earlier means stopping work at age 63/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save as scenario" })).toBeEnabled();
  });

  it("allows immediate retirement at the current age", () => {
    render(<WhatIfPage />);

    fireEvent.change(
      screen.getByRole("slider", { name: "Experimental retirement age" }),
      { target: { value: "47" } },
    );

    expect(screen.getByText("Age 47")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Retiring now means stopping work at age 47",
      }),
    ).toBeInTheDocument();

    const experimentalCall = mockedUsePensionProjection.mock.calls.find(
      ([projectionInputs]) => projectionInputs.retirementAge === 47,
    );
    expect(experimentalCall?.[0]).not.toHaveProperty("extraContributionAge");
    expect(experimentalCall?.[0]).not.toHaveProperty("extraMonthlyContribution");
  });

  it("opens Save more and changes the regular employee contribution", async () => {
    const user = userEvent.setup();
    render(<WhatIfPage />);

    await user.click(screen.getByRole("button", { name: /save more/i }));

    expect(
      screen.getByRole("heading", { name: "Save more each month" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", {
        name: "Experimental monthly employee contribution",
      }),
    ).toHaveValue("800");
    expect(
      screen.getByRole("switch", {
        name: "Include scheduled extra contribution",
      }),
    ).toBeChecked();

    fireEvent.change(
      screen.getByRole("slider", {
        name: "Experimental monthly employee contribution",
      }),
      { target: { value: "1000" } },
    );

    const experimentalCall = mockedUsePensionProjection.mock.calls.at(-1)?.[0];
    expect(experimentalCall).toEqual(
      expect.objectContaining({ monthlyEmployeeContribution: 1000 }),
    );
    expect(screen.getByRole("button", { name: "Save as scenario" })).toBeEnabled();
  });

  it("can exclude the scheduled extra contribution", async () => {
    const user = userEvent.setup();
    render(<WhatIfPage />);
    await user.click(screen.getByRole("button", { name: /save more/i }));

    await user.click(
      screen.getByRole("switch", {
        name: "Include scheduled extra contribution",
      }),
    );

    const experimentalCall = mockedUsePensionProjection.mock.calls.at(-1)?.[0];
    expect(experimentalCall).not.toHaveProperty("extraContributionAge");
    expect(experimentalCall).not.toHaveProperty("extraMonthlyContribution");
  });

  it("resets the selected experiment to the active plan", async () => {
    const user = userEvent.setup();
    render(<WhatIfPage />);
    await user.click(screen.getByRole("button", { name: /save more/i }));

    fireEvent.change(
      screen.getByRole("slider", {
        name: "Experimental monthly employee contribution",
      }),
      { target: { value: "1000" } },
    );
    await user.click(screen.getByRole("button", { name: "Reset experiment" }));

    expect(
      screen.getByRole("slider", {
        name: "Experimental monthly employee contribution",
      }),
    ).toHaveValue("800");
  });

  it("saves a contribution experiment as a scenario", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "prompt").mockReturnValue("Save more monthly");
    render(<WhatIfPage />);
    await user.click(screen.getByRole("button", { name: /save more/i }));

    fireEvent.change(
      screen.getByRole("slider", {
        name: "Experimental monthly employee contribution",
      }),
      { target: { value: "1000" } },
    );
    await user.click(screen.getByRole("button", { name: "Save as scenario" }));

    expect(createScenario).toHaveBeenCalledWith("Save more monthly", "baseline");
    expect(updateScenarioPlan).toHaveBeenCalledWith(
      "saved-experiment",
      expect.objectContaining({ monthlyEmployeeContribution: 1000 }),
      expect.any(Object),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Save more monthly has been saved and is ready to compare.",
    );
  });
});
