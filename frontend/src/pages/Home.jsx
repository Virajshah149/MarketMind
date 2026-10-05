import { useEffect, useRef, useState } from "react"
import CompanySearch from "../components/CompanySearch"
import ShockConfig from "../components/ShockConfig"
import DependencyGraph from "../components/DependencyGraph"
import { HeroNetwork, PortScene, FactoryScene, ChartScene, Icon } from "../components/Illustrations"
import mockCompanies from "../data/mockCompanies"
import dependencyData from "../data/dependencyData"
import LiveDemo from "../components/LiveDemo"

const linkCount = Object.values(dependencyData).reduce((n, targets) => n + Object.keys(targets).length, 0)
const sectorCount = new Set(mockCompanies.map((c) => c.sector)).size

const stats = [
  { value: mockCompanies.length, label: "Companies mapped" },
  { value: linkCount, label: "Supplier–customer links" },
  { value: sectorCount, label: "Sectors covered" },
  { value: 5, label: "Shock types to simulate" },
]

const features = [
  {
    icon: "network",
    title: "Dependency mapping",
    text: "See who supplies whom. Every company is connected to its suppliers and customers, with a strength score for each link.",
  },
  {
    icon: "bolt",
    title: "Shock simulation",
    text: "Pick a company, choose an event such as a cost increase or a logistics failure, and set how severe it is.",
  },
  {
    icon: "doc",
    title: "Evidence for every link",
    text: "Each relationship comes with an explanation and the source it was drawn from, so you can check the reasoning.",
  },
  {
    icon: "clock",
    title: "Historical replays",
    text: "Compare what the model predicted with how the market actually moved in past supply-chain events.",
  },
]

const steps = [
  { title: "Choose a company", text: "Search by name, ticker or sector to pick the company where the disruption begins." },
  { title: "Set the shock", text: "Select the type of event and how severe it is: low, medium or high." },
  { title: "Follow the spread", text: "Watch the impact travel hop by hop through suppliers and customers on the dependency graph." },
]

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

const faqs = [
  { q: "Are the numbers real?", a: "Not yet. The links, evidence and market values in this prototype are illustrative. They are there to show how the model works." },
  { q: "Which shocks can I simulate?", a: "Raw material cost increase, supply disruption, production disruption, demand drop and logistics disruption, each at low, medium or high severity." },
  { q: "How is the impact calculated?", a: "Every link has a strength between 0 and 1. The shock is multiplied by that strength at each hop, so the effect fades the further it travels." },
  { q: "Which companies are covered?", a: "Five Indian listed companies across metals, automobiles, auto components and energy. More can be added to the dataset." },
]

