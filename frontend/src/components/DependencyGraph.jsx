import CytoscapeComponent from "react-cytoscapejs"

function DependencyGraph({ company, severity }) {
  const elements = [
    {
      data: {
        id: company.company_id,
        label: `${company.company_name}\nSHOCK`,
        type: "origin",
      },
    },

    {
      data: {
        id: "CMP002",
        label: "Bharat Forge\n72%",
        type: "strong",
      },
    },

    {
      data: {
        id: "CMP003",
        label: "Maruti Suzuki\n48%",
        type: "medium",
      },
    },

    {
      data: {
        id: "CMP005",
        label: "Tata Motors\n35%",
        type: "weak",
      },
    },

    {
      data: {
        id: "edge-1",
        source: company.company_id,
        target: "CMP002",
        strength: 0.72,
      },
    },

    {
      data: {
        id: "edge-2",
        source: company.company_id,
        target: "CMP003",
        strength: 0.48,
      },
    },

    {
      data: {
        id: "edge-3",
        source: "CMP002",
        target: "CMP005",
        strength: 0.35,
      },
    },
  ]

  const stylesheet = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "text-wrap": "wrap",
        "text-valign": "center",
        "text-halign": "center",
        color: "#ffffff",
        "font-size": "13px",
        "font-weight": "bold",
        width: 110,
        height: 70,
        "border-width": 2,
        "background-color": "#1e293b",
        "border-color": "#475569",
      },
    },

    {
      selector: 'node[type="origin"]',
      style: {
        "background-color": "#164e63",
        "border-color": "#22d3ee",
        "border-width": 3,
        width: 130,
        height: 80,
      },
    },

    {
      selector: 'node[type="strong"]',
      style: {
        "background-color": "#7f1d1d",
        "border-color": "#ef4444",
      },
    },

    {
      selector: 'node[type="medium"]',
      style: {
        "background-color": "#78350f",
        "border-color": "#f59e0b",
      },
    },

    {
      selector: 'node[type="weak"]',
      style: {
        "background-color": "#713f12",
        "border-color": "#eab308",
      },
    },

    {
      selector: "edge",
      style: {
        width: "mapData(strength, 0, 1, 1, 7)",
        "line-color": "#475569",
        "target-arrow-color": "#64748b",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
      },
    },

    {
      selector: 'edge[id="edge-1"]',
      style: {
        "line-color": "#ef4444",
        "target-arrow-color": "#ef4444",
      },
    },

    {
      selector: 'edge[id="edge-2"]',
      style: {
        "line-color": "#f59e0b",
        "target-arrow-color": "#f59e0b",
      },
    },

    {
      selector: 'edge[id="edge-3"]',
      style: {
        "line-color": "#eab308",
        "target-arrow-color": "#eab308",
      },
    },
  ]

  const layout = {
    name: "breadthfirst",
    directed: true,
    padding: 50,
    spacingFactor: 1.3,
  }

  return (
    <div className="mt-8 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">

      <div className="border-b border-slate-800 px-6 py-4">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-medium text-cyan-400">
              Dependency Network
            </p>

            <h2 className="mt-1 text-xl font-semibold text-white">
              Shock propagation
            </h2>
          </div>

          <div className="text-right">

            <p className="text-xs uppercase tracking-wide text-slate-500">
              Severity
            </p>

            <p className="mt-1 font-semibold capitalize text-white">
              {severity}
            </p>

          </div>

        </div>

      </div>

      <div className="h-[550px]">

        <CytoscapeComponent
          elements={elements}
          stylesheet={stylesheet}
          layout={layout}
          style={{
            width: "100%",
            height: "100%",
          }}
        />

      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 border-t border-slate-800 px-6 py-4 text-xs text-slate-400">

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-cyan-400" />
          Origin
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          Strong impact
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-orange-500" />
          Medium impact
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          Weak impact
        </div>

      </div>

    </div>
  )
}

export default DependencyGraph