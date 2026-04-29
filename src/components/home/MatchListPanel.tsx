import { type ChangeEvent } from "react";

import { MatchEndpointCard } from "@/components/MatchEndpointCard";
import type { GeneratedMatchRecord, GenerationResult } from "@/lib/types/domain";

export type MatchListGrouping = "all" | "round";
export type MatchGenderFilter = "all" | "men" | "women";

export interface MatchListSection {
  key: string;
  title: string;
  records: GeneratedMatchRecord[];
}

interface MatchListPanelProps {
  result: GenerationResult;
  visibleMatchesCount: number;
  matchListGrouping: MatchListGrouping;
  matchGenderFilter: MatchGenderFilter;
  matchListSections: MatchListSection[];
  selectedMatchCode?: string;
  onGroupingChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onGenderFilterChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onSelectRecord: (record: GeneratedMatchRecord) => void;
  formatDateTime: (value: string) => string;
}

export function MatchListPanel({
  result,
  visibleMatchesCount,
  matchListGrouping,
  matchGenderFilter,
  matchListSections,
  selectedMatchCode,
  onGroupingChange,
  onGenderFilterChange,
  onSelectRecord,
  formatDateTime,
}: MatchListPanelProps) {
  const totalMatchesCount = result.matches.length;
  const hasFilteredView = visibleMatchesCount !== totalMatchesCount;

  return (
    <aside className="match-list-panel" aria-label="Generated football match list">
      <header>
        <h2>Matches</h2>
        <p>
          {visibleMatchesCount} fixtures available
          {hasFilteredView ? ` (of ${totalMatchesCount})` : ""}
        </p>
        <p className="list-meta">Generated at {formatDateTime(result.diagnostics.generatedAt)}</p>

        <div className="match-list-controls">
          <div className="match-list-control-group">
            <label className="match-list-controls-label" htmlFor="match-list-grouping">
              Grouping
            </label>
            <select
              id="match-list-grouping"
              className="match-list-controls-select"
              value={matchListGrouping}
              onChange={onGroupingChange}
            >
              <option value="all">All matches</option>
              <option value="round">By round</option>
            </select>
          </div>

          <div className="match-list-control-group">
            <label className="match-list-controls-label" htmlFor="match-list-gender">
              Gender
            </label>
            <select
              id="match-list-gender"
              className="match-list-controls-select"
              value={matchGenderFilter}
              onChange={onGenderFilterChange}
            >
              <option value="all">All</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
            </select>
          </div>
        </div>
      </header>

      <div className="match-list-scroll">
        {matchListSections.map((section: MatchListSection) => (
          <section key={section.key} className="match-list-section">
            {matchListGrouping === "round" && <h3 className="match-list-section-heading">{section.title}</h3>}

            <div className="match-list-section-items">
              {section.records.map((record: GeneratedMatchRecord) => (
                <MatchEndpointCard
                  key={record.source.matchCode}
                  record={record}
                  isSelected={selectedMatchCode === record.source.matchCode}
                  onOpen={onSelectRecord}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
