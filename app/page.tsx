import MatchTable from "./components/MatchTable";
import { matches } from "./data/matches";

export default function Home() {
  const menMatches = matches.filter((m) => m.gender === "Men");
  const womenMatches = matches.filter((m) => m.gender === "Women");

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-md">
        <div className="mx-auto max-w-screen-xl px-6 py-5 flex items-center gap-3">
          <span className="text-3xl">⚽</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">FootyScores</h1>
            <p className="text-sm text-green-200 mt-0.5">
              Paris 2024 Olympic Football – API Endpoint Reference
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-6 py-8 space-y-10">
        {/* Info Banner */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <strong>QA Reference Tool:</strong> This page lists every football
          match played during the Paris 2024 Olympic Games along with its
          expected API endpoint. Use these endpoints as reference values in your
          automated tests to validate the FootyScores API.
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Matches", value: matches.length },
            { label: "Men's Matches", value: menMatches.length },
            { label: "Women's Matches", value: womenMatches.length },
            {
              label: "Venues",
              value: new Set(matches.map((m) => m.venue)).size,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm"
            >
              <p className="text-3xl font-bold text-green-700">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Men's Matches */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="inline-block h-5 w-1.5 rounded-full bg-green-600" />
            Men&apos;s Football
          </h2>
          <MatchTable matches={menMatches} />
        </section>

        {/* Women's Matches */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="inline-block h-5 w-1.5 rounded-full bg-pink-500" />
            Women&apos;s Football
          </h2>
          <MatchTable matches={womenMatches} />
        </section>
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-400">
        FootyScores · Paris 2024 Olympic Games Football · QA Reference Tool
      </footer>
    </div>
  );
}

