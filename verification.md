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

After the reported black-page incident, the development service was restarted. The command center then rendered its seeded intake, assessment metrics, risk distribution, and exposure outlook; the CBOM Inventory also rendered all four evidence-backed records and the selected-evidence panel without a blank state.

The dependency graph was also loaded after the restart and displayed the full 16-node, 22-edge relationship view with its blast-radius evidence panel. This confirms the recovery on the principal command-center, inventory, and graph routes.

Authenticated saved-scan verification was completed in the workspace preview. Inventory presented evidence-backed records; Graph showed its 16 nodes and 22 edges; PQC Guidance showed Mosca-style controls and recommendations; Roadmap displayed remediation waves; and Quantum Descent showed the active scan’s 34% readiness.

Development-only QA controls were used to exercise recovery states without changing production behavior. Error panels with retry controls were confirmed for Inventory, Graph, PQC Guidance, Roadmap, Reports, and Quantum Descent. Empty panels were confirmed for Inventory, Graph, PQC Guidance, Roadmap, and Quantum Descent, while the signed-out Reports page provided the expected save-a-scan readiness state.

After the user signed in and saved a demo scan, the live command center resolved to the persisted **Atlas Treasury Platform** scenario. It displayed 83 cryptographic assets, 2 quantum-vulnerable assets, 2 potential HNDL exposures, 29% quantum readiness, and source evidence from the Java enterprise service scenario.

The authenticated CBOM Inventory initially presented its public fallback while the saved-scan query resolved, then correctly refreshed to the persisted Java enterprise findings: Core banking client transport, Treasury document signer, and Ledger archive encryption. The selected RSA-2048 record retained its on-premises source location, 18-year data lifetime, and Java JSSE provenance.

The authenticated Dependency Graph also settled to the persisted Atlas Treasury scan, showing 13 nodes and 16 edges. Its focused service node connected to Core banking client transport, Java JSSE 17, RSA-2048, the Java enterprise boundary, and Secret data through evidence-backed relationship paths.

The authenticated PQC Guidance view resolved to the same Java enterprise scan, displaying the 15-year lifetime, 18-month migration time, and 9-year CRQC planning horizon. Its recommendations adapted to the saved context, including X25519 + ML-KEM-1024 for the secret inter-bank transport and an HSM-aware ECDSA + ML-DSA-87 signature path for the Treasury document signer.

The authenticated Migration Roadmap resolved its persisted remediation plan into three ordered waves: remove immediate classical weaknesses, upgrade shared dependencies, and introduce hybrid quantum-safe paths. Each wave retained its indicative effort label and dependency gate.

The Roadmap now makes its saved-scan source explicit: the authenticated view displayed the **Saved scan roadmap** label and **Active context: Atlas Treasury Platform** before the remediation waves.

Quantum Descent settled from the public fallback to the persisted Atlas Treasury posture, changing from 34% to the saved scan’s 29% quantum readiness and retaining the enterprise-to-system-to-asset-to-risk navigation controls.

Reports & export also resolved to the authenticated saved scan. Both **Download JSON** and **Download HTML** actions became enabled, and the readiness panel reported “Ready from saved scan.”

The authenticated Reports empty state was also exercised with the development-only QA control. It disabled both export downloads and displayed: “No saved scans yet. Create one from the command center to enable export,” together with a Start a demo scan action. Combined with the prior QA error and empty checks, this completes explicit resilience-state verification across Inventory, Graph, PQC Guidance, Migration Roadmap, Reports, and Quantum Descent.

| Workspace view | Error state | Empty state | Saved-scan state |
|---|---|---|---|
| Inventory | Verified with retry control | Verified with no-record guidance | Verified with Atlas Treasury Java evidence |
| Dependency Graph | Verified with retry control | Verified with no-node guidance | Verified with 13 nodes and 16 edges |
| PQC Guidance | Verified with retry control | Verified with no-recommendation guidance | Verified with context-aware Java recommendations |
| Migration Roadmap | Verified with retry control | Verified with no-wave guidance | Verified with Atlas Treasury saved-scan marker |
| Reports & export | Verified with retry control | Verified with authenticated no-scan readiness | Verified with enabled JSON and HTML exports |
| Quantum Descent | Verified with retry control | Verified with no-posture guidance | Verified with 29% saved-scan readiness |

The repaired persistence flow was exercised with the Java enterprise scenario selected in an authenticated session. The scan action entered its explicit “Saving scan…” state without reproducing the previous immediate findings-insert error.

The repaired Java enterprise scan completed successfully and navigated to its persisted CBOM Inventory, which displayed the three expected findings and the `java-core-rsa` evidence record. A database check confirmed that `java-core-rsa` now exists in **two distinct scan keys**, proving the revised scan-scoped unique constraint permits repeated seeded scenario runs while preserving each run’s findings.

The regression suite now includes a repeated-run payload test for the same seeded `findingKey` under two different `scanKey` values, plus a failure-path test that confirms a transactional findings-insert error prevents the post-insert detail lookup. TypeScript validation and all **14** project tests pass.

The failure-path test now uses a stateful transaction simulation: it stages the initial scan row, forces the findings insert to fail, and proves that neither the staged scan nor related detail payloads are committed after the transaction rejects.

## Spatial Mode verification

The Quantum Descent page now presents an explicit **ENTER SPATIAL MODE** action while retaining the existing normal enterprise-to-risk navigation. The spatial scene was verified against the authenticated saved Mercury Payments scan, which rendered calculated enterprise clusters, selected RSA-2048 evidence metadata, active-scan metrics, an evidence-derived blast-radius summary, and the recommendation engine’s generated hybrid migration target with indicative effort and latency labels.

The WebGL renderer was verified after removing the development-only JSX location injector that attempted to pass unsupported `data-loc` attributes to React Three Fiber primitives. The finished scene renders a central high-risk node and bounded current-level entities rather than an unfiltered inventory. It supports Enterprise, Risk, Dependency, Cryptography, Timeline, and Migration lenses; normal back/breadcrumb controls; and reset behavior.

Search-to-descent was exercised by searching for **ECDSA P-256**. Selecting the observed finding moved the spatial level to its artefact context and showed the corresponding `ECDSA + ML-DSA-87` generated recommendation, compatibility condition, and relevant remediation waves. The selected RSA-2048 path also showed a Mosca-style timeline with the configured planning horizon explicitly labelled as an estimate, together with the derived HNDL status.

The **Exit to inventory** control was verified from Spatial Mode. It routed to `/inventory?finding=py-tls-rsa` and opened the selected RSA-2048 CBOM evidence detail rather than losing the current investigation context.

At a 390-pixel mobile viewport, Spatial Mode used the responsive, keyboard-addressable two-dimensional fallback. It rendered the same calculated enterprise clusters and selected-finding details without WebGL interaction requirements. The fallback communicates “Select an observed entity to descend” rather than showing inactive orbit controls.

The final regression suite includes four scan-derived spatial projection tests for calculated clusters, evidence-backed blast radius, finding-specific timeline and migration mapping, and search results. TypeScript validation passed, and the full suite passed with **21 tests** across six files.
