import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { PensionInputErrors } from "../../validation/validatePensionInputs";
import { AppIcons } from "../../icons";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

export interface RetirementSnapshotSection {
  id: string;
  label: string;
  icon: IconDefinition;
  errorCount: number;
  optional?: boolean;
}

export interface RetirementInputSnapshotProps {
  inputs: PensionInputs;
  errors: PensionInputErrors;
  sections?: RetirementSnapshotSection[];
  onNavigate?: (sectionId: string) => void;
}

export function RetirementInputSnapshot({
  inputs,
  errors,
  sections = [],
  onNavigate,
}: RetirementInputSnapshotProps) {
  const errorCount = Object.values(errors).filter(Boolean).length;
  const yearsUntilRetirement = Math.max(
    0,
    inputs.retirementAge - inputs.currentAge
  );
  const totalMonthlyContribution =
    inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution;
  const hasExtraContribution =
    Boolean(inputs.extraMonthlyContribution) &&
    inputs.extraContributionAge !== undefined;

  const requiredSections = sections.filter((section) => !section.optional);
  const completeSections = requiredSections.filter(
    (section) => section.errorCount === 0
  ).length;
  const completionPercentage =
    requiredSections.length === 0
      ? errorCount === 0
        ? 100
        : 0
      : Math.round((completeSections / requiredSections.length) * 100);

  return (
    <aside
      className={`retirement-input-snapshot${
        errorCount > 0 ? " retirement-input-snapshot-review" : ""
      }`}
      aria-labelledby="retirement-input-snapshot-heading"
    >
      <div className="retirement-input-snapshot-heading">
        <div>
          <p className="planner-eyebrow">Live plan summary</p>
          <h3 id="retirement-input-snapshot-heading">Retirement snapshot</h3>
        </div>

        <span className="retirement-input-snapshot-icon" aria-hidden="true">
          <FontAwesomeIcon icon={AppIcons.retirement} />
        </span>
      </div>

      <div className="retirement-input-snapshot-progress">
        <div className="retirement-input-snapshot-progress-copy">
          <span>Plan setup</span>
          <strong>{completionPercentage}%</strong>
        </div>
        <div
          className="retirement-input-snapshot-progress-track"
          role="progressbar"
          aria-label="Required planner sections completed"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completionPercentage}
        >
          <span style={{ width: `${completionPercentage}%` }} />
        </div>
      </div>

      <div className="retirement-input-snapshot-hero">
        <strong>{yearsUntilRetirement}</strong>
        <span>
          {yearsUntilRetirement === 1 ? "year" : "years"} until retirement
        </span>
      </div>

      <dl className="retirement-input-snapshot-metrics">
        <div>
          <dt>Current pension</dt>
          <dd>{formatCurrency(inputs.currentPot)}</dd>
        </div>
        <div>
          <dt>Total each month</dt>
          <dd>{formatCurrency(totalMonthlyContribution)}</dd>
        </div>
        <div>
          <dt>Expected return</dt>
          <dd>{formatPercentage(inputs.annualReturn)}</dd>
        </div>
        <div>
          <dt>Annual fee</dt>
          <dd>{formatPercentage(inputs.annualFee)}</dd>
        </div>
      </dl>

      {sections.length > 0 && (
        <nav className="retirement-input-snapshot-navigation" aria-label="Planner sections">
          <p>Jump to a section</p>
          <div>
            {sections.map((section) => {
              const needsReview = section.errorCount > 0;
              return (
                <button
                  key={section.id}
                  type="button"
                  className={needsReview ? "needs-review" : undefined}
                  onClick={() => onNavigate?.(section.id)}
                >
                  <span aria-hidden="true">
                    <FontAwesomeIcon icon={section.icon} />
                  </span>
                  <span>{section.label}</span>
                  <small>
                    {needsReview
                      ? `${section.errorCount} ${section.errorCount === 1 ? "error" : "errors"}`
                      : section.optional
                        ? "Optional"
                        : "Complete"}
                  </small>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <div
        className={`retirement-input-readiness${
          errorCount > 0 ? " retirement-input-readiness-review" : ""
        }`}
        role="status"
      >
        <span className="retirement-input-readiness-icon" aria-hidden="true">
          <FontAwesomeIcon
            icon={errorCount > 0 ? AppIcons.warning : AppIcons.success}
          />
        </span>

        <span>
          <strong>
            {errorCount > 0
              ? `Review ${errorCount} ${errorCount === 1 ? "field" : "fields"}`
              : "Ready to calculate"}
          </strong>
          <small>
            {errorCount > 0
              ? "Use the section links above to correct highlighted fields."
              : hasExtraContribution
                ? "Your future contribution change is included."
                : "Contribution changes are optional."}
          </small>
        </span>
      </div>
    </aside>
  );
}
