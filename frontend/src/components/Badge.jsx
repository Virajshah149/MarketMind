export const strengthOf = (s) =>
  s >= 0.65 ? { label: "Strong", cls: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" }
  : s >= 0.4 ? { label: "Medium", cls: "border-sky-400/30 bg-sky-400/10 text-sky-300" }
  : { label: "Weak", cls: "border-slate-600 bg-slate-800 text-slate-300" }

export function StrengthBadge({ strength }) {
  const s = strengthOf(strength)
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.label} · {Math.round(strength * 100)}%</span>
}

export function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="pt-12 pb-8">
      <p className="text-sm font-medium text-cyan-400">{eyebrow}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h1>
      {children && <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">{children}</p>}
    </header>
  )
}

export const Spinner = () => <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
