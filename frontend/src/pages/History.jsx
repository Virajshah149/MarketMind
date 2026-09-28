import { useState } from "react"
import historicalEvents from "../data/historicalEvents"

function History() {
  const [selectedEvent, setSelectedEvent] = useState(null)

  /*
   * ---------------------------------------------------------
   * Severity styling
   * ---------------------------------------------------------
   */

  const getSeverityStyle = (severity) => {
    if (severity === "High") {
      return "border-red-400/30 bg-red-400/10 text-red-300"
    }

    if (severity === "Medium") {
      return "border-amber-400/30 bg-amber-400/10 text-amber-300"
    }

    return "border-slate-700 bg-slate-800 text-slate-300"
  }

  /*
   * ---------------------------------------------------------
   * Strength styling
   * ---------------------------------------------------------
   */

  const getStrength = (strength) => {
    if (strength >= 0.65) {
      return {
        label: "Strong",
        className:
          "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
      }
    }

    if (strength >= 0.4) {
      return {
        label: "Medium",
        className:
          "border-sky-400/30 bg-sky-400/10 text-sky-300",
      }
    }

    return {
      label: "Weak",
      className:
        "border-slate-700 bg-slate-800 text-slate-300",
    }
  }

  /*
   * ---------------------------------------------------------
   * Event list
   * ---------------------------------------------------------
   */

  if (!selectedEvent) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">

        {/* Header */}
        <section>
          <p className="text-sm font-medium text-cyan-400">
            Historical Analysis
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Did this actually happen?
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400">
            Explore historical events and see how dependency
            relationships can be compared with observed market
            movements.
          </p>
        </section>

        {/* Information banner */}
        <div className="mt-10 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">

          <div className="flex gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              ↗
            </div>

            <div>
              <p className="font-medium text-white">
                Historical validation
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                MarketMind uses historical events as evidence to
                examine whether observed company movements are
                consistent with dependency relationships.
              </p>
            </div>

          </div>

        </div>

        {/* Event list */}
        <section className="mt-10">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-semibold text-white">
                Historical events
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select an event to inspect its propagation.
              </p>
            </div>

            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-500">
              {historicalEvents.length} events
            </span>

          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {historicalEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelectedEvent(event)}
                className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-900"
              >

                {/* Event top */}
                <div className="flex items-start justify-between gap-3">

                  <span className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-400">
                    {event.category}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getSeverityStyle(
                      event.severity
                    )}`}
                  >
                    {event.severity}
                  </span>

                </div>

                {/* Title */}
                <h3 className="mt-5 text-lg font-semibold text-white group-hover:text-cyan-300">
                  {event.title}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {event.period} · {event.date}
                </p>

                {/* Summary */}
                <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-400">
                  {event.summary}
                </p>

                {/* Origin */}
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-600">
                    Origin
                  </p>

                  <p className="mt-2 font-medium text-white">
                    {event.originCompany.company_name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {event.originCompany.ticker}
                  </p>

                </div>

                {/* Button */}
                <div className="mt-5 flex items-center justify-between text-sm">

                  <span className="text-slate-500">
                    View analysis
                  </span>

                  <span className="text-cyan-400 transition group-hover:translate-x-1">
                    →
                  </span>

                </div>

              </button>
            ))}

          </div>
        </section>

      </main>
    )
  }

  /*
   * ---------------------------------------------------------
   * EVENT DETAIL
   * ---------------------------------------------------------
   */

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">

      {/* Back */}
      <button
        type="button"
        onClick={() => setSelectedEvent(null)}
        className="mb-8 text-sm text-slate-500 transition hover:text-white"
      >
        ← Back to historical events
      </button>

      {/* Header */}
      <section>

        <div className="flex flex-wrap items-center gap-3">

          <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
            {selectedEvent.category}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${getSeverityStyle(
              selectedEvent.severity
            )}`}
          >
            {selectedEvent.severity} severity
          </span>

          <span className="text-xs text-slate-600">
            {selectedEvent.period}
          </span>

        </div>

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-5xl">
          {selectedEvent.title}
        </h1>

        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400">
          {selectedEvent.eventDescription}
        </p>

      </section>

      {/* =====================================================
          EVENT SUMMARY
          ===================================================== */}

      <section className="mt-10 grid gap-5 md:grid-cols-3">

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

          <p className="text-xs uppercase tracking-wider text-slate-600">
            Event date
          </p>

          <p className="mt-2 text-lg font-semibold text-white">
            {selectedEvent.date}
          </p>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

          <p className="text-xs uppercase tracking-wider text-slate-600">
            Origin company
          </p>

          <p className="mt-2 text-lg font-semibold text-white">
            {selectedEvent.originCompany.company_name}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {selectedEvent.originCompany.ticker}
          </p>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

          <p className="text-xs uppercase tracking-wider text-slate-600">
            Companies affected
          </p>

          <p className="mt-2 text-lg font-semibold text-cyan-300">
            {selectedEvent.propagation.length}
          </p>

        </div>

      </section>

      {/* =====================================================
          PROPAGATION CHAIN
          ===================================================== */}

      <section className="mt-10">

        <div>
          <p className="text-sm font-medium text-cyan-400">
            Dependency chain
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-white">
            How the event propagated
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Each hop represents another layer of dependency.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">

          {selectedEvent.propagation.map(
            (company, index) => {
              const strength = getStrength(
                company.dependencyStrength
              )

              return (
                <div key={company.company_id}>

                  <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">

                    {/* Company */}
                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-sm font-bold text-cyan-300">
                        {company.hop}
                      </div>

                      <div>

                        <p className="font-semibold text-white">
                          {company.company_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {company.ticker}
                        </p>

                      </div>

                    </div>

                    {/* Metrics */}
                    <div className="flex flex-wrap items-center gap-3">

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${strength.className}`}
                      >
                        {strength.label} dependency
                      </span>

                      <span className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400">
                        Simulated impact:{" "}
                        <span className="text-white">
                          {company.simulatedImpact}%
                        </span>
                      </span>

                      <span className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400">
                        Observed movement:{" "}
                        <span
                          className={
                            company.actualMovement >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }
                        >
                          {company.actualMovement > 0
                            ? "+"
                            : ""}
                          {company.actualMovement}%
                        </span>
                      </span>

                    </div>

                  </div>

                  {/* Connector */}
                  {index <
                    selectedEvent.propagation.length -
                      1 && (
                    <div className="px-6">
                      <div className="h-px bg-slate-800" />
                    </div>
                  )}

                </div>
              )
            }
          )}

        </div>

      </section>

      {/* =====================================================
          SIMULATION VS OBSERVATION
          ===================================================== */}

      <section className="mt-10">

        <div>
          <p className="text-sm font-medium text-cyan-400">
            Market observation
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-white">
            Simulated impact vs observed movement
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            The simulation represents dependency propagation.
            Observed movement represents the historical market
            data stored for this demonstration.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px] text-left">

              <thead className="border-b border-slate-800 bg-slate-950">

                <tr>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Company
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Hop
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Dependency
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Simulated
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Observed
                  </th>

                </tr>

              </thead>

              <tbody>

                {selectedEvent.propagation.map(
                  (company) => (
                    <tr
                      key={company.company_id}
                      className="border-b border-slate-800 last:border-0"
                    >

                      <td className="px-6 py-5">

                        <p className="font-medium text-white">
                          {company.company_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {company.ticker}
                        </p>

                      </td>

                      <td className="px-6 py-5 text-sm text-slate-400">
                        {company.hop}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-400">
                        {(company.dependencyStrength * 100).toFixed(
                          0
                        )}
                        %
                      </td>

                      <td className="px-6 py-5">

                        <span className="text-sm font-medium text-cyan-300">
                          {company.simulatedImpact}%
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`text-sm font-medium ${
                            company.actualMovement >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {company.actualMovement > 0
                            ? "+"
                            : ""}
                          {company.actualMovement}%
                        </span>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>

      {/* =====================================================
          EVIDENCE
          ===================================================== */}

      <section className="mt-10">

        <div>
          <p className="text-sm font-medium text-cyan-400">
            Evidence
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-white">
            Supporting information
          </h2>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">

          {selectedEvent.evidence.map(
            (item, index) => (
              <div
                key={`${item.source}-${index}`}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
              >

                <div className="flex items-center justify-between">

                  <p className="font-medium text-white">
                    {item.source}
                  </p>

                  <span className="rounded-md bg-slate-950 px-2 py-1 text-xs text-slate-500">
                    {item.period}
                  </span>

                </div>

                <p className="mt-4 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>

              </div>
            )
          )}

        </div>

        <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">

          <p className="text-xs leading-5 text-amber-300/80">
            Frontend demonstration data only. Historical event
            values and evidence will be replaced with verified
            annual-report and market-data sources when the backend
            data pipeline is connected.
          </p>

        </div>

      </section>

    </main>
  )
}

export default History