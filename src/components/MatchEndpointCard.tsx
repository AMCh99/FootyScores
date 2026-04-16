import type { KeyboardEvent } from "react";

import { TeamFlag } from "@/components/TeamFlag";
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

function getStatusTone(status: string): "status-live" | "status-finished" | "status-scheduled" {
  const normalized = status.trim().toLowerCase();

  if (normalized.includes("live") || normalized.includes("progress")) {
    return "status-live";
  }

  if (normalized.includes("finished") || normalized.includes("full") || normalized.includes("ended")) {
    return "status-finished";
  }

  return "status-scheduled";
}

export function MatchEndpointCard({ record, isSelected = false, onOpen }: MatchEndpointCardProps) {
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
      className={`match-list-item${isInteractive ? " clickable" : ""}${isSelected ? " selected" : ""}`}
      onClick={isInteractive ? handleOpen : undefined}
      onKeyDown={handleKeyDown}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `Open details for ${record.source.matchCode}` : undefined}
    >
      <div className="match-list-item-top">
        <div>
          <h3 className="matchup-line">
            <span className="team-inline">
              <TeamFlag
                teamCode={record.source.homeTeamCode}
                teamName={record.endpoint.teams.home}
              />
              <span>{record.endpoint.teams.home}</span>
            </span>
            <span className="team-vs">vs</span>
            <span className="team-inline">
              <TeamFlag
                teamCode={record.source.awayTeamCode}
                teamName={record.endpoint.teams.away}
              />
              <span>{record.endpoint.teams.away}</span>
            </span>
          </h3>
        </div>

        <span className={`status-pill ${getStatusTone(record.endpoint.status)}`}>{record.endpoint.status}</span>
      </div>

      <div className="match-list-item-footer">
        <p className="meta">
          {formatDateTime(record.endpoint.kickoff)} | {record.endpoint.competition.round}
        </p>
        <p className="footnote">Match ID: {record.source.matchCode}</p>
      </div>
    </article>
  );
}
