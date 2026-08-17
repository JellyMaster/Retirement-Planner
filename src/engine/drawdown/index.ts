export { DrawdownEngine } from "./DrawdownEngine";
export {
  calculateSustainableTargetIncome,
  type SustainableTargetIncomeOptions,
} from "./calculateSustainableTargetIncome";
export { createDefaultDrawdownInputs } from "./factories/createDefaultDrawdownInputs";
export type { DrawdownInputs } from "./models/DrawdownInputs";
export type { DrawdownResult } from "./models/DrawdownResult";
export type { DrawdownYear } from "./models/DrawdownYear";
export {
  validateDrawdownInputs,
  type DrawdownInputErrors,
  type DrawdownValidationResult,
} from "./validators/DrawdownInputsValidator";
