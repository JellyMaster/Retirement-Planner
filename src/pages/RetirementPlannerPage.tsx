import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Link,
  useInRouterContext,
  useSearchParams,
} from "react-router-dom";

import { EssentialAdvancedPensionInputsForm } from "../components/inputs/guided";
import { useScenarios } from "../components/scenarios";
import { createDefaultPensionInputs } from "../config/defaultPensionInputs";
import { createRetirementSpendingOutcome } from "../engine/drawdown/createRetirementSpendingOutcome";
import { DrawdownEngine } from "../engine/drawdown/DrawdownEngine";
import { createDrawdownInputsFromPlan } from "../engine/drawdown/factories/createDrawdownInputsFromPlan";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { usePensionProjection } from "../hooks/usePensionProjection";
import { useStoredRetirementGoals } from "../hooks/useStoredRetirementGoals";
import { AppIcons } from "../icons";
import { savePensionInputs } from "../state/planStorage";
import "../styles/my-plan-dev-panel.css";

const advancedIncomeSectionLabels: Record<string, string> = {
  chapters: "Will your spending change during retirement?",
  "retirement-chapters": "Will your spending change during retirement?",
  "tax-free-cash": "What income and cash should the plan include?",
};

const drawdownEngine = new DrawdownEngine();

export function RetirementPlannerPage() {
  return useInRouterContext() ? (
    <RoutedRetirementPlannerPage />
  ) : (
    <RetirementPlannerPageContent searchParams={new URLSearchParams()} />
  );
}

function RoutedRetirementPlannerPage() {
  const [searchParams] = useSearchParams();
  return <RetirementPlannerPageContent searchParams={searchParams} />;
}

