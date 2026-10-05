// Pure-CSS bars: simulated impact (index, 0-100) vs observed price movement (%).
export default function MovementChart({ data }) {
  const maxMove = Math.max(...data.map((d) => Math.abs(d.actualMovement)), 1)
  return (
    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="mb-5 flex flex-wrap gap-5 text-xs text-slate-400">
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-cyan-400" />Simulated impact (index)</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />Observed gain</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-red-400" />Observed fall</span>
      </div>
      <div className="space-y-5">
        {data.map((d) => (
          <div key={d.company_id}>
            <p className="mb-2 text-sm font-medium text-white">{d.company_name} <span className="text-xs text-slate-600">· hop {d.hop}</span></p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="h-2.5 flex-1 rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${d.simulatedImpact}%` }} /></div>
                <span className="w-14 text-right text-xs text-cyan-300">{d.simulatedImpact}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2.5 flex-1 rounded-full bg-slate-800"><div className={`h-full rounded-full ${d.actualMovement >= 0 ? "bg-emerald-400" : "bg-red-400"}`} style={{ width: `${(Math.abs(d.actualMovement) / maxMove) * 100}%` }} /></div>
                <span className="w-14 text-right text-xs text-slate-300">{d.actualMovement > 0 ? "+" : ""}{d.actualMovement}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs text-slate-600">The two bar sets use different scales: simulated impact is an index; observed movement is scaled to the largest move in this event.</p>
    </div>
  )
}
