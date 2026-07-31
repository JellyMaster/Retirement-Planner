import type { PensionInputs } from "../models/PensionInputs";
import type { FeeImpact } from "../models/FeeImpact";
import type { MoneyValue } from "../models/MoneyValue";

import { RetirementProjectionEngine } from "./RetirementProjectionEngine";

function subtractMoney(a: MoneyValue, b: MoneyValue): MoneyValue {
    return {
        nominal: a.nominal - b.nominal,
        real: a.real - b.real,
    };
}

function addMoney(a: MoneyValue, b: MoneyValue): MoneyValue {
    return {
        nominal: a.nominal + b.nominal,
        real: a.real + b.real,
    };
}

export class FeeImpactCalculator {

    static calculate(inputs: PensionInputs): FeeImpact {

        const withFees =
            RetirementProjectionEngine.calculate(inputs);

        const withoutFees =
            RetirementProjectionEngine.calculate({
                ...inputs,
                annualFee: 0,
            });

        const finalPotDifference = subtractMoney(
            withoutFees.finalBalance,
            withFees.finalBalance
        );

        const cumulativeFees =
            withFees.totalFees;

        const lostCompoundGrowth = subtractMoney(
            finalPotDifference,
            cumulativeFees
        );

        const percentageDifference =
            withoutFees.finalBalance.nominal === 0
                ? 0
                : (finalPotDifference.nominal /
                    withoutFees.finalBalance.nominal) * 100;

        const yearlyImpact = [];

        let runningFees: MoneyValue = {
            nominal: 0,
            real: 0,
        };

        for (let i = 0; i < withFees.years.length; i++) {

            const feeYear = withFees.years[i];
            const noFeeYear = withoutFees.years[i];

            runningFees = addMoney(
                runningFees,
                feeYear.fees
            );

            yearlyImpact.push({

                yearIndex: feeYear.yearIndex,

                age: feeYear.age,

                feePaid: feeYear.fees,

                cumulativeFees: runningFees,

                potDifference: subtractMoney(
                    noFeeYear.closingBalance,
                    feeYear.closingBalance
                ),
            });
        }

        return {

            withFees,

            withoutFees,

            finalPotDifference,

            cumulativeFees,

            lostCompoundGrowth,

            percentageDifference,

            yearlyImpact,
        };
    }
}