// Number that counts up the first time it scrolls into view
function Stat({ value, label }) {
  const ref = useRef(null)
  const [n, setN] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      if (reduce) return setN(value)
      const t0 = performance.now()
      const tick = (t) => {
        const p = Math.min((t - t0) / 1100, 1)
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [value])
  return (
    <div ref={ref} className="text-center md:text-left">
      <dd className="text-4xl font-bold tracking-tight text-cyan-400">{n}</dd>
      <dt className="mt-1 text-sm text-slate-500">{label}</dt>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-white transition hover:text-cyan-400">
        {q}
        <span className={`text-xl text-cyan-400 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <p className="overflow-hidden px-6 text-sm leading-6 text-slate-400"><span className="block pb-5">{a}</span></p>
      </div>
    </div>
  )
}

function SectionHeading({ title, children, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h2>
      {children && <p className="mt-4 text-base leading-7 text-slate-400">{children}</p>}
    </div>
  )
}

function Home({ initialCompany = null, onNavigate }) {
  const [selectedCompany, setSelectedCompany] = useState(initialCompany)
  const [shockResult, setShockResult] = useState(null)
  const simulatorRef = useRef(null)

  // Coming from the Companies page ("Simulate shock"): jump straight to the simulator
  useEffect(() => {
    if (initialCompany) {
      const t = setTimeout(() => simulatorRef.current?.scrollIntoView({ block: "start" }), 50)
      return () => clearTimeout(t)
    }
  }, [initialCompany])

  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const on = () => {
      const h = document.documentElement
      setProgress((h.scrollTop / Math.max(h.scrollHeight - h.clientHeight, 1)) * 100)
    }
    window.addEventListener("scroll", on, { passive: true })
    return () => window.removeEventListener("scroll", on)
  }, [])

  const handleCompanySelect = (company) => {
    setSelectedCompany(company)
    setShockResult(null)
  }

  const handleSimulate = (simulation) => {
    setShockResult(simulation)
  }

  const pickCompany = (company) => {
    handleCompanySelect(company)
    scrollToId("simulator")
  }

  return (
    <main>
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-1">
        <div className="h-full bg-cyan-500" style={{ width: `${progress}%` }} />
      </div>

      {/* ───────── Hero ───────── */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:py-24 lg:grid-cols-2">
        <div>
          <div className="mb-5 inline-block rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            Supply chain risk intelligence
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">
            See how a shock <span className="text-cyan-400">spreads.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
            MarketMind maps the dependencies between listed companies and shows how a
            supply-chain disruption at one company travels through the network to the
            others.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => scrollToId("simulator")}
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Try the simulator
            </button>
            <button
              type="button"
              onClick={() => scrollToId("how-it-works")}
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 font-semibold text-white transition hover:border-cyan-400"
            >
              How it works
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
          <HeroNetwork className="h-auto w-full" />
        </div>
      </section>

      {/* ───────── Company ticker ───────── */}
      <section aria-label="Companies covered" className="overflow-hidden border-y border-slate-800 bg-slate-900/60 py-4">
        <div className="mm-marquee flex w-max whitespace-nowrap text-sm">
          {[...mockCompanies, ...mockCompanies].map((c, i) => (
            <span key={i} className="mr-10 flex items-center gap-2">
              <span className="font-semibold text-white">{c.company_name}</span>
              <span className="text-cyan-400">{c.ticker}</span>
              <span className="text-slate-500">{c.sector}</span>
            </span>
          ))}
        </div>
      </section>

      {/* ───────── Stats ───────── */}
      <section className="mx-auto mt-10 max-w-7xl px-6">
        <dl className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-4 md:p-8">
          {stats.map((s) => <Stat key={s.label} {...s} />)}
        </dl>
      </section>

      {/* ───────── About the company ───────── */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:py-28 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-slate-800 shadow-lg">
          <PortScene className="h-auto w-full" />
        </div>
        <div>
          <SectionHeading title="About MarketMind">
            A problem at one factory or port rarely stays there. A steel shortage raises costs for
            component makers, which then affects carmakers, and the effect keeps moving down the chain.
          </SectionHeading>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
            MarketMind is a supply-chain graph reasoning engine. It turns company relationships into a
            network, then traces how a financial shock propagates across it, so analysts and students can
            see which companies are exposed, how strongly, and why.
          </p>
          <ul className="mt-6 space-y-3 text-slate-400">
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
              <span>
                <strong className="text-white">Our mission:</strong> make hidden dependencies between
                companies visible and easy to understand.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
              <span>
                <strong className="text-white">Who it is for:</strong> analysts, risk teams and
                students studying how markets are connected.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
              <span>
                <strong className="text-white">What we cover:</strong> Indian listed companies across
                metals, automobiles, auto components and energy.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ───────── What we offer ───────── */}
      <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-28">
        <SectionHeading center title="What MarketMind does">
          Four tools that work together, from mapping the network to checking predictions against real
          market moves.
        </SectionHeading>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-cyan-400 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                <Icon name={f.icon} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Live demo ───────── */}
      <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-28">
        <SectionHeading center title="Try a shock right here">
          Click any company to start the disruption there, change the severity, and watch the impact spread.
        </SectionHeading>
        <div className="mt-10">
          <LiveDemo onOpen={pickCompany} />
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-slate-800 bg-slate-900/60">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:py-28 lg:grid-cols-2">
          <div>
            <SectionHeading title="How it works">
              From a search to a full impact map in three steps.
            </SectionHeading>
            <ol className="mt-8 space-y-6">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-slate-950">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{s.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-slate-800 shadow-lg">
              <FactoryScene className="h-full w-full object-cover" />
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-800 shadow-lg">
              <ChartScene className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Coverage ───────── */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <SectionHeading center title="Companies in the network">
          These companies are linked through supplier and customer relationships. Select one to start a shock from it.
        </SectionHeading>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {mockCompanies.map((c) => (
            <button type="button" key={c.company_id} onClick={() => pickCompany(c)} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:-translate-y-1 hover:border-cyan-400 hover:shadow-lg">
              <p className="font-semibold text-white">{c.company_name}</p>
              <p className="mt-1 text-sm text-cyan-400">
                {c.exchange}: {c.ticker}
              </p>
              <p className="mt-3 text-xs text-slate-500">{c.sector}</p>
              <p className="mt-2 text-xs font-medium text-cyan-400">Simulate from here</p>
            </button>
          ))}
        </div>
        {onNavigate && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("companies")}
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-400"
            >
              Browse all companies
            </button>
            <button
              type="button"
              onClick={() => onNavigate("history")}
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-400"
            >
              View historical events
            </button>
          </div>
        )}
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="mx-auto max-w-3xl px-6 pb-20 md:pb-28">
        <SectionHeading center title="Common questions" />
        <div className="mt-8 divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900">
          {faqs.map((f) => <FaqItem key={f.q} {...f} />)}
        </div>
      </section>

      {/* ───────── Simulator (search bar at the bottom) ───────── */}
      <section id="simulator" ref={simulatorRef} className="scroll-mt-16 border-t border-slate-800 bg-cyan-400/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 pb-28 text-center md:pt-24">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-cyan-400 shadow">
            <Icon name="search" />
          </div>
          <h2 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl">
            Try it on a company
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
            Search for a company, choose a shock and see which other companies feel it.
          </p>

          <div className="mt-10 w-full max-w-xl">
            <CompanySearch onCompanySelect={handleCompanySelect} />

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-slate-500">Quick picks:</span>
              {mockCompanies.slice(0, 4).map((c) => (
                <button key={c.company_id} type="button" onClick={() => handleCompanySelect(c)}
                  className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-300 transition hover:border-cyan-400 hover:text-white">
                  {c.company_name}
                </button>
              ))}
            </div>

            {/* Selected Company */}
            {selectedCompany && (
              <div className="mt-4 rounded-xl border border-cyan-400/20 bg-slate-900 px-5 py-4 text-left">
                <p className="text-sm text-cyan-300">Selected company</p>

                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{selectedCompany.company_name}</p>

                    <p className="text-sm text-slate-400">
                      {selectedCompany.exchange}: {selectedCompany.ticker}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {selectedCompany.sector} · {selectedCompany.industry}
                    </p>
                  </div>

                  <span className="rounded-lg bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">Selected</span>
                </div>
              </div>
            )}

            {/* Shock Configuration */}
            {selectedCompany && <ShockConfig company={selectedCompany} onSimulate={handleSimulate} />}

            {/* Dependency Graph */}
            {shockResult && <DependencyGraph company={shockResult.company} severity={shockResult.severity} />}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
