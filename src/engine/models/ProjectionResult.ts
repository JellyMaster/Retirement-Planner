import { type  MoneyValue } from "./MoneyValue";
import { type ProjectionYear } from "./ProjectionYear";

export interface ProjectionResult {
  years: ProjectionYear[];

  finalBalance: MoneyValue;

  totalContributions: MoneyValue;

  totalInvestmentGrowth: MoneyValue;

  totalFees: MoneyValue;
}