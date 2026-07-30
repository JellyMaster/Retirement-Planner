import { createPensionInputs } from "./createPensionInputs";

export function createRetirementSoonPension() {
  return createPensionInputs({
    retirementAge: 50,
  });
}