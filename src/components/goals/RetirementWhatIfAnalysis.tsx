import { useMemo } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { RetirementProjectionEngine } from "../../engine/services/RetirementProjectionEngine";
import { AppIcons } from "../../icons";
import { formatCurrency } from "../../utils/formatters";
import { calculateRetirementHealth } from "./calculateRetirementHealth";
import { CustomWhatIfBuilder } from "../what-if";
import { Button, Card, CardHeader, DashboardGrid, StatusBadge } from "../ui";

interface RetirementWhatIfAnalysisProps {
  inputs: PensionInputs;
  result: ProjectionResult;
  goals: RetirementGoals;
  onApplyToComparison: (inputs: PensionInputs) => void;
}

type ScenarioTone = "positive" | "caution" | "neutral";

interface ScenarioDefinition {
  id: string;
  title: string;
  description: string;
  icon: IconDefinition;
  tone: ScenarioTone;
  buildInputs: (inputs: PensionInputs) => PensionInputs;
  available?: (inputs: PensionInputs) => boolean;
}

interface ScenarioResult extends ScenarioDefinition {
  nextInputs: PensionInputs;
  potDifference: number;
  incomeDifference: number;
  scoreDifference: number;
  resultingScore: number;
}

const scenarios: ScenarioDefinition[] = [
  {
    id: "retire-later",
    title: "Retire one year later",
    description: "Add one more year of contributions and potential investment growth.",
    icon: AppIcons.clock,
    tone: "positive",
    buildInputs: (inputs) => ({
      ...inputs,
      retirementAge: Math.min(100, inputs.retirementAge + 1),
    }),
    available: (inputs) => inputs.retirementAge < 100,
  },
  {
    id: "save-more",
    title: "Save £100 more each month",
    description: "Increase your own monthly pension contribution by £100.",
    icon: AppIcons.plus,
    tone: "positive",
    buildInputs: (inputs) => ({
      ...inputs,
      monthlyEmployeeContribution: inputs.monthlyEmployeeContribution + 100,
    }),
  },
  {
    id: "lower-return",
    title: "Returns are 1% lower",
    description: "Stress-test the plan using a more cautious annual return assumption.",
    icon: AppIcons.chartLine,
    tone: "caution",
    buildInputs: (inputs) => ({
      ...inputs,
      annualReturn: Math.max(-0.99, Number((inputs.annualReturn - 0.01).toFixed(10))),
    }),
  },
  {
    id: "higher-fees",
    title: "Fees are 0.25% higher",
    description: "See how a higher annual pension charge could affect the outcome.",
    icon: AppIcons.fees,
    tone: "caution",
    buildInputs: (inputs) => ({
      ...inputs,
      annualFee: Number((inputs.annualFee + 0.0025).toFixed(10)),
    }),
  },
  {
    id: "higher-inflation",
    title: "Inflation is 1% higher",
    description: "Test the real value of the plan under a higher inflation assumption.",
    icon: AppIcons.growth,
    tone: "caution",
    buildInputs: (inputs) => ({
      ...inputs,
      inflation: Number((inputs.inflation + 0.01).toFixed(10)),
    }),
  },
  {
    id: "remove-extra",
    title: "Remove future extra contributions",
    description: "Measure how much your planned additional payments contribute to the result.",
    icon: AppIcons.minus,
    tone: "neutral",
    buildInputs: (inputs) => ({
      ...inputs,
      extraContributionAge: undefined,
      extraMonthlyContribution: undefined,
    }),
    available: (inputs) => Boolean(inputs.extraMonthlyContribution && inputs.extraMonthlyContribution > 0),
  },
];

function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.5) return formatCurrency(0);
  return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPoints(value: number): string {
  if (value === 0) return "No change";
  return `${value > 0 ? "+" : "−"}${Math.abs(value)} ${Math.abs(value) === 1 ? "point" : "points"}`;
}

export function RetirementWhatIfAnalysis({
  inputs,
  result,
  goals,
  onApplyToComparison,
}: RetirementWhatIfAnalysisProps) {
  const baselineHealth = useMemo(
    () => calculateRetirementHealth(result, goals),
    [result, goals],
  );

  const scenarioResults = useMemo<ScenarioResult[]>(() => {
    return scenarios
      .filter((scenario) => scenario.available?.(inputs) ?? true)
      .map((scenario) => {
        const nextInputs = scenario.buildInputs(inputs);
        const projection = RetirementProjectionEngine.calculate(nextInputs);
        const health = calculateRetirementHealth(projection, goals);

        return {
          ...scenario,
          nextInputs,
          potDifference: projection.finalBalance.real - result.finalBalance.real,
          incomeDifference: health.estimatedAnnualIncome - baselineHealth.estimatedAnnualIncome,
          scoreDifference: health.score - baselineHealth.score,
          resultingScore: health.score,
        };
      });
  }, [baselineHealth, goals, inputs, result]);

  return (
    <Card className="retirement-what-if" aria-labelledby="retirement-what-if-heading">
      <CardHeader
        eyebrow="Explore your options"
        title="What happens if…"
        titleId="retirement-what-if-heading"
        icon={AppIcons.comparison}
        description="Preview common changes without altering your current plan. Send any scenario to comparison when you want a closer look."
        badge={
          <StatusBadge tone="info">
            Current score {baselineHealth.score}/100
          </StatusBadge>
        }
      />

      <DashboardGrid columns={3} className="retirement-what-if-grid">
        {scenarioResults.map((scenario) => (
          <Card
            as="article"
            className={`retirement-what-if-card retirement-what-if-card-${scenario.tone}`}
            tone={scenario.tone === "positive" ? "success" : scenario.tone === "caution" ? "warning" : "subtle"}
            interactive
            key={scenario.id}
          >
            <div className="retirement-what-if-card-heading">
              <span className="retirement-what-if-icon" aria-hidden="true">
                <FontAwesomeIcon icon={scenario.icon} />
              </span>
              <div>
                <h3>{scenario.title}</h3>
                <p>{scenario.description}</p>
              </div>
            </div>

            <dl className="retirement-what-if-impact">
              <div>
                <dt>Projected pot</dt>
                <dd className={scenario.potDifference >= 0 ? "positive" : "negative"}>
                  {formatSignedCurrency(scenario.potDifference)}
                </dd>
              </div>
              <div>
                <dt>Annual income</dt>
                <dd className={scenario.incomeDifference >= 0 ? "positive" : "negative"}>
                  {formatSignedCurrency(scenario.incomeDifference)}
                </dd>
              </div>
              <div>
                <dt>Readiness</dt>
                <dd>
                  {scenario.resultingScore}<small>/100</small>
                  <span className={scenario.scoreDifference >= 0 ? "positive" : "negative"}>
                    {formatSignedPoints(scenario.scoreDifference)}
                  </span>
                </dd>
              </div>
            </dl>

            <Button variant="compare" fullWidth onClick={() => onApplyToComparison(scenario.nextInputs)}>
              Apply to comparison
            </Button>
          </Card>
        ))}
      </DashboardGrid>

      <CustomWhatIfBuilder
        inputs={inputs}
        result={result}
        goals={goals}
        onApplyToComparison={onApplyToComparison}
      />

      <p className="retirement-what-if-disclaimer">
        These are planning illustrations using your existing assumptions and retirement goals. They do not change the current plan until you choose to edit or replace it.
      </p>
    </Card>
  );
}
