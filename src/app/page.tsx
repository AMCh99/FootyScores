"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";

import { MatchEndpointCard } from "@/components/MatchEndpointCard";
import { StatePanel } from "@/components/StatePanel";
import { errorMessages } from "@/lib/errors/messages";
import { exportEndpointsToJson } from "@/lib/export/exportJson";
import type { GenerationResult, SourceMode } from "@/lib/types/domain";
import type { MatchEndpoint } from "@/lib/types/endpoint";

interface ApiErrorResponse {
  error?: {
    title?: string;
    detail?: string;
  };
}

function getErrorMessage(payload: ApiErrorResponse | null): string {
  if (!payload?.error) {
    return errorMessages.generationFailedDetail;
  }

  const title = payload.error.title ?? errorMessages.generationFailedTitle;
  const detail = payload.error.detail ?? errorMessages.generationFailedDetail;

  return `${title}: ${detail}`;
}

function downloadJson(fileName: string, endpoints: MatchEndpoint[]): void {
  const blob = new Blob([exportEndpointsToJson(endpoints)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function HomePage() {
  const [mode, setMode] = useState<SourceMode>("live");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<GenerationResult | null>(null);

  const endpoints = useMemo(() => {
    if (!result) {
      return [];
    }

    return result.matches.map((item: GenerationResult["matches"][number]) => item.endpoint);
  }, [result]);

  const handleGenerate = async (): Promise<void> => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        setResult(null);
        setError(getErrorMessage(payload));
        return;
      }

      const payload = (await response.json()) as GenerationResult;

      setResult(payload);
    } catch {
      setResult(null);
      setError(errorMessages.generationFailedDetail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (): void => {
    if (endpoints.length === 0) {
      return;
    }

    downloadJson("olympic-football-endpoints.json", endpoints);
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <h1>FootyScores Paris 2024 Endpoint Generator</h1>
        <p>
          Generate deterministic, football-only endpoint payloads from official Olympic schedule data.
          Use live mode to call official sources or fixture mode to build from api_examples.
        </p>
        <div className="controls">
          <select
            className="control-select"
            value={mode}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setMode(event.target.value as SourceMode)
            }
            aria-label="Source mode"
            disabled={isLoading}
          >
            <option value="live">Live official source</option>
            <option value="fixture">Fixture mode (api_examples)</option>
          </select>
          <button className="control-button" onClick={handleGenerate} disabled={isLoading} type="button">
            {isLoading ? "Generating..." : "Load and Generate"}
          </button>
          <button
            className="control-button secondary"
            onClick={handleExport}
            disabled={endpoints.length === 0}
            type="button"
          >
            Export JSON
          </button>
        </div>
      </section>

      {isLoading && (
        <StatePanel
          title="Loading Match Data"
          message="Retrieving Olympic football sources and generating endpoint payloads."
        />
      )}

      {!isLoading && error.length > 0 && (
        <StatePanel title={errorMessages.generationFailedTitle} message={error} isError />
      )}

      {!isLoading && !error && result && result.matches.length === 0 && (
        <StatePanel
          title="No Football Matches Found"
          message="No football fixtures were generated from the selected source."
        />
      )}

      {!isLoading && !error && result && result.matches.length > 0 && (
        <>
          <section className="results-header">
            <div>
              <strong>{result.matches.length}</strong> football matches generated
            </div>
            <div className="meta">
              mode={result.diagnostics.sourceMode} | fallbackUsed={String(result.diagnostics.fallbackUsed)} |
              failedEndpoints={result.diagnostics.failedEndpoints.length} | generatedAt=
              {result.diagnostics.generatedAt}
            </div>
          </section>

          <section className="results-grid" aria-label="Generated match endpoints">
            {result.matches.map((record: GenerationResult["matches"][number]) => (
              <MatchEndpointCard key={record.source.matchCode} record={record} />
            ))}
          </section>
        </>
      )}
    </main>
  );
}
