import type {
  UkIncomeTaxBand,
  UkIncomeTaxInputs,
  UkIncomeTaxResult,
} from "./models/UkIncomeTaxModels";
import { validateUkIncomeTaxInputs } from "./validators/UkIncomeTaxValidator";

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundRate(value: number): number {
  return Math.round((value + Number.EPSILON) * 10_000) / 10_000;
}

export class UkIncomeTaxEngine {
  calculate(inputs: UkIncomeTaxInputs): UkIncomeTaxResult {
    const validation = validateUkIncomeTaxInputs(inputs);

    if (!validation.isValid) {
      const details = Object.entries(validation.errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(" ");

      throw new Error(`Invalid UK income-tax inputs. ${details}`);
    }

    const taxablePensionIncome = roundMoney(
      inputs.pensionWithdrawal - inputs.taxFreePensionWithdrawal,
    );
    const adjustedNetIncome = roundMoney(
      taxablePensionIncome +
        inputs.statePensionIncome +
        inputs.otherTaxableIncome,
    );

    const allowanceReduction = Math.max(
      0,
      (adjustedNetIncome - inputs.taxYear.personalAllowanceTaperThreshold) *
        inputs.taxYear.personalAllowanceTaperRate,
    );
    const personalAllowance = roundMoney(
      Math.max(0, inputs.taxYear.personalAllowance - allowanceReduction),
    );
    const taxableIncome = roundMoney(
      Math.max(0, adjustedNetIncome - personalAllowance),
    );

    const basicTaxable = roundMoney(
      Math.min(taxableIncome, inputs.taxYear.basicRateBand),
    );

    const higherBandWidth = Math.max(
      0,
      inputs.taxYear.additionalRateThreshold -
        inputs.taxYear.basicRateBand,
    );
    const higherTaxable = roundMoney(
      Math.min(Math.max(0, taxableIncome - basicTaxable), higherBandWidth),
    );
    const additionalTaxable = roundMoney(
      Math.max(0, taxableIncome - basicTaxable - higherTaxable),
    );

    const bands: UkIncomeTaxBand[] = [
      {
        name: "basic",
        rate: inputs.taxYear.basicRate,
        taxableAmount: basicTaxable,
        tax: roundMoney(basicTaxable * inputs.taxYear.basicRate),
      },
      {
        name: "higher",
        rate: inputs.taxYear.higherRate,
        taxableAmount: higherTaxable,
        tax: roundMoney(higherTaxable * inputs.taxYear.higherRate),
      },
      {
        name: "additional",
        rate: inputs.taxYear.additionalRate,
        taxableAmount: additionalTaxable,
        tax: roundMoney(additionalTaxable * inputs.taxYear.additionalRate),
      },
    ];

    const incomeTax = roundMoney(
      bands.reduce((total, band) => total + band.tax, 0),
    );
    const grossIncome = roundMoney(
      inputs.pensionWithdrawal +
        inputs.statePensionIncome +
        inputs.otherTaxableIncome,
    );
    const netIncome = roundMoney(grossIncome - incomeTax);

    let marginalTaxRate = 0;
    if (additionalTaxable > 0) {
      marginalTaxRate = inputs.taxYear.additionalRate;
    } else if (higherTaxable > 0) {
      marginalTaxRate = inputs.taxYear.higherRate;
    } else if (basicTaxable > 0) {
      marginalTaxRate = inputs.taxYear.basicRate;
    }

    return {
      grossIncome,
      taxFreePensionIncome: roundMoney(inputs.taxFreePensionWithdrawal),
      taxablePensionIncome,
      statePensionIncome: roundMoney(inputs.statePensionIncome),
      otherTaxableIncome: roundMoney(inputs.otherTaxableIncome),
      adjustedNetIncome,
      personalAllowance,
      taxableIncome,
      bands,
      incomeTax,
      netIncome,
      effectiveTaxRate:
        grossIncome === 0 ? 0 : roundRate(incomeTax / grossIncome),
      marginalTaxRate,
    };
  }
}
