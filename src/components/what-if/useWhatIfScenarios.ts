import { useContext } from "react";

import {
  WhatIfScenarioContext,
  type WhatIfScenarioContextValue,
} from "./WhatIfScenarioStore";

export function useWhatIfScenarios(): WhatIfScenarioContextValue {
  const context = useContext(WhatIfScenarioContext);
  if (!context) {
    throw new Error("useWhatIfScenarios must be used inside WhatIfScenarioProvider.");
  }
  return context;
}
