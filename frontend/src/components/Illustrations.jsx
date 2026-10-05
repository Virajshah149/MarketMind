// Self-contained SVG illustrations (no image files needed).
// To use a real photo instead, replace any of these with <img src="..." className="..." />.

export function HeroNetwork({ className = "" }) {
  const nodes = [
    { x: 260, y: 220, r: 34, label: "Tata Steel", origin: true },
    { x: 96, y: 110, r: 24, label: "Bharat Forge" },
    { x: 420, y: 96, r: 26, label: "Tata Motors" },
    { x: 440, y: 300, r: 22, label: "Maruti Suzuki" },
    { x: 120, y: 330, r: 22, label: "Reliance" },
    { x: 270, y: 385, r: 16, label: "" },
    { x: 262, y: 52, r: 16, label: "" },
  ]
  const [o, ...rest] = nodes
  return (
    <svg viewBox="0 0 520 440" className={className} role="img" aria-label="A network of companies with a shock spreading outward from one company">
      <defs>
        <radialGradient id="hn-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0e8b99" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0e8b99" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hn-origin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0e8b99" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      <circle cx={o.x} cy={o.y} r="210" fill="url(#hn-glow)" />
      {[0, 1.6, 3.2].map((d) => (
        <circle key={d} className="mm-ring" cx={o.x} cy={o.y} r="190" fill="none" stroke="#0e8b99" strokeWidth="2.5" style={{ animationDelay: `${d}s` }} />
      ))}
      {[70, 120, 175].map((r, i) => (
        <circle key={r} cx={o.x} cy={o.y} r={r} fill="none" stroke="#0e8b99" strokeOpacity={0.35 - i * 0.09} strokeDasharray="4 7" />
      ))}

      {rest.map((n, i) => (
        <line key={i} x1={o.x} y1={o.y} x2={n.x} y2={n.y} stroke="#8aa3ab" strokeOpacity="0.7" strokeWidth="1.5" />
      ))}
      <line x1="420" y1="96" x2="440" y2="300" stroke="#bcd3d9" strokeWidth="1.5" />
      <line x1="96" y1="110" x2="262" y2="52" stroke="#bcd3d9" strokeWidth="1.5" />
      <line x1="120" y1="330" x2="270" y2="385" stroke="#bcd3d9" strokeWidth="1.5" />

      {rest.map((n, i) => (
        <g key={i}>
          <circle className="mm-node" style={{ animationDelay: i < 3 ? "0.8s" : "1.8s" }} cx={n.x} cy={n.y} r={n.r} fill="#ffffff" stroke={i < 3 ? "#0e8b99" : "#bcd3d9"} strokeWidth="2.5" />
          {n.label && (
            <text x={n.x} y={n.y + n.r + 18} textAnchor="middle" fontSize="13" fontWeight="600" fill="#33454d" fontFamily="Inter, system-ui, sans-serif">
              {n.label}
            </text>
          )}
        </g>
      ))}

      <circle cx={o.x} cy={o.y} r={o.r} fill="url(#hn-origin)" />
      <path d="M264 205l-13 19h9l-4 15 13-19h-9z" fill="#fff" />
      <text x={o.x} y={o.y + o.r + 20} textAnchor="middle" fontSize="14" fontWeight="700" fill="#17232a" fontFamily="Inter, system-ui, sans-serif">
        Tata Steel
      </text>
      <rect x="196" y="150" width="128" height="26" rx="13" fill="#17232a" />
      <text x="260" y="167" textAnchor="middle" fontSize="12" fontWeight="600" fill="#fff" fontFamily="Inter, system-ui, sans-serif">
        Shock starts here
      </text>
    </svg>
  )
}

