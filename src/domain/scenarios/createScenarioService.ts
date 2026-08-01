import { createDefaultPensionInputs } from "../../config/defaultPensionInputs";
import { LocalScenarioRepository } from "./LocalScenarioRepository";
import {
  ScenarioService,
  createBrowserScenarioDependencies,
} from "./ScenarioService";

export function createBrowserScenarioService(): ScenarioService {
  const dependencies = createBrowserScenarioDependencies();
  const repository = new LocalScenarioRepository(
    window.localStorage,
    createDefaultPensionInputs(),
    dependencies,
  );

  return new ScenarioService(repository, dependencies);
}
