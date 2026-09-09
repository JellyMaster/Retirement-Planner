import type { ScenarioDrawdownPreferences, ScenarioId } from "../scenarios";
import type { PensionInputs } from "../../engine/models/PensionInputs";

export type WhatIfExperimentId =
  | "retirement-age"
  | "contributions"
  | "spending"
  | "fees"
  | "returns"
  | "inflation"
  | "state-pension"
  | "market-downturn";

export interface WhatIfScenario {
  id: string;
  name: string;
  baseScenarioId: ScenarioId;
  experimentType: WhatIfExperimentId;
  createdAt: string;
  updatedAt: string;
  inputs: PensionInputs;
  drawdown: ScenarioDrawdownPreferences;
}

export interface WhatIfScenarioState {
  scenarios: WhatIfScenario[];
}
