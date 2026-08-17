import type { RetirementLivingStandardLevel } from "./retirementLivingStandards";

export interface LivingStandardsValues {
  minimum: number;
  moderate: number;
  comfortable: number;
}

export interface LivingStandardsProgression {
  targetSpending: number;
  sustainableSpending: number;
  targetHeadroom: number;
  supportedLevel: RetirementLivingStandardLevel | null;
  supportedAmount: number | null;
  nextLevel: RetirementLivingStandardLevel | null;
  nextAmount: number | null;
  nextLevelGap: number;
}

const LEVELS: readonly RetirementLivingStandardLevel[] = [
  "minimum",
  "moderate",
  "comfortable",
];

export function createLivingStandardsProgression(
  targetSpending: number,
  sustainableSpending: number,
  standards: LivingStandardsValues,
): LivingStandardsProgression {
  if (
    !Number.isFinite(targetSpending) ||
    targetSpending < 0 ||
    !Number.isFinite(sustainableSpending) ||
    sustainableSpending < 0
  ) {
    throw new Error("Living Standards progression values must be finite and non-negative.");
  }

  const supportedLevel = [...LEVELS]
    .reverse()
    .find((level) => sustainableSpending >= standards[level]) ?? null;
  const supportedIndex = supportedLevel ? LEVELS.indexOf(supportedLevel) : -1;
  const nextLevel = LEVELS[supportedIndex + 1] ?? null;
  const supportedAmount = supportedLevel ? standards[supportedLevel] : null;
  const nextAmount = nextLevel ? standards[nextLevel] : null;

  return {
    targetSpending,
    sustainableSpending,
    targetHeadroom: sustainableSpending - targetSpending,
    supportedLevel,
    supportedAmount,
    nextLevel,
    nextAmount,
    nextLevelGap: nextAmount === null ? 0 : Math.max(0, nextAmount - sustainableSpending),
  };
}
