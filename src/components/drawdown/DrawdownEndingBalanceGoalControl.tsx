import {
  createDefaultScenarioDrawdownPreferences,
  type ScenarioDrawdownPreferences,
} from "../../domain/scenarios";
import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import { getEndingBalanceTarget } from "../../engine/drawdown/models/DrawdownEndingBalanceGoal";
import { formatCurrency } from "../../utils/formatters";
import { PercentageInput } from "../forms";

interface DrawdownEndingBalanceGoalControlProps {
  inputs: DrawdownInputs;
  drawdown?: ScenarioDrawdownPreferences;
  onChange: (drawdown: ScenarioDrawdownPreferences) => void;
}

export function DrawdownEndingBalanceGoalControl({
  inputs,
  drawdown,
  onChange,
}: DrawdownEndingBalanceGoalControlProps) {
  const preferences = drawdown ?? createDefaultScenarioDrawdownPreferences();
  const mode = preferences.endingBalanceMode ?? "preserve";
  const percentage = preferences.endingBalancePercentage ?? 1;
  const startingBalanceAfterCash = Math.max(
    0,
    inputs.startingBalance - inputs.taxFreeCash,
  );
  const retirementYears = inputs.endAge - inputs.retirementAge;
  const targetEndingBalance = getEndingBalanceTarget(
    startingBalanceAfterCash,
    inputs.inflationRate,
    retirementYears,
    { mode, percentage },
  );

  function selectMode(nextMode: NonNullable<ScenarioDrawdownPreferences["endingBalanceMode"]>) {
    onChange({
      ...preferences,
      endingBalanceMode: nextMode,
      endingBalancePercentage:
        nextMode === "preserve"
          ? 1
          : nextMode === "spend-to-zero"
            ? 0
            : percentage > 0 && percentage < 1
              ? percentage
              : 0.5,
    });
  }

  function changePercentage(nextPercentage: number) {
    onChange({
      ...preferences,
      endingBalanceMode: "percentage",
      endingBalancePercentage: Math.min(1, Math.max(0, nextPercentage)),
    });
  }

  return (
    <section
      className="panel drawdown-ending-balance-panel"
      aria-labelledby="drawdown-ending-balance-title"
    >
      <div className="drawdown-section-heading">
        <div>
          <p className="panel-eyebrow">Ending balance</p>
          <h2 id="drawdown-ending-balance-title">What should be left at the end?</h2>
        </div>
        <p>
          Choose how much of the retirement pot you want the sustainable-income
          calculation to retain at age {inputs.endAge}.
        </p>
      </div>

      <div
        className="drawdown-ending-balance-options"
        role="radiogroup"
        aria-label="Ending pension balance goal"
      >
        <GoalOption
          selected={mode === "preserve"}
          title="Preserve the pot"
          description="Aim to retain 100% of the retirement pot's purchasing power."
          onSelect={() => selectMode("preserve")}
        />
        <GoalOption
          selected={mode === "percentage"}
          title="Leave a percentage"
          description="Choose how much of the retirement pot's purchasing power should remain."
          onSelect={() => selectMode("percentage")}
        />
        <GoalOption
          selected={mode === "spend-to-zero"}
          title="Spend it down"
          description="Allow the pension to reach £0 at the planning age, but not before."
          onSelect={() => selectMode("spend-to-zero")}
        />
      </div>

      {mode === "percentage" && (
        <div className="drawdown-ending-balance-percentage">
          <label htmlFor="drawdown-ending-balance-percentage">
            <span>Percentage to retain</span>
            <small>Measured against the retirement pot after tax-free cash.</small>
          </label>
          <PercentageInput
            id="drawdown-ending-balance-percentage"
            value={percentage}
            min={0}
            max={100}
            step={5}
            onValueChange={(nextValue) => changePercentage(nextValue ?? 0)}
          />
        </div>
      )}

      <div className="drawdown-ending-balance-summary">
        <span>Illustrated ending-balance target</span>
        <strong>{formatCurrency(targetEndingBalance)}</strong>
        <small>
          Future-money amount at the end of the plan. The percentage goal itself
          is defined in today&apos;s-money purchasing-power terms.
        </small>
      </div>
    </section>
  );
}

function GoalOption({
  selected,
  title,
  description,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={
        selected
          ? "scenario-drawdown-option is-selected"
          : "scenario-drawdown-option"
      }
      onClick={onSelect}
    >
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  );
}
