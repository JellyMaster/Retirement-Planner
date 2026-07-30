import { type  MoneyValue } from "./MoneyValue";

export interface ProjectionYear {
     yearIndex: number;
  age: number;

  openingBalance: MoneyValue;

  contributions: MoneyValue;

  investmentGrowth: MoneyValue;

  fees: MoneyValue;

  closingBalance: MoneyValue;
}