import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { ConnectedJourneyLinks } from "./ConnectedJourneyLinks";
import { DeepLinkedPage } from "./DeepLinkedPage";

describe("connected journey navigation", () => {
  it("activates the requested What If experiment", async () => {
    const onSelect = vi.fn();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    render(
      <MemoryRouter initialEntries={["/what-if?experiment=fees"]}>
        <DeepLinkedPage kind="what-if">
          <button type="button" onClick={onSelect}>Lower fees</button>
        </DeepLinkedPage>
      </MemoryRouter>,
    );

    await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
  });

  it("targets and navigates a connected recommendation link", async () => {
    render(
      <MemoryRouter initialEntries={["/guidance"]}>
        <ConnectedJourneyLinks />
        <a href="/what-if">Explore lower fees</a>
        <LocationValue />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "Explore lower fees" });
    await waitFor(() =>
      expect(link).toHaveAttribute("href", "/what-if?experiment=fees"),
    );

    act(() => fireEvent.click(link));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/what-if?experiment=fees",
    );
  });
});

function LocationValue() {
  const location = useLocation();
  return (
    <Routes>
      <Route
        path="*"
        element={
          <output data-testid="location">
            {location.pathname}
            {location.search}
          </output>
        }
      />
    </Routes>
  );
}
