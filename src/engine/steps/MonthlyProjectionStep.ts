import { type MonthlyProjectionContext } from "../models/MonthlyProjectionContext";

export interface MonthlyProjectionStep {
  execute(context: MonthlyProjectionContext): void;
}