import { ProjectionResultFactory } from "../factories/ProjectionResultFactory";
import type { PensionInputs } from "../models/PensionInputs";
import type { ProjectionResult } from "../models/ProjectionResult";
import type { ProjectionYear } from "../models/ProjectionYear";

export function applyMarketDownturn(
  projection: ProjectionResult,
  inputs: PensionInputs,
): ProjectionResult {
  const downturnAge = inputs.marketDownturnAge;
  const downturnPercentage = inputs.marketDownturnPercentage ?? 0;

  if (
    downturnAge === undefined ||
    downturnPercentage <= 0 ||
    projection.years.length === 0
  ) {
    return projection;
  }

  const severity = Math.min(0.8, Math.max(0, downturnPercentage));
  let nominalLoss = 0;
  let realLoss = 0;

  const nominalNetFactor = Math.max(
    0,
    1 + inputs.annualReturn - inputs.annualFee,
  );
  const realNetFactor = Math.max(
    0,
    nominalNetFactor / (1 + Math.max(0, inputs.inflation)),
  );

  const years = projection.years.map((year): ProjectionYear => {
    if (year.age < downturnAge) {
      return cloneYear(year);
    }

    if (year.age === downturnAge) {
      nominalLoss = year.closingBalance.nominal * severity;
      realLoss = year.closingBalance.real * severity;
    } else if (nominalLoss > 0 || realLoss > 0) {
      nominalLoss *= nominalNetFactor;
      realLoss *= realNetFactor;
    }

    return {
      ...cloneYear(year),
      openingBalance: {
        nominal: Math.max(0, year.openingBalance.nominal - nominalLoss),
        real: Math.max(0, year.openingBalance.real - realLoss),
      },
      investmentGrowth: {
        nominal:
          year.investmentGrowth.nominal - nominalLoss * inputs.annualReturn,
        real:
          year.investmentGrowth.real -
          realLoss * Math.max(0, realNetFactor - 1 + inputs.annualFee),
      },
      fees: {
        nominal: Math.max(
          0,
          year.fees.nominal - nominalLoss * inputs.annualFee,
        ),
        real: Math.max(0, year.fees.real - realLoss * inputs.annualFee),
      },
      closingBalance: {
        nominal: Math.max(0, year.closingBalance.nominal - nominalLoss),
        real: Math.max(0, year.closingBalance.real - realLoss),
      },
    };
  });

  return ProjectionResultFactory.create(years);
}

function cloneYear(year: ProjectionYear): ProjectionYear {
  return {
    ...year,
    openingBalance: { ...year.openingBalance },
    contributions: { ...year.contributions },
    investmentGrowth: { ...year.investmentGrowth },
    fees: { ...year.fees },
    closingBalance: { ...year.closingBalance },
  };
}
