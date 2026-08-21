import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import type { AppIcon } from "../../icons";
import { AppIcons } from "../../icons";
import {
  getDisplayYears,
  type MoneyDisplayMode,
} from "../../utils/drawdownDisplayValues";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface DrawdownRetirementChaptersProps {
  inputs: DrawdownInputs;
  result: DrawdownResult;
  displayMode: MoneyDisplayMode;
}

interface RetirementChapter {
  title: string;
  startAge: number;
  endAge: number;
  annualIncome: number;
  summary: string;
  icon: AppIcon;
}

export function DrawdownRetirementChapters({
  inputs,
  result,
  displayMode,
}: DrawdownRetirementChaptersProps) {
  const chapters = createChapters(inputs);
  const displayYears = getDisplayYears(
    result.years,
    inputs.inflationRate,
    displayMode,
  );
  const lowestBalanceYear = displayYears.reduce(
    (lowest, year) =>
      lowest === null || year.closingBalance < lowest.closingBalance
        ? year
        : lowest,
    null as (typeof displayYears)[number] | null,
  );
  const firstSpendingChange = chapters[1]?.startAge ?? null;
  const hasMultipleChapters = chapters.length > 1;
  const supportsIncome =
    result.firstShortfallAge === null &&
    result.firstNetIncomeShortfallAge === null;
  const lastsToHorizon = result.depletionAge === null;
  const statePensionStart = displayYears.find((year) => year.statePensionIncome > 0);
  const highestTaxYear = displayYears.reduce(
    (highest, year) =>
      highest === null || year.incomeTax > highest.incomeTax ? year : highest,
    null as (typeof displayYears)[number] | null,
  );
  const averageSpendableIncome = displayYears.length > 0
    ? displayYears.reduce((total, year) => total + year.netIncome, 0) / displayYears.length
    : 0;
  const averageTaxRate = result.averageEffectiveTaxRate;

  return (
    <section className="drawdown-chapters-and-questions">
      <div className="drawdown-key-questions" aria-labelledby="drawdown-key-questions-title">
        <header>
          <p className="panel-eyebrow">Understanding your income</p>
          <h3 id="drawdown-key-questions-title">The key answers behind your retirement income</h3>
          <p>
            These answers summarise whether your planned income is supported, when other income sources begin helping and how tax affects the money available to spend.
          </p>
        </header>
        <div className="drawdown-question-grid">
          <Question
            label="Will your planned income be available throughout retirement?"
            value={supportsIncome ? "Yes, throughout the plan" : "Not throughout the plan"}
            detail={supportsIncome
              ? "The illustration provides the income you planned for every year shown."
              : "At least one year provides less than the income you planned for."}
            tone={supportsIncome ? "positive" : "warning"}
          />
          <Question
            label="When does State Pension begin helping?"
            value={statePensionStart ? `Age ${statePensionStart.age}` : "Not included"}
            detail={statePensionStart
              ? "From this age, less of your retirement income may need to come from your private pension."
              : "No State Pension income is included in this illustration."}
            tone="neutral"
          />
          <Question
            label="When is estimated tax highest?"
            value={highestTaxYear ? formatCurrency(highestTaxYear.incomeTax) : formatCurrency(0)}
            detail={highestTaxYear
              ? `At age ${highestTaxYear.age}. Average tax across the plan is ${formatPercentage(averageTaxRate)} of gross retirement income.`
              : undefined}
            tone="neutral"
          />
          <Question
            label="How much money is available to spend on average?"
            value={`${formatCurrency(averageSpendableIncome)}/year`}
            detail={displayMode === "today" ? "Shown in today’s money." : "Shown in future money."}
            tone="positive"
          />
          <Question
            label="Does your private pension remain available?"
            value={lastsToHorizon ? `Through age ${inputs.endAge}` : `Until age ${result.depletionAge}`}
            detail={lastsToHorizon
              ? "It remains available throughout the period you are planning for."
              : "It is fully used before the end of the planning period."}
            tone={lastsToHorizon ? "positive" : "warning"}
          />
          <Question
            label="When does your planned spending change?"
            value={firstSpendingChange === null ? "It stays the same" : `Age ${firstSpendingChange}`}
            detail={firstSpendingChange === null
              ? "Your income target is unchanged throughout the plan."
              : "A new spending phase begins from this age."}
            tone="neutral"
          />
          <Question
            label="What is the lowest projected pension balance?"
            value={lowestBalanceYear ? formatCurrency(lowestBalanceYear.closingBalance) : formatCurrency(0)}
            detail={lowestBalanceYear ? `At age ${lowestBalanceYear.age}.` : undefined}
            tone={lowestBalanceYear && lowestBalanceYear.closingBalance > 0 ? "positive" : "warning"}
          />
        </div>
      </div>

      {hasMultipleChapters ? (
        <div className="drawdown-retirement-chapters" aria-labelledby="drawdown-chapters-title">
          <header>
            <p className="panel-eyebrow">Retirement chapters</p>
            <h3 id="drawdown-chapters-title">How your planned spending changes over time</h3>
            <p>
              Each chapter shows the income you have planned for that stage of retirement and helps explain why the amount needed from your pension may change.
            </p>
          </header>
          <div className="drawdown-chapter-grid">
            {chapters.map((chapter) => (
              <RetirementChapterCard key={`${chapter.title}-${chapter.startAge}`} chapter={chapter} />
            ))}
          </div>
        </div>
      ) : (
        <div className="drawdown-retirement-chapters" aria-labelledby="drawdown-single-chapter-title">
          <header>
            <p className="panel-eyebrow">Your income plan</p>
            <h3 id="drawdown-single-chapter-title">Your planned income stays consistent</h3>
            <p>
              Your plan keeps the same income target from age {inputs.retirementAge} through age {inputs.endAge}, so retirement is shown as one continuous stage.
            </p>
          </header>
        </div>
      )}
    </section>
  );
}

