
interface ProjectionAssumption {
  label: string;
  value: string;
}

interface ProjectionAssumptionsProps {
  assumptions: ProjectionAssumption[];
}

export function ProjectionAssumptions({
  assumptions,
}: ProjectionAssumptionsProps) {
  return (
    <section className="panel assumptions-panel">
      <div className="panel-heading">
        <h2>Projection assumptions</h2>

        <p>
          The key values used to calculate your pension
          projection.
        </p>
      </div>

      <dl className="assumptions-list">
        {assumptions.map((assumption) => (
          <div
            className="assumption-row"
            key={assumption.label}
          >
            <dt>{assumption.label}</dt>
            <dd>{assumption.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

