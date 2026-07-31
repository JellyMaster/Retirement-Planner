import { useState } from "react";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { PensionInputErrors } from "../../validation/validatePensionInputs";
import { AppIcons } from "../../icons";
import {
  CurrencyInput,
  FormField,
  FormSection,
  NumberInput,
  PercentageInput,
  type FormSectionSummaryItem,
} from "../forms";

interface PensionInputsFormProps {
  idPrefix?: string;
  value: PensionInputs;
  errors: PensionInputErrors;
  onChange: (inputs: PensionInputs) => void;
  onReset: () => void;
  collapsibleSections?: boolean;
  comparisonValue?: PensionInputs;
}

type RequiredNumericField =
  | "currentAge"
  | "retirementAge"
  | "currentPot"
  | "monthlyEmployeeContribution"
  | "monthlyEmployerContribution";

type OptionalNumericField =
  | "extraContributionAge"
  | "extraMonthlyContribution";

export function PensionInputsForm({
  idPrefix = "pension",
  value,
  errors,
  onChange,
  onReset,
  collapsibleSections = false,
  comparisonValue,
}: PensionInputsFormProps) {
  const [openSection, setOpenSection] = useState("personal");

  function createFieldId(fieldName: string): string {
    return `${idPrefix}-${fieldName}`;
  }

  function updateRequiredNumber(
    field: RequiredNumericField,
    nextValue: number | undefined
  ) {
    onChange({
      ...value,
      [field]: nextValue ?? Number.NaN,
    });
  }

  function updateOptionalNumber(
    field: OptionalNumericField,
    nextValue: number | undefined
  ) {
    onChange({
      ...value,
      [field]: nextValue,
    });
  }

  function updatePercentage(
    field: "annualReturn" | "annualFee" | "inflation" | "annualContributionIncrease",
    nextValue: number | undefined
  ) {
    onChange({
      ...value,
      [field]: nextValue ?? Number.NaN,
    });
  }

  function countChanged(fields: (keyof PensionInputs)[]): number {
    if (!comparisonValue) return 0;
    return fields.filter((field) => value[field] !== comparisonValue[field]).length;
  }

  function countErrors(fields: (keyof PensionInputErrors)[]): number {
    return fields.filter((field) => Boolean(errors[field])).length;
  }

  function toggleSection(sectionId: string) {
    setOpenSection((current) => (current === sectionId ? "" : sectionId));
  }

  function createSummaryItem(
    label: string,
    displayValue: string,
    currentValue: number | undefined,
    otherValue: number | undefined,
    formatDifference: (difference: number) => string
  ): FormSectionSummaryItem {
    const changed =
      comparisonValue !== undefined && currentValue !== otherValue;

    return {
      label,
      value: displayValue,
      changed,
      difference:
        changed && currentValue !== undefined && otherValue !== undefined
          ? formatDifference(currentValue - otherValue)
          : undefined,
    };
  }

  function formatSignedNumber(difference: number, suffix = ""): string {
    const sign = difference > 0 ? "+" : "";
    return `${sign}${difference.toLocaleString()}${suffix}`;
  }

  function formatCurrencyDifference(difference: number): string {
    const sign = difference > 0 ? "+" : difference < 0 ? "−" : "";
    return `${sign}£${Math.abs(difference).toLocaleString()}`;
  }

  function formatPercentagePointDifference(difference: number): string {
    const percentagePoints = difference * 100;
    const sign = percentagePoints > 0 ? "+" : "";
    return `${sign}${percentagePoints.toFixed(2)} pp`;
  }

  const totalMonthlyContribution =
    value.monthlyEmployeeContribution + value.monthlyEmployerContribution;
  const comparisonMonthlyContribution = comparisonValue
    ? comparisonValue.monthlyEmployeeContribution +
      comparisonValue.monthlyEmployerContribution
    : undefined;

  return (
    <section className="panel">
      <div className="panel-heading panel-heading-row">
        <div>
          <h2>Your details</h2>
          <p>
            Enter your pension details and planning assumptions. Your projection
            updates automatically as the values change.
          </p>
        </div>

        <button type="button" className="reset-button" onClick={onReset}>
          Reset defaults
        </button>
      </div>

      <div className="input-sections">
        <FormSection
          sectionId="personal"
          title="Personal details"
          icon={AppIcons.user}
          collapsible={collapsibleSections}
          isOpen={openSection === "personal"}
          onToggle={toggleSection}
          summary={`Age ${value.currentAge} · Retire at ${value.retirementAge}`}
          summaryItems={[
            createSummaryItem(
              "Current age",
              String(value.currentAge),
              value.currentAge,
              comparisonValue?.currentAge,
              (difference) =>
                formatSignedNumber(
                  difference,
                  Math.abs(difference) === 1 ? " year" : " years"
                )
            ),
            createSummaryItem(
              "Retire at",
              String(value.retirementAge),
              value.retirementAge,
              comparisonValue?.retirementAge,
              (difference) =>
                formatSignedNumber(
                  difference,
                  Math.abs(difference) === 1 ? " year" : " years"
                )
            ),
          ]}
          changedCount={countChanged(["currentAge", "retirementAge"])}
          errorCount={countErrors(["currentAge", "retirementAge"])}
          description="Your current age and the age at which you plan to retire."
        >
          <FormField
            id={createFieldId("currentAge")}
            label="Current age"
            hint="Enter your age today."
            error={errors.currentAge}
          >
            {(id, describedBy) => (
              <NumberInput
                id={id}
                aria-describedby={describedBy}
                value={Number.isFinite(value.currentAge) ? value.currentAge : ""}
                min={18}
                max={100}
                suffix="years"
                error={Boolean(errors.currentAge)}
                onValueChange={(nextValue) =>
                  updateRequiredNumber("currentAge", nextValue)
                }
              />
            )}
          </FormField>

          <FormField
            id={createFieldId("retirementAge")}
            label="Planned retirement age"
            hint="Choose the age when regular pension contributions will stop."
            error={errors.retirementAge}
          >
            {(id, describedBy) => (
              <NumberInput
                id={id}
                aria-describedby={describedBy}
                value={
                  Number.isFinite(value.retirementAge)
                    ? value.retirementAge
                    : ""
                }
                min={18}
                max={100}
                suffix="years"
                error={Boolean(errors.retirementAge)}
                onValueChange={(nextValue) =>
                  updateRequiredNumber("retirementAge", nextValue)
                }
              />
            )}
          </FormField>
        </FormSection>

        <FormSection
          sectionId="pension"
          title="Current pension"
          icon={AppIcons.pension}
          collapsible={collapsibleSections}
          isOpen={openSection === "pension"}
          onToggle={toggleSection}
          summary={`£${value.currentPot.toLocaleString()} pot · £${totalMonthlyContribution.toLocaleString()}/month`}
          summaryItems={[
            createSummaryItem(
              "Pension pot",
              `£${value.currentPot.toLocaleString()}`,
              value.currentPot,
              comparisonValue?.currentPot,
              formatCurrencyDifference
            ),
            createSummaryItem(
              "Monthly total",
              `£${totalMonthlyContribution.toLocaleString()}`,
              totalMonthlyContribution,
              comparisonMonthlyContribution,
              formatCurrencyDifference
            ),
            createSummaryItem(
              "Your contribution",
              `£${value.monthlyEmployeeContribution.toLocaleString()}`,
              value.monthlyEmployeeContribution,
              comparisonValue?.monthlyEmployeeContribution,
              formatCurrencyDifference
            ),
          ]}
          changedCount={countChanged([
            "currentPot",
            "monthlyEmployeeContribution",
            "monthlyEmployerContribution",
          ])}
          errorCount={countErrors([
            "currentPot",
            "monthlyEmployeeContribution",
            "monthlyEmployerContribution",
          ])}
          description="Your pension balance and regular monthly contributions."
        >
          <FormField
            id={createFieldId("currentPot")}
            label="Current pension pot"
            hint="Use the combined value of the pensions included in this plan."
            error={errors.currentPot}
          >
            {(id, describedBy) => (
              <CurrencyInput
                id={id}
                aria-describedby={describedBy}
                value={Number.isFinite(value.currentPot) ? value.currentPot : ""}
                min={0}
                step={100}
                error={Boolean(errors.currentPot)}
                onValueChange={(nextValue) =>
                  updateRequiredNumber("currentPot", nextValue)
                }
              />
            )}
          </FormField>

          <FormField
            id={createFieldId("employeeContribution")}
            label="Your monthly contribution"
            hint="Enter the amount paid into your pension from you each month."
            error={errors.monthlyEmployeeContribution}
          >
            {(id, describedBy) => (
              <CurrencyInput
                id={id}
                aria-describedby={describedBy}
                value={
                  Number.isFinite(value.monthlyEmployeeContribution)
                    ? value.monthlyEmployeeContribution
                    : ""
                }
                min={0}
                step={10}
                error={Boolean(errors.monthlyEmployeeContribution)}
                onValueChange={(nextValue) =>
                  updateRequiredNumber("monthlyEmployeeContribution", nextValue)
                }
              />
            )}
          </FormField>

          <FormField
            id={createFieldId("employerContribution")}
            label="Employer monthly contribution"
            hint="Include the amount your employer pays into the pension each month."
            error={errors.monthlyEmployerContribution}
          >
            {(id, describedBy) => (
              <CurrencyInput
                id={id}
                aria-describedby={describedBy}
                value={
                  Number.isFinite(value.monthlyEmployerContribution)
                    ? value.monthlyEmployerContribution
                    : ""
                }
                min={0}
                step={10}
                error={Boolean(errors.monthlyEmployerContribution)}
                onValueChange={(nextValue) =>
                  updateRequiredNumber("monthlyEmployerContribution", nextValue)
                }
              />
            )}
          </FormField>
        </FormSection>

        <FormSection
          sectionId="investment"
          title="Investment assumptions"
          icon={AppIcons.growth}
          collapsible={collapsibleSections}
          isOpen={openSection === "investment"}
          onToggle={toggleSection}
          summary={`${(value.annualReturn * 100).toFixed(1)}% return · ${(value.annualFee * 100).toFixed(2)}% fee`}
          summaryItems={[
            createSummaryItem(
              "Return",
              `${(value.annualReturn * 100).toFixed(1)}%`,
              value.annualReturn,
              comparisonValue?.annualReturn,
              formatPercentagePointDifference
            ),
            createSummaryItem(
              "Annual fee",
              `${(value.annualFee * 100).toFixed(2)}%`,
              value.annualFee,
              comparisonValue?.annualFee,
              formatPercentagePointDifference
            ),
            createSummaryItem(
              "Inflation",
              `${(value.inflation * 100).toFixed(1)}%`,
              value.inflation,
              comparisonValue?.inflation,
              formatPercentagePointDifference
            ),
          ]}
          changedCount={countChanged(["annualReturn", "annualFee", "inflation"])}
          errorCount={countErrors(["annualReturn", "annualFee", "inflation"])}
          description="Expected investment growth, pension charges and inflation."
        >
          <FormField
            id={createFieldId("annualReturn")}
            label="Expected annual return"
            hint="This is the assumed return before pension fees are deducted."
            error={errors.annualReturn}
          >
            {(id, describedBy) => (
              <PercentageInput
                id={id}
                aria-describedby={describedBy}
                value={
                  Number.isFinite(value.annualReturn) ? value.annualReturn : ""
                }
                min={0}
                max={20}
                step={0.1}
                error={Boolean(errors.annualReturn)}
                onValueChange={(nextValue) =>
                  updatePercentage("annualReturn", nextValue)
                }
              />
            )}
          </FormField>

          <FormField
            id={createFieldId("annualFee")}
            label="Annual pension fee"
            hint="Enter the total annual fund, platform and administration charge."
            error={errors.annualFee}
          >
            {(id, describedBy) => (
              <PercentageInput
                id={id}
                aria-describedby={describedBy}
                value={Number.isFinite(value.annualFee) ? value.annualFee : ""}
                min={0}
                max={5}
                step={0.01}
                decimalPlaces={4}
                error={Boolean(errors.annualFee)}
                onValueChange={(nextValue) =>
                  updatePercentage("annualFee", nextValue)
                }
              />
            )}
          </FormField>

          <FormField
            id={createFieldId("inflation")}
            label="Expected inflation"
            hint="Used to express future values in today's purchasing power."
            error={errors.inflation}
          >
            {(id, describedBy) => (
              <PercentageInput
                id={id}
                aria-describedby={describedBy}
                value={Number.isFinite(value.inflation) ? value.inflation : ""}
                min={0}
                max={15}
                step={0.1}
                error={Boolean(errors.inflation)}
                onValueChange={(nextValue) =>
                  updatePercentage("inflation", nextValue)
                }
              />
            )}
          </FormField>
        </FormSection>

        <FormSection
          sectionId="changes"
          title="Contribution changes"
          icon={AppIcons.plus}
          collapsible={collapsibleSections}
          isOpen={openSection === "changes"}
          onToggle={toggleSection}
          summary={`${(value.annualContributionIncrease * 100).toFixed(1)}% annual increase${
            value.extraMonthlyContribution
              ? ` · +£${value.extraMonthlyContribution.toLocaleString()} from age ${
                  value.extraContributionAge ?? "—"
                }`
              : ""
          }`}
          summaryItems={[
            createSummaryItem(
              "Annual increase",
              `${(value.annualContributionIncrease * 100).toFixed(1)}%`,
              value.annualContributionIncrease,
              comparisonValue?.annualContributionIncrease,
              formatPercentagePointDifference
            ),
            createSummaryItem(
              "Extra monthly",
              value.extraMonthlyContribution
                ? `£${value.extraMonthlyContribution.toLocaleString()}`
                : "None",
              value.extraMonthlyContribution ?? 0,
              comparisonValue
                ? comparisonValue.extraMonthlyContribution ?? 0
                : undefined,
              formatCurrencyDifference
            ),
            createSummaryItem(
              "Starts at",
              value.extraContributionAge
                ? `Age ${value.extraContributionAge}`
                : "—",
              value.extraContributionAge,
              comparisonValue?.extraContributionAge,
              (difference) =>
                formatSignedNumber(
                  difference,
                  Math.abs(difference) === 1 ? " year" : " years"
                )
            ),
          ]}
          changedCount={countChanged([
            "annualContributionIncrease",
            "extraContributionAge",
            "extraMonthlyContribution",
          ])}
          errorCount={countErrors([
            "annualContributionIncrease",
            "extraContributionAge",
            "extraMonthlyContribution",
          ])}
          description="Model regular contribution increases or a later additional payment."
        >
          <FormField
            id={createFieldId("contributionIncrease")}
            label="Annual contribution increase"
            hint="Use this to model contributions rising each year, for example with salary."
            error={errors.annualContributionIncrease}
          >
            {(id, describedBy) => (
              <PercentageInput
                id={id}
                aria-describedby={describedBy}
                value={
                  Number.isFinite(value.annualContributionIncrease)
                    ? value.annualContributionIncrease
                    : ""
                }
                min={0}
                max={20}
                step={0.1}
                error={Boolean(errors.annualContributionIncrease)}
                onValueChange={(nextValue) =>
                  updatePercentage("annualContributionIncrease", nextValue)
                }
              />
            )}
          </FormField>

          <FormField
            id={createFieldId("extraContributionAge")}
            label="Extra contribution starts at age"
            hint="Leave blank when you are not planning a later contribution increase."
            error={errors.extraContributionAge}
            optional
          >
            {(id, describedBy) => (
              <NumberInput
                id={id}
                aria-describedby={describedBy}
                value={value.extraContributionAge ?? ""}
                min={value.currentAge}
                max={value.retirementAge}
                suffix="years"
                error={Boolean(errors.extraContributionAge)}
                onValueChange={(nextValue) =>
                  updateOptionalNumber("extraContributionAge", nextValue)
                }
              />
            )}
          </FormField>

          <FormField
            id={createFieldId("extraMonthlyContribution")}
            label="Extra monthly contribution"
            hint="The additional monthly amount paid from the selected age."
            error={errors.extraMonthlyContribution}
            optional
          >
            {(id, describedBy) => (
              <CurrencyInput
                id={id}
                aria-describedby={describedBy}
                value={value.extraMonthlyContribution ?? ""}
                min={0}
                step={10}
                error={Boolean(errors.extraMonthlyContribution)}
                onValueChange={(nextValue) =>
                  updateOptionalNumber("extraMonthlyContribution", nextValue)
                }
              />
            )}
          </FormField>
        </FormSection>
      </div>
    </section>
  );
}