function createChapters(inputs: DrawdownInputs): RetirementChapter[] {
  const phases = inputs.spendingPhases?.length
    ? inputs.spendingPhases
    : [
        {
          startAge: inputs.retirementAge,
          annualIncome: inputs.desiredAnnualIncome,
          label: "Active retirement",
        },
      ];

  return phases.map((phase, index) => {
    const nextStartAge = phases[index + 1]?.startAge;
    const title = normaliseChapterTitle(phase.label, index);

    return {
      title,
      startAge: phase.startAge,
      endAge: nextStartAge ? nextStartAge - 1 : inputs.endAge,
      annualIncome: phase.annualIncome,
      summary:
        index === 0
          ? "The early years of retirement, when plans often include more travel, activities and discretionary spending."
          : index === phases.length - 1
            ? "The later-life chapter, focused on maintaining dependable income through the end of the plan."
            : "A more settled chapter with a lower planned income target and reduced pressure on private withdrawals.",
      icon:
        index === 0
          ? AppIcons.retirement
          : index === phases.length - 1
            ? AppIcons.health
            : AppIcons.home,
    };
  });
}

function normaliseChapterTitle(label: string, index: number): string {
  if (label === "Active years") return "Active retirement";
  if (label === "Slower years") return "Settled retirement";
  if (label === "Later life") return "Later life";
  return label || ["Active retirement", "Settled retirement", "Later life"][index] || "Retirement";
}

function RetirementChapterCard({ chapter }: { chapter: RetirementChapter }) {
  return (
    <article className="retirement-chapter-card">
      <span className="retirement-chapter-icon" aria-hidden="true">
        <FontAwesomeIcon icon={chapter.icon} fixedWidth />
      </span>
      <div>
        <small>
          Age {chapter.startAge}–{chapter.endAge}
        </small>
        <h4>{chapter.title}</h4>
        <strong>{formatCurrency(chapter.annualIncome)}/year</strong>
        <p>{chapter.summary}</p>
      </div>
    </article>
  );
}

function Question({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail?: string;
  tone: "positive" | "warning" | "neutral";
}) {
  return (
    <article className={`drawdown-question-card is-${tone}`}>
      <span aria-hidden="true">
        <FontAwesomeIcon
          icon={tone === "positive" ? AppIcons.success : tone === "warning" ? AppIcons.warning : AppIcons.information}
        />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        {detail && <p>{detail}</p>}
      </div>
    </article>
  );
}
