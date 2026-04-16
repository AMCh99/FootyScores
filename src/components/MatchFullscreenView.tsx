import type { MouseEvent } from "react";

import type { GeneratedMatchRecord } from "@/lib/types/domain";

interface MatchFullscreenViewProps {
  record: GeneratedMatchRecord;
  onOpenSingleApi: (matchCode: string) => void;
  onCompareSingle: (matchCode: string) => void;
  canCompareSingle: boolean;
  onExportSingle: (record: GeneratedMatchRecord) => void;
  onClose: () => void;
}

export function MatchFullscreenView({
  record,
  onOpenSingleApi,
  onCompareSingle,
  canCompareSingle,
  onExportSingle,
  onClose,
}: MatchFullscreenViewProps) {
  const titleId = `match-fullscreen-${record.source.matchCode}`;

  const handlePanelClick = (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
  };

  return (
    <div className="fullscreen-backdrop" onClick={onClose}>
      <section
        className="fullscreen-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={handlePanelClick}
      >
        <header className="fullscreen-header">
          <div>
            <h2 id={titleId}>
              {record.endpoint.teams.home} vs {record.endpoint.teams.away}
            </h2>
            <p>
              {record.endpoint.kickoff} | {record.endpoint.competition.round}
            </p>
          </div>
          <div className="fullscreen-actions">
            <button
              className="control-button secondary"
              onClick={() => onOpenSingleApi(record.source.matchCode)}
              type="button"
            >
              Open Single Match API
            </button>
              <button
                className="control-button secondary"
                onClick={() => onCompareSingle(record.source.matchCode)}
                disabled={!canCompareSingle}
                type="button"
              >
                Compare This Match
              </button>
            <button
              className="control-button secondary"
              onClick={() => onExportSingle(record)}
              type="button"
            >
              Export This Match
            </button>
            <button className="control-button secondary" onClick={onClose} type="button">
              Close Fullscreen
            </button>
          </div>
        </header>

        <div className="fullscreen-columns">
          <section className="fullscreen-section">
            <h3>Source Match Data</h3>
            <pre>{JSON.stringify(record.source, null, 2)}</pre>
          </section>

          <section className="fullscreen-section">
            <h3>Generated Endpoint</h3>
            <pre>{JSON.stringify(record.endpoint, null, 2)}</pre>
          </section>
        </div>
      </section>
    </div>
  );
}