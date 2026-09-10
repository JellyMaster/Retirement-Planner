import { useEffect, useRef, useState } from "react";

interface SaveWhatIfScenarioModalProps {
  suggestedName: string;
  experimentName: string;
  basePlanName: string;
  onCancel: () => void;
  onSave: (name: string) => void;
}

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "input:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function SaveWhatIfScenarioModal({
  suggestedName,
  experimentName,
  basePlanName,
  onCancel,
  onSave,
}: SaveWhatIfScenarioModalProps) {
  const modalRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(suggestedName);

  useEffect(() => {
    const opener =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !modalRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [onCancel]);

  const trimmedName = name.trim();

  return (
    <div
      className="what-if-save-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        ref={modalRef}
        className="what-if-save-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="what-if-save-title"
        aria-describedby="what-if-save-description"
        tabIndex={-1}
      >
        <header className="what-if-save-header">
          <div>
            <p className="planner-eyebrow">Save experiment</p>
            <h2 id="what-if-save-title">Keep this What If result</h2>
            <p id="what-if-save-description">
              Save this experiment so you can return to it later without turning it into a full plan.
            </p>
          </div>
          <button
            type="button"
            className="what-if-save-close"
            aria-label="Close save experiment dialog"
            onClick={onCancel}
          >
            ×
          </button>
        </header>

        <div className="what-if-save-context" aria-label="Experiment details">
          <div>
            <span>Experiment</span>
            <strong>{experimentName}</strong>
          </div>
          <div>
            <span>Based on</span>
            <strong>{basePlanName}</strong>
          </div>
        </div>

        <form
          className="what-if-save-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (trimmedName) onSave(trimmedName);
          }}
        >
          <label htmlFor="what-if-save-name">
            <span>Name</span>
            <input
              ref={inputRef}
              id="what-if-save-name"
              aria-label="Name"
              value={name}
              maxLength={80}
              autoComplete="off"
              onChange={(event) => setName(event.target.value)}
            />
            <small>You can change the suggested name before saving.</small>
          </label>

          <div className="what-if-save-actions">
            <button
              type="button"
              className="ui-button ui-button-secondary ui-button-medium"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ui-button ui-button-primary ui-button-medium"
              disabled={!trimmedName}
            >
              Save experiment
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
