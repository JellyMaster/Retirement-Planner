import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  createTestPensionInputs,
  createTestProjection,
  createTestRetirementGoals,
} from "../../test/retirementTestFixtures";
import { renderWithProviders } from "../../test/renderWithProviders";
import { RetirementSustainabilityDashboard } from "./RetirementSustainabilityDashboard";

describe("RetirementSustainabilityDashboard", () => {
  it("shows survival, income reliability and the lifetime chart", () => {
    renderWithProviders(
      <RetirementSustainabilityDashboard
        inputs={createTestPensionInputs()}
        projection={createTestProjection()}
        goals={createTestRetirementGoals()}
        simulations={50}
        seed={123}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /will your pension last/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/income reliability/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /how retirement reliability changes with age/i,
      }),
    ).toBeInTheDocument();
  });
});
