# Visual Verification Notes

- The command center renders the zero-friction repository target intake, four scenario cards, posture metrics, risk distribution, and a clearly labelled illustrative exposure trend.
- The CBOM inventory renders evidence-backed findings with source location, confidence, provenance, and a detail panel.
- The dependency graph renders scenario-specific service, library, algorithm, asset, endpoint, and data relationships, including an evidence-path side panel.
- The PQC guidance page renders Mosca-style planning controls, context-aware recommendations, and explicit indicative effort and latency labels.
- The migration, reports, and Quantum Descent views render with working navigation and the intended dark observatory design language.

The post-wiring desktop verification confirmed that the public seeded fallback remains populated across Inventory, Graph, Recommendations, Roadmap, and Quantum Descent. The active-scan selection policy is also covered by automated tests for signed-out fallback, empty history, and latest-scan preference.

At a 375-pixel mobile viewport, the command center collapses into a compact top navigation layout without clipping the scenario intake, posture metrics, risk distribution, or exposure outlook. The inventory transitions to a readable asset-and-role presentation with its evidence detail panel stacked beneath the records.

The final command-center check confirmed that scenario fallback metrics render immediately rather than leaving the dashboard blank during active-scan resolution. The risk-distribution cards are visibly actionable and route to the selected inventory finding; the corresponding `finding` query parameter selects that record’s evidence detail on the CBOM page.

The sandbox browser did not retain its prior ECDAT session while preparing the final authenticated workflow check, so persisted-scan UI verification remains pending a signed-in browser session. Automated tests cover the seeded-run persistence and active-scan selection paths.

The theme control was verified in the browser: its accessible label changed from “Switch to light theme” to “Switch to dark theme” after activation, and the command-center shell switched to the light presentation. Light-mode contrast was then refined for the cyan, emerald, amber, and rose semantic accents.

The browser was then reloaded while light mode remained active, confirming that the selected theme is persisted for the session through the application’s saved preference.

The CBOM Inventory was checked in light mode. The table, selected-evidence panel, critical risk badge, classical/quantum risk dimensions, and evidence-quality panel remain readable against the light surfaces.

The analytical workspace screens were rechecked after state handling was added. Inventory, Graph, Roadmap, and Quantum Descent show explicit loading messaging while their evidence queries resolve; PQC guidance continues to render its public fallback, and Reports clearly signals session or export readiness. The graph’s nodes and Inventory’s evidence rows now expose keyboard interaction patterns.

During the state-transition check, the graph exposed a React hook-order error. Memoisation was moved ahead of conditional state returns; the graph was reloaded successfully afterwards and rendered its relationship evidence, keyboard-addressable nodes, and blast-radius panel in light mode.

Keyboard activation was exercised on the dependency graph. Focusing the Mercury Payments API SVG node and pressing Enter updated the blast-radius lens from the full 22-edge overview to the node’s 8 direct evidence-backed relationships.

The Inventory evidence rows were confirmed as keyboard-focusable, including the ECDSA P-256 finding row selected for activation testing.

Pressing Enter on the focused ECDSA P-256 Inventory row replaced the selected evidence detail from RSA-2048 to the ECDSA record, including its high quantum-risk classification, location, library version, and provenance.
