import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppIcons } from "../../icons";

import type { ProjectionYear } from "../../engine/models/ProjectionYear";

import {
  getProjectionMilestones,
  type ProjectionMilestone,
} from "../../engine/utils/getProjectionMilestones";
import {
  formatCompactCurrency,
  formatCurrency,
} from "../../utils/formatters";

interface ProjectionMilestonesProps {
  years: ProjectionYear[];
}

export function ProjectionMilestones({
  years,
}: ProjectionMilestonesProps) {
  const milestones = useMemo(
    () => getProjectionMilestones(years),
    [years]
  );

  if (years.length === 0) {
    return null;
  }

  const reachedCount = milestones.filter(
    (milestone) => milestone.reached
  ).length;

  return (
    <section className="panel milestones-panel">
      <div className="panel-heading">
        <h2>Projection milestones</h2>

        <p>
          See when your projected pension reaches important
          balance targets.
        </p>
      </div>

      <div className="milestone-summary">
        <strong>
          {reachedCount} of {milestones.length}
        </strong>

        <span>
          milestones reached before retirement
        </span>
      </div>

      <div className="milestones-grid">
        {milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.target}
            milestone={milestone}
          />
        ))}
      </div>
    </section>
  );
}

interface MilestoneCardProps {
  milestone: ProjectionMilestone;
}

function MilestoneCard({
  milestone,
}: MilestoneCardProps) {
  return (
    <article
      className={
        milestone.reached
          ? "milestone-card milestone-card-reached"
          : "milestone-card milestone-card-unreached"
      }
    >
      <div className="milestone-icon">
        <FontAwesomeIcon icon={milestone.reached ? AppIcons.success : AppIcons.minus} />
      </div>

      <div className="milestone-content">
        <h3>
          {formatCompactCurrency(
            milestone.target
          )}
        </h3>

        {milestone.reached &&
        milestone.age !== undefined ? (
          <>
            <p>
              Reached at age{" "}
              <strong>{milestone.age}</strong>
            </p>

            {milestone.balance !== undefined && (
              <span className="milestone-balance">
                Projected balance{" "}
                {formatCurrency(
                  milestone.balance
                )}
              </span>
            )}
          </>
        ) : (
          <p>
            Not reached before retirement
          </p>
        )}
      </div>
    </article>
  );
}



