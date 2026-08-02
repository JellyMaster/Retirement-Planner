import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

import { ScenarioProvider } from "../components/scenarios";
import { ThemeProvider } from "../theme/ThemeProvider";

interface AppProvidersProps {
  children: ReactNode;
  initialEntries?: string[];
}

interface AppRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialEntries?: string[];
}

function AppProviders({
  children,
  initialEntries = ["/"],
}: AppProvidersProps) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider>
        <ScenarioProvider>{children}</ScenarioProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

export function renderWithAppProviders(
  ui: ReactElement,
  { initialEntries, ...renderOptions }: AppRenderOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AppProviders initialEntries={initialEntries}>{children}</AppProviders>
    ),
    ...renderOptions,
  });
}
