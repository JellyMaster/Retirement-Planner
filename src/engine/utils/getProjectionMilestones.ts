import type { ProjectionYear } from "../models/ProjectionYear";

export interface ProjectionMilestone {
  target: number;
  reached: boolean;
  age?: number;
  balance?: number;
}

const milestoneTargets = [
  250_000,
  500_000,
  750_000,
  1_000_000,
];

export function getProjectionMilestones(
  years: ProjectionYear[]
): ProjectionMilestone[] {
  return milestoneTargets.map((target) => {
    const matchingYear = years.find(
      (year) =>
        year.closingBalance.nominal >= target
    );

    if (!matchingYear) {
      return {
        target,
        reached: false,
      };
    }

    return {
      target,
      reached: true,

      // The closing balance is reached at the end
      // of this projection year.
      age: matchingYear.age + 1,

      balance:
        matchingYear.closingBalance.nominal,
    };
  });
}