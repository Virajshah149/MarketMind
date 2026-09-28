import { useState } from "react"
import CompanySearch from "../components/CompanySearch"
import ShockConfig from "../components/ShockConfig"
import DependencyGraph from "../components/DependencyGraph"

function Home() {
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [shockResult, setShockResult] = useState(null)

  const handleCompanySelect = (company) => {
    setSelectedCompany(company)
    setShockResult(null)
  }

  const handleSimulate = (simulation) => {
    setShockResult(simulation)
  }

  return (
    <main className="mx-auto max-w-7xl px-6">
      <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">

        {/* Badge */}
        <div className="mb-4 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
          Supply Chain Risk Intelligence
        </div>

        {/* Heading */}
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white md:text-7xl">
          See how a shock
          <span className="text-cyan-400"> spreads.</span>
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          MarketMind maps dependencies between companies and
          shows how supply-chain disruptions can propagate through
          the network.
        </p>

        {/* Company Search */}
        <div className="mt-10 w-full max-w-xl">
          <CompanySearch
            onCompanySelect={handleCompanySelect}
          />

          {/* Selected Company */}
          {selectedCompany && (
            <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-left">
              <p className="text-sm text-cyan-300">
                Selected company
              </p>

              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">
                    {selectedCompany.company_name}
                  </p>

                  <p className="text-sm text-slate-400">
                    {selectedCompany.exchange}: {selectedCompany.ticker}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedCompany.sector} · {selectedCompany.industry}
                  </p>
                </div>

                <span className="rounded-lg bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
                  Selected
                </span>
              </div>
            </div>
          )}

          {/* Shock Configuration */}
          {selectedCompany && (
            <ShockConfig
              company={selectedCompany}
              onSimulate={handleSimulate}
            />
          )}

          {/* Dependency Graph */}
          {shockResult && (
            <DependencyGraph
              company={shockResult.company}
              severity={shockResult.severity}
            />
          )}
        </div>
      </section>
    </main>
  )
}

export default Home