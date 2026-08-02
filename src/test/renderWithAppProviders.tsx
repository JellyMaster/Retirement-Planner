import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

import { AppTestProviders } from "./AppTestProviders";

interface AppRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialEntries?: string[];
}

export function renderWithAppProviders(
  ui: ReactElement,
  { initialEntries, ...renderOptions }: AppRenderOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AppTestProviders initialEntries={initialEntries}>
        {children}
      </AppTestProviders>
    ),
    ...renderOptions,
  });
}
