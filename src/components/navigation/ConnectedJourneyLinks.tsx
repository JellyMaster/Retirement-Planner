import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    const updateLinks = () => {
      document.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
        const destination = getDestination(link);
        if (destination) link.setAttribute("href", destination);
      });
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const destination = getDestination(link);
      if (!destination) return;

      event.preventDefault();
      event.stopPropagation();
      navigate(destination);
    };

    updateLinks();
    document.addEventListener("click", handleClick, true);
    const observer = new MutationObserver(updateLinks);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("click", handleClick, true);
      observer.disconnect();
    };
  }, [location.pathname, location.search, navigate]);

  return null;
}

function getDestination(link: HTMLAnchorElement): string | undefined {
  const label = link.textContent?.replace(/\s+/g, " ").trim() ?? "";
  return destinations[label];
}
