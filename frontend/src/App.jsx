import { useState } from "react"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import History from "./pages/History"
import Companies from "./pages/Companies"

export default function App() {
  const [page, setPage] = useState("dashboard")
  const [startCompany, setStartCompany] = useState(null)

  const navigate = (id) => { setStartCompany(null); setPage(id); window.scrollTo(0, 0) }
  const simulate = (company) => { setStartCompany(company); setPage("dashboard"); window.scrollTo(0, 0) }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-200 antialiased">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(14,139,153,0.12),transparent_65%)]" />
      <div className="relative">
        <Navbar currentPage={page} onNavigate={navigate} />
        {page === "dashboard" && <Home key={startCompany?.company_id ?? "home"} initialCompany={startCompany} onNavigate={navigate} />}
        {page === "companies" && <Companies onSimulate={simulate} />}
        {page === "history" && <History />}
        <Footer />
      </div>
    </div>
  )
}
