import { useEffect, useMemo, useState } from "react"
import { getCompanies, getCompanyProfile, getDependencyCounts } from "../services/api"
import { PageHeader, Spinner, StrengthBadge } from "../components/Badge"

function Links({ title, rows, empty }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <h3 className="font-semibold text-white">{title} <span className="ml-1 text-sm text-slate-500">{rows.length}</span></h3>
      {rows.length === 0 ? <p className="mt-4 text-sm text-slate-500">{empty}</p> : (
        <ul className="mt-4 divide-y divide-slate-800">
          {rows.map((r) => (
            <li key={r.company.company_id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium text-white">{r.company.company_name}</p>
                <p className="text-xs text-slate-500">{r.company.ticker} · {r.relationship}</p>
              </div>
              <StrengthBadge strength={r.strength} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Detail({ id, onBack, onSimulate }) {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => { getCompanyProfile(id).then(setProfile).catch((e) => setError(e.message)) }, [id])

  if (error) return <p className="py-20 text-center text-red-300">{error}</p>
  if (!profile) return <div className="flex justify-center py-24"><Spinner /></div>
  const { company: c, customers, suppliers } = profile
  const evidence = [...customers, ...suppliers][0]?.evidence

  return (
    <div className="pt-10">
      <button type="button" onClick={onBack} className="text-sm text-slate-500 transition hover:text-white">← All companies</button>
      <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-cyan-400">{c.exchange}: {c.ticker}</p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-white">{c.company_name}</h1>
          <p className="mt-2 text-slate-400">{c.legal_name}</p>
        </div>
        <button type="button" onClick={() => onSimulate(c)} className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">Simulate shock →</button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Sector", c.sector], ["Industry", c.industry], ["Suppliers", suppliers.length], ["Customers", customers.length]].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-600">{k}</p>
            <p className="mt-2 text-lg font-semibold text-white">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Links title="Suppliers (upstream)" rows={suppliers} empty="No upstream dependencies mapped." />
        <Links title="Customers (downstream)" rows={customers} empty="No downstream dependencies mapped." />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="font-semibold text-white">Evidence</h3>
        {evidence ? (
          <p className="mt-3 text-sm text-slate-400">{evidence.source} · {evidence.period} <span className="text-slate-600">— {evidence.note}</span></p>
        ) : <p className="mt-3 text-sm text-slate-500">No evidence available for this company yet.</p>}
      </div>
    </div>
  )
}

export default function Companies({ onSimulate }) {
  const [companies, setCompanies] = useState(null)
  const [counts, setCounts] = useState({})
  const [error, setError] = useState(null)
  const [query, setQuery] = useState("")
  const [sector, setSector] = useState("All")
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    Promise.all([getCompanies(), getDependencyCounts()])
      .then(([c, d]) => { setCompanies(c); setCounts(d) })
      .catch(() => setError("Backend unavailable. Please try again."))
  }, [])

  const sectors = useMemo(() => ["All", ...new Set((companies || []).map((c) => c.sector))], [companies])
  const filtered = useMemo(() => (companies || []).filter((c) =>
    (sector === "All" || c.sector === sector) &&
    [c.company_name, c.ticker, c.sector].some((f) => f.toLowerCase().includes(query.toLowerCase()))), [companies, query, sector])

  if (selected) return <main className="mx-auto max-w-7xl px-6"><Detail id={selected} onBack={() => setSelected(null)} onSimulate={onSimulate} /></main>

  return (
    <main className="mx-auto max-w-7xl px-6">
      <PageHeader eyebrow="Company universe" title="Companies">Browse tracked companies and inspect their supplier and customer dependencies.</PageHeader>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, ticker or sector..."
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 md:max-w-md" />
        <div className="flex flex-wrap gap-2">
          {sectors.map((s) => (
            <button key={s} type="button" onClick={() => setSector(s)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${sector === s ? "border-cyan-400 bg-cyan-400/10 text-cyan-300" : "border-slate-700 text-slate-400 hover:border-slate-600"}`}>{s}</button>
          ))}
        </div>
      </div>

      {error && <p className="mt-16 text-center text-red-300">{error}</p>}
      {!error && !companies && <div className="flex justify-center py-24"><Spinner /></div>}
      {companies && filtered.length === 0 && <p className="mt-16 text-center text-slate-500">No companies found.</p>}

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => {
          const d = counts[c.company_id] || { suppliers: 0, customers: 0 }
          return (
            <button key={c.company_id} type="button" onClick={() => setSelected(c.company_id)}
              className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left transition hover:-translate-y-1 hover:border-cyan-400/30">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-sm font-bold text-cyan-300">{c.company_name[0]}</span>
                <span className="rounded-md bg-slate-950 px-2 py-1 text-xs text-slate-500">{c.exchange}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white group-hover:text-cyan-300">{c.company_name}</h3>
              <p className="mt-1 text-sm text-slate-500">{c.ticker} · {c.sector}</p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-sm">
                <span className="text-slate-400">{d.suppliers} suppliers · {d.customers} customers</span>
                <span className="text-cyan-400 transition group-hover:translate-x-1">→</span>
              </div>
            </button>
          )
        })}
      </div>
    </main>
  )
}
