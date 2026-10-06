import { useEffect, useRef, useState } from "react"
import CompanySearch from "../components/CompanySearch"
import ShockConfig from "../components/ShockConfig"
import DependencyGraph from "../components/DependencyGraph"
import LiveDemo from "../components/LiveDemo"
import { PortScene, FactoryScene, Icon } from "../components/Illustrations"
import mockCompanies from "../data/mockCompanies"
import dependencyData from "../data/dependencyData"

const linkCount = Object.values(dependencyData).reduce((n, t) => n + Object.keys(t).length, 0)
const sectorCount = new Set(mockCompanies.map((c) => c.sector)).size

// Free-to-use photos from Unsplash (no attribution required)
const img = (id, w = 1400) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=70&w=${w}`
const PHOTO = {
  pier: "1578575437130-527eed3abbec",
  ship: "1595587637401-83ff822bd63e",
  stack: "1678182451047-196f22a4143e",
  crane: "1706499856012-14f062c72b49",
  sunset: "1759272840538-ae4b07214c71",
  harbor: "1673896493356-6684ede37a7d",
}

function Photo({ id, alt, className = "", w, fallback }) {
  const [bad, setBad] = useState(false)
  if (bad) return fallback
  return <img src={img(PHOTO[id], w)} alt={alt} loading="lazy" onError={() => setBad(true)} className={`object-cover ${className}`} />
}

const what = [
  { t: "A map of who depends on whom", d: "Every company in our network is linked to its suppliers and customers, and every link has a strength score so you can see which ones really matter." },
  { t: "A way to test “what if?”", d: "Choose a company, pick an event such as a cost spike or a port delay, set how bad it is, and see which other companies feel it." },
  { t: "Reasons, not just numbers", d: "Each relationship comes with a plain explanation and its source, so you can check our thinking instead of taking it on trust." },
  { t: "A look back at what really happened", d: "Replay past disruptions and compare what the model expected with how share prices actually moved." },
]

const steps = [
  { t: "Pick a company", d: "Search by name, ticker or sector." },
  { t: "Describe the problem", d: "A cost increase, a factory stoppage, a logistics delay. Then choose low, medium or high." },
  { t: "See who feels it", d: "Follow the effect from supplier to customer, hop by hop." },
]

const faqs = [
  { q: "Are the numbers real?", a: "Not yet. This is a prototype, so the links, evidence and market values are illustrative. They show how the model works, not investment advice." },
  { q: "Which shocks can I test?", a: "Raw material cost increase, supply disruption, production disruption, demand drop and logistics disruption, each at low, medium or high severity." },
  { q: "How is the impact worked out?", a: "Every link has a strength between 0 and 1. The shock is multiplied by that strength at each step, so it fades the further it travels." },
  { q: "Which companies do you cover?", a: "Five Indian listed companies across metals, automobiles, auto components and energy. We plan to add more." },
]

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
const display = "font-display font-semibold tracking-tight"

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold text-white hover:text-cyan-400">
        {q}
        <span className={`text-xl text-cyan-400 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <p className="overflow-hidden text-sm leading-6 text-slate-400"><span className="block pb-5">{a}</span></p>
      </div>
    </div>
  )
}

