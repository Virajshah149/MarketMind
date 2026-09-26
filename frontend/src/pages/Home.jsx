function Home() {
  return (
    <main className="mx-auto max-w-7xl px-6">

      {/* Hero */}
      <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">

        <div className="mb-4 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
          Supply Chain Risk Intelligence
        </div>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white md:text-7xl">
          See how a shock
          <span className="text-cyan-400"> spreads.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          MarketMind maps dependencies between companies and
          shows how supply-chain disruptions can propagate through
          the network.
        </p>

        {/* Search */}
        <div className="mt-10 w-full max-w-xl">

          <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 shadow-lg">

            <span className="mr-3 text-slate-500">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search for a company..."
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />

          </div>

          <button className="mt-4 rounded-xl bg-cyan-500 px-8 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
            Simulate a Shock
          </button>

        </div>

      </section>

    </main>
  )
}

export default Home