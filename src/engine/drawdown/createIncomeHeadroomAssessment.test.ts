import { describe, expect, it } from "vitest";

import { createIncomeHeadroomAssessment } from "./createIncomeHeadroomAssessment";

describe("createIncomeHeadroomAssessment", () => {
  it("classifies at least 10% headroom as comfortable", () => {
    expect(createIncomeHeadroomAssessment(30_000, 33_000)).toEqual({
      targetIncome: 30_000,
      sustainableIncome: 33_000,
      annualHeadroom: 3_000,
      headroomPercent: 0.1,
      status: "comfortable",
    });
  });

  it("classifies positive headroom below 10% as tight", () => {
    const assessment = createIncomeHeadroomAssessment(30_000, 31_500);

    expect(assessment.annualHeadroom).toBe(1_500);
    expect(assessment.headroomPercent).toBeCloseTo(0.05);
    expect(assessment.status).toBe("tight");
  });

  it("classifies an exact sustainable target as tight", () => {
    expect(createIncomeHeadroomAssessment(30_000, 30_000).status).toBe("tight");
  });

  it("classifies income above the sustainable amount as a shortfall", () => {
    const assessment = createIncomeHeadroomAssessment(30_000, 27_000);

    expect(assessment.annualHeadroom).toBe(-3_000);
    expect(assessment.headroomPercent).toBeCloseTo(-0.1);
    expect(assessment.status).toBe("shortfall");
  });

  it("handles a zero target without dividing by zero", () => {
    expect(createIncomeHeadroomAssessment(0, 10_000)).toEqual({
      targetIncome: 0,
      sustainableIncome: 10_000,
      annualHeadroom: 10_000,
      headroomPercent: null,
      status: "comfortable",
    });
  });

  it("rejects invalid income values", () => {
    expect(() => createIncomeHeadroomAssessment(-1, 10_000)).toThrow(
      /target income/i,
    );
    expect(() => createIncomeHeadroomAssessment(10_000, Number.NaN)).toThrow(
      /sustainable income/i,
    );
  });
});
