import {
  render,
  screen,

} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  describe,
  expect,
  it,
} from "vitest";

import { RetirementPlannerPage } from "./RetirementPlannerPage";

describe("RetirementPlannerPage", () => {
  it("renders the planner with a projection", () => {
    render(<RetirementPlannerPage />);

    expect(
      screen.getByRole("heading", {
        name: /retirement planner/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/your projection/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /compare scenario/i,
      })
    ).toBeInTheDocument();
  });

  it("shows validation errors when an input is invalid", async () => {
    const user = userEvent.setup();

    render(<RetirementPlannerPage />);

    const currentAgeInput =
      screen.getByLabelText(/current age/i);

    await user.clear(currentAgeInput);
    await user.type(currentAgeInput, "10");

    expect(
      screen.getByRole("alert")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /correct the highlighted fields/i
      )
    ).toBeInTheDocument();
  });

  it("does not show projection results while inputs are invalid", async () => {
    const user = userEvent.setup();

    render(<RetirementPlannerPage />);

    const retirementAgeInput =
      screen.getByLabelText(
        /retirement age/i
      );

    await user.clear(retirementAgeInput);
    await user.type(retirementAgeInput, "20");

    expect(
      screen.getByText(
        /correct the highlighted fields/i
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        /projection milestones/i
      )
    ).not.toBeInTheDocument();
  });

  it("restores the default inputs when reset is clicked", async () => {
    const user = userEvent.setup();

    render(<RetirementPlannerPage />);

    const currentAgeInput =
      screen.getByLabelText(
        /current age/i
      );

    const originalValue =
      currentAgeInput.getAttribute("value");

    await user.clear(currentAgeInput);
    await user.type(currentAgeInput, "55");

    expect(currentAgeInput).toHaveValue(55);

    await user.click(
      screen.getByRole("button", {
        name: /reset/i,
      })
    );

    expect(currentAgeInput).toHaveValue(
      Number(originalValue)
    );
  });

  it("copies the current scenario when comparison is enabled", async () => {
    const user = userEvent.setup();

    render(<RetirementPlannerPage />);

    const currentAgeInput =
      screen.getByLabelText(
        /current age/i
      );

    await user.clear(currentAgeInput);
    await user.type(currentAgeInput, "52");

    await user.click(
      screen.getByRole("button", {
        name: /compare scenario/i,
      })
    );

    const currentFormInput =
      document.getElementById(
        "current-currentAge"
      );

    const comparisonFormInput =
      document.getElementById(
        "comparison-currentAge"
      );

    expect(currentFormInput).toHaveValue(52);
    expect(comparisonFormInput).toHaveValue(
      52
    );
  });

  it("uses unique IDs for current and comparison inputs", async () => {
    const user = userEvent.setup();

    render(<RetirementPlannerPage />);

    await user.click(
      screen.getByRole("button", {
        name: /compare scenario/i,
      })
    );

    expect(
      document.getElementById(
        "current-currentAge"
      )
    ).toBeInTheDocument();

    expect(
      document.getElementById(
        "comparison-currentAge"
      )
    ).toBeInTheDocument();

    expect(
      document.querySelectorAll(
        "#current-currentAge"
      )
    ).toHaveLength(1);

    expect(
      document.querySelectorAll(
        "#comparison-currentAge"
      )
    ).toHaveLength(1);
  });

  it("rejects an extra contribution age equal to retirement age", async () => {
    const user = userEvent.setup();

    render(<RetirementPlannerPage />);

    const retirementAgeInput =
      screen.getByLabelText(
        "Retirement age"
      );

    const extraContributionAgeInput =
      screen.getByLabelText(
        "Extra contribution age"
      );

    await user.clear(
      retirementAgeInput
    );
    await user.type(
      retirementAgeInput,
      "68"
    );

    await user.clear(
      extraContributionAgeInput
    );
    await user.type(
      extraContributionAgeInput,
      "68"
    );

    expect(
      screen.getByText(
        /must be before retirement age/i
      )
    ).toBeInTheDocument();
  });
});