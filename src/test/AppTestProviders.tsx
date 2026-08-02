import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

import { ScenarioProvider } from "../components/scenarios";
import { ThemeProvider } from "../theme/ThemeProvider";

interface AppTestProvidersProps {
  children: ReactNode;
  initialEntries?: string[];
}

export function AppTestProviders({
  children,
  initialEntries = ["/"],
}: AppTestProvidersProps) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider>
        <ScenarioProvider>{children}</ScenarioProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}