function RetirementPlannerPageContent({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) {
  const { activeScenario, updateScenarioInputs } = useScenarios();
  const [retirementGoals] = useStoredRetirementGoals();
  const [inputs, setInputs] = useState<PensionInputs>(() => ({
    ...activeScenario.inputs,
  }));
  const scenario = usePensionProjection(inputs);

  useEffect(() => {
    if (searchParams.get("step") !== "income") return;

    const stepFrame = window.requestAnimationFrame(() => {
      const requestedSection = searchParams.get("section") ?? "";
      const advancedSectionLabel = advancedIncomeSectionLabels[requestedSection];

      if (advancedSectionLabel) {
        const strategy = document.querySelector<HTMLButtonElement>(
          'button[aria-label="Retirement strategy"]',
        );
        strategy?.click();
        strategy?.focus();

        window.requestAnimationFrame(() => {
          const strategyButtons = Array.from(
            document.querySelectorAll<HTMLButtonElement>(
              ".retirement-strategy-card-toggle",
            ),
          );
          const target = strategyButtons.find((button) =>
            button.textContent?.includes(advancedSectionLabel),
          );
          target?.click();
          target?.focus();
          target?.scrollIntoView?.({ behavior: "smooth", block: "center" });
        });
        return;
      }

      const retirementIncome = document.querySelector<HTMLButtonElement>(
        'button[aria-label="Retirement income"]',
      );
      retirementIncome?.click();
      retirementIncome?.focus();

      window.requestAnimationFrame(() => {
        const targetId =
          requestedSection === "state-pension"
            ? "current-essential-income-statePension"
            : requestedSection === "income-target"
              ? "current-essential-income-desiredAnnualIncome"
              : null;
        const target = targetId ? document.getElementById(targetId) : null;
        target?.focus();
        target?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      });
    });

    return () => window.cancelAnimationFrame(stepFrame);
  }, [searchParams]);

  const commitInputs = useCallback(
    (nextInputs: PensionInputs) => {
      const committed = { ...nextInputs };
      updateScenarioInputs(activeScenario.id, committed);
      setInputs(committed);

      if (activeScenario.isBaseline) {
        savePensionInputs(committed);
      }
    },
    [activeScenario.id, activeScenario.isBaseline, updateScenarioInputs],
  );

  function resetInputs() {
    commitInputs(createDefaultPensionInputs());
  }

  const planComplete = !scenario.hasErrors;
  const calculationAudit = useMemo(() => {
    if (scenario.hasErrors) return null;

    const effectiveDrawdownInputs = createDrawdownInputsFromPlan({
      pensionInputs: inputs,
      projection: scenario.projection,
      retirementGoals,
      drawdown: activeScenario.drawdown,
    });
    const drawdownResult = drawdownEngine.calculate(effectiveDrawdownInputs);
    const spendingOutcome = createRetirementSpendingOutcome(
      effectiveDrawdownInputs,
      activeScenario.drawdown,
    );
    const firstYear = drawdownResult.years[0] ?? null;
    const lastYear = drawdownResult.years.at(-1) ?? null;
    const retirementPeriods = drawdownResult.years.length;
    const endingBalanceToday =
      lastYear && retirementPeriods > 0
        ? lastYear.closingBalance /
          Math.pow(1 + effectiveDrawdownInputs.inflationRate, retirementPeriods)
        : drawdownResult.finalBalance;

    return {
      generatedFor: {
        scenarioId: activeScenario.id,
        scenarioName: activeScenario.name,
      },
      projection: {
        retirementAge: inputs.retirementAge,
        pensionAtRetirement: {
          todayMoney: scenario.projection.finalBalance.real,
          futureMoney: scenario.projection.finalBalance.nominal,
        },
        totalContributions: scenario.projection.totalContributions,
        totalInvestmentGrowth: scenario.projection.totalInvestmentGrowth,
        totalFees: scenario.projection.totalFees,
      },
      effectiveDrawdownInputs: {
        ...effectiveDrawdownInputs,
        retirementPeriods,
        statePensionIncluded: effectiveDrawdownInputs.annualStatePension > 0,
        preStatePensionRetirementYears: Math.max(
          0,
          Math.min(
            effectiveDrawdownInputs.endAge + 1,
            effectiveDrawdownInputs.statePensionAge,
          ) - effectiveDrawdownInputs.retirementAge,
        ),
      },
      savedStrategyResult: {
        taxFreeCashTaken: drawdownResult.taxFreeCashTaken,
        balanceEnteringDrawdown: drawdownResult.balanceAfterTaxFreeCash,
        firstYear: firstYear
          ? {
              age: firstYear.age,
              desiredNetIncome: firstYear.desiredIncome,
              privatePensionWithdrawal: firstYear.pensionWithdrawal,
              statePensionIncome: firstYear.statePensionIncome,
              grossIncome: firstYear.grossIncome,
              incomeTax: firstYear.incomeTax,
              netIncome: firstYear.netIncome,
              openingBalance: firstYear.openingBalance,
              investmentGrowth: firstYear.investmentGrowth,
              fees: firstYear.fees,
              closingBalance: firstYear.closingBalance,
            }
          : null,
        firstNetIncomeShortfallAge: drawdownResult.firstNetIncomeShortfallAge,
        depletionAge: drawdownResult.depletionAge,
        endingBalance: {
          futureMoney: drawdownResult.finalBalance,
          todayMoneyApprox: endingBalanceToday,
        },
        totalsFutureMoney: {
          desiredIncome: drawdownResult.totalDesiredIncome,
          statePensionIncome: drawdownResult.totalStatePensionIncome,
          privatePensionWithdrawals: drawdownResult.totalPensionWithdrawals,
          grossIncome: drawdownResult.totalGrossIncome,
          incomeTax: drawdownResult.totalIncomeTax,
          netIncome: drawdownResult.totalNetIncome,
          netIncomeShortfall: drawdownResult.totalNetIncomeShortfall,
          investmentGrowth: drawdownResult.totalInvestmentGrowth,
          fees: drawdownResult.totalFees,
        },
      },
      sustainabilityResult: {
        interpretation:
          "Maximum constant annual net spending that satisfies the configured ending-balance goal through the planning age.",
        endingBalanceMode: activeScenario.drawdown?.endingBalanceMode ?? "preserve",
        savedEndingBalancePercentage:
          activeScenario.drawdown?.endingBalancePercentage ?? null,
        targetEndingBalance: spendingOutcome.targetEndingBalance,
        targetNetSpending: spendingOutcome.targetNetSpending,
        supportableNetSpending: spendingOutcome.sustainableNetSpending,
        annualHeadroom: spendingOutcome.annualHeadroom,
        headroomPercent: spendingOutcome.headroomPercent,
        status: spendingOutcome.status,
        modelledEndingBalance: spendingOutcome.modelledEndingBalance,
        includesStatePension: spendingOutcome.includesStatePension ?? false,
      },
    };
  }, [activeScenario, inputs, retirementGoals, scenario.hasErrors, scenario.projection]);

  return (
    <main className="planner-page my-plan-page">
      <header className="planner-header my-plan-header">
        <div>
          <p className="planner-eyebrow">My Plan · {activeScenario.name}</p>
          <h1>Build your retirement plan</h1>
          <p>
            Start with the essentials, then fine-tune advanced assumptions only when
            you need them.
          </p>
        </div>

        <Link className="ui-button ui-button-secondary ui-button-medium" to="/">
          View overview
        </Link>
      </header>

      <section
        className={`my-plan-context${
          activeScenario.isBaseline ? " is-baseline" : " is-alternative"
        }`}
        aria-label="Plan being edited"
      >
        <div className="my-plan-context-main">
          <span className="my-plan-context-icon" aria-hidden="true">
            <FontAwesomeIcon
              icon={
                activeScenario.isBaseline
                  ? AppIcons.status.success
                  : AppIcons.navigation.compare
              }
            />
          </span>
          <div>
            <p className="planner-eyebrow">
              {activeScenario.isBaseline ? "Main retirement plan" : "Saved scenario"}
            </p>
            <h2>{activeScenario.name}</h2>
            <p>
              {activeScenario.isBaseline
                ? "Edits here update the plan used across the retirement planner."
                : "Edits apply only to this saved scenario. Your baseline plan remains unchanged."}
            </p>
          </div>
        </div>

        <div
          className={`my-plan-completeness${
            planComplete ? " is-complete" : " needs-attention"
          }`}
          aria-label="Plan completeness"
        >
          <span>Plan details</span>
          <strong>{planComplete ? "Complete" : "Needs attention"}</strong>
          <small>
            {planComplete
              ? "Essential plan information is usable"
              : "Review the highlighted fields"}
          </small>
          <small>Updated {formatUpdatedDate(activeScenario.updatedAt)}</small>
        </div>
      </section>

      <section className="my-plan-editor-region" aria-label="Edit retirement plan">
        <EssentialAdvancedPensionInputsForm
          idPrefix="current"
          value={inputs}
          errors={scenario.errors}
          onChange={commitInputs}
          onReset={resetInputs}
        />
      </section>

      <aside className="my-plan-source-note" aria-label="Where plan changes are used">
        <FontAwesomeIcon icon={AppIcons.status.information} aria-hidden="true" />
        <p>
          Changes here update your Overview, What If? and Drawdown results automatically.
        </p>
      </aside>

      {import.meta.env.DEV && (
        <PlanJsonDevPanel
          scenario={{
            ...activeScenario,
            inputs,
            drawdown: activeScenario.drawdown ?? null,
          }}
          calculationAudit={calculationAudit}
        />
      )}
    </main>
  );
}

function PlanJsonDevPanel({
  scenario,
  calculationAudit,
}: {
  scenario: unknown;
  calculationAudit: unknown;
}) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const json = JSON.stringify(
    {
      savedPlan: scenario,
      calculationAudit,
    },
    null,
    2,
  );

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(json);
      setCopyStatus("Copied calculation audit JSON to clipboard.");
    } catch {
      setCopyStatus("Could not copy automatically. Select the JSON below and copy it manually.");
    }
  }

  return (
    <details className="my-plan-dev-panel">
      <summary>
        <span className="my-plan-dev-panel-summary-copy">
          <strong>Developer · Calculation Audit JSON</strong>
          <small>Saved inputs plus the effective values and outputs used by the calculation engines.</small>
        </span>
        <span className="my-plan-dev-badge">Dev only</span>
      </summary>

      <div className="my-plan-dev-panel-body">
        <div className="my-plan-dev-panel-toolbar">
          <p>
            Copy this snapshot to reconcile projection, drawdown and sustainability results
            without having to infer values from the UI.
          </p>
          <button
            type="button"
            className="ui-button ui-button-secondary ui-button-small"
            onClick={copyJson}
          >
            Copy audit JSON
          </button>
        </div>

        <pre className="my-plan-dev-json" aria-label="Calculation audit JSON">
          <code>{json}</code>
        </pre>

        {copyStatus && (
          <p className="my-plan-dev-copy-status" role="status">
            {copyStatus}
          </p>
        )}
      </div>
    </details>
  );
}

function formatUpdatedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
