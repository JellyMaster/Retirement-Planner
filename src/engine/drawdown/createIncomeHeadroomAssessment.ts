export type IncomeHeadroomStatus = "comfortable" | "tight" | "shortfall";

export interface IncomeHeadroomAssessment {
  targetIncome: number;
  sustainableIncome: number;
  annualHeadroom: number;
  headroomPercent: number | null;
  status: IncomeHeadroomStatus;
}

const COMFORTABLE_HEADROOM_THRESHOLD = 0.1;

export function createIncomeHeadroomAssessment(
  targetIncome: number,
  sustainableIncome: number,
): IncomeHeadroomAssessment {
  if (!Number.isFinite(targetIncome) || targetIncome < 0) {
    throw new Error("Target income must be a finite number of zero or more.");
  }

  if (!Number.isFinite(sustainableIncome) || sustainableIncome < 0) {
    throw new Error("Sustainable income must be a finite number of zero or more.");
  }

  const annualHeadroom = sustainableIncome - targetIncome;
  const headroomPercent =
    targetIncome === 0 ? null : annualHeadroom / targetIncome;

  const status: IncomeHeadroomStatus =
    annualHeadroom < 0
      ? "shortfall"
      : targetIncome === 0
        ? sustainableIncome > 0
          ? "comfortable"
          : "tight"
        : headroomPercent !== null &&
            headroomPercent >= COMFORTABLE_HEADROOM_THRESHOLD
          ? "comfortable"
          : "tight";

  return {
    targetIncome,
    sustainableIncome,
    annualHeadroom,
    headroomPercent,
    status,
  };
}
