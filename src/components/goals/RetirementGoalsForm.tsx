import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";

interface RetirementGoalsFormProps {
  value: RetirementGoals;
  onChange: (value: RetirementGoals) => void;
  compact?: boolean;
}

export function RetirementGoalsForm({ value, onChange, compact = false }: RetirementGoalsFormProps) {
  function update<K extends keyof RetirementGoals>(key: K, nextValue: RetirementGoals[K]) {
    onChange({ ...value, [key]: nextValue });
  }

  return (
    <section className={compact ? "retirement-goals-form retirement-goals-form-compact" : "retirement-goals-form"}>
      <div className="retirement-goals-form-heading">
        <div>
          <p className="planner-eyebrow">Retirement goals</p>
          <h2>Your target</h2>
        </div>
        <span className="retirement-goals-target-icon" aria-hidden="true"><FontAwesomeIcon icon={AppIcons.goals} /></span>
      </div>

      <div className="retirement-goals-fields">
        <label>
          <span>Desired annual income</span>
          <div className="retirement-goals-money-input"><span>£</span><input type="number" min="0" step="500" value={value.desiredAnnualIncome} onChange={(event) => update("desiredAnnualIncome", Number(event.target.value))} /></div>
        </label>

        <label>
          <span>Emergency reserve</span>
          <div className="retirement-goals-money-input"><span>£</span><input type="number" min="0" step="1000" value={value.emergencyReserve} onChange={(event) => update("emergencyReserve", Number(event.target.value))} /></div>
        </label>

        <label className="retirement-goals-checkbox">
          <input type="checkbox" checked={value.includeStatePension} onChange={(event) => update("includeStatePension", event.target.checked)} />
          <span>Include State Pension</span>
        </label>

        {value.includeStatePension && (
          <div className="retirement-goals-state-grid">
            <label>
              <span>Annual amount</span>
              <div className="retirement-goals-money-input"><span>£</span><input type="number" min="0" step="100" value={value.statePensionAnnualAmount} onChange={(event) => update("statePensionAnnualAmount", Number(event.target.value))} /></div>
            </label>
            <label>
              <span>Starts at age</span>
              <input type="number" min="55" max="80" value={value.statePensionAge} onChange={(event) => update("statePensionAge", Number(event.target.value))} />
            </label>
          </div>
        )}
      </div>
      <p className="retirement-goals-help">Targets are shown in today&apos;s money. The health score is a planning indicator, not a probability or guarantee.</p>
    </section>
  );
}
