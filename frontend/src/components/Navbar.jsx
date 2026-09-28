function Navbar({ currentPage, onNavigate }) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
    },
    {
      id: "companies",
      label: "Companies",
    },
    {
      id: "history",
      label: "History",
    },
  ]

  return (
    <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className="text-xl font-bold tracking-tight text-white"
        >
          Market<span className="text-cyan-400">Mind</span>
        </button>

        {/* Navigation */}
        <div className="flex items-center gap-2">

          {navItems.map((item) => {

            const isActive =
              currentPage === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {

                  /*
                   * Companies page isn't built yet.
                   * Keep the button visually available but
                   * send the user to dashboard for now.
                   */
                  if (item.id === "companies") {
                    onNavigate("dashboard")
                    return
                  }

                  onNavigate(item.id)
                }}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  isActive
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            )
          })}

        </div>

      </div>

    </nav>
  )
}

export default Navbar