import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

type DeepLinkedPageKind = "what-if" | "plan" | "drawdown" | "explore";

interface DeepLinkedPageProps {
  kind: DeepLinkedPageKind;
  children: ReactNode;
}

const experimentLabels: Record<string, string> = {
  "retirement-age": "Retirement age",
  contributions: "Save more",
  spending: "Spend more",
  fees: "Lower fees",
  returns: "Investment returns",
  inflation: "Inflation",
  "state-pension": "State Pension",
  "market-downturn": "Market downturn",
};

const drawdownTabLabels: Record<string, string> = {
  overview: "Overview",
  income: "Income",
  balance: "Balance",
  timeline: "Timeline",
  assumptions: "Assumptions",
};

const planSectionLabels: Record<string, string> = {
  "income-target": "Income target",
  chapters: "Retirement chapters",
  "retirement-chapters": "Retirement chapters",
  "tax-free-cash": "Tax-free cash",
  "state-pension": "State Pension",
};

export function DeepLinkedPage({ kind, children }: DeepLinkedPageProps) {
  const location = useLocation();

  useEffect(() => {
    const parameters = new URLSearchParams(location.search);
    let cancelled = false;

    const run = () => {
      if (cancelled) return;

      if (kind === "what-if") {
        activateButton(experimentLabels[parameters.get("experiment") ?? ""]);
        return;
      }

      if (kind === "drawdown") {
        activateButton(drawdownTabLabels[parameters.get("tab") ?? ""]);
        return;
      }

      if (kind === "plan") {
        const step = parameters.get("step");
        if (step === "income") {
          activateButton("Retirement income", "aria-label");
          window.requestAnimationFrame(() => {
            activateButton(planSectionLabels[parameters.get("section") ?? ""]);
          });
        }
        return;
      }

      if (kind === "explore" && parameters.get("lesson") === "sequence-returns") {
        focusDestination(document.getElementById("sequence-returns-title"));
      }
    };

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(run);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [kind, location.search]);

  return <>{children}</>;
}

function activateButton(label: string | undefined, attribute?: "aria-label") {
  if (!label) return;

  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
  const button = buttons.find((candidate) =>
    attribute === "aria-label"
      ? candidate.getAttribute("aria-label") === label
      : candidate.textContent?.replace(/\s+/g, " ").trim().includes(label),
  );

  if (!button || button.disabled) return;
  button.click();
  focusDestination(button);
}

function focusDestination(element: HTMLElement | null) {
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
  if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "-1");
  element.focus({ preventScroll: true });
}
