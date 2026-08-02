import { useEffect } from "react";

const NAVIGATION_KEYS = new Set(["ArrowRight", "ArrowLeft", "Home", "End"]);

export function TabKeyboardNavigation() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!NAVIGATION_KEYS.has(event.key)) return;
      if (!(event.target instanceof HTMLElement)) return;

      const currentTab = event.target.closest<HTMLElement>("[role='tab']");
      const tabList = currentTab?.closest<HTMLElement>("[role='tablist']");
      if (!currentTab || !tabList) return;

      const tabs = Array.from(
        tabList.querySelectorAll<HTMLElement>("[role='tab']"),
      ).filter(
        (tab) =>
          tab.getAttribute("aria-disabled") !== "true" &&
          !(tab instanceof HTMLButtonElement && tab.disabled),
      );
      const currentIndex = tabs.indexOf(currentTab);
      if (currentIndex < 0 || tabs.length === 0) return;

      let nextIndex = currentIndex;
      if (event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      }

      const nextTab = tabs[nextIndex];
      if (!nextTab) return;

      event.preventDefault();
      event.stopPropagation();
      nextTab.focus();
      nextTab.click();
    }

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  return null;
}
