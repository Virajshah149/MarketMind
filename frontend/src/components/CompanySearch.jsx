import { useState } from "react"
import mockCompanies from "../data/mockCompanies"

function CompanySearch({ onCompanySelect }) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  const filteredCompanies = mockCompanies.filter((company) =>
    company.company_name.toLowerCase().includes(search.toLowerCase()) ||
    company.ticker.toLowerCase().includes(search.toLowerCase()) ||
    company.sector.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative w-full max-w-xl">

      {/* Search box */}
      <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 shadow-lg">

        <span className="mr-3 text-slate-500">
          🔍
        </span>

        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setOpen(true)
          }}
          placeholder="Search company, ticker, or sector..."
          className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
        />

      </div>

      {/* Search results */}
      {search.length > 0 && open && (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">

          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <button
                key={company.company_id}
                onClick={() => {
                  onCompanySelect(company)
                  setSearch(company.company_name)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between border-b border-slate-800 px-5 py-4 text-left transition hover:bg-slate-800"
              >

                <div>
                  <p className="font-medium text-white">
                    {company.company_name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {company.exchange}: {company.ticker}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {company.sector} · {company.industry}
                  </p>
                </div>

                <span className="text-slate-500">
                  →
                </span>

              </button>
            ))
          ) : (
            <div className="px-5 py-4 text-slate-500">
              No companies found.
            </div>
          )}

        </div>
      )}

    </div>
  )
}

export default CompanySearch