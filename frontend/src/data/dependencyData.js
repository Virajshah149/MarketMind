const dependencyData = {
  CMP001: {
    CMP002: {
      strength: 0.72,
      impact: 72,
      relationship: "Supplier → Customer",
      explanation:
        "The relationship represents a strong dependency between Tata Steel and Bharat Forge. A disruption affecting steel availability or cost can create pressure on downstream manufacturing.",
      evidence: {
        source: "Annual Report",
        period: "FY2024",
        note: "Illustrative evidence for frontend development.",
      },
    },

    CMP003: {
      strength: 0.48,
      impact: 48,
      relationship: "Supplier → Customer",
      explanation:
        "Steel and related metal inputs can affect automotive manufacturing costs. The simulated impact is weaker than the primary dependency.",
      evidence: {
        source: "Annual Report",
        period: "FY2024",
        note: "Illustrative evidence for frontend development.",
      },
    },

    CMP005: {
      strength: 0.35,
      impact: 35,
      relationship: "Supplier → Customer",
      explanation:
        "The simulated relationship represents a lower-strength downstream dependency where changes in steel input costs can affect manufacturing economics.",
      evidence: {
        source: "Annual Report",
        period: "FY2024",
        note: "Illustrative evidence for frontend development.",
      },
    },
  },

  CMP002: {
    CMP005: {
      strength: 0.35,
      impact: 35,
      relationship: "Supplier → Customer",
      explanation:
        "A disruption affecting an automotive component supplier can propagate to downstream vehicle manufacturing.",
      evidence: {
        source: "Annual Report",
        period: "FY2024",
        note: "Illustrative evidence for frontend development.",
      },
    },
  },
}

export default dependencyData