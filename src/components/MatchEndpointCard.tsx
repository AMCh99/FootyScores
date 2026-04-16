import type { KeyboardEvent } from "react";

import type { GeneratedMatchRecord } from "@/lib/types/domain";

interface MatchEndpointCardProps {
  record: GeneratedMatchRecord;
  isSelected?: boolean;
  onOpen?: (record: GeneratedMatchRecord) => void;
}

function formatDateTime(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function MatchEndpointCard({ record, isSelected = false, onOpen }: MatchEndpointCardProps) {
  const isInteractive = typeof onOpen === "function";
  const endpointPreview = JSON.stringify(record.endpoint, null, 2);

  const handleOpen = (): void => {
    if (!onOpen) {
      return;
    }

    onOpen(record);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (!isInteractive) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  };

  return (
    <article
      className={`match-list-item${isInteractive ? " clickable" : ""}${isSelected ? " selected" : ""}`}
      onClick={isInteractive ? handleOpen : undefined}
      onKeyDown={handleKeyDown}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `Open fullscreen details for ${record.source.matchCode}` : undefined}
    >
      <div className="match-list-item-top">
        <div>
          <h3>
            {record.endpoint.teams.home} vs {record.endpoint.teams.away}
          </h3>
          <p className="meta">
            {formatDateTime(record.endpoint.kickoff)} | {record.endpoint.competition.round}
          </p>
          <p className="footnote">{record.source.matchCode}</p>
        </div>

        <span className="status-pill">{record.endpoint.status}</span>
      </div>

      <p className="endpoint-label">Generated Endpoint</p>
      <pre className="endpoint-preview">{endpointPreview}</pre>
    </article>
  );
}
