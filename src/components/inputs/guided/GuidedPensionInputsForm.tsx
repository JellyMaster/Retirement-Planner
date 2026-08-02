import { useMemo, useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  createDefaultScenarioDrawdownPreferences,
  type ScenarioDrawdownPreferences,
} from "../../../domain/scenarios";
import type { PensionInputs } from "../../../engine/models/PensionInputs";
import { AppIcons } from "../../../icons";
import type { PensionInputErrors } from "../../../validation/validatePensionInputs";
import { formatCurrency, formatPercentage } from "../../../utils/formatters";
import "../../forms/forms.css";
import {
  CurrencyInput,
  FormField,
  NumberInput,
  PercentageInput,
} from "../../forms";
import {
  ScenarioDrawdownFields,
  useScenarios,
} from "../../scenarios";

interface GuidedPensionInputsFormProps {
  idPrefix?: string;
  value: PensionInputs;
  errors: PensionInputErrors;
  onChange: (inputs: PensionInputs) => void;
  onReset: () => void;
}

type StepId =
  | "personal"
  | "pension"
  | "assumptions"
  | "changes"
  | "income"
  | "review";

type RequiredNumberField =
  | "currentAge"
  | "retirementAge"
  | "currentPot"
  | "monthlyEmployeeContribution"
  | "monthlyEmployerContribution";

type OptionalNumberField = "extraContributionAge" | "extraMonthlyContribution";

type PercentageField =
  | "annualReturn"
  | "annualFee"
  | "inflation"
  | "annualContributionIncrease";

const steps: Array<{
  id: StepId;
  label: string;
  shortLabel: string;
  icon: (typeof AppIcons)[keyof typeof AppIcons];
}> = [
  { id: "personal", label: "About you", shortLabel: "You", icon: AppIcons.user },
  { id: "pension", label: "Your pension", shortLabel: "Pension", icon: AppIcons.pension },
  { id: "assumptions", label: "Assumptions", shortLabel: "Returns", icon: AppIcons.growth },
  { id: "changes", label: "Contribution changes", shortLabel: "Changes", icon: AppIcons.plus },
  { id: "income", label: "Retirement income", shortLabel: "Income", icon: AppIcons.money },
  { id: "review", label: "Review plan", shortLabel: "Review", icon: AppIcons.check },
];

