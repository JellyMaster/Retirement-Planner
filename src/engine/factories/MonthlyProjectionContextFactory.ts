import type { MonthlyProjectionContext } from "../models/MonthlyProjectionContext";
import type { PensionInputs } from "../models/PensionInputs";

export class MonthlyProjectionContextFactory {
  public static create(
    inputs: PensionInputs,
    monthIndex: number,
    openingBalance: number
  ): MonthlyProjectionContext {
    this.validateMonthIndex(monthIndex);
    this.validateOpeningBalance(openingBalance);

    const inflationFactor = Math.pow(
      1 + inputs.inflation,
      (monthIndex + 1) / 12
    );

    return {
      inputs,
      monthIndex,

      age:
        inputs.currentAge +
        Math.floor(monthIndex / 12),

      openingBalance,

      employeeContribution: 0,
      employerContribution: 0,
      totalContribution: 0,

      investmentGrowth: 0,
      fees: 0,
      closingBalance: openingBalance,

      inflationFactor,
    };
  }

  private static validateMonthIndex(
    monthIndex: number
  ): void {
    if (!Number.isFinite(monthIndex)) {
      throw new TypeError(
        "Month index must be a finite number."
      );
    }

    if (
      !Number.isInteger(monthIndex) ||
      monthIndex < 0
    ) {
      throw new RangeError(
        "Month index must be a non-negative whole number."
      );
    }
  }

  private static validateOpeningBalance(
    openingBalance: number
  ): void {
    if (!Number.isFinite(openingBalance)) {
      throw new TypeError(
        "Opening balance must be a finite number."
      );
    }

    if (openingBalance < 0) {
      throw new RangeError(
        "Opening balance cannot be negative."
      );
    }
  }
}