export function PortScene({ className = "" }) {
  const colors = ["#0e8b99", "#4f46e5", "#b45309", "#0a6f7b", "#5f7880", "#4338ca"]
  return (
    <svg viewBox="0 0 640 420" className={className} role="img" aria-label="A cargo ship carrying containers next to a port crane">
      <defs>
        <linearGradient id="ps-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9f3f6" />
          <stop offset="100%" stopColor="#f0fbfc" />
        </linearGradient>
        <linearGradient id="ps-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e8b99" />
          <stop offset="100%" stopColor="#0a6f7b" />
        </linearGradient>
      </defs>
      <rect width="640" height="420" fill="url(#ps-sky)" />
      <circle cx="510" cy="90" r="42" fill="#ffffff" opacity="0.9" />
      <ellipse cx="150" cy="80" rx="60" ry="14" fill="#fff" opacity="0.9" />
      <ellipse cx="200" cy="66" rx="38" ry="11" fill="#fff" opacity="0.9" />

      {/* crane */}
      <g fill="none" stroke="#33454d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M70 330V120" />
        <path d="M130 330V120" />
        <path d="M70 120h60M70 200h60M70 270h60" strokeWidth="4" />
        <path d="M40 120h300" strokeWidth="8" />
        <path d="M100 120L40 120M100 60V120" />
        <path d="M100 60L340 120M100 60L40 120" strokeWidth="3" />
        <path d="M290 120v70" strokeWidth="3" />
      </g>
      <rect x="270" y="190" width="40" height="22" fill="#b45309" />

      {/* quay */}
      <rect x="0" y="330" width="230" height="90" fill="#8aa3ab" />
      <rect x="0" y="330" width="230" height="10" fill="#5f7880" />

      {/* sea */}
      <rect x="0" y="335" width="640" height="85" fill="url(#ps-sea)" opacity="0.92" />
      <path d="M0 360c40-10 80 10 120 0s80-10 120 0 80 10 120 0 80-10 120 0 80 10 160 0" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" />

      {/* ship */}
      <path d="M215 300h390l-40 60H250z" fill="#17232a" />
      <path d="M232 300h356" stroke="#b45309" strokeWidth="6" />
      {[0, 1, 2, 3, 4].map((c) =>
        [0, 1, 2].map((r) => (
          <rect key={`${c}-${r}`} x={240 + c * 58} y={272 - r * 26} width="54" height="24" rx="2" fill={colors[(c * 2 + r * 3) % colors.length]} stroke="#17232a" strokeOpacity="0.25" />
        ))
      )}
      <rect x="540" y="230" width="46" height="70" rx="3" fill="#f0fbfc" stroke="#17232a" strokeWidth="2" />
      <rect x="548" y="240" width="30" height="10" fill="#0e8b99" />
    </svg>
  )
}

export function FactoryScene({ className = "" }) {
  return (
    <svg viewBox="0 0 640 420" className={className} role="img" aria-label="A steel factory with smoke and a delivery truck">
      <defs>
        <linearGradient id="fs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e4e9ff" />
          <stop offset="100%" stopColor="#f0fbfc" />
        </linearGradient>
      </defs>
      <rect width="640" height="420" fill="url(#fs-sky)" />
      <rect y="330" width="640" height="90" fill="#33454d" />
      <path d="M0 375h640" stroke="#f0fbfc" strokeWidth="3" strokeDasharray="26 20" />

      {/* smoke */}
      <g fill="#ffffff" opacity="0.95">
        <circle cx="150" cy="70" r="26" />
        <circle cx="185" cy="48" r="32" />
        <circle cx="230" cy="36" r="24" />
        <circle cx="300" cy="80" r="22" />
        <circle cx="335" cy="56" r="28" />
      </g>

      {/* chimneys */}
      <rect x="130" y="100" width="40" height="150" fill="#5f7880" />
      <rect x="130" y="100" width="40" height="14" fill="#b45309" />
      <rect x="280" y="120" width="36" height="130" fill="#5f7880" />
      <rect x="280" y="120" width="36" height="14" fill="#b45309" />

      {/* building */}
      <path d="M70 330V240l70-30v30l80-32v32l80-32v32l80-32v122z" fill="#8aa3ab" />
      <rect x="70" y="240" width="380" height="90" fill="#4a5f67" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={92 + i * 72} y="262" width="46" height="30" rx="2" fill="#f0fbfc" opacity="0.85" />
      ))}
      <rect x="250" y="292" width="70" height="38" fill="#17232a" />

      {/* steel coils */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={490 + i * 44} cy="310" r="20" fill="#bcd3d9" stroke="#5f7880" strokeWidth="3" />
          <circle cx={490 + i * 44} cy="310" r="7" fill="#33454d" />
        </g>
      ))}

      {/* truck */}
      <rect x="380" y="330" width="150" height="10" fill="#17232a" opacity="0" />
      <g transform="translate(360 338)">
        <rect x="0" y="0" width="120" height="44" rx="4" fill="#0e8b99" />
        <path d="M120 10h34l16 20v14h-50z" fill="#4f46e5" />
        <rect x="132" y="16" width="20" height="14" fill="#f0fbfc" />
        <circle cx="26" cy="46" r="11" fill="#17232a" />
        <circle cx="26" cy="46" r="4" fill="#bcd3d9" />
        <circle cx="140" cy="46" r="11" fill="#17232a" />
        <circle cx="140" cy="46" r="4" fill="#bcd3d9" />
      </g>
    </svg>
  )
}

