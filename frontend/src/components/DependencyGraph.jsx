import { useEffect, useMemo, useRef, useState } from "react"
import CytoscapeComponent from "react-cytoscapejs"
import dependencyData from "../data/dependencyData"

function DependencyGraph({ company, severity }) {
  const cyRef = useRef(null)

  const [graphReady, setGraphReady] = useState(false)
  const [currentHop, setCurrentHop] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const [selectedNode, setSelectedNode] = useState(null)

  /*
   * ------------------------------------------------------------
   * 1. SHOCK SEVERITY
   * ------------------------------------------------------------
   */

  const severityMultiplier = {
    low: 0.6,
    medium: 1,
    high: 1.4,
  }

  const initialShock =
    severityMultiplier[severity] ?? severityMultiplier.medium

  /*
   * ------------------------------------------------------------
   * 2. BUILD GRAPH DATA
   * ------------------------------------------------------------
   */

  const graphData = useMemo(() => {
    const sourceCompany = company

    /*
     * For the current frontend demo we use the dependency
     * relationships stored in dependencyData.js.
     */
    const sourceDependencies =
      dependencyData[sourceCompany.company_id] || {}

    /*
     * Known companies used in the current demo.
     * Later these will come from the backend/database.
     */
    const knownCompanies = {
      CMP001: {
        company_name: "Tata Steel",
        ticker: "TATASTEEL",
        sector: "Metals",
      },

      CMP002: {
        company_name: "Bharat Forge",
        ticker: "BHARATFORG",
        sector: "Auto Components",
      },

      CMP003: {
        company_name: "Maruti Suzuki",
        ticker: "MARUTI",
        sector: "Automobile",
      },

      CMP005: {
        company_name: "Tata Motors",
        ticker: "TATAMOTORS",
        sector: "Automobile",
      },
    }

    /*
     * --------------------------------------------------------
     * SOURCE NODE
     * --------------------------------------------------------
     */

    const nodes = [
      {
        data: {
          id: sourceCompany.company_id,
          label: sourceCompany.company_name,
          ticker: sourceCompany.ticker,
          hop: 0,
          type: "source",
          impact: Math.round(100 * initialShock),
        },
      },
    ]

    const edges = []

    /*
     * --------------------------------------------------------
     * FIRST HOP
     * --------------------------------------------------------
     */

    Object.entries(sourceDependencies).forEach(
      ([targetId, relationship]) => {
        const targetCompany =
          knownCompanies[targetId]

        if (!targetCompany) {
          return
        }

        const firstHopImpact = Math.round(
          relationship.impact * initialShock
        )

        nodes.push({
          data: {
            id: targetId,
            label: targetCompany.company_name,
            ticker: targetCompany.ticker,
            hop: 1,
            type: "affected",
            impact: firstHopImpact,
          },
        })

        edges.push({
          data: {
            id: `${sourceCompany.company_id}-${targetId}`,
            source: sourceCompany.company_id,
            target: targetId,
            strength: relationship.strength,
            impact: firstHopImpact,
            hop: 1,
          },
        })
      }
    )

    /*
     * --------------------------------------------------------
     * SECOND HOP
     * --------------------------------------------------------
     *
     * Look for dependencies from each first-hop company.
     */

    Object.keys(sourceDependencies).forEach((firstHopId) => {
      const secondHopDependencies =
        dependencyData[firstHopId] || {}

      Object.entries(secondHopDependencies).forEach(
        ([secondHopId, relationship]) => {
          const targetCompany =
            knownCompanies[secondHopId]

          if (!targetCompany) {
            return
          }

          /*
           * Don't add duplicate source nodes.
           */
          if (
            secondHopId === sourceCompany.company_id ||
            nodes.some(
              (node) => node.data.id === secondHopId
            )
          ) {
            return
          }

          const firstHopRelationship =
            sourceDependencies[firstHopId]

          /*
           * Mathematical propagation:
           *
           * Impact at hop 2 =
           * initial shock
           * × hop 1 dependency strength
           * × hop 2 dependency strength
           */
          const secondHopImpact = Math.round(
            100 *
              initialShock *
              firstHopRelationship.strength *
              relationship.strength
          )

          nodes.push({
            data: {
              id: secondHopId,
              label: targetCompany.company_name,
              ticker: targetCompany.ticker,
              hop: 2,
              type: "affected",
              impact: secondHopImpact,
            },
          })

          edges.push({
            data: {
              id: `${firstHopId}-${secondHopId}`,
              source: firstHopId,
              target: secondHopId,
              strength: relationship.strength,
              impact: secondHopImpact,
              hop: 2,
            },
          })
        }
      )
    })

    return {
      nodes,
      edges,
    }
  }, [company, initialShock])

  /*
   * ------------------------------------------------------------
   * 3. CYTOSCAPE ELEMENTS
   * ------------------------------------------------------------
   */

  const elements = useMemo(() => {
    return [
      ...graphData.nodes,
      ...graphData.edges,
    ]
  }, [graphData])

  /*
   * ------------------------------------------------------------
   * 4. CYTOSCAPE STYLE
   * ------------------------------------------------------------
   */

  const stylesheet = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",

        width: 90,
        height: 90,

        "background-color": "#0f172a",

        color: "#e2e8f0",

        "font-size": 11,
        "font-weight": 600,

        "border-width": 2,
        "border-color": "#334155",

        "text-wrap": "wrap",
        "text-max-width": 75,

        opacity: 0.15,
      },
    },

    /*
     * Source company
     */
    {
      selector: 'node[type="source"]',
      style: {
        width: 110,
        height: 110,

        "background-color": "#083344",

        "border-color": "#22d3ee",
        "border-width": 3,

        color: "#cffafe",

        "font-size": 12,
        "font-weight": 700,
      },
    },

    /*
     * Affected companies
     */
    {
      selector: 'node[type="affected"]',
      style: {
        "background-color": "#172033",
        "border-color": "#475569",
      },
    },

    /*
     * Edges
     */
    {
      selector: "edge",
      style: {
        width: 2,

        "line-color": "#334155",

        "target-arrow-color": "#475569",
        "target-arrow-shape": "triangle",

        "curve-style": "bezier",

        opacity: 0.08,
      },
    },

    /*
     * Strong relationships
     */
    {
      selector: 'edge[strength >= 0.65]',
      style: {
        width: 4,
        "line-color": "#22d3ee",
        "target-arrow-color": "#22d3ee",
      },
    },

    /*
     * Medium relationships
     */
    {
      selector: 'edge[strength >= 0.4][strength < 0.65]',
      style: {
        width: 3,
        "line-color": "#38bdf8",
        "target-arrow-color": "#38bdf8",
      },
    },

    /*
     * Selected node
     */
    {
      selector: "node:selected",
      style: {
        "border-color": "#67e8f9",
        "border-width": 4,
        "overlay-color": "#22d3ee",
        "overlay-opacity": 0.08,
      },
    },
  ]

  /*
   * ------------------------------------------------------------
   * 5. GRAPH LAYOUT
   * ------------------------------------------------------------
   */

  const layout = {
    name: "breadthfirst",
    directed: true,
    roots: `#${company.company_id}`,
    padding: 60,
    spacingFactor: 1.3,
    animate: false,
  }

  /*
   * ------------------------------------------------------------
   * 6. GRAPH READY
   * ------------------------------------------------------------
   */

  const handleGraphReady = (cy) => {
    cyRef.current = cy

    /*
     * Prevent duplicate listeners.
     */
    cy.removeListener("tap", "node")

    /*
     * Node click.
     */
    cy.on("tap", "node", (event) => {
      const node = event.target

      const nodeHop = Number(
        node.data("hop")
      )

      /*
       * Don't allow users to click companies
       * before the shock reaches them.
       */
      if (nodeHop > currentHop) {
        return
      }

      setSelectedNode({
        id: node.data("id"),
        name: node.data("label"),
        ticker: node.data("ticker"),
        hop: node.data("hop"),
        impact: node.data("impact"),
      })
    })

    setGraphReady(true)
  }

  /*
   * ------------------------------------------------------------
   * 7. RESET WHEN A NEW SIMULATION STARTS
   * ------------------------------------------------------------
   */

  useEffect(() => {
    setCurrentHop(0)
    setSelectedNode(null)
    setIsAnimating(true)
  }, [company.company_id, severity])

  /*
   * ------------------------------------------------------------
   * 8. SHOCK PROPAGATION ANIMATION
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!graphReady) {
      return
    }

    const cy = cyRef.current

    if (!cy) {
      return
    }

    /*
     * Reset everything.
     */
    cy.nodes().forEach((node) => {
      const hop = Number(node.data("hop"))

      if (hop === 0) {
        node.animate(
          {
            style: {
              opacity: 1,
            },
          },
          {
            duration: 500,
          }
        )
      } else {
        node.animate(
          {
            style: {
              opacity: 0.15,
            },
          },
          {
            duration: 300,
          }
        )
      }
    })

    cy.edges().forEach((edge) => {
      edge.animate(
        {
          style: {
            opacity: 0.08,
          },
        },
        {
          duration: 300,
        }
      )
    })

    /*
     * --------------------------------------------------------
     * CURRENT HOP
     * --------------------------------------------------------
     */

    cy.nodes().forEach((node) => {
      const hop = Number(node.data("hop"))

      if (hop <= currentHop) {
        node.animate(
          {
            style: {
              opacity: 1,
            },
          },
          {
            duration: 600,
          }
        )
      }
    })

    cy.edges().forEach((edge) => {
      const hop = Number(edge.data("hop"))

      if (hop <= currentHop) {
        edge.animate(
          {
            style: {
              opacity: 1,
            },
          },
          {
            duration: 600,
          }
        )
      }
    })
  }, [currentHop, graphReady])

  /*
   * ------------------------------------------------------------
   * 9. AUTOMATIC HOP PROGRESSION
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!graphReady) {
      return
    }

    setIsAnimating(true)

    /*
     * Hop 0 → Hop 1
     */
    const hop1Timer = setTimeout(() => {
      setCurrentHop(1)
    }, 800)

    /*
     * Hop 1 → Hop 2
     */
    const hop2Timer = setTimeout(() => {
      setCurrentHop(2)
    }, 1600)

    /*
     * Finish animation
     */
    const finishTimer = setTimeout(() => {
      setIsAnimating(false)
    }, 2400)

    return () => {
      clearTimeout(hop1Timer)
      clearTimeout(hop2Timer)
      clearTimeout(finishTimer)
    }
  }, [
    company.company_id,
    severity,
    graphReady,
  ])

  /*
   * ------------------------------------------------------------
   * 10. FIND SELECTED RELATIONSHIP
   * ------------------------------------------------------------
   */

  const selectedRelationship = useMemo(() => {
    if (!selectedNode) {
      return null
    }

    /*
     * Source company has no incoming relationship.
     */
    if (
      selectedNode.id ===
      company.company_id
    ) {
      return null
    }

    /*
     * Search direct relationship.
     */
    const directRelationship =
      dependencyData[company.company_id]?.[
        selectedNode.id
      ]

    if (directRelationship) {
      return directRelationship
    }

    /*
     * Search second-hop relationship.
     */
    for (const firstHopId of Object.keys(
      dependencyData[company.company_id] || {}
    )) {
      const secondHopRelationship =
        dependencyData[firstHopId]?.[
          selectedNode.id
        ]

      if (secondHopRelationship) {
        return secondHopRelationship
      }
    }

    return null
  }, [
    selectedNode,
    company.company_id,
  ])

  /*
   * ------------------------------------------------------------
   * 11. STRENGTH LABEL
   * ------------------------------------------------------------
   */

  const getStrengthLabel = (strength) => {
    if (strength >= 0.65) {
      return {
        label: "Strong",
        className:
          "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
      }
    }

    if (strength >= 0.4) {
      return {
        label: "Medium",
        className:
          "border-sky-400/30 bg-sky-400/10 text-sky-300",
      }
    }

    return {
      label: "Weak",
      className:
        "border-slate-600 bg-slate-800 text-slate-300",
    }
  }

  /*
   * ------------------------------------------------------------
   * 12. CURRENT STATUS
   * ------------------------------------------------------------
   */

  const statusText = {
    0: "Shock originated",
    1: "Shock reached direct dependencies",
    2: "Shock reached second-order dependencies",
  }

  /*
   * ------------------------------------------------------------
   * 13. RENDER
   * ------------------------------------------------------------
 */

  return (
    <div className="mt-10 w-full text-left">

      {/* =====================================================
          GRAPH HEADER
          ===================================================== */}

      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>
          <p className="text-sm font-medium text-cyan-400">
            Dependency Network
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-white">
            How the shock spreads
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            The simulated shock starts at{" "}
            <span className="text-slate-300">
              {company.company_name}
            </span>{" "}
            and propagates through connected companies.
            Impact decreases as the shock moves further
            through the network.
          </p>
        </div>

        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            isAnimating
              ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
              : "border-slate-700 bg-slate-900 text-slate-400"
          }`}
        >
          {isAnimating
            ? "● Simulating propagation..."
            : "✓ Propagation complete"}
        </div>
      </div>

      {/* =====================================================
          PROPAGATION STEPS
          ===================================================== */}

      <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Propagation status
            </p>

            <p className="mt-1 text-sm font-medium text-white">
              {statusText[currentHop]}
            </p>
          </div>

          <div className="flex items-center gap-3">

            {/* Hop 0 */}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition ${
                  currentHop >= 0
                    ? "border-cyan-400 bg-cyan-400 text-slate-950"
                    : "border-slate-700 bg-slate-900 text-slate-500"
                }`}
              >
                0
              </div>

              <span className="hidden text-xs text-slate-400 sm:block">
                Source
              </span>
            </div>

            <div
              className={`h-px w-8 transition ${
                currentHop >= 1
                  ? "bg-cyan-400"
                  : "bg-slate-700"
              }`}
            />

            {/* Hop 1 */}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition ${
                  currentHop >= 1
                    ? "border-cyan-400 bg-cyan-400 text-slate-950"
                    : "border-slate-700 bg-slate-900 text-slate-500"
                }`}
              >
                1
              </div>

              <span className="hidden text-xs text-slate-400 sm:block">
                Direct
              </span>
            </div>

            <div
              className={`h-px w-8 transition ${
                currentHop >= 2
                  ? "bg-cyan-400"
                  : "bg-slate-700"
              }`}
            />

            {/* Hop 2 */}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition ${
                  currentHop >= 2
                    ? "border-cyan-400 bg-cyan-400 text-slate-950"
                    : "border-slate-700 bg-slate-900 text-slate-500"
                }`}
              >
                2
              </div>

              <span className="hidden text-xs text-slate-400 sm:block">
                Second-order
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          GRAPH
          ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">

        <div className="border-b border-slate-800 px-5 py-4">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-medium text-white">
                Supply-chain dependency graph
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Click an active company to inspect the relationship.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                Active
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                Not reached
              </div>

            </div>
          </div>
        </div>

        <div className="h-[520px] w-full">

          <CytoscapeComponent
            elements={elements}
            stylesheet={stylesheet}
            layout={layout}
            cy={handleGraphReady}
            style={{
              width: "100%",
              height: "100%",
            }}
            wheelSensitivity={0.2}
          />

        </div>
      </div>

      {/* =====================================================
          SELECTED COMPANY / RELATIONSHIP DETAILS
          ===================================================== */}

      {selectedNode && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">

          {/* Company summary */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Selected company
            </p>

            <h3 className="mt-2 text-xl font-semibold text-white">
              {selectedNode.name}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {selectedNode.ticker}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Hop
                </p>

                <p className="mt-1 text-lg font-semibold text-white">
                  {selectedNode.hop}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Impact
                </p>

                <p className="mt-1 text-lg font-semibold text-cyan-300">
                  {selectedNode.impact}%
                </p>
              </div>

            </div>

          </div>

          {/* Relationship explanation */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

            {selectedRelationship ? (
              <>
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Why this connection matters
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {selectedRelationship.relationship}
                    </h3>
                  </div>

                  {(() => {
                    const strength =
                      getStrengthLabel(
                        selectedRelationship.strength
                      )

                    return (
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${strength.className}`}
                      >
                        {strength.label}
                      </span>
                    )
                  })()}

                </div>

                <p className="mt-5 text-sm leading-7 text-slate-400">
                  {selectedRelationship.explanation}
                </p>

                {/* Evidence */}
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">

                  <div className="flex items-center justify-between">

                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Evidence
                    </p>

                    <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-400">
                      {selectedRelationship.evidence.period}
                    </span>

                  </div>

                  <p className="mt-3 text-sm font-medium text-white">
                    {selectedRelationship.evidence.source}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {selectedRelationship.evidence.note}
                  </p>

                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Source company
                </p>

                <h3 className="mt-2 text-lg font-semibold text-white">
                  Shock origin
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  This company is the starting point of the
                  simulation. The shock originates here and
                  propagates through its downstream dependencies.
                </p>
              </>
            )}

          </div>

        </div>
      )}

      {/* =====================================================
          LEGEND / EXPLANATION
          ===================================================== */}

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">

        <div className="grid gap-4 md:grid-cols-3">

          <div>
            <p className="text-sm font-medium text-white">
              Hop 0
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              The company where the simulated shock originates.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Hop 1
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Companies directly connected to the shocked company.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Hop 2
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Secondary companies affected through another dependency.
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}

export default DependencyGraph