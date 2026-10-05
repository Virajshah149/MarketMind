import { useMemo, useState } from "react"
import mockCompanies from "../data/mockCompanies"
import dependencyData from "../data/dependencyData"

const POS = {
  CMP001: [80, 170],
  CMP002: [250, 78],
  CMP004: [250, 262],
  CMP003: [440, 78],
  CMP005: [440, 262],
}
const SEVERITY = { low: 0.4, medium: 0.7, high: 1 }
const byId = Object.fromEntries(mockCompanies.map((c) => [c.company_id, c]))

const edges = Object.entries(dependencyData).flatMap(([s, targets]) =>
  Object.entries(targets)
    .filter(([d]) => POS[s] && POS[d])
    .map(([d, r]) => ({ s, d, strength: r.strength }))
)

// Best (strongest) path strength from the origin to every company, up to a few hops
function spread(origin) {
  const best = { [origin]: 1 }
  for (let i = 0; i < 4; i++) {
    for (const [s, v] of Object.entries({ ...best })) {
      for (const [d, r] of Object.entries(dependencyData[s] || {})) {
        const x = v * r.strength
        if (d !== origin && x > (best[d] || 0)) best[d] = x
      }
    }
  }
  return best
}

export default function LiveDemo({ onOpen }) {
  const [origin, setOrigin] = useState("CMP001")
  const [severity, setSeverity] = useState("medium")
  const best = useMemo(() => spread(origin), [origin])
  const impact = (id) => (id === origin ? 100 : Math.round((best[id] || 0) * SEVERITY[severity] * 100))
  const ranked = mockCompanies.filter((c) => POS[c.company_id]).sort((a, b) => impact(b.company_id) - impact(a.company_id))

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            Shock starts at <strong className="text-white">{byId[origin].company_name}</strong>
          </p>
          <div className="flex gap-2" role="group" aria-label="Shock severity">
            {Object.keys(SEVERITY).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={severity === s}
                onClick={() => setSeverity(s)}
                className={`rounded-lg border px-4 py-1.5 text-sm font-medium capitalize transition ${
                  severity === s ? "border-cyan-400 bg-cyan-400/10 text-cyan-300" : "border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <svg viewBox="0 0 560 340" className="mt-4 h-auto w-full" role="group" aria-label="Company network. Select a company to start a shock there.">
          {edges.map((e) => {
            const [x1, y1] = POS[e.s]
            const [x2, y2] = POS[e.d]
            const active = best[e.s] !== undefined && best[e.d] !== undefined
            return (
              <line
                key={e.s + e.d}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={active ? "#b45309" : "#bcd3d9"}
                strokeWidth={1.5 + e.strength * 3}
                strokeOpacity={active ? 0.75 : 0.6}
                strokeDasharray={active ? "7 6" : "0"}
                style={{ transition: "stroke .4s, stroke-opacity .4s" }}
              />
            )
          })}

          {Object.entries(POS).map(([id, [x, y]]) => {
            const c = byId[id]
            const pct = impact(id)
            const isOrigin = id === origin
            const a = 0.1 + (pct / 100) * 0.6
            return (
              <g
                key={id}
                role="button"
                tabIndex={0}
                aria-pressed={isOrigin}
                aria-label={`Start shock at ${c.company_name}`}
                className="cursor-pointer outline-none [&:focus-visible>circle:last-of-type]:stroke-[#4f46e5]"
                onClick={() => setOrigin(id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOrigin(id))}
              >
                {isOrigin && <circle key={origin} className="mm-pulse" cx={x} cy={y} r="34" fill="none" stroke="#0e8b99" strokeWidth="3" />}
                <circle
                  cx={x}
                  cy={y}
                  r="34"
                  fill={isOrigin ? "#0e8b99" : pct > 0 ? `rgba(217,119,6,${a})` : "#ffffff"}
                  stroke={isOrigin ? "#0a6f7b" : pct > 0 ? "#b45309" : "#8aa3ab"}
                  strokeWidth="2.5"
                  style={{ transition: "fill .5s, stroke .5s" }}
                />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={isOrigin ? "#fff" : "#17232a"} fontFamily="Inter, system-ui, sans-serif">
                  {isOrigin ? "Origin" : pct > 0 ? `${pct}%` : "–"}
                </text>
                <text x={x} y={y + 56} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#33454d" fontFamily="Inter, system-ui, sans-serif">
                  {c.company_name}
                </text>
              </g>
            )
          })}
        </svg>
        <p className="text-center text-xs text-slate-500">Click any company to move the starting point.</p>
      </div>

      <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white">Estimated impact</h3>
        <p className="mt-1 text-sm text-slate-500">Each link multiplies the shock by its strength, so the effect weakens with every hop.</p>
        <ul className="mt-5 space-y-4">
          {ranked.map((c) => {
            const pct = impact(c.company_id)
            return (
              <li key={c.company_id}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-white">{c.company_name}</span>
                  <span className="text-slate-400">{c.company_id === origin ? "Origin" : pct > 0 ? `${pct}%` : "Not affected"}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${c.company_id === origin ? "bg-cyan-400" : "bg-amber-300"}`}
                    style={{ width: `${pct}%`, transition: "width .6s ease" }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
        <button
          type="button"
          onClick={() => onOpen?.(byId[origin])}
          className="mt-auto rounded-xl bg-cyan-500 px-5 py-3 pt-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Open {byId[origin].company_name} in the full simulator
        </button>
      </div>
    </div>
  )
}
