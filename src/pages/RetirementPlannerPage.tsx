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

import type { PensionInputs } from "../engine/models/PensionInputs";

import { usePensionProjection } from "../hooks/usePensionProjection";

import { ThemeToggle } from "../components/theme/ThemeToggle";
import {
  formatCurrency,
  formatPercentage,
} from "../utils/formatters";


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

  const currentScenario =
    usePensionProjection(inputs);

  const comparisonScenario =
    usePensionProjection(comparisonInputs);

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
          inputs.monthlyEmployeeContribution +
            inputs.monthlyEmployerContribution
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
    comparisonScenario.projection.finalBalance
      .nominal -
    currentScenario.projection.finalBalance
      .nominal;

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

         <ThemeToggle />
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
            idPrefix="current"
            value={inputs}
            errors={currentScenario.errors}
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
              idPrefix="comparison"
              value={comparisonInputs}
              errors={
                comparisonScenario.errors
              }
              onChange={
                setComparisonInputs
              }
              onReset={
                resetComparisonInputs
              }
            />
          </div>
        ) : currentScenario.hasErrors ? (
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
            result={
              currentScenario.projection
            }
          />
        )}
      </section>

      {comparisonEnabled ? (
        <>
          {currentScenario.hasErrors ||
          comparisonScenario.hasErrors ? (
            <section
              className="validation-notice"
              role="alert"
            >
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
                    result={
                      currentScenario.projection
                    }
                    retirementAge={
                      inputs.retirementAge
                    }
                    monthlyContribution={
                      inputs.monthlyEmployeeContribution +
                      inputs.monthlyEmployerContribution
                    }
                  />

                  <ScenarioSummaryCard
                    title="Comparison plan"
                    result={
                      comparisonScenario.projection
                    }
                    retirementAge={
                      comparisonInputs.retirementAge
                    }
                    monthlyContribution={
                      comparisonInputs.monthlyEmployeeContribution +
                      comparisonInputs.monthlyEmployerContribution
                    }
                    difference={
                      finalBalanceDifference
                    }
                  />
                </div>
              </section>

              <ScenarioComparisonChart
                baseYears={
                  currentScenario.projection
                    .years
                }
                comparisonYears={
                  comparisonScenario.projection
                    .years
                }
              />
            </>
          )}
        </>
      ) : currentScenario.hasErrors ? (
        <section
          className="validation-notice"
          role="alert"
        >
          Correct the highlighted fields to
          view your projection.
        </section>
      ) : (
        <>
          <ProjectionAssumptions
            assumptions={assumptions}
          />

          <ProjectionMilestones
            years={
              currentScenario.projection.years
            }
          />

          <PensionBalanceChart
            years={
              currentScenario.projection.years
            }
          />

          <ContributionGrowthChart
            years={
              currentScenario.projection.years
            }
          />

          <ProjectionTable
            years={
              currentScenario.projection.years
            }
          />
        </>
      )}
    </main>
  );
}

