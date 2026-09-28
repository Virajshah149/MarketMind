import { useState } from "react"

function ShockConfig({ company, onSimulate }) {
  const [shockType, setShockType] = useState("raw_material_cost")
  const [severity, setSeverity] = useState("medium")

  const handleSimulate = () => {
    onSimulate({
      company,
      shockType,
      severity,
    })
  }

  return (
    <div className="mt-8 w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-left shadow-xl">

      {/* Header */}
      <div>
        <p className="text-sm font-medium text-cyan-400">
          Simulate a Shock
        </p>

        <h2 className="mt-2 text-xl font-semibold text-white">
          What happens if this company is affected?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Choose the type and severity of the event to see how
          the effect could propagate through connected companies.
        </p>
      </div>

      {/* Shock Type */}
      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Shock type
        </label>

        <select
          value={shockType}
          onChange={(event) => setShockType(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
        >
          <option value="raw_material_cost">
            Raw material cost increase
          </option>

          <option value="supply_disruption">
            Supply disruption
          </option>

          <option value="production_disruption">
            Production disruption
          </option>

          <option value="demand_drop">
            Demand drop
          </option>

          <option value="logistics_disruption">
            Logistics disruption
          </option>
        </select>
      </div>

      {/* Severity */}
      <div className="mt-6">
        <label className="mb-3 block text-sm font-medium text-slate-300">
          Shock severity
        </label>

        <div className="grid grid-cols-3 gap-3">

          <button
            type="button"
            onClick={() => setSeverity("low")}
            className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
              severity === "low"
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600"
            }`}
          >
            Low
          </button>

          <button
            type="button"
            onClick={() => setSeverity("medium")}
            className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
              severity === "medium"
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600"
            }`}
          >
            Medium
          </button>

          <button
            type="button"
            onClick={() => setSeverity("high")}
            className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
              severity === "high"
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600"
            }`}
          >
            High
          </button>

        </div>
      </div>

      {/* Simulate */}
      <button
        type="button"
        onClick={handleSimulate}
        className="mt-6 w-full rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
      >
        Simulate Shock →
      </button>

    </div>
  )
}

export default ShockConfig