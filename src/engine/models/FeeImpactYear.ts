import type { MoneyValue } from "./MoneyValue";

export interface FeeImpactYear {
    yearIndex: number;

    age: number;

    feePaid: MoneyValue;

    cumulativeFees: MoneyValue;

    potDifference: MoneyValue;
}