export function GuidedPensionInputsForm({
  idPrefix = "pension",
  value,
  errors,
  onChange,
  onReset,
}: GuidedPensionInputsFormProps) {
  const { activeScenario, updateScenarioPlan } = useScenarios();
  const [drawdown, setDrawdown] = useState<ScenarioDrawdownPreferences>(() => ({
    ...(activeScenario.drawdown ?? createDefaultScenarioDrawdownPreferences()),
  }));
  const [activeStep, setActiveStep] = useState<StepId>("personal");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const activeIndex = steps.findIndex((step) => step.id === activeStep);

  const stepErrors = useMemo(
    () => ({
      personal: [errors.currentAge, errors.retirementAge].filter(Boolean).length,
      pension: [
        errors.currentPot,
        errors.monthlyEmployeeContribution,
        errors.monthlyEmployerContribution,
      ].filter(Boolean).length,
      assumptions: [errors.annualReturn, errors.annualFee, errors.inflation].filter(Boolean).length,
      changes: [
        errors.annualContributionIncrease,
        errors.extraContributionAge,
        errors.extraMonthlyContribution,
      ].filter(Boolean).length,
      income: 0,
      review: Object.values(errors).filter(Boolean).length,
    }),
    [errors],
  );

  function fieldId(name: string) {
    return `${idPrefix}-${name}`;
  }

  function updateRequired(field: RequiredNumberField, next: number | undefined) {
    onChange({ ...value, [field]: next ?? Number.NaN });
  }

  function updateOptional(field: OptionalNumberField, next: number | undefined) {
    onChange({ ...value, [field]: next });
  }

  function updatePercentage(field: PercentageField, next: number | undefined) {
    onChange({ ...value, [field]: next ?? Number.NaN });
  }

  function updateDrawdown(next: ScenarioDrawdownPreferences) {
    setDrawdown(next);
    updateScenarioPlan(activeScenario.id, activeScenario.inputs, next);
  }

  function goToStep(step: StepId) {
    setIsCollapsed(false);
    setActiveStep(step);
    window.requestAnimationFrame(() => {
      const formElement = document.getElementById("guided-pension-form");

      if (
        formElement &&
        typeof formElement.scrollIntoView === "function"
      ) {
        formElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }

  function continueForward() {
    const errorsForStep = stepErrors[activeStep];
    if (activeStep !== "changes" && activeStep !== "income" && activeStep !== "review" && errorsForStep > 0) {
      return;
    }
    const next = steps[Math.min(activeIndex + 1, steps.length - 1)];
    goToStep(next.id);
  }

  function goBack() {
    const previous = steps[Math.max(activeIndex - 1, 0)];
    goToStep(previous.id);
  }

  const totalMonthly = value.monthlyEmployeeContribution + value.monthlyEmployerContribution;
  const yearsUntilRetirement = Math.max(0, value.retirementAge - value.currentAge);

  function resetPlan() {
    setIsCollapsed(false);
    setActiveStep("personal");
    onReset();
  }

  function viewProjection() {
    if (stepErrors.review > 0) return;
    setIsCollapsed(true);
    window.requestAnimationFrame(() => {
      document.getElementById("retirement-projection-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  if (isCollapsed) {
    return (
      <section
        id="guided-pension-form"
        className="guided-pension-form guided-pension-form-collapsed panel"
        aria-label="Retirement plan summary"
      >
        <div className="guided-pension-collapsed-main">
          <span className="guided-pension-collapsed-icon" aria-hidden="true">
            <FontAwesomeIcon icon={AppIcons.success} />
          </span>
          <div className="guided-pension-collapsed-copy">
            <p className="planner-eyebrow">Retirement plan complete</p>
            <h2>Your plan at a glance</h2>
            <div className="guided-pension-collapsed-metrics">
              <span><small>Timeline</small><strong>Age {value.currentAge} to {value.retirementAge}</strong></span>
              <span><small>Current pot</small><strong>{formatCurrency(value.currentPot)}</strong></span>
              <span><small>Monthly saving</small><strong>{formatCurrency(totalMonthly)}</strong></span>
              <span><small>Expected return</small><strong>{formatPercentage(value.annualReturn)}</strong></span>
              <span><small>Income plan</small><strong>{drawdown.withdrawalStrategy === "target-income" ? formatCurrency(drawdown.desiredAnnualIncome) : formatPercentage(drawdown.withdrawalRate)}</strong></span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="secondary-button guided-pension-edit-button"
          onClick={() => {
            setIsCollapsed(false);
            setActiveStep("review");
          }}
        >
          <FontAwesomeIcon icon={AppIcons.settings} />
          Edit plan
        </button>
      </section>
    );
  }

  return (
    <section id="guided-pension-form" className="guided-pension-form panel">
      <header className="guided-pension-form-header">
        <div>
          <p className="planner-eyebrow">Build your retirement plan</p>
          <h2>Your pension details</h2>
          <p>Work through one short step at a time. Your projection updates as you go.</p>
        </div>
        <button type="button" className="reset-button" onClick={resetPlan}>
          Reset defaults
        </button>
      </header>

      <nav className="guided-pension-progress" aria-label="Retirement planner progress">
        {steps.map((step, index) => {
          const isActive = step.id === activeStep;
          const isComplete = index < activeIndex && stepErrors[step.id] === 0;
          const hasErrors = stepErrors[step.id] > 0;
          return (
            <button
              key={step.id}
              type="button"
              className={[
                "guided-pension-progress-step",
                isActive && "active",
                isComplete && "complete",
                hasErrors && "has-errors",
              ].filter(Boolean).join(" ")}
              aria-current={isActive ? "step" : undefined}
              aria-label={step.label}
              onClick={() => goToStep(step.id)}
            >
              <span className="guided-pension-progress-marker" aria-hidden="true">
                {isComplete ? <FontAwesomeIcon icon={AppIcons.check} /> : index + 1}
              </span>
              <span>
                <small>Step {index + 1}</small>
                <strong>{step.shortLabel}</strong>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="guided-pension-summary-strip" aria-live="polite">
        <span><strong>{yearsUntilRetirement}</strong> years to retirement</span>
        <span><strong>{formatCurrency(value.currentPot)}</strong> saved</span>
        <span><strong>{formatCurrency(totalMonthly)}</strong> each month</span>
      </div>

      <div className="guided-pension-step" key={activeStep}>
        {activeStep === "personal" && (
          <StepShell
            icon={AppIcons.user}
            eyebrow="Step 1 of 6"
            title="Tell us about you"
            description="Your ages determine how long your pension has to grow."
          >
            <FormField id={fieldId("currentAge")} label="Current age" hint="Your age today." error={errors.currentAge}>
              {(id, describedBy) => (
                <NumberInput id={id} aria-describedby={describedBy} value={Number.isFinite(value.currentAge) ? value.currentAge : ""} min={18} max={100} suffix="years" error={Boolean(errors.currentAge)} onValueChange={(next) => updateRequired("currentAge", next)} />
              )}
            </FormField>
            <FormField id={fieldId("retirementAge")} label="Retirement age" hint="The age when you plan to stop regular pension contributions." error={errors.retirementAge}>
              {(id, describedBy) => (
                <NumberInput id={id} aria-describedby={describedBy} value={Number.isFinite(value.retirementAge) ? value.retirementAge : ""} min={18} max={100} suffix="years" error={Boolean(errors.retirementAge)} onValueChange={(next) => updateRequired("retirementAge", next)} />
              )}
            </FormField>
          </StepShell>
        )}

        {activeStep === "pension" && (
          <StepShell icon={AppIcons.pension} eyebrow="Step 2 of 6" title="Your pension today" description="Add what you have already saved and what goes in each month.">
            <FormField id={fieldId("currentPot")} label="Current pension pot" hint="The combined value of pensions included in this plan." error={errors.currentPot}>
              {(id, describedBy) => <CurrencyInput id={id} aria-describedby={describedBy} value={Number.isFinite(value.currentPot) ? value.currentPot : ""} step={100} error={Boolean(errors.currentPot)} onValueChange={(next) => updateRequired("currentPot", next)} />}
            </FormField>
            <FormField id={fieldId("employeeContribution")} label="Your monthly contribution" hint="The amount paid from you each month." error={errors.monthlyEmployeeContribution}>
              {(id, describedBy) => <CurrencyInput id={id} aria-describedby={describedBy} value={Number.isFinite(value.monthlyEmployeeContribution) ? value.monthlyEmployeeContribution : ""} step={10} error={Boolean(errors.monthlyEmployeeContribution)} onValueChange={(next) => updateRequired("monthlyEmployeeContribution", next)} />}
            </FormField>
            <FormField id={fieldId("employerContribution")} label="Employer monthly contribution" hint="The amount your employer pays in each month." error={errors.monthlyEmployerContribution}>
              {(id, describedBy) => <CurrencyInput id={id} aria-describedby={describedBy} value={Number.isFinite(value.monthlyEmployerContribution) ? value.monthlyEmployerContribution : ""} step={10} error={Boolean(errors.monthlyEmployerContribution)} onValueChange={(next) => updateRequired("monthlyEmployerContribution", next)} />}
            </FormField>
          </StepShell>
        )}

        {activeStep === "assumptions" && (
          <StepShell icon={AppIcons.growth} eyebrow="Step 3 of 6" title="Set your assumptions" description="Use realistic long-term estimates. You can refine them later.">
            <FormField id={fieldId("annualReturn")} label="Expected annual return" hint="Investment growth before pension fees." error={errors.annualReturn}>
              {(id, describedBy) => <PercentageInput id={id} aria-describedby={describedBy} value={Number.isFinite(value.annualReturn) ? value.annualReturn : ""} max={20} step={0.1} error={Boolean(errors.annualReturn)} onValueChange={(next) => updatePercentage("annualReturn", next)} />}
            </FormField>
            <FormField id={fieldId("annualFee")} label="Annual pension fee" hint="Fund, platform and administration charges combined." error={errors.annualFee}>
              {(id, describedBy) => <PercentageInput id={id} aria-describedby={describedBy} value={Number.isFinite(value.annualFee) ? value.annualFee : ""} max={5} step={0.01} decimalPlaces={4} error={Boolean(errors.annualFee)} onValueChange={(next) => updatePercentage("annualFee", next)} />}
            </FormField>
            <FormField id={fieldId("inflation")} label="Expected inflation" hint="Used to show values in today's money." error={errors.inflation}>
              {(id, describedBy) => <PercentageInput id={id} aria-describedby={describedBy} value={Number.isFinite(value.inflation) ? value.inflation : ""} max={15} step={0.1} error={Boolean(errors.inflation)} onValueChange={(next) => updatePercentage("inflation", next)} />}
            </FormField>
          </StepShell>
        )}

        {activeStep === "changes" && (
          <StepShell icon={AppIcons.plus} eyebrow="Step 4 of 6 · Optional" title="Plan future contribution changes" description="Model regular increases or an extra amount starting later.">
            <FormField id={fieldId("contributionIncrease")} label="Annual contribution increase" hint="For example, contributions rising with salary." error={errors.annualContributionIncrease}>
              {(id, describedBy) => <PercentageInput id={id} aria-describedby={describedBy} value={Number.isFinite(value.annualContributionIncrease) ? value.annualContributionIncrease : ""} max={20} step={0.1} error={Boolean(errors.annualContributionIncrease)} onValueChange={(next) => updatePercentage("annualContributionIncrease", next)} />}
            </FormField>
            <FormField id={fieldId("extraContributionAge")} label="Extra contribution age" hint="Leave both extra-contribution fields blank if not needed." error={errors.extraContributionAge} optional>
              {(id, describedBy) => <NumberInput id={id} aria-describedby={describedBy} value={value.extraContributionAge ?? ""} min={value.currentAge} max={Math.max(value.currentAge, value.retirementAge - 1)} suffix="years" error={Boolean(errors.extraContributionAge)} onValueChange={(next) => updateOptional("extraContributionAge", next)} />}
            </FormField>
            <FormField id={fieldId("extraMonthlyContribution")} label="Extra monthly contribution" hint="The additional monthly amount from the age above." error={errors.extraMonthlyContribution} optional>
              {(id, describedBy) => <CurrencyInput id={id} aria-describedby={describedBy} value={value.extraMonthlyContribution ?? ""} step={10} error={Boolean(errors.extraMonthlyContribution)} onValueChange={(next) => updateOptional("extraMonthlyContribution", next)} />}
            </FormField>
          </StepShell>
        )}

        {activeStep === "income" && (
          <StepShell
            icon={AppIcons.money}
            eyebrow="Step 5 of 6"
            title="Plan your retirement income"
            description="Choose how this plan should provide income after retirement."
          >
            <ScenarioDrawdownFields
              idPrefix={fieldId("drawdown")}
              value={drawdown}
              onChange={updateDrawdown}
            />
          </StepShell>
        )}

        {activeStep === "review" && (
          <StepShell icon={AppIcons.check} eyebrow="Step 6 of 6" title="Review your plan" description="Check the key details before exploring your projection.">
            <div className="guided-plan-review">
              <ReviewGroup title="Your timeline" icon={AppIcons.user} onEdit={() => goToStep("personal")}>
                <ReviewRow label="Current age" value={String(value.currentAge)} />
                <ReviewRow label="Retirement age" value={String(value.retirementAge)} />
                <ReviewRow label="Time to retirement" value={`${yearsUntilRetirement} years`} />
              </ReviewGroup>
              <ReviewGroup title="Pension today" icon={AppIcons.pension} onEdit={() => goToStep("pension")}>
                <ReviewRow label="Current pot" value={formatCurrency(value.currentPot)} />
                <ReviewRow label="Monthly total" value={formatCurrency(totalMonthly)} />
              </ReviewGroup>
              <ReviewGroup title="Assumptions" icon={AppIcons.growth} onEdit={() => goToStep("assumptions")}>
                <ReviewRow label="Expected return" value={formatPercentage(value.annualReturn)} />
                <ReviewRow label="Annual fee" value={formatPercentage(value.annualFee)} />
                <ReviewRow label="Inflation" value={formatPercentage(value.inflation)} />
              </ReviewGroup>
              <ReviewGroup title="Future changes" icon={AppIcons.plus} onEdit={() => goToStep("changes")}>
                <ReviewRow label="Annual increase" value={formatPercentage(value.annualContributionIncrease)} />
                <ReviewRow label="Extra monthly" value={value.extraMonthlyContribution ? formatCurrency(value.extraMonthlyContribution) : "Not added"} />
              </ReviewGroup>
              <ReviewGroup title="Retirement income" icon={AppIcons.money} onEdit={() => goToStep("income")}>
                <ReviewRow
                  label="Approach"
                  value={drawdown.withdrawalStrategy === "target-income" ? "Target annual income" : "Percentage withdrawal"}
                />
                <ReviewRow
                  label={drawdown.withdrawalStrategy === "target-income" ? "Income target" : "Withdrawal rate"}
                  value={drawdown.withdrawalStrategy === "target-income" ? formatCurrency(drawdown.desiredAnnualIncome) : formatPercentage(drawdown.withdrawalRate)}
                />
                <ReviewRow label="Tax-free cash" value={drawdown.taxFreeCash > 0 ? formatCurrency(drawdown.taxFreeCash) : "Not selected"} />
              </ReviewGroup>
            </div>
            <div className={stepErrors.review > 0 ? "guided-review-status review" : "guided-review-status ready"} role="status">
              <FontAwesomeIcon icon={stepErrors.review > 0 ? AppIcons.warning : AppIcons.success} />
              <span>
                <strong>{stepErrors.review > 0 ? `Review ${stepErrors.review} fields` : "Your plan is ready"}</strong>
                <small>{stepErrors.review > 0 ? "Use the Edit buttons above to correct highlighted information." : "Your projection and drawdown analysis use these saved choices."}</small>
              </span>
            </div>
          </StepShell>
        )}
      </div>

      <footer className="guided-pension-actions">
        <button type="button" className="secondary-button" onClick={goBack} disabled={activeIndex === 0}>
          Back
        </button>
        {activeStep !== "review" ? (
          <button type="button" className="primary-button" onClick={continueForward} aria-disabled={activeStep !== "changes" && activeStep !== "income" && stepErrors[activeStep] > 0}>
            {activeStep === "income" ? "Review plan" : "Continue"}
          </button>
        ) : (
          <button type="button" className="primary-button" onClick={viewProjection} disabled={stepErrors.review > 0}>
            View projection
          </button>
        )}
      </footer>
    </section>
  );
}

function StepShell({ icon, eyebrow, title, description, children }: { icon: (typeof AppIcons)[keyof typeof AppIcons]; eyebrow: string; title: string; description: string; children: ReactNode }) {
  return (
    <div className="guided-step-shell">
      <div className="guided-step-heading">
        <span aria-hidden="true"><FontAwesomeIcon icon={icon} /></span>
        <div><p>{eyebrow}</p><h3>{title}</h3><small>{description}</small></div>
      </div>
      <div className="guided-step-fields">{children}</div>
    </div>
  );
}

function ReviewGroup({ title, icon, onEdit, children }: { title: string; icon: (typeof AppIcons)[keyof typeof AppIcons]; onEdit: () => void; children: ReactNode }) {
  return (
    <article className="guided-review-group">
      <header><span aria-hidden="true"><FontAwesomeIcon icon={icon} /></span><h4>{title}</h4><button type="button" onClick={onEdit}>Edit</button></header>
      <dl>{children}</dl>
    </article>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}
