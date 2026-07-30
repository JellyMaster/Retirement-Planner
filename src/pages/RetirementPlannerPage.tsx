
import {
  useMemo,
  useState,
} from "react";

import { ScenarioComparisonChart } from "../components/comparison/ScenarioComparisonChart";
import { ScenarioSummaryCard } from "../components/comparison/ScenarioSummaryCard";
import { PensionInputsForm } from "../components/inputs/PensionInputsForm";
import { ContributionGrowthChart } from "../components/projection/ContributionGrowthChart";
import { PensionBalanceChart } from "../components/projection/PensionBalanceChart";
import { ProjectionTable } from "../components/projection/ProjectionTable";
import { ProjectionAssumptions } from "../components/summary/ProjectionAssumptions";
import { ProjectionMilestones } from "../components/summary/ProjectionMilestones";
import { ProjectionSummary } from "../components/summary/ProjectionSummary";

import { defaultPensionInputs } from "../config/defaultPensionInputs";

import { ProjectionResultFactory } from "../engine/factories/ProjectionResultFactory";
import type { PensionInputs } from "../engine/models/PensionInputs";
import { RetirementProjectionEngine } from "../engine/services/RetirementProjectionEngine";

import {
  hasPensionInputErrors,
  validatePensionInputs,
} from "../validation/validatePensionInputs";

