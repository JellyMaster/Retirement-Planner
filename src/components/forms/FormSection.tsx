import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useId, useState, type ReactNode } from "react";

import { AppIcons } from "../../icons";
import "./forms.css";

export interface FormSectionSummaryItem {
  label: string;
  value: string;
  changed?: boolean;
  difference?: string;
}

export interface FormSectionProps {
  title: string;
  children: ReactNode;
  icon?: IconDefinition;
  description?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;

  /** Optional controlled expansion state. */
  isOpen?: boolean;
  /** Stable identifier used for aria-controls and controlled toggling. */
  sectionId?: string;
  onToggle?: (sectionId: string) => void;

  /** Compact content shown while a section is collapsed. */
  summary?: string;
  summaryItems?: FormSectionSummaryItem[];
  changedCount?: number;
  errorCount?: number;
}

export function FormSection({
  title,
  children,
  icon,
  description,
  collapsible = false,
  defaultExpanded = true,
  className,
  isOpen,
  sectionId,
  onToggle,
  summary,
  summaryItems = [],
  changedCount = 0,
  errorCount = 0,
}: FormSectionProps) {
  const generatedId = useId();
  const resolvedSectionId =
    sectionId ?? `form-section-${generatedId.replace(/:/g, "")}`;
  const contentId = `${resolvedSectionId}-content`;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = isOpen !== undefined;
  const expanded = collapsible
    ? isControlled
      ? isOpen
      : internalExpanded
    : true;

  function toggleExpanded() {
    if (!collapsible) return;

    if (onToggle) {
      onToggle(resolvedSectionId);
      return;
    }

    setInternalExpanded((current) => !current);
  }

  const sectionClassName = [
    "form-section",
    collapsible && "form-section-collapsible",
    expanded && "form-section-open",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (collapsible) {
    return (
      <section className={sectionClassName}>
        <button
          type="button"
          className="form-section-summary"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={toggleExpanded}
        >
          <span className="form-section-card-main">
            <span className="form-section-icon" aria-hidden="true">
              {icon ? <FontAwesomeIcon icon={icon} /> : null}
            </span>

            <span className="form-section-summary-copy">
              <span className="form-section-summary-heading">
                <strong>{title}</strong>

                <span
                  className={
                    changedCount > 0
                      ? "form-section-status-badge form-section-status-changed"
                      : "form-section-status-badge form-section-status-same"
                  }
                >
                  {changedCount > 0 ? "Changed" : "Same"}
                </span>

                {errorCount > 0 && (
                  <span className="form-section-error-badge">
                    {errorCount} {errorCount === 1 ? "error" : "errors"}
                  </span>
                )}
              </span>

              {summaryItems.length > 0 ? (
                <span className="form-section-summary-metrics">
                  {summaryItems.map((item) => (
                    <span
                      className={`form-section-summary-metric${
                        item.changed
                          ? " form-section-summary-metric-changed"
                          : ""
                      }`}
                      key={item.label}
                      aria-label={
                        item.changed && item.difference
                          ? `${item.label}: ${item.value}, ${item.difference} compared with the other plan`
                          : `${item.label}: ${item.value}, unchanged`
                      }
                    >
                      <small>{item.label}</small>
                      <span className="form-section-summary-value-row">
                        <strong>{item.value}</strong>
                        {item.changed && item.difference && (
                          <span
                            className="form-section-summary-difference"
                            aria-hidden="true"
                          >
                            {item.difference}
                          </span>
                        )}
                      </span>
                    </span>
                  ))}
                </span>
              ) : (
                <small>{summary ?? description}</small>
              )}
            </span>
          </span>

          <span className="form-section-summary-action">
            <span>{expanded ? "Close" : "Edit"}</span>
            <span className="form-section-chevron" aria-hidden="true">
              <FontAwesomeIcon icon={AppIcons.chevronDown} />
            </span>
          </span>
        </button>

        {expanded && (
          <div id={contentId} className="form-section-body form-section-collapsible-content">
            {children}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className={sectionClassName}>
      <header className="form-section-heading">
        <div className="form-section-title">
          {icon && (
            <span className="form-section-icon" aria-hidden="true">
              <FontAwesomeIcon icon={icon} />
            </span>
          )}

          <div className="form-section-title-copy">
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </div>
        </div>
      </header>

      <div className="form-section-body">{children}</div>
    </section>
  );
}
