import type { KeyboardEvent } from "react";

import type { GeneratedMatchRecord } from "@/lib/types/domain";

interface MatchEndpointCardProps {
  record: GeneratedMatchRecord;
  onOpen?: (record: GeneratedMatchRecord) => void;
}

export function MatchEndpointCard({ record, onOpen }: MatchEndpointCardProps) {
  const isInteractive = typeof onOpen === "function";

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
      className={`match-card${isInteractive ? " clickable" : ""}`}
      onClick={isInteractive ? handleOpen : undefined}
      onKeyDown={handleKeyDown}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `Open fullscreen details for ${record.source.matchCode}` : undefined}
    >
      <h3>
        {record.endpoint.teams.home} vs {record.endpoint.teams.away}
      </h3>
      <p className="meta">
        {record.endpoint.kickoff} | {record.endpoint.competition.round}
      </p>
      <dl>
        <dt>Code</dt>
        <dd>{record.source.matchCode}</dd>
        <dt>Status</dt>
        <dd>{record.endpoint.status}</dd>
        <dt>Venue</dt>
        <dd>
          {record.endpoint.venue.name}, {record.endpoint.venue.city}
        </dd>
        <dt>Source</dt>
        <dd>{record.source.sourceMode}</dd>
      </dl>
      {isInteractive && <p className="card-hint">Click card to open fullscreen details.</p>}
      <pre>{JSON.stringify(record.endpoint, null, 2)}</pre>
    </article>
  );
}
