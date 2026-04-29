import { TeamFlag } from "@/components/TeamFlag";
import type { GeneratedMatchRecord } from "@/lib/types/domain";

interface MatchDetailSummaryProps {
  selectedRecord: GeneratedMatchRecord;
  showSourceContext: boolean;
  isSourceContextLoading: boolean;
  onOpenSingleMatchApi: (matchCode: string) => void;
  onExportSingleMatch: (record: GeneratedMatchRecord) => void;
  onToggleSourceContext: () => void;
  formatDateTime: (value: string) => string;
  getStatusTone: (status: string) => "status-live" | "status-finished" | "status-scheduled";
}

export function MatchDetailSummary({
  selectedRecord,
  showSourceContext,
  isSourceContextLoading,
  onOpenSingleMatchApi,
  onExportSingleMatch,
  onToggleSourceContext,
  formatDateTime,
  getStatusTone,
}: MatchDetailSummaryProps) {
  return (
    <section className="detail-summary-layout">
      <header className="detail-header">
        <div className="detail-header-main">
          <p className={`detail-status ${getStatusTone(selectedRecord.endpoint.status)}`}>
            {selectedRecord.endpoint.status}
          </p>
          <h2 className="detail-matchup">
            <span className="team-inline">
              <TeamFlag
                teamCode={selectedRecord.source.homeTeamCode}
                teamName={selectedRecord.endpoint.teams.home}
                size="lg"
              />
              <span>{selectedRecord.endpoint.teams.home}</span>
            </span>
            <span className="team-vs">vs</span>
            <span className="team-inline">
              <TeamFlag
                teamCode={selectedRecord.source.awayTeamCode}
                teamName={selectedRecord.endpoint.teams.away}
                size="lg"
              />
              <span>{selectedRecord.endpoint.teams.away}</span>
            </span>
          </h2>
          <p className="detail-header-meta">
            {formatDateTime(selectedRecord.endpoint.kickoff)} | {selectedRecord.endpoint.venue.name},{" "}
            {selectedRecord.endpoint.venue.city}
          </p>

          <dl className="detail-header-context">
            <div>
              <dt>Match Code</dt>
              <dd>{selectedRecord.source.matchCode}</dd>
            </div>
            <div>
              <dt>Event Code</dt>
              <dd>{selectedRecord.source.eventCode}</dd>
            </div>
            <div>
              <dt>Round</dt>
              <dd>{selectedRecord.endpoint.competition.round}</dd>
            </div>
          </dl>
        </div>

        <div className="detail-header-side">
          <div className="detail-score-card" aria-label="Match score">
            <p className="detail-card-label">Scoreline</p>
            <div className="detail-score">
              <span>{selectedRecord.endpoint.score.home}</span>
              <small>:</small>
              <span>{selectedRecord.endpoint.score.away}</span>
            </div>
            <p className="detail-score-caption">{selectedRecord.endpoint.competition.round}</p>
          </div>
        </div>
      </header>

      <aside className="detail-summary-actions" aria-label="Inspection tools">
        <article className="detail-actions-card">
          <p className="detail-card-label">Inspection Actions</p>
          <div className="detail-actions">
            <button
              className="control-button secondary"
              onClick={() => onOpenSingleMatchApi(selectedRecord.source.matchCode)}
              type="button"
            >
              Open Single API
            </button>
            <button
              className="control-button secondary"
              onClick={() => onExportSingleMatch(selectedRecord)}
              type="button"
            >
              Export This Match
            </button>
            <button
              className="control-button secondary"
              onClick={onToggleSourceContext}
              disabled={isSourceContextLoading}
              type="button"
            >
              {showSourceContext ? "Hide Full Source Context" : "Show Full Source Context"}
            </button>
          </div>
        </article>
      </aside>
    </section>
  );
}
