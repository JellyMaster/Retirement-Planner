import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const destinations: Record<string, string> = {
  "Explore retirement age": "/what-if?experiment=retirement-age",
  "Explore saving more": "/what-if?experiment=contributions",
  "Explore lower fees": "/what-if?experiment=fees",
  "Explore State Pension": "/what-if?experiment=state-pension",
  "Open market downturn": "/what-if?experiment=market-downturn",
  "Explore inflation": "/what-if?experiment=inflation",
  "Open What If?": "/what-if?experiment=retirement-age",
  "Open the interactive lesson": "/explore?lesson=sequence-returns",
  "Explore retirement risk": "/explore?lesson=sequence-returns",
  "Review sequence risk": "/explore?lesson=sequence-returns",
  "Review retirement income": "/plan?step=income&section=income-target",
  "Review retirement chapters": "/plan?step=income&section=chapters",
  "Add retirement chapters": "/plan?step=income&section=chapters",
  "Review tax-free cash": "/plan?step=income&section=tax-free-cash",
  "Review State Pension": "/plan?step=income&section=state-pension",
  "Review Drawdown": "/drawdown?tab=overview",
  "Review income": "/drawdown?tab=income",
  "Review pension balance": "/drawdown?tab=balance",
  "Review timeline": "/drawdown?tab=timeline",
};

export function ConnectedJourneyLinks() {
  const location = useLocation();

  useEffect(() => {
    const updateLinks = () => {
      document.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
        const label = link.textContent?.replace(/\s+/g, " ").trim() ?? "";
        const destination = destinations[label];
        if (destination) link.setAttribute("href", destination);
      });
    };

    updateLinks();
    const observer = new MutationObserver(updateLinks);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname, location.search]);

  return null;
}