function Home({ initialCompany = null, onNavigate }) {
  const [selectedCompany, setSelectedCompany] = useState(initialCompany)
  const [shockResult, setShockResult] = useState(null)
  const [sent, setSent] = useState(false)
  const simulatorRef = useRef(null)

  useEffect(() => {
    if (initialCompany) {
      const t = setTimeout(() => simulatorRef.current?.scrollIntoView({ block: "start" }), 50)
      return () => clearTimeout(t)
    }
  }, [initialCompany])

  const handleCompanySelect = (company) => {
    setSelectedCompany(company)
    setShockResult(null)
  }
  const handleSimulate = (simulation) => setShockResult(simulation)
  const pickCompany = (company) => {
    handleCompanySelect(company)
    scrollToId("simulator")
  }

  const field = "w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-14 md:py-20 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-sm font-medium text-cyan-400">MarketMind · Supply chain risk analysis</p>
          <h1 className={`${display} mt-4 text-5xl leading-[1.05] text-white md:text-6xl`}>
            When one port stops, a lot of people feel it.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
            A steel delay becomes a late car part, and a late car part becomes an empty showroom. We help
            you see those chains before they break, so you can ask better questions about risk.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <button type="button" onClick={() => scrollToId("play")}
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
              See it in action
            </button>
            <button type="button" onClick={() => scrollToId("story")} className="font-semibold text-white underline decoration-cyan-400 underline-offset-4">
              Read our story
            </button>
          </div>
          <p className="mt-10 text-sm text-slate-500">
            Today we map {mockCompanies.length} companies, {linkCount} supplier links and {sectorCount} sectors.
          </p>
        </div>
        <div className="relative">
          <Photo id="pier" w={1600} alt="Container ships docked at a busy port" className="h-[420px] w-full rounded-3xl shadow-xl md:h-[520px]" fallback={<PortScene className="h-auto w-full rounded-3xl" />} />
          <div className="absolute -bottom-5 left-4 max-w-[17rem] rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg md:left-[-1.5rem]">
            <p className="text-sm leading-5 text-slate-400">
              <span className="font-semibold text-white">Why ports matter:</span> most of the goods a factory needs arrive by sea.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="mx-auto grid max-w-7xl scroll-mt-20 items-center gap-14 px-6 py-20 md:py-28 lg:grid-cols-2">
        <Photo id="stack" w={1200} alt="Shipping containers stacked high" className="h-[460px] w-full rounded-3xl" fallback={<FactoryScene className="h-auto w-full rounded-3xl" />} />
        <div>
          <h2 className={`${display} text-3xl text-white md:text-4xl`}>Why we built MarketMind</h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-slate-400">
            <p>
              Most people watch a company’s share price. Very few ask who that company depends on. When a
              supplier struggles, the effect rarely stays put, yet the connections are hard to see.
            </p>
            <p>
              So we built a tool that draws those connections and lets you push on them: choose a company,
              choose a problem, and watch what moves. We kept it simple on purpose, because risk should be
              something you can explain to a colleague in a minute.
            </p>
          </div>
          <dl className="mt-8 grid gap-6 border-t border-slate-800 pt-6 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-white">Who it’s for</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-400">Analysts, risk teams and students learning how markets connect.</dd>
            </div>
            <div>
              <dt className="font-semibold text-white">What we cover</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-400">Indian listed companies in metals, automobiles, auto components and energy.</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* What we do */}
      <section className="border-y border-slate-800 bg-slate-900/60">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:py-28 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className={`${display} text-3xl text-white md:text-4xl`}>What you can do here</h2>
            <p className="mt-4 text-slate-400">Four things we think are worth doing well.</p>
          </div>
          <ul className="divide-y divide-slate-800">
            {what.map((w) => (
              <li key={w.t} className="py-6 first:pt-0">
                <h3 className="text-lg font-semibold text-white">{w.t}</h3>
                <p className="mt-2 leading-7 text-slate-400">{w.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Interactive demo */}
      <section id="play" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <h2 className={`${display} text-3xl text-white md:text-4xl`}>Go on, push on it</h2>
          <p className="mt-4 text-slate-400">
            Click a company to start a problem there, then change how bad it is. The bars show how much of
            the shock reaches everyone else.
          </p>
        </div>
        <div className="mt-10"><LiveDemo onOpen={pickCompany} /></div>
      </section>

      {/* Photo band */}
      <section className="relative">
        <Photo id="crane" w={2000} alt="A crane working over stacked containers" className="h-[360px] w-full md:h-[440px]" fallback={<div className="h-[360px] bg-slate-800" />} />
        <div className="absolute inset-0 flex items-center bg-black/45">
          <p className={`${display} mx-auto max-w-3xl px-6 text-center text-3xl leading-tight text-white md:text-5xl`} style={{ color: "#fff" }}>
            Supply chains are made of people, ports and promises.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 md:py-28 lg:grid-cols-2">
        <div>
          <h2 className={`${display} text-3xl text-white md:text-4xl`}>How it works</h2>
          <ol className="mt-8 space-y-7">
            {steps.map((s, i) => (
              <li key={s.t} className="flex gap-5">
                <span className={`${display} text-3xl text-cyan-400`}>{i + 1}</span>
                <div>
                  <h3 className="font-semibold text-white">{s.t}</h3>
                  <p className="mt-1 text-slate-400">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Photo id="harbor" w={900} alt="Harbour cranes" className="h-72 w-full rounded-2xl" fallback={<PortScene className="h-72 w-full rounded-2xl" />} />
          <Photo id="sunset" w={900} alt="Containers at sunset" className="mt-10 h-72 w-full rounded-2xl" fallback={<FactoryScene className="mt-10 h-72 w-full rounded-2xl" />} />
        </div>
      </section>

      {/* Companies */}
      <section className="mx-auto max-w-4xl px-6 pb-20 md:pb-28">
        <h2 className={`${display} text-3xl text-white md:text-4xl`}>The companies we cover</h2>
        <ul className="mt-8 divide-y divide-slate-800 border-y border-slate-800">
          {mockCompanies.map((c) => (
            <li key={c.company_id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-semibold text-white">{c.company_name}</p>
                <p className="text-sm text-slate-500">{c.exchange}: {c.ticker} · {c.sector}</p>
              </div>
              <button type="button" onClick={() => pickCompany(c)} className="text-sm font-semibold text-cyan-400 hover:underline">
                Test a shock →
              </button>
            </li>
          ))}
        </ul>
        {onNavigate && (
          <p className="mt-5 text-sm text-slate-500">
            Want more detail? <button type="button" onClick={() => onNavigate("companies")} className="font-semibold text-white underline underline-offset-4">Browse all companies</button> or{" "}
            <button type="button" onClick={() => onNavigate("history")} className="font-semibold text-white underline underline-offset-4">see past events</button>.
          </p>
        )}
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-20 md:pb-28">
        <h2 className={`${display} text-3xl text-white md:text-4xl`}>Questions people ask</h2>
        <div className="mt-6 divide-y divide-slate-800 border-y border-slate-800">
          {faqs.map((f) => <FaqItem key={f.q} {...f} />)}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-y border-slate-800 bg-slate-900/60">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:py-24 lg:grid-cols-2">
          <div>
            <h2 className={`${display} text-3xl text-white md:text-4xl`}>Talk to us</h2>
            <p className="mt-4 max-w-md text-slate-400">Questions, ideas or a company you’d like us to add? Write to us and a real person will reply.</p>
            <dl className="mt-8 space-y-4 text-sm">
              <div><dt className="text-slate-500">Email</dt><dd className="font-semibold text-white">hello@marketmind.example</dd></div>
              <div><dt className="text-slate-500">Based in</dt><dd className="font-semibold text-white">Gujarat, India</dd></div>
            </dl>
          </div>
          {sent ? (
            <div className="self-center rounded-2xl border border-slate-800 bg-slate-900 p-8">
              <h3 className="text-xl font-semibold text-white">Thanks, we got your message.</h3>
              <p className="mt-2 text-slate-400">We’ll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
              <input required placeholder="Your name" aria-label="Your name" className={field} />
              <input required type="email" placeholder="Email address" aria-label="Email address" className={field} />
              <textarea required rows={4} placeholder="How can we help?" aria-label="Message" className={field} />
              <button type="submit" className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">Send message</button>
            </form>
          )}
        </div>
      </section>

      {/* Simulator: the search bar sits at the bottom */}
      <section id="simulator" ref={simulatorRef} className="scroll-mt-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 pb-28 text-center md:pt-24">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-cyan-400 shadow"><Icon name="search" /></div>
          <h2 className={`${display} mt-5 text-3xl text-white md:text-4xl`}>Look up any company</h2>
          <p className="mt-3 max-w-xl text-slate-400">Search for a company, choose a shock and see who else feels it.</p>

          <div className="mt-8 w-full max-w-xl">
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

            {selectedCompany && (
              <div className="mt-4 rounded-xl border border-cyan-400/20 bg-slate-900 px-5 py-4 text-left">
                <p className="text-sm text-cyan-300">Selected company</p>
                <p className="mt-2 font-semibold text-white">{selectedCompany.company_name}</p>
                <p className="text-sm text-slate-400">{selectedCompany.exchange}: {selectedCompany.ticker}</p>
                <p className="mt-1 text-xs text-slate-500">{selectedCompany.sector} · {selectedCompany.industry}</p>
              </div>
            )}
            {selectedCompany && <ShockConfig company={selectedCompany} onSimulate={handleSimulate} />}
            {shockResult && <DependencyGraph company={shockResult.company} severity={shockResult.severity} />}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
