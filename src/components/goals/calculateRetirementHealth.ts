import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";

export interface RetirementHealthMetrics {
    investablePot: number;
    annualPrivateIncome: number;
    annualStatePension: number;
    estimatedAnnualIncome: number;
    annualGap: number;
    coverage: number;
    score: number;
    status: "on-track" | "close" | "needs-attention";
}

export function calculateRetirementHealth(
    result: ProjectionResult,
    goals: RetirementGoals
): RetirementHealthMetrics {

    const investablePot = Math.max(
        0,
        result.finalBalance.real - goals.emergencyReserve
    );

    const annualPrivateIncome = investablePot * 0.04;

    const annualStatePension =
        goals.includeStatePension
            ? goals.statePensionAnnualAmount
            : 0;

    const estimatedAnnualIncome =
        annualPrivateIncome + annualStatePension;

    const target = Math.max(
        1,
        goals.desiredAnnualIncome
    );

    const annualGap =
        estimatedAnnualIncome -
        goals.desiredAnnualIncome;

    const coverage =
        estimatedAnnualIncome / target;

    const score = Math.max(
        0,
        Math.min(
            100,
            Math.round(coverage * 100)
        )
    );

    const status =
        coverage >= 1
            ? "on-track"
            : coverage >= 0.85
                ? "close"
                : "needs-attention";

    return {
        investablePot,
        annualPrivateIncome,
        annualStatePension,
        estimatedAnnualIncome,
        annualGap,
        coverage,
        score,
        status,
    };
}