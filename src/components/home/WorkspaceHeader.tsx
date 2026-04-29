interface WorkspaceHeaderProps {
  isLoading: boolean;
  hasEndpoints: boolean;
  onOpenApi: () => void;
  onExport: () => void;
  onReload: () => void;
}

export function WorkspaceHeader({
  isLoading,
  hasEndpoints,
  onOpenApi,
  onExport,
  onReload,
}: WorkspaceHeaderProps) {
  return (
    <header className="workspace-header">
      <div>
        <p className="workspace-eyebrow">Paris 2024 Football</p>
        <h1>footy-scores</h1>
        <p className="workspace-subtitle">
          Compact fixture list for inspection. Select any match to review generated payload details and source data.
        </p>
      </div>

      <div className="workspace-actions">
        <button className="control-button secondary" onClick={onOpenApi} type="button">
          Open API JSON
        </button>
        <button className="control-button secondary" onClick={onExport} disabled={!hasEndpoints} type="button">
          Export All
        </button>
        <button className="control-button" onClick={onReload} disabled={isLoading} type="button">
          {isLoading ? "Refreshing..." : "Reload Matches"}
        </button>
      </div>
    </header>
  );
}
