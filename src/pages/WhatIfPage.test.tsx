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
  const finalBalance = 500_000 + (inputs.retirementAge - 65) * 50_000;

  return {
    hasErrors: false,
    errors: {},
    projection: {
      years: [
        {
          yearIndex: 1,
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
    name: "Retire at 63",
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

  it("shows the experiment launcher and retirement-age decision lab", () => {
    render(<WhatIfPage />);

    expect(
      screen.getByRole("heading", {
        name: "What would happen if you changed one decision?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What would you like to explore?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retirement age/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /save more/i })).toBeDisabled();
    expect(
      screen.getByRole("slider", { name: "Experimental retirement age" }),
    ).toHaveValue("65");
    expect(screen.getByText("Main Plan is unchanged")).toBeInTheDocument();
  });

  it("updates the story and outcomes as the slider moves", () => {
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
    expect(screen.getByText("-£100,000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save as scenario" })).toBeEnabled();
  });

  it("resets the temporary experiment", async () => {
    const user = userEvent.setup();
    render(<WhatIfPage />);

    fireEvent.change(
      screen.getByRole("slider", { name: "Experimental retirement age" }),
      { target: { value: "63" } },
    );
    await user.click(screen.getByRole("button", { name: "Reset experiment" }));

    expect(
      screen.getByRole("slider", { name: "Experimental retirement age" }),
    ).toHaveValue("65");
    expect(screen.getByText("Main Plan is unchanged")).toBeInTheDocument();
  });

  it("saves a worthwhile experiment as a scenario", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "prompt").mockReturnValue("Earlier retirement");
    render(<WhatIfPage />);

    fireEvent.change(
      screen.getByRole("slider", { name: "Experimental retirement age" }),
      { target: { value: "63" } },
    );
    await user.click(screen.getByRole("button", { name: "Save as scenario" }));

    expect(createScenario).toHaveBeenCalledWith("Earlier retirement", "baseline");
    expect(updateScenarioPlan).toHaveBeenCalledWith(
      "saved-experiment",
      expect.objectContaining({ retirementAge: 63 }),
      expect.any(Object),
    );
    expect(
      screen.getByRole("status"),
    ).toHaveTextContent("Earlier retirement has been saved and is ready to compare.");
  });
});
