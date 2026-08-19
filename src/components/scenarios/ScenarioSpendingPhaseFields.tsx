import type { ScenarioDrawdownPreferences } from "../../domain/scenarios";
import type { DrawdownSpendingPhase } from "../../engine/drawdown/models/DrawdownInputs";
import { CurrencyInput, FormField, NumberInput, PercentageInput } from "../forms";

interface ScenarioSpendingPhaseFieldsProps {
  idPrefix: string;
  retirementAge: number;
  value: ScenarioDrawdownPreferences;
  onChange: (value: ScenarioDrawdownPreferences) => void;
  showEnableToggle?: boolean;
}

const phaseLabels = ["Active retirement", "Settled retirement", "Later life"] as const;

export function ScenarioSpendingPhaseFields({
  idPrefix,
  retirementAge,
  value,
  onChange,
  showEnableToggle = true,
}: ScenarioSpendingPhaseFieldsProps) {
  const hasStoredPhases = Boolean(value.spendingPhases?.length);
  const enabled = showEnableToggle ? hasStoredPhases : true;
  const phases = hasStoredPhases
    ? normalisePhases(
        value.spendingPhases ?? [],
        retirementAge,
        value.planningAge,
        value.desiredAnnualIncome,
        value.withdrawalRate,
      )
    : createDefaultPhases(
        retirementAge,
        value.planningAge,
        value.desiredAnnualIncome,
        value.withdrawalRate,
      );
  const usesPercentage = value.withdrawalStrategy === "percentage";

  function setEnabled(nextEnabled: boolean) {
    const next = { ...value };
    if (nextEnabled) next.spendingPhases = phases;
    else delete next.spendingPhases;
    onChange(next);
  }

  function updatePhase(
    index: number,
    field: "startAge" | "annualIncome" | "withdrawalRate",
    nextValue: number | undefined,
  ) {
    const nextPhases = phases.map((phase, phaseIndex) =>
      phaseIndex === index
        ? {
            ...phase,
            [field]:
              nextValue ??
              (field === "startAge"
                ? phase.startAge
                : field === "withdrawalRate"
                  ? phase.withdrawalRate ?? value.withdrawalRate
                  : 0),
          }
        : phase,
    );
    onChange({ ...value, spendingPhases: nextPhases });
  }

  return (
    <fieldset className="scenario-edit-section scenario-spending-phases">
      <legend>Retirement phases</legend>
      <p className="scenario-edit-section-copy">
        {usesPercentage
          ? "Set a different percentage withdrawal rate for each stage of retirement."
          : "Set a different spendable income target for each stage of retirement."}
      </p>

      {showEnableToggle && (
        <label className="retirement-goals-checkbox">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          <span>
            {usesPercentage
              ? "Use different withdrawal rates at different ages"
              : "Use different income targets at different ages"}
          </span>
        </label>
      )}

      {enabled && (
        <div className="scenario-spending-phase-grid">
          {phases.map((phase, index) => {
            const minimumAge = index === 0
              ? retirementAge
              : phases[index - 1].startAge + 1;
            const maximumAge = index === phases.length - 1
              ? value.planningAge - 1
              : phases[index + 1].startAge - 1;

            return (
              <section key={phase.label} className="scenario-spending-phase-card">
                <div>
                  <span>Phase {index + 1}</span>
                  <h3>{phase.label}</h3>
                </div>
                <div className="scenario-edit-grid">
                  <FormField
                    id={`${idPrefix}-phase-${index}-age`}
                    label="Starts at age"
                    hint={
                      index === 0
                        ? "The first phase begins at retirement."
                        : `Must be after age ${phases[index - 1].startAge}.`
                    }
                  >
                    {(id, describedBy) => (
                      <NumberInput
                        id={id}
                        aria-describedby={describedBy}
                        value={phase.startAge}
                        min={minimumAge}
                        max={Math.max(minimumAge, maximumAge)}
                        suffix="years"
                        disabled={index === 0}
                        onValueChange={(nextValue) =>
                          updatePhase(index, "startAge", nextValue)
                        }
                      />
                    )}
                  </FormField>

                  {usesPercentage ? (
                    <FormField
                      id={`${idPrefix}-phase-${index}-rate`}
                      label="Annual withdrawal rate"
                      hint="Percentage of the remaining pension withdrawn each year in this phase."
                    >
                      {(id, describedBy) => (
                        <PercentageInput
                          id={id}
                          aria-describedby={describedBy}
                          value={phase.withdrawalRate ?? value.withdrawalRate}
                          min={0}
                          max={100}
                          step={0.1}
                          onValueChange={(nextValue) =>
                            updatePhase(index, "withdrawalRate", nextValue)
                          }
                        />
                      )}
                    </FormField>
                  ) : (
                    <FormField
                      id={`${idPrefix}-phase-${index}-income`}
                      label="Annual spending target"
                      hint="The spendable annual income target for this phase, in today's money."
                    >
                      {(id, describedBy) => (
                        <CurrencyInput
                          id={id}
                          aria-describedby={describedBy}
                          value={phase.annualIncome}
                          min={0}
                          step={500}
                          onValueChange={(nextValue) =>
                            updatePhase(index, "annualIncome", nextValue)
                          }
                        />
                      )}
                    </FormField>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

function createDefaultPhases(
  retirementAge: number,
  planningAge: number,
  annualIncome: number,
  withdrawalRate: number,
): DrawdownSpendingPhase[] {
  const retirementYears = Math.max(3, planningAge - retirementAge);
  const slowerAge = Math.min(
    planningAge - 2,
    retirementAge + Math.max(1, Math.round(retirementYears / 3)),
  );
  const laterAge = Math.min(
    planningAge - 1,
    Math.max(slowerAge + 1, retirementAge + Math.round((retirementYears * 2) / 3)),
  );

  return [
    {
      startAge: retirementAge,
      annualIncome,
      withdrawalRate,
      label: phaseLabels[0],
    },
    {
      startAge: slowerAge,
      annualIncome: Math.round((annualIncome * 0.85) / 500) * 500,
      withdrawalRate,
      label: phaseLabels[1],
    },
    {
      startAge: laterAge,
      annualIncome: Math.round((annualIncome * 0.7) / 500) * 500,
      withdrawalRate,
      label: phaseLabels[2],
    },
  ];
}

function normalisePhases(
  phases: DrawdownSpendingPhase[],
  retirementAge: number,
  planningAge: number,
  annualIncome: number,
  withdrawalRate: number,
): DrawdownSpendingPhase[] {
  const defaults = createDefaultPhases(
    retirementAge,
    planningAge,
    annualIncome,
    withdrawalRate,
  );
  return phaseLabels.map((label, index) => ({
    label,
    startAge: index === 0
      ? retirementAge
      : phases[index]?.startAge ?? defaults[index].startAge,
    annualIncome: phases[index]?.annualIncome ?? defaults[index].annualIncome,
    withdrawalRate:
      phases[index]?.withdrawalRate ?? defaults[index].withdrawalRate,
  }));
}
