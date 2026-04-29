import type { MatchSourceContext } from "@/lib/types/domain";

interface SourceContextPanelProps {
  isSourceContextLoading: boolean;
  sourceContextError: string;
  selectedSourceContext: MatchSourceContext | undefined;
}

export function SourceContextPanel({
  isSourceContextLoading,
  sourceContextError,
  selectedSourceContext,
}: SourceContextPanelProps) {
  return (
    <section className="source-context-panel source-context-column" aria-live="polite">
      <h3>Full Source Context</h3>
      <p>
        Combined per-match data pulled from connected official endpoints (StartList, EventUnits,
        EventGames, Phases, Result, and Labels).
      </p>

      {isSourceContextLoading && (
        <div className="source-context-loading" role="status" aria-live="polite">
          <span className="source-context-spinner" aria-hidden="true" />
          Loading all connected source inputs...
        </div>
      )}

      {!isSourceContextLoading && sourceContextError.length > 0 && (
        <p className="source-context-error">{sourceContextError}</p>
      )}

      {!isSourceContextLoading && !sourceContextError && selectedSourceContext && (
        <pre>{JSON.stringify(selectedSourceContext, null, 2)}</pre>
      )}
    </section>
  );
}
