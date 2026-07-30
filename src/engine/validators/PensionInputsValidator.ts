import { type PensionInputs } from "../models/PensionInputs";

export class PensionInputsValidator {
  public static validate(
    inputs: PensionInputs
  ): void {
    this.requireNonNegativeInteger(
      inputs.currentAge,
      "Current age"
    );

    this.requireNonNegativeInteger(
      inputs.retirementAge,
      "Retirement age"
    );

    this.requireNonNegative(
      inputs.currentPot,
      "Current pot"
    );

    this.requireNonNegative(
      inputs.monthlyEmployeeContribution,
      "Monthly employee contribution"
    );

    this.requireNonNegative(
      inputs.monthlyEmployerContribution,
      "Monthly employer contribution"
    );

    this.requireFinite(
      inputs.annualContributionIncrease,
      "Annual contribution increase"
    );

    this.requireFinite(
      inputs.annualReturn,
      "Annual return"
    );

    this.requirePercentageBelowOne(
      inputs.annualFee,
      "Annual fee"
    );

    this.requireNonNegative(
      inputs.inflation,
      "Inflation"
    );

    /*
     * Equal ages are valid because the engine returns the current
     * pot without calculating any future months.
     */
    if (
      inputs.retirementAge <
      inputs.currentAge
    ) {
      throw new RangeError(
        "Retirement age cannot be below current age."
      );
    }

    if (inputs.annualReturn <= -1) {
      throw new RangeError(
        "Annual return must be greater than -100%."
      );
    }

    if (
      inputs.annualContributionIncrease <= -1
    ) {
      throw new RangeError(
        "Annual contribution increase must be greater than -100%."
      );
    }

    this.validateExtraContribution(inputs);
  }

  private static validateExtraContribution(
    inputs: PensionInputs
  ): void {
    const hasExtraContributionAge =
      inputs.extraContributionAge !== undefined;

    const hasExtraMonthlyContribution =
      inputs.extraMonthlyContribution !==
      undefined;

    if (
      hasExtraContributionAge !==
      hasExtraMonthlyContribution
    ) {
      throw new TypeError(
        "Extra contribution age and extra monthly contribution must be provided together."
      );
    }

    if (
      inputs.extraContributionAge !== undefined
    ) {
      this.requireNonNegativeInteger(
        inputs.extraContributionAge,
        "Extra contribution age"
      );
    }

    if (
      inputs.extraMonthlyContribution !==
      undefined
    ) {
      this.requireNonNegative(
        inputs.extraMonthlyContribution,
        "Extra monthly contribution"
      );
    }

    /*
     * There is no projection period when both ages are equal,
     * so the extra contribution age will never be reached or used.
     */
    if (
      inputs.retirementAge ===
      inputs.currentAge
    ) {
      return;
    }

    if (
      inputs.extraContributionAge !== undefined &&
      inputs.extraContributionAge <
        inputs.currentAge
    ) {
      throw new RangeError(
        "Extra contribution age cannot be below current age."
      );
    }

    if (
      inputs.extraContributionAge !== undefined &&
      inputs.extraContributionAge >=
        inputs.retirementAge
    ) {
      throw new RangeError(
        "Extra contribution age must be below retirement age."
      );
    }
  }

  private static requireFinite(
    value: number,
    name: string
  ): void {
    if (!Number.isFinite(value)) {
      throw new TypeError(
        `${name} must be a finite number.`
      );
    }
  }

  private static requireNonNegative(
    value: number,
    name: string
  ): void {
    this.requireFinite(value, name);

    if (value < 0) {
      throw new RangeError(
        `${name} cannot be negative.`
      );
    }
  }

  private static requireNonNegativeInteger(
    value: number,
    name: string
  ): void {
    this.requireNonNegative(value, name);

    if (!Number.isInteger(value)) {
      throw new TypeError(
        `${name} must be a whole number.`
      );
    }
  }

  private static requirePercentageBelowOne(
    value: number,
    name: string
  ): void {
    this.requireNonNegative(value, name);

    if (value >= 1) {
      throw new RangeError(
        `${name} must be below 100%.`
      );
    }
  }
}