import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { ScenarioProvider } from "../components/scenarios";
import { ThemeProvider } from "../theme/ThemeProvider";

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter>
        <ThemeProvider>
          <ScenarioProvider>{children}</ScenarioProvider>
        </ThemeProvider>
      </MemoryRouter>
    ),
    ...options,
  });
}
