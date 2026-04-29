import { GeneratedEndpointPanel } from "@/components/home/GeneratedEndpointPanel";
import { MatchDetailSummary } from "@/components/home/MatchDetailSummary";
import { SourceContextPanel } from "@/components/home/SourceContextPanel";
import type { EndpointViewMode } from "@/components/home/matchDetailTypes";
import type { GeneratedMatchRecord, MatchSourceContext } from "@/lib/types/domain";

export type { EndpointViewMode } from "@/components/home/matchDetailTypes";

interface MatchDetailPanelProps {
  selectedRecord: GeneratedMatchRecord;
  endpointViewMode: EndpointViewMode;
  onEndpointViewModeChange: (mode: EndpointViewMode) => void;
  showSourceContext: boolean;
  isSourceContextLoading: boolean;
  sourceContextError: string;
  selectedSourceContext: MatchSourceContext | undefined;
  onOpenSingleMatchApi: (matchCode: string) => void;
  onExportSingleMatch: (record: GeneratedMatchRecord) => void;
  onToggleSourceContext: () => void;
  formatDateTime: (value: string) => string;
  getStatusTone: (status: string) => "status-live" | "status-finished" | "status-scheduled";
}

export function MatchDetailPanel({
  selectedRecord,
  endpointViewMode,
  onEndpointViewModeChange,
  showSourceContext,
  isSourceContextLoading,
  sourceContextError,
  selectedSourceContext,
  onOpenSingleMatchApi,
  onExportSingleMatch,
  onToggleSourceContext,
  formatDateTime,
  getStatusTone,
}: MatchDetailPanelProps) {
  return (
    <section className="match-detail-panel" aria-live="polite">
      <MatchDetailSummary
        selectedRecord={selectedRecord}
        showSourceContext={showSourceContext}
        isSourceContextLoading={isSourceContextLoading}
        onOpenSingleMatchApi={onOpenSingleMatchApi}
        onExportSingleMatch={onExportSingleMatch}
        onToggleSourceContext={onToggleSourceContext}
        formatDateTime={formatDateTime}
        getStatusTone={getStatusTone}
      />

      <section className={`endpoint-inspection${showSourceContext ? " with-context" : ""}`}>
        <GeneratedEndpointPanel
          selectedRecord={selectedRecord}
          endpointViewMode={endpointViewMode}
          onEndpointViewModeChange={onEndpointViewModeChange}
          formatDateTime={formatDateTime}
        />

        {showSourceContext && (
          <SourceContextPanel
            isSourceContextLoading={isSourceContextLoading}
            sourceContextError={sourceContextError}
            selectedSourceContext={selectedSourceContext}
          />
        )}
      </section>
    </section>
  );
}
