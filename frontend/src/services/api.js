// API layer. Currently backed by mock data; swap bodies for fetch() calls to FastAPI later.
import mockCompanies from "../data/mockCompanies"
import dependencyData from "../data/dependencyData"
import historicalEvents from "../data/historicalEvents"

const delay = (value, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(value), ms))
const byId = Object.fromEntries(mockCompanies.map((c) => [c.company_id, c]))

export const getCompanies = () => delay(mockCompanies)

export const getCompanyProfile = (id) => {
  const company = byId[id]
  if (!company) return Promise.reject(new Error("Company not found"))
  const customers = Object.entries(dependencyData[id] || {}).map(([cid, rel]) => ({ company: byId[cid], ...rel }))
  const suppliers = Object.entries(dependencyData)
    .filter(([, targets]) => targets[id])
    .map(([sid, targets]) => ({ company: byId[sid], ...targets[id] }))
  return delay({ company, customers, suppliers })
}

export const getDependencyCounts = () =>
  delay(Object.fromEntries(mockCompanies.map((c) => {
    const customers = Object.keys(dependencyData[c.company_id] || {}).length
    const suppliers = Object.values(dependencyData).filter((t) => t[c.company_id]).length
    return [c.company_id, { customers, suppliers }]
  })))

export const getHistoricalEvents = () => delay(historicalEvents)
