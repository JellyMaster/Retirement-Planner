import { createContext } from "react";

import type {
  WhatIfExperimentId,
  WhatIfScenario,
  WhatIfScenarioState,
} from "../../domain/what-if/WhatIfScenario";
import type { ScenarioDrawdownPreferences, ScenarioId } from "../../domain/scenarios";
import type { PensionInputs } from "../../engine/models/PensionInputs";

export interface SaveWhatIfScenarioInput {
  name: string;
  baseScenarioId: ScenarioId;
  experimentType: WhatIfExperimentId;
  inputs: PensionInputs;
  drawdown: ScenarioDrawdownPreferences;
}

export interface WhatIfScenarioContextValue extends WhatIfScenarioState {
  saveScenario: (input: SaveWhatIfScenarioInput) => WhatIfScenario;
  deleteScenario: (id: string) => void;
}

export const WhatIfScenarioContext =
  createContext<WhatIfScenarioContextValue | null>(null);