export function ChartScene({ className = "" }) {
  const bars = [
    { h: 60, c: "#bcd3d9" },
    { h: 96, c: "#8aa3ab" },
    { h: 150, c: "#0e8b99" },
    { h: 118, c: "#4f46e5" },
    { h: 74, c: "#8aa3ab" },
    { h: 44, c: "#bcd3d9" },
  ]
  return (
    <svg viewBox="0 0 640 420" className={className} role="img" aria-label="A dashboard showing simulated impact against actual market movement">
      <rect width="640" height="420" fill="#eaf8fa" />
      <rect x="40" y="36" width="560" height="348" rx="18" fill="#ffffff" stroke="#d5e6ea" strokeWidth="2" />
      <rect x="66" y="62" width="150" height="14" rx="7" fill="#17232a" />
      <rect x="66" y="88" width="230" height="10" rx="5" fill="#d5e6ea" />

      {[0, 1, 2].map((i) => (
        <line key={i} x1="66" x2="574" y1={170 + i * 60} y2={170 + i * 60} stroke="#e5eff2" strokeWidth="2" />
      ))}
      {bars.map((b, i) => (
        <g key={i}>
          <rect x={90 + i * 78} y={340 - b.h} width="46" height={b.h} rx="6" fill={b.c} />
        </g>
      ))}
      <path d="M113 250L191 214 269 168 347 190 425 236 503 274" fill="none" stroke="#b45309" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {[[113, 250], [191, 214], [269, 168], [347, 190], [425, 236], [503, 274]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="6" fill="#fff" stroke="#b45309" strokeWidth="3" />
      ))}

      <rect x="440" y="62" width="134" height="34" rx="17" fill="#ecfdf5" />
      <circle cx="460" cy="79" r="6" fill="#059669" />
      <rect x="474" y="74" width="80" height="10" rx="5" fill="#059669" opacity="0.5" />
    </svg>
  )
}

export function Icon({ name, className = "h-6 w-6" }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }
  const paths = {
    network: (
      <>
        <circle cx="12" cy="12" r="3" {...p} />
        <circle cx="4.5" cy="5.5" r="2" {...p} />
        <circle cx="19.5" cy="5.5" r="2" {...p} />
        <circle cx="4.5" cy="18.5" r="2" {...p} />
        <circle cx="19.5" cy="18.5" r="2" {...p} />
        <path d="M6 7l4.2 3.6M18 7l-4.2 3.6M6 17l4.2-3.6M18 17l-4.2-3.6" {...p} />
      </>
    ),
    bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" {...p} />,
    doc: (
      <>
        <path d="M6 2h9l5 5v15H6z" {...p} />
        <path d="M14 2v6h6M9 13h8M9 17h8" {...p} />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" {...p} />
        <path d="M12 7v5l3 2" {...p} />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" {...p} />
        <path d="M20 20l-4-4" {...p} />
      </>
    ),
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
