import { useState } from "react"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import History from "./pages/History"

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard")

  return (
    <div className="min-h-screen bg-slate-950">

      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      {currentPage === "dashboard" && (
        <Home />
      )}

      {currentPage === "history" && (
        <History />
      )}

    </div>
  )
}

export default App