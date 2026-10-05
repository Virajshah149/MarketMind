import { useState } from "react"

const items = [
  { id: "dashboard", label: "Dashboard" },
  { id: "companies", label: "Companies" },
  { id: "history", label: "History" },
]

export default function Navbar({ currentPage, onNavigate }) {
  const [open, setOpen] = useState(false)
  const go = (id) => { onNavigate(id); setOpen(false) }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <button type="button" onClick={() => go("dashboard")} className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 text-sm font-black text-slate-950">M</span>
          <span className="text-lg font-bold tracking-tight text-white">Market<span className="text-cyan-400">Mind</span></span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {items.map((i) => (
            <button key={i.id} type="button" onClick={() => go(i.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${currentPage === i.id ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}>
              {i.label}
            </button>
          ))}
        </div>

        <button type="button" aria-label="Menu" onClick={() => setOpen(!open)}
          className="rounded-lg border border-slate-800 px-3 py-1.5 text-slate-300 md:hidden">{open ? "✕" : "☰"}</button>
      </div>

      {open && (
        <div className="border-t border-slate-800 px-6 py-3 md:hidden">
          {items.map((i) => (
            <button key={i.id} type="button" onClick={() => go(i.id)}
              className={`block w-full rounded-lg px-4 py-3 text-left text-sm ${currentPage === i.id ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400"}`}>{i.label}</button>
          ))}
        </div>
      )}
    </nav>
  )
}
