import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useScenarios } from "../components/scenarios";
import { useWhatIfScenarios } from "../components/what-if/WhatIfScenarioContext";
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

vi.mock("../components/what-if/WhatIfScenarioContext", async () => {
  const actual = await vi.importActual<
    typeof import("../components/what-if/WhatIfScenarioContext")
  >("../components/what-if/WhatIfScenarioContext");
  return { ...actual, useWhatIfScenarios: vi.fn() };
});

vi.mock("../hooks/usePensionProjection");

const mockedUseScenarios = vi.mocked(useScenarios);
const mockedUseWhatIfScenarios = vi.mocked(useWhatIfScenarios);
const mockedUsePensionProjection = vi.mocked(usePensionProjection);
const zeroMoney = { nominal: 0, real: 0 };

function createProjection(inputs: PensionInputs) {
  const employeeEffect =
    (inputs.monthlyEmployeeContribution - 800) * 100;
  const employerEffect =
    (inputs.monthlyEmployerContribution - 200) * 100;
  const extraEffect = (inputs.extraMonthlyContribution ?? 0) * 50;
  const finalBalance =
    inputs.retirementAge === inputs.currentAge
      ? inputs.currentPot
      : 500_000 +
        (inputs.retirementAge - 65) * 50_000 +
        employeeEffect +
        employerEffect +
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
    id: "saved-plan",
    name: "Saved plan",
    colour: "accent",
    isBaseline: false,
    createdAt: "2026-08-02T12:00:00.000Z",
    updatedAt: "2026-08-02T12:00:00.000Z",
    inputs: createDefaultPensionInputs(),
  }));
  const updateScenarioPlan = vi.fn();
  const saveWhatIfScenario = vi.fn((input) => ({
    id: "saved-experiment",
    createdAt: "2026-09-09T12:00:00.000Z",
    updatedAt: "2026-09-09T12:00:00.000Z",
    ...input,
  }));
  const deleteWhatIfScenario = vi.fn();
  const setHasUnsavedExperiment = vi.fn();

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

    mockedUseWhatIfScenarios.mockReturnValue({
      scenarios: [],
      hasUnsavedExperiment: false,
      setHasUnsavedExperiment,
      saveScenario: saveWhatIfScenario,
      deleteScenario: deleteWhatIfScenario,
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
    expect(screen.getByRole("tab", { name: /retirement age/i })).toBeEnabled();
    expect(screen.getByRole("tab", { name: /save more/i })).toBeEnabled();
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
      screen.getByRole("heading", { name: "Retire at 63" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 years earlier")).toBeInTheDocument();
    expect(screen.getByText("Pension when retirement starts")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save experiment" })).toBeEnabled();
    expect(setHasUnsavedExperiment).toHaveBeenCalledWith(true);
  });

  it("allows immediate retirement at the current age", () => {
    render(<WhatIfPage />);

    fireEvent.change(
      screen.getByRole("slider", { name: "Experimental retirement age" }),
      { target: { value: "47" } },
    );

    expect(screen.getByText("Age 47", { selector: "strong" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Retire at 47" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Retiring now uses the pension already built/i),
    ).toBeInTheDocument();

    const experimentalCall = mockedUsePensionProjection.mock.calls.find(
      ([projectionInputs]) => projectionInputs.retirementAge === 47,
    );
    expect(experimentalCall?.[0]).not.toHaveProperty("extraContributionAge");
    expect(experimentalCall?.[0]).not.toHaveProperty("extraMonthlyContribution");
  });

  it("centres employee and employer sliders on the saved plan", async () => {
    const user = userEvent.setup();
    render(<WhatIfPage />);
    await user.click(screen.getByRole("tab", { name: /save more/i }));

    expect(
      screen.getByRole("slider", {
        name: "Experimental monthly employee contribution change",
      }),
    ).toHaveValue("0");
    expect(
      screen.getByRole("slider", {
        name: "Experimental monthly employer contribution change",
      }),
    ).toHaveValue("0");
    expect(screen.getByText("Saved plan · £800")).toBeInTheDocument();
    expect(screen.getByText("Saved plan · £200")).toBeInTheDocument();
  });

  it("changes employee and employer contributions relative to the saved plan", async () => {
    const user = userEvent.setup();
    render(<WhatIfPage />);
    await user.click(screen.getByRole("tab", { name: /save more/i }));

    fireEvent.change(
      screen.getByRole("slider", {
        name: "Experimental monthly employee contribution change",
      }),
      { target: { value: "200" } },
    );
    fireEvent.change(
      screen.getByRole("slider", {
        name: "Experimental monthly employer contribution change",
      }),
      { target: { value: "100" } },
    );

    const experimentalCall = mockedUsePensionProjection.mock.calls.at(-1)?.[0];
    expect(experimentalCall).toEqual(
      expect.objectContaining({
        monthlyEmployeeContribution: 1_000,
        monthlyEmployerContribution: 300,
      }),
    );
    expect(screen.getByRole("button", { name: "Save experiment" })).toBeEnabled();
  });

  it("allows the scheduled extra contribution start age to change", async () => {
    const user = userEvent.setup();
    render(<WhatIfPage />);
    await user.click(screen.getByRole("tab", { name: /save more/i }));

    const ageSlider = screen.getByRole("slider", {
      name: "Experimental extra contribution start age",
    });
    expect(ageSlider).toHaveValue("56");
    expect(screen.getByText("Saved · age 56")).toBeInTheDocument();

    fireEvent.change(ageSlider, { target: { value: "52" } });

    const experimentalCall = mockedUsePensionProjection.mock.calls.at(-1)?.[0];
    expect(experimentalCall).toEqual(
      expect.objectContaining({
        extraContributionAge: 52,
        extraMonthlyContribution: 500,
      }),
    );
    expect(ageSlider).toHaveAttribute("aria-valuetext", "Starts at age 52");
    expect(screen.getByText("Start age: 52")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save experiment" })).toBeEnabled();
  });

  it("can exclude the scheduled extra contribution", async () => {
    const user = userEvent.setup();
    render(<WhatIfPage />);
    await user.click(screen.getByRole("tab", { name: /save more/i }));

    await user.click(
      screen.getByRole("switch", {
        name: "Include scheduled extra contribution",
      }),
    );

    const experimentalCall = mockedUsePensionProjection.mock.calls.at(-1)?.[0];
    expect(experimentalCall).not.toHaveProperty("extraContributionAge");
    expect(experimentalCall).not.toHaveProperty("extraMonthlyContribution");
  });

  it("resets contribution amounts and the extra start age", async () => {
    const user = userEvent.setup();
    render(<WhatIfPage />);
    await user.click(screen.getByRole("tab", { name: /save more/i }));

    fireEvent.change(
      screen.getByRole("slider", {
        name: "Experimental monthly employee contribution change",
      }),
      { target: { value: "200" } },
    );
    fireEvent.change(
      screen.getByRole("slider", {
        name: "Experimental extra contribution start age",
      }),
      { target: { value: "52" } },
    );
    await user.click(screen.getByRole("button", { name: "Reset experiment" }));

    expect(
      screen.getByRole("slider", {
        name: "Experimental monthly employee contribution change",
      }),
    ).toHaveValue("0");
    expect(
      screen.getByRole("slider", {
        name: "Experimental extra contribution start age",
      }),
    ).toHaveValue("56");
  });

  it("saves the selected extra contribution age through the What If modal", async () => {
    const user = userEvent.setup();
    render(<WhatIfPage />);
    await user.click(screen.getByRole("tab", { name: /save more/i }));

    fireEvent.change(
      screen.getByRole("slider", {
        name: "Experimental extra contribution start age",
      }),
      { target: { value: "52" } },
    );
    await user.click(screen.getByRole("button", { name: "Save experiment" }));

    const dialog = screen.getByRole("dialog", { name: "Keep this What If result" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Save more", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("Main Plan", { selector: "strong" })).toBeInTheDocument();

    const nameInput = screen.getByRole("textbox", { name: "Name" });
    expect(nameInput).toHaveValue("Save 1000 monthly");
    await user.clear(nameInput);
    await user.type(nameInput, "Save earlier");
    await user.click(within(dialog).getByRole("button", { name: "Save experiment" }));

    expect(saveWhatIfScenario).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Save earlier",
        baseScenarioId: "baseline",
        experimentType: "contributions",
        inputs: expect.objectContaining({
          extraContributionAge: 52,
          extraMonthlyContribution: 500,
        }),
        drawdown: expect.any(Object),
      }),
    );
    expect(createScenario).not.toHaveBeenCalled();
    expect(updateScenarioPlan).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Save earlier saved to Main Plan.",
    );
  });
});
