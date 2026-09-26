function Navbar() {
  return (
    <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <div className="text-xl font-bold tracking-tight text-white">
          Market<span className="text-cyan-400">Mind</span>
        </div>

        <div className="flex items-center gap-8 text-sm text-slate-400">
          <button className="transition hover:text-white">
            Dashboard
          </button>

          <button className="transition hover:text-white">
            Companies
          </button>

          <button className="transition hover:text-white">
            History
          </button>
        </div>

      </div>
    </nav>
  )
}

export default Navbar