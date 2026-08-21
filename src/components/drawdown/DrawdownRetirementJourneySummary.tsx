import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import { formatCurrency } from "../../utils/formatters";

interface DrawdownRetirementJourneySummaryProps {
  inputs: DrawdownInputs;
  result: DrawdownResult;
}

interface JourneyMilestone {
  age: number;
  title: string;
  description: string;
  tone: "neutral" | "positive" | "warning";
}

export function DrawdownRetirementJourneySummary({
  inputs,
  result,
}: DrawdownRetirementJourneySummaryProps) {
  const milestones = createJourneyMilestones(inputs, result);
  const firstSpendingChange = inputs.spendingPhases?.find(
    (phase) => phase.startAge > inputs.retirementAge,
  );
  const firstIncomeConcernAge =
    result.firstNetIncomeShortfallAge ?? result.firstShortfallAge;
  const finalBalance = result.years.at(-1)?.closingBalance ?? result.finalBalance;

  return (
    <section
      className="drawdown-retirement-journey-summary"
      aria-labelledby="drawdown-retirement-journey-summary-title"
    >
      <header className="drawdown-retirement-journey-summary-heading">
        <div>
          <p className="panel-eyebrow">Your journey at a glance</p>
          <h2 id="drawdown-retirement-journey-summary-title">
            The important moments in your retirement
          </h2>
          <p>
            Retirement is rarely one identical year after another. These milestones show
            when the way your plan works changes and why those points are worth noticing.
          </p>
        </div>
      </header>

      <div className="drawdown-retirement-journey-milestones" role="list">
        {milestones.map((milestone) => (
          <article
            key={`${milestone.age}-${milestone.title}`}
            className={`drawdown-retirement-journey-milestone is-${milestone.tone}`}
            role="listitem"
          >
            <div className="drawdown-retirement-journey-marker" aria-hidden="true">
              <span />
            </div>
            <div>
              <small>Age {milestone.age}</small>
              <strong>{milestone.title}</strong>
              <p>{milestone.description}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="drawdown-retirement-journey-questions">
        <JourneyAnswer
          label="When does retirement begin?"
          value={`Age ${inputs.retirementAge}`}
          detail="This is the first year shown in your retirement plan."
          tone="neutral"
        />
        <JourneyAnswer
          label="When does State Pension begin helping?"
          value={
            inputs.annualStatePension > 0
              ? `Age ${inputs.statePensionAge}`
              : "Not included"
          }
          detail={
            inputs.annualStatePension > 0
              ? "From this point, less of your income may need to come from your private pension."
              : "Your illustration currently relies on the other income sources in your plan."
          }
          tone="neutral"
        />
        <JourneyAnswer
          label="When does planned spending first change?"
          value={firstSpendingChange ? `Age ${firstSpendingChange.startAge}` : "No change planned"}
          detail={
            firstSpendingChange
              ? `${firstSpendingChange.label} begins here.`
              : "The same planned income is used throughout retirement."
          }
          tone="neutral"
        />
        <JourneyAnswer
          label="Is your planned income fully met?"
          value={firstIncomeConcernAge === null ? "Throughout the plan" : `Until age ${firstIncomeConcernAge}`}
          detail={
            firstIncomeConcernAge === null
              ? "The illustration provides the planned income throughout the period shown."
              : "From this age, the amount available is below the income in your plan."
          }
          tone={firstIncomeConcernAge === null ? "positive" : "warning"}
        />
        <JourneyAnswer
          label="Does your private pension last?"
          value={result.depletionAge === null ? `Through age ${inputs.endAge}` : `Until age ${result.depletionAge}`}
          detail={
            result.depletionAge === null
              ? `${formatCurrency(finalBalance)} remains at the end of the plan.`
              : "The private pension is fully used before the end of the planning period."
          }
          tone={result.depletionAge === null ? "positive" : "warning"}
        />
      </div>

      <aside className="drawdown-retirement-journey-note">
        <strong>What does this journey tell you?</strong>
        <p>
          The important part is not that every year looks the same. It is understanding
          when your income sources, spending needs or pension position change, and whether
          the plan continues to support the retirement you have described.
        </p>
      </aside>
    </section>
  );
}

function createJourneyMilestones(
  inputs: DrawdownInputs,
  result: DrawdownResult,
): JourneyMilestone[] {
  const milestones = new Map<number, JourneyMilestone>();

  const add = (milestone: JourneyMilestone) => {
    const existing = milestones.get(milestone.age);
    if (!existing || tonePriority(milestone.tone) > tonePriority(existing.tone)) {
      milestones.set(milestone.age, milestone);
    }
  };

  add({
    age: inputs.retirementAge,
    title: "Your retirement begins",
    description: "Your private pension starts supporting the retirement income in this plan.",
    tone: "neutral",
  });

  if (inputs.annualStatePension > 0 && inputs.statePensionAge <= inputs.endAge) {
    add({
      age: inputs.statePensionAge,
      title: "Your State Pension begins",
      description: "Part of your retirement income now comes from the State Pension, which can reduce how much needs to come from your private pension.",
      tone: "positive",
    });
  }

  inputs.spendingPhases
    ?.filter((phase) => phase.startAge > inputs.retirementAge)
    .forEach((phase) => {
      add({
        age: phase.startAge,
        title: "Your planned spending changes",
        description: `${phase.label} begins, so the amount of income your plan is trying to provide changes from this point.`,
        tone: "neutral",
      });
    });

  const firstIncomeConcernAge =
    result.firstNetIncomeShortfallAge ?? result.firstShortfallAge;
  if (firstIncomeConcernAge !== null) {
    add({
      age: firstIncomeConcernAge,
      title: "Your planned income is no longer fully met",
      description: "The plan continues to provide income, but the amount available from this point is below the level you planned for.",
      tone: "warning",
    });
  }

  if (result.depletionAge !== null) {
    add({
      age: result.depletionAge,
      title: "Your private pension has been fully used",
      description: "After this point, retirement income depends on the other income sources included in your plan.",
      tone: "warning",
    });
  }

  add({
    age: inputs.endAge,
    title: "Your planning period ends",
    description: "This is the final age included in the retirement illustration.",
    tone: "neutral",
  });

  return [...milestones.values()].sort((a, b) => a.age - b.age);
}

function tonePriority(tone: JourneyMilestone["tone"]) {
  if (tone === "warning") return 3;
  if (tone === "positive") return 2;
  return 1;
}

function JourneyAnswer({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "neutral" | "positive" | "warning";
}) {
  return (
    <article className={`drawdown-retirement-journey-answer is-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
