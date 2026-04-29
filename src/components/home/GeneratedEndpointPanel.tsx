import { EndpointSimplifiedView } from "@/components/home/EndpointSimplifiedView";
import type { EndpointViewMode } from "@/components/home/matchDetailTypes";
import type { GeneratedMatchRecord } from "@/lib/types/domain";

interface GeneratedEndpointPanelProps {
  selectedRecord: GeneratedMatchRecord;
  endpointViewMode: EndpointViewMode;
  onEndpointViewModeChange: (mode: EndpointViewMode) => void;
  formatDateTime: (value: string) => string;
}

export function GeneratedEndpointPanel({
  selectedRecord,
  endpointViewMode,
  onEndpointViewModeChange,
  formatDateTime,
}: GeneratedEndpointPanelProps) {
  return (
    <article className="generated-endpoint-panel">
      <div className="generated-endpoint-header">
        <h3>Generated Endpoint</h3>

        <div className="endpoint-view-toggle" role="group" aria-label="Generated endpoint view mode">
          <button
            className={`endpoint-view-button${endpointViewMode === "json" ? " active" : ""}`}
            onClick={() => onEndpointViewModeChange("json")}
            type="button"
          >
            JSON
          </button>
          <button
            className={`endpoint-view-button${endpointViewMode === "simplified" ? " active" : ""}`}
            onClick={() => onEndpointViewModeChange("simplified")}
            type="button"
          >
            Simplified
          </button>
        </div>
      </div>

      {endpointViewMode === "json" ? (
        <pre>{JSON.stringify(selectedRecord.endpoint, null, 2)}</pre>
      ) : (
        <EndpointSimplifiedView selectedRecord={selectedRecord} formatDateTime={formatDateTime} />
      )}
    </article>
  );
}
