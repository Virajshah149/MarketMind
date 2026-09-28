const historicalEvents = [
  {
    id: "EVT001",

    title: "Steel Input Cost Shock",

    period: "FY2024",

    date: "2024-05-15",

    category: "Raw Material",

    severity: "High",

    summary:
      "A simulated historical case showing how a change in steel input economics could propagate through connected manufacturing companies.",

    eventDescription:
      "The event represents a steel input cost shock originating around the steel industry and examines how dependency relationships can transmit cost pressure into downstream automotive and manufacturing companies.",

    source:
      "Illustrative historical-analysis dataset for frontend development.",

    sourceType: "Annual Report / Market Data",

    originCompany: {
      company_id: "CMP001",
      company_name: "Tata Steel",
      ticker: "TATASTEEL",
    },

    propagation: [
      {
        company_id: "CMP001",
        company_name: "Tata Steel",
        ticker: "TATASTEEL",
        hop: 0,
        dependencyStrength: 1.0,
        simulatedImpact: 100,
        actualMovement: 4.8,
      },

      {
        company_id: "CMP002",
        company_name: "Bharat Forge",
        ticker: "BHARATFORG",
        hop: 1,
        dependencyStrength: 0.72,
        simulatedImpact: 72,
        actualMovement: -2.1,
      },

      {
        company_id: "CMP003",
        company_name: "Maruti Suzuki",
        ticker: "MARUTI",
        hop: 1,
        dependencyStrength: 0.48,
        simulatedImpact: 48,
        actualMovement: -1.2,
      },

      {
        company_id: "CMP005",
        company_name: "Tata Motors",
        ticker: "TATAMOTORS",
        hop: 2,
        dependencyStrength: 0.35,
        simulatedImpact: 25,
        actualMovement: -0.7,
      },
    ],

    evidence: [
      {
        source: "Annual Report",
        period: "FY2024",
        description:
          "Illustrative evidence describing exposure to raw material costs and downstream manufacturing economics.",
      },

      {
        source: "Historical Market Data",
        period: "2024",
        description:
          "Historical price movement used for comparison against the simulated dependency propagation.",
      },
    ],
  },

  {
    id: "EVT002",

    title: "Automotive Supply Disruption",

    period: "FY2023",

    date: "2023-09-12",

    category: "Supply Disruption",

    severity: "Medium",

    summary:
      "Example of a supply disruption propagating from an automotive component company toward downstream vehicle manufacturers.",

    eventDescription:
      "This scenario examines how disruption at an upstream automotive component supplier can create secondary pressure for companies dependent on those components.",

    source:
      "Illustrative historical-analysis dataset for frontend development.",

    sourceType: "Annual Report / Market Data",

    originCompany: {
      company_id: "CMP002",
      company_name: "Bharat Forge",
      ticker: "BHARATFORG",
    },

    propagation: [
      {
        company_id: "CMP002",
        company_name: "Bharat Forge",
        ticker: "BHARATFORG",
        hop: 0,
        dependencyStrength: 1.0,
        simulatedImpact: 100,
        actualMovement: -3.2,
      },

      {
        company_id: "CMP005",
        company_name: "Tata Motors",
        ticker: "TATAMOTORS",
        hop: 1,
        dependencyStrength: 0.35,
        simulatedImpact: 35,
        actualMovement: -1.1,
      },
    ],

    evidence: [
      {
        source: "Annual Report",
        period: "FY2023",
        description:
          "Illustrative evidence concerning supplier concentration and component availability.",
      },

      {
        source: "Historical Market Data",
        period: "2023",
        description:
          "Historical market movement used for frontend demonstration.",
      },
    ],
  },

  {
    id: "EVT003",

    title: "Manufacturing Demand Shock",

    period: "FY2022",

    date: "2022-11-08",

    category: "Demand",

    severity: "Medium",

    summary:
      "Example scenario showing how a reduction in downstream demand can affect connected companies.",

    eventDescription:
      "The scenario demonstrates a demand-side shock and provides a second type of historical event for the MarketMind interface.",

    source:
      "Illustrative historical-analysis dataset for frontend development.",

    sourceType: "Market Data",

    originCompany: {
      company_id: "CMP003",
      company_name: "Maruti Suzuki",
      ticker: "MARUTI",
    },

    propagation: [
      {
        company_id: "CMP003",
        company_name: "Maruti Suzuki",
        ticker: "MARUTI",
        hop: 0,
        dependencyStrength: 1.0,
        simulatedImpact: 100,
        actualMovement: -2.8,
      },

      {
        company_id: "CMP002",
        company_name: "Bharat Forge",
        ticker: "BHARATFORG",
        hop: 1,
        dependencyStrength: 0.48,
        simulatedImpact: 48,
        actualMovement: -1.4,
      },
    ],

    evidence: [
      {
        source: "Historical Market Data",
        period: "2022",
        description:
          "Historical market movement used for frontend demonstration.",
      },
    ],
  },
]

export default historicalEvents