# Visual Verification Notes

- The command center renders the zero-friction repository target intake, four scenario cards, posture metrics, risk distribution, and a clearly labelled illustrative exposure trend.
- The CBOM inventory renders evidence-backed findings with source location, confidence, provenance, and a detail panel.
- The dependency graph renders scenario-specific service, library, algorithm, asset, endpoint, and data relationships, including an evidence-path side panel.
- The PQC guidance page renders Mosca-style planning controls, context-aware recommendations, and explicit indicative effort and latency labels.
- The migration, reports, and Quantum Descent views render with working navigation and the intended dark observatory design language.

The post-wiring desktop verification confirmed that the public seeded fallback remains populated across Inventory, Graph, Recommendations, Roadmap, and Quantum Descent. The active-scan selection policy is also covered by automated tests for signed-out fallback, empty history, and latest-scan preference.

At a 375-pixel mobile viewport, the command center collapses into a compact top navigation layout without clipping the scenario intake, posture metrics, risk distribution, or exposure outlook. The inventory transitions to a readable asset-and-role presentation with its evidence detail panel stacked beneath the records.

The final command-center check confirmed that scenario fallback metrics render immediately rather than leaving the dashboard blank during active-scan resolution. The risk-distribution cards are visibly actionable and route to the selected inventory finding; the corresponding `finding` query parameter selects that record’s evidence detail on the CBOM page.
