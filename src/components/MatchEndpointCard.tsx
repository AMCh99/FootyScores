import type { GeneratedMatchRecord } from "@/lib/types/domain";

interface MatchEndpointCardProps {
  record: GeneratedMatchRecord;
}

export function MatchEndpointCard({ record }: MatchEndpointCardProps) {
  return (
    <article className="match-card">
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
      <pre>{JSON.stringify(record.endpoint, null, 2)}</pre>
    </article>
  );
}
