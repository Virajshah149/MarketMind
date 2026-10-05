export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-800/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-xs text-slate-500 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} MarketMind · Supply-chain risk intelligence</p>
        <p>Prototype: dependency, evidence and market values are illustrative.</p>
      </div>
    </footer>
  )
}
