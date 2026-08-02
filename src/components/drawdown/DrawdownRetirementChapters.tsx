import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import type { AppIcon } from "../../icons";
import { AppIcons } from "../../icons";
import {
  getDisplayYears,
  type MoneyDisplayMode,
} from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";

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
  const supportsIncome =
    result.firstShortfallAge === null &&
    result.firstNetIncomeShortfallAge === null;
  const lastsToHorizon = result.depletionAge === null;

  return (
    <section className="drawdown-chapters-and-questions">
      <div className="drawdown-key-questions" aria-labelledby="drawdown-key-questions-title">
        <header>
          <p className="panel-eyebrow">Key questions</p>
          <h3 id="drawdown-key-questions-title">Your retirement at a glance</h3>
          <p>Clear answers to the questions most likely to shape the plan.</p>
        </header>
        <div className="drawdown-question-grid">
          <Question
            label="Can the plan support the target income?"
            value={supportsIncome ? "Yes" : "Not throughout"}
            tone={supportsIncome ? "positive" : "warning"}
          />
          <Question
            label="Does the private pension last?"
            value={lastsToHorizon ? `Through age ${inputs.endAge}` : `Until age ${result.depletionAge}`}
            tone={lastsToHorizon ? "positive" : "warning"}
          />
          <Question
            label="When does State Pension begin?"
            value={inputs.annualStatePension > 0 ? `Age ${inputs.statePensionAge}` : "Not included"}
            tone="neutral"
          />
          <Question
            label="When does planned spending change?"
            value={firstSpendingChange === null ? "One target throughout" : `Age ${firstSpendingChange}`}
            tone="neutral"
          />
          <Question
            label="Lowest illustrated pension balance"
            value={lowestBalanceYear ? formatCurrency(lowestBalanceYear.closingBalance) : formatCurrency(0)}
            detail={lowestBalanceYear ? `At age ${lowestBalanceYear.age}` : undefined}
            tone={lowestBalanceYear && lowestBalanceYear.closingBalance > 0 ? "positive" : "warning"}
          />
        </div>
      </div>

      <div className="drawdown-retirement-chapters" aria-labelledby="drawdown-chapters-title">
        <header>
          <p className="panel-eyebrow">Retirement chapters</p>
          <h3 id="drawdown-chapters-title">How your retirement changes over time</h3>
          <p>Each chapter uses the income target saved in the active plan.</p>
        </header>
        <div className="drawdown-chapter-grid">
          {chapters.map((chapter) => (
            <RetirementChapterCard key={`${chapter.title}-${chapter.startAge}`} chapter={chapter} />
          ))}
        </div>
        <Link className="drawdown-chapter-action" to="/what-if">
          Could you spend more during active retirement? Explore it in What If?
        </Link>
      </div>
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
