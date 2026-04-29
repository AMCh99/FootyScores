import type { GeneratedMatchRecord } from "@/lib/types/domain";

interface EndpointSimplifiedViewProps {
  selectedRecord: GeneratedMatchRecord;
  formatDateTime: (value: string) => string;
}

export function EndpointSimplifiedView({
  selectedRecord,
  formatDateTime,
}: EndpointSimplifiedViewProps) {
  return (
    <section className="endpoint-simplified" aria-label="Simplified generated endpoint">
      <div className="endpoint-simplified-grid">
        <article className="endpoint-simplified-card">
          <h4>Match</h4>
          <p className="endpoint-value-strong">
            {selectedRecord.endpoint.teams.home} vs {selectedRecord.endpoint.teams.away}
          </p>
          <p className="endpoint-muted">Kickoff: {formatDateTime(selectedRecord.endpoint.kickoff)}</p>
          <p className="endpoint-muted">Status: {selectedRecord.endpoint.status}</p>
        </article>

        <article className="endpoint-simplified-card endpoint-simplified-score-card">
          <h4>Score</h4>
          <p className="endpoint-scoreline">
            {selectedRecord.endpoint.score.home}
            <span>:</span>
            {selectedRecord.endpoint.score.away}
          </p>
          <p className="endpoint-muted">
            Half-time {selectedRecord.endpoint.score.halfTime.home}: {selectedRecord.endpoint.score.halfTime.away}
          </p>
        </article>

        <article className="endpoint-simplified-card">
          <h4>Competition</h4>
          <p className="endpoint-value-strong">{selectedRecord.endpoint.competition.name}</p>
          <p className="endpoint-muted">Season: {selectedRecord.endpoint.competition.season}</p>
          <p className="endpoint-muted">Round: {selectedRecord.endpoint.competition.round}</p>
        </article>

        <article className="endpoint-simplified-card">
          <h4>Venue</h4>
          <p className="endpoint-value-strong">{selectedRecord.endpoint.venue.name}</p>
          <p className="endpoint-muted">City: {selectedRecord.endpoint.venue.city}</p>
        </article>
      </div>

      <article className="endpoint-simplified-card">
        <h4>Scorers</h4>
        {selectedRecord.endpoint.scorers.length === 0 ? (
          <p className="endpoint-muted">No scorers were provided for this match.</p>
        ) : (
          <ul className="endpoint-scorers-list">
            {selectedRecord.endpoint.scorers.map((scorer) => (
              <li key={`${scorer.team}-${scorer.player}-${scorer.minute}-${scorer.type}`}>
                <span className="endpoint-scorer-minute">{`${scorer.minute}'`}</span>
                <span className="endpoint-scorer-main">
                  <strong>{scorer.player}</strong> ({scorer.team})
                </span>
                <span className="endpoint-scorer-meta">
                  {scorer.type}
                  {scorer.assist ? ` | Assist: ${scorer.assist}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="endpoint-simplified-card">
        <h4>Lineups</h4>
        <div className="endpoint-lineups-grid">
          {(["home", "away"] as const).map((side) => {
            const lineup = selectedRecord.endpoint.lineups[side];

            return (
              <section key={side} className="endpoint-lineup-card">
                <h5>{lineup.team}</h5>
                <p className="endpoint-lineup-meta">
                  Formation: {lineup.formation} | Coach: {lineup.coach}
                </p>

                <div className="endpoint-lineup-columns">
                  <section>
                    <h6>Starting XI ({lineup.startingXI.length})</h6>
                    <ol className="endpoint-player-list">
                      {lineup.startingXI.map((player) => (
                        <li key={`${side}-${player.number}-${player.name}-starting`}>
                          <span>#{player.number}</span> {player.name} ({player.position})
                        </li>
                      ))}
                    </ol>
                  </section>

                  <section>
                    <h6>Bench ({lineup.bench.length})</h6>
                    {lineup.bench.length === 0 ? (
                      <p className="endpoint-muted">No bench players listed.</p>
                    ) : (
                      <ul className="endpoint-player-list">
                        {lineup.bench.map((player) => (
                          <li key={`${side}-${player.number}-${player.name}-bench`}>
                            <span>#{player.number}</span> {player.name} ({player.position})
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              </section>
            );
          })}
        </div>
      </article>
    </section>
  );
}
