import { useSyncExternalStore } from "react";

export type WhatIfViewMode = "simple" | "detailed";
export type WhatIfMoneyDisplayMode = "today" | "nominal";

interface WhatIfDisplaySettingsSnapshot {
  viewMode: WhatIfViewMode;
  displayMode: WhatIfMoneyDisplayMode;
}

const listeners = new Set<() => void>();
let snapshot: WhatIfDisplaySettingsSnapshot = {
  viewMode: "simple",
  displayMode: "today",
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function setWhatIfViewMode(viewMode: WhatIfViewMode) {
  if (snapshot.viewMode === viewMode) return;
  snapshot = { ...snapshot, viewMode };
  emitChange();
}

export function setWhatIfMoneyDisplayMode(displayMode: WhatIfMoneyDisplayMode) {
  if (snapshot.displayMode === displayMode) return;
  snapshot = { ...snapshot, displayMode };
  emitChange();
}

export function useWhatIfDisplaySettings() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
