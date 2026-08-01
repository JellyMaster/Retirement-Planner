import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { defaultPensionInputs } from "../../config/defaultPensionInputs";
import { defaultRetirementGoals } from "../../config/defaultRetirementGoals";
import { MonteCarloConfidenceDashboard } from "./MonteCarloConfidenceDashboard";

describe("MonteCarloConfidenceDashboard", () => {
  it("shows confidence and percentile outcomes", () => {
    render(
      <MonteCarloConfidenceDashboard
        inputs={defaultPensionInputs}
        goals={defaultRetirementGoals}
        simulations={100}
        seed={123}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /retirement confidence/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuetext",
      expect.stringMatching(/percent of simulations reached the target/i),
    );
    expect(screen.getByText(/target balance/i)).toBeInTheDocument();
    expect(screen.getByText(/median outcome/i)).toBeInTheDocument();
    expect(screen.getByText(/strong outcome/i)).toBeInTheDocument();
  });
});
