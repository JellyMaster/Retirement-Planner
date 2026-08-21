import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";

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
  const firstIncomeConcernAge =
    result.firstNetIncomeShortfallAge ?? result.firstShortfallAge;

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
            See the points where your retirement plan changes, from your first year of
            retirement through to the end of the period you are planning for.
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

      <div className="drawdown-retirement-journey-questions" aria-label="Key retirement journey answers">
        <JourneyAnswer
          label="Retirement starts"
          value={`Age ${inputs.retirementAge}`}
          tone="neutral"
        />
        <JourneyAnswer
          label="State Pension starts"
          value={
            inputs.annualStatePension > 0
              ? `Age ${inputs.statePensionAge}`
              : "Not included"
          }
          tone="neutral"
        />
        <JourneyAnswer
          label="Private pension lasts"
          value={
            result.depletionAge === null
              ? `Through age ${inputs.endAge}`
              : `Until age ${result.depletionAge}`
          }
          tone={result.depletionAge === null ? "positive" : "warning"}
        />
        <JourneyAnswer
          label="Planned income"
          value={
            firstIncomeConcernAge === null
              ? "Met throughout"
              : `Below plan from age ${firstIncomeConcernAge}`
          }
          tone={firstIncomeConcernAge === null ? "positive" : "warning"}
        />
      </div>

      <p className="drawdown-retirement-journey-note">
        Retirement does not usually change in exactly the same way every year. This journey
        highlights the key moments where your income or pension changes so you can see how
        your plan evolves over time.
      </p>
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
    description: "Your private pension starts providing your planned retirement income.",
    tone: "neutral",
  });

  if (inputs.annualStatePension > 0 && inputs.statePensionAge <= inputs.endAge) {
    add({
      age: inputs.statePensionAge,
      title: "Your State Pension begins",
      description: "Your State Pension starts, reducing how much may need to come from your private pension.",
      tone: "positive",
    });
  }

  inputs.spendingPhases
    ?.filter((phase) => phase.startAge > inputs.retirementAge)
    .forEach((phase) => {
      add({
        age: phase.startAge,
        title: "Your planned spending changes",
        description: `${phase.label} begins and the income your plan aims to provide changes.`,
        tone: "neutral",
      });
    });

  const firstIncomeConcernAge =
    result.firstNetIncomeShortfallAge ?? result.firstShortfallAge;
  if (firstIncomeConcernAge !== null) {
    add({
      age: firstIncomeConcernAge,
      title: "Your planned income is no longer fully met",
      description: "The amount available from this point is below the income you planned for.",
      tone: "warning",
    });
  }

  if (result.depletionAge !== null) {
    add({
      age: result.depletionAge,
      title: "Your private pension has been fully used",
      description: "Income after this point depends on the other sources included in your plan.",
      tone: "warning",
    });
  }

  add({
    age: inputs.endAge,
    title: "Your planning period ends",
    description: "Your illustrated retirement journey finishes here.",
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
  tone,
}: {
  label: string;
  value: string;
  tone: "neutral" | "positive" | "warning";
}) {
  return (
    <article className={`drawdown-retirement-journey-answer is-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
