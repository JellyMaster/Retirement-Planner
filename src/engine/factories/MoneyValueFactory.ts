import { type MoneyValue } from "../models/MoneyValue";

export class MoneyValueFactory {
  public static create(
    nominal: number,
    inflationFactor: number
  ): MoneyValue {
    if (inflationFactor <= 0) {
      throw new RangeError(
        "Inflation factor must be greater than zero."
      );
    }

    return {
      nominal,
      real: nominal / inflationFactor,
    };
  }

  public static empty(): MoneyValue {
    return {
      nominal: 0,
      real: 0,
    };
  }
}