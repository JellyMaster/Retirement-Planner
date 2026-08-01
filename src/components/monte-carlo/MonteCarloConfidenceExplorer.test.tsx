import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { createTestPensionInputs, createTestRetirementGoals } from "../../test/retirementTestFixtures";
import { renderWithProviders } from "../../test/renderWithProviders";
import { MonteCarloConfidenceExplorer } from "./MonteCarloConfidenceExplorer";

describe("MonteCarloConfidenceExplorer", () => {
  it("renders the percentile chart and sensitivity analysis", () => {
    renderWithProviders(
      <MonteCarloConfidenceExplorer
        inputs={createTestPensionInputs()}
        goals={createTestRetirementGoals()}
      />,
    );

    expect(screen.getByRole("heading", { name: /understand the range behind your result/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /how uncertainty grows over time/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /what changes your confidence/i })).toBeInTheDocument();
  });

  it("opens advanced settings and updates volatility", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <MonteCarloConfidenceExplorer
        inputs={createTestPensionInputs()}
        goals={createTestRetirementGoals()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /adjust settings/i }));
    expect(screen.getByLabelText(/annual volatility/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reset defaults/i }));
  });
});