export function RetirementPlannerPage() {
  const [inputs, setInputs] =
    useState<PensionInputs>(() => ({
      ...defaultPensionInputs,
    }));

  const [
    comparisonInputs,
    setComparisonInputs,
  ] = useState<PensionInputs>(() => ({
    ...defaultPensionInputs,
  }));

  const [
    comparisonEnabled,
    setComparisonEnabled,
  ] = useState(false);

  const errors = useMemo(
    () => validatePensionInputs(inputs),
    [inputs]
  );

  const comparisonErrors = useMemo(
    () =>
      validatePensionInputs(
        comparisonInputs
      ),
    [comparisonInputs]
  );

  const hasErrors =
    hasPensionInputErrors(errors);

  const comparisonHasErrors =
    hasPensionInputErrors(
      comparisonErrors
    );

  const projection = useMemo(() => {
    if (hasErrors) {
      return ProjectionResultFactory.create(
        []
      );
    }

    return RetirementProjectionEngine.calculate(
      inputs
    );
  }, [inputs, hasErrors]);

  const comparisonProjection =
    useMemo(() => {
      if (
        !comparisonEnabled ||
        comparisonHasErrors
      ) {
        return ProjectionResultFactory.create(
          []
        );
      }

      return RetirementProjectionEngine.calculate(
        comparisonInputs
      );
    }, [
      comparisonInputs,
      comparisonEnabled,
      comparisonHasErrors,
    ]);

  const assumptions = useMemo(
    () => [
      {
        label: "Current age",
        value: String(inputs.currentAge),
      },
      {
        label: "Retirement age",
        value: String(
          inputs.retirementAge
        ),
      },
      {
        label: "Starting pension",
        value: formatCurrency(
          inputs.currentPot
        ),
      },
      {
        label: "Monthly contribution",
        value: formatCurrency(
          inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution
        ),
      },
      {
        label: "Annual return",
        value: formatPercentage(
          inputs.annualReturn
        ),
      },
      {
        label: "Inflation",
        value: formatPercentage(
          inputs.inflation
        ),
      },
      {
        label: "Annual fund fee",
        value: formatPercentage(
          inputs.annualFee
        ),
      },
      {
        label: "Contribution increase",
        value: formatPercentage(
          inputs.annualContributionIncrease
        ),
      },
    ],
    [inputs]
  );

  const finalBalanceDifference =
    comparisonProjection.finalBalance.nominal -
    projection.finalBalance.nominal;

  function resetInputs() {
    setInputs({
      ...defaultPensionInputs,
    });
  }

  function resetComparisonInputs() {
    setComparisonInputs({
      ...defaultPensionInputs,
    });
  }

  function enableComparison() {
    setComparisonInputs({
      ...inputs,
    });

    setComparisonEnabled(true);
  }

  function disableComparison() {
    setComparisonEnabled(false);
  }

  return (
    <main className="planner-page">
      <header className="planner-header">
        <p className="planner-eyebrow">
          Retirement planning
        </p>

        <h1>Retirement Planner</h1>

        <p>
          Adjust your assumptions to see how
          your pension could grow over time.
        </p>
      </header>

      <div className="comparison-toggle-row">
        <div>
          <h2>Scenario comparison</h2>

          <p>
            Compare your current plan with an
            alternative set of assumptions.
          </p>
        </div>

        {comparisonEnabled ? (
          <button
            type="button"
            className="comparison-toggle-button comparison-toggle-button-active"
            onClick={disableComparison}
          >
            Stop comparing
          </button>
        ) : (
          <button
            type="button"
            className="comparison-toggle-button"
            onClick={enableComparison}
          >
            Compare scenario
          </button>
        )}
      </div>

      <section
        className={
          comparisonEnabled
            ? "scenario-input-grid"
            : "planner-grid"
        }
      >
        <div className="scenario-input-column">
          {comparisonEnabled && (
            <div className="scenario-input-heading">
              <span>Scenario 1</span>
              <h2>Current plan</h2>
            </div>
          )}

          <PensionInputsForm
            value={inputs}
            errors={errors}
            onChange={setInputs}
            onReset={resetInputs}
          />
        </div>

        {comparisonEnabled ? (
          <div className="scenario-input-column">
            <div className="scenario-input-heading">
              <span>Scenario 2</span>
              <h2>Comparison plan</h2>
            </div>

            <PensionInputsForm
              value={comparisonInputs}
              errors={comparisonErrors}
              onChange={
                setComparisonInputs
              }
              onReset={
                resetComparisonInputs
              }
            />
          </div>
        ) : hasErrors ? (
          <section className="panel">
            <div className="panel-heading">
              <h2>Your projection</h2>

              <p>
                Correct the highlighted fields
                to calculate your results.
              </p>
            </div>
          </section>
        ) : (
          <ProjectionSummary
            result={projection}
          />
        )}
      </section>

      {comparisonEnabled ? (
        <>
          {hasErrors ||
          comparisonHasErrors ? (
            <section className="validation-notice">
              Correct the highlighted fields
              in both scenarios to view the
              comparison.
            </section>
          ) : (
            <>
              <section className="panel scenario-results-panel">
                <div className="panel-heading">
                  <h2>Scenario results</h2>

                  <p>
                    Compare the projected outcome
                    of each plan.
                  </p>
                </div>

                <div className="scenario-results-grid">
                  <ScenarioSummaryCard
                    title="Current plan"
                    result={projection}
                    retirementAge={
                      inputs.retirementAge
                    }
                    monthlyContribution={
                      inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution
                    }
                  />

                  <ScenarioSummaryCard
                    title="Comparison plan"
                    result={
                      comparisonProjection
                    }
                    retirementAge={
                      comparisonInputs.retirementAge
                    }
                    monthlyContribution={
                      comparisonInputs.monthlyEmployeeContribution + comparisonInputs.monthlyEmployerContribution
                    }
                    difference={
                      finalBalanceDifference
                    }
                  />
                </div>
              </section>

              <ScenarioComparisonChart
                baseYears={
                  projection.years
                }
                comparisonYears={
                  comparisonProjection.years
                }
              />
            </>
          )}
        </>
      ) : hasErrors ? (
        <section className="validation-notice">
          Correct the highlighted fields to
          view your projection.
        </section>
      ) : (
        <>
          <ProjectionAssumptions
            assumptions={assumptions}
          />

          <ProjectionMilestones
            years={projection.years}
          />

          <PensionBalanceChart
            years={projection.years}
          />

          <ContributionGrowthChart
            years={projection.years}
          />

          <ProjectionTable
            years={projection.years}
          />
        </>
      )}
    </main>
  );
}

function formatCurrency(
  value: number
): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercentage(
  value: number
): string {
  return new Intl.NumberFormat("en-GB", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value);
}

