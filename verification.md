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

## Zumerlab-inspired Spatial Mode visual update

The supplied Zumerlab reference was translated into the **Spatial Mode field only**, not applied as a generic platform reskin. The retained ECDAT data model, risk semantics, navigation, WebGL renderer, and accessible fallback continue to drive all visible entities and relationship paths.

The desktop field was verified in the dark workspace. It now uses a deep blue-black focus field, indigo depth bloom, fine blue grid, compact elevated observation labels, amber/coral focus accents, controlled camera drift, and warm selected relationship paths. Risk values remain encoded by the scene’s observed risk weights; the warmer focus palette adds hierarchy without inventing new security states.

The responsive 390-pixel fallback was rechecked. It retained its keyboard-addressable calculated entity cards, while adopting the same blue depth field, compact elevated cards, amber/coral selected state, and no-WebGL guidance. The normal-mode exit, evidence detail, and data labels remained unchanged.

The style update intentionally removed the Spatial Mode blur treatment and keeps non-essential motion behind the existing reduced-motion preference. TypeScript validation passed and the full Vitest suite remained green with **21 tests** across six files.

## Improvement plan Phase 1 audit

The supplied Phase 1 blocker plan was reconciled with the existing platform. The live project already contains the required Drizzle schema, including authenticated users plus scan, finding, assumption, recommendation, relationship, and migration-wave persistence. It also uses managed environment configuration rather than a committed local `.env` file.

The development service is running, `pnpm check` completed successfully, and the full Vitest suite passed with **21 tests**. A direct request to the registered public `ecdat.preview` tRPC procedure returned HTTP **200**, confirming the seeded-preview API surface remains reachable. No replacement schema, local credentials, or new bootstrap configuration was introduced.

## Improvement plan Phase 2 — seeded exports

The Reports workspace now supports both authenticated saved-scan exports and unauthenticated seeded-demo exports. A public `ecdat.previewExport` tRPC procedure builds the same CycloneDX-oriented CBOM shape and executive HTML report from deterministic scenario evidence without creating a database record. Its direct endpoint probe returned HTTP **200** with a populated response.

Reports clearly identifies whether the source is a saved active scan or a seeded demo preview, provides generation feedback, exposes CBOM JSON and executive HTML downloads in either mode, and includes a read-only sample of exported findings before download. The saved-scan flow was visually verified with the Mercury Payments scan, including its evidence cards. TypeScript validation passed, and the full suite now passes with **22 tests** across six files.

The public fallback was rechecked across Command Center, CBOM Inventory, Dependency Graph, PQC Guidance, Migration Roadmap, Reports, and Quantum Descent. All routes rendered their active seeded evidence model without a route-specific crash or empty-state divergence. The Reports route retains its labelled seeded export path when no saved scan is selected; the authenticated Mercury Payments view continues to use the saved-scan export path.

## Improvement plan Phase 3 — Command Center

The Command Center now derives its quantum exposure composition from the active findings, separating quantum-vulnerable, legacy/monitor, and lower-quantum-exposure records. Its evidence outlook is also derived from confidence-ordered risk weights and is explicitly labelled as an evidence signal rather than historical telemetry.

Recent activity now identifies whether the current context comes from saved scan evidence or seeded demo evidence, including finding and relationship counts. All four KPI cards are keyboard-accessible drill-down actions: inventory, a quantum-vulnerable finding, a qualified HNDL finding, and PQC guidance respectively. The quantum-vulnerable drill-down was exercised against the Mercury Payments scan and opened the RSA-2048 evidence detail. TypeScript validation passed and the full suite passes with **23 tests** across seven files.

## Improvement plan Phase 4 — Inventory and graph exploration

CBOM Inventory now provides active-data search, risk, quantum-state, and environment filters; deterministic sorting by algorithm, risk, criticality, and confidence; pagination; and richer library/version, environment, sensitivity, confidence, and risk columns. Selected evidence retains its source-level metadata and now shows a relationship-derived blast-radius summary plus recommendation preview. The quantum-vulnerable filter was exercised on the Mercury Payments scan and correctly narrowed the view to RSA-2048 and ECDSA P-256.

Dependency Graph now uses a deterministic type-aware layout from the active relationship model, with explicit node-type legend, drag pan, scroll/button zoom, reset, selected-edge focus, and focused blast-radius severity context. The RSA-2048 focus path was verified, showing the three observed IMPLEMENTS, PROTECTS, and SUPPORTS relationships with one high-risk linked finding. TypeScript validation passed and the full suite passes with **25 tests** across eight files.

## Improvement plan Phase 5 — recommendations and roadmap

PQC Guidance now presents a controlled Assess → Pilot → Roll out migration path, richer observed-versus-candidate comparisons, compatibility and HNDL context, and a Mosca-style planning timeline derived from the three editable planning inputs. The timeline is explicitly described as a planning aid rather than a forecast or delivery certainty. It was visually verified with the Mercury Payments recommendation set.

Migration Roadmap now makes sequencing visible through wave gates and progress connectors, and adds an indicative aggregate effort summary parsed from the displayed wave labels. The Mercury Payments roadmap correctly reports **7–17 engineer-weeks across 3 labelled waves**, accompanied by a clear caveat that it excludes parallel work, staffing, dates, and production readiness. TypeScript validation passed and the full suite passes with **27 tests** across nine files.

## Improvement plan Phase 6 — Quantum Descent

Quantum Descent normal mode now presents active-scan depth cues for assets, relationship links, findings, and actions, together with a visible depth-progress indicator. The new **Focus highest risk** action enters Spatial Mode directly at the active scan’s risk lens and selected highest-risk RSA-2048 evidence, while retaining the existing normal Spatial Mode entry. The spatial deep link is now explicit (`?spatial=1`) and the Normal mode control correctly returns to the clean `/descent` route. Both transitions were visually verified against the Mercury Payments saved scan.

## Improvement plan Phase 7 — global workspace access

The dashboard shell now includes a keyboard-accessible global command search, opened by the visible Search workspace control or `Ctrl/Cmd+K`. It searches navigation, active observed evidence, and generated guidance. Selecting the RSA-2048 observed-evidence result was verified to open the corresponding Inventory detail route.

The shell also provides a non-destructive Active risk signals panel derived only from the active scan’s critical or HNDL-qualified findings. The Mercury Payments notification panel correctly surfaced its RSA-2048 and ECDSA P-256 potential HNDL signals, each with direct evidence-detail access. TypeScript validation passed and the full suite passes with **28 tests** across ten files.

The workspace now also displays a brief ECDAT Quantum Observatory initialization sequence on the first workspace load in a browser session. The overlay is explicitly pointer-transparent, auto-dismisses after a short interval, is bypassed under reduced-motion preference, and is suppressed on subsequent in-session route loads. TypeScript validation passed after its addition.

The initialization overlay was visually verified through the development-only `?qaBoot=1` preview after clearing the session marker. The branded ECDAT Quantum Observatory sequence appeared over the already-rendered workspace, then auto-dismissed to reveal active controls. The overlay uses `pointer-events: none`, so it does not block interaction; reduced-motion and already-initialized sessions bypass it by design.

The visible boot overlay’s pointer transparency was exercised directly: selecting the underlying Search workspace control while the overlay was visible opened the command palette, confirming no interaction interception. A repeat in-session `?qaBoot=1` load rendered without the overlay. A fresh development-only `?qaBoot=1&qaReduced=1` load also rendered without the overlay, confirming the reduced-motion bypass. The two preview query flags are development-only verification aids and do not alter normal workspace behavior.

## Improvement plan Phase 8 — polish and resilience

The shared visual system now has consistent visible focus rings, reduced-motion overrides for non-essential animations and smooth scrolling, and compact-screen padding/scrollbar refinements. The reusable workspace-state card now exposes status updates to assistive technology and adds contextual loading, error, and empty-state guidance rather than presenting an isolated message.

At a 375-pixel viewport, the Command Center retained its mobile shell, readable hierarchy, primary search and theme actions, and vertically accessible demo intake. The CBOM Inventory empty-state route retained its compact filters and showed its clear no-record guidance without clipping the main workspace. Both views were visually verified after the polish update.

Desktop and 375-pixel mobile checks were completed for Dependency Graph, PQC Guidance, Migration Roadmap, Reports, and Quantum Descent. Each retained readable hierarchy, route-specific actions, and the compact mobile shell without horizontal page overflow. The graph preserves its explicit zoom controls at small widths, the planning controls stack vertically, reports retain export context, and Quantum Descent retains its high-risk and Spatial Mode entry actions.

The Dependency Graph development-only error route was also exercised after the `WorkspaceState` update. It rendered the enriched Workspace guidance card with a clear statement that the active scan was unchanged and an available Try again action. Final TypeScript validation and the full Vitest suite passed with **28 tests** across ten files.

The Dependency Graph development-only loading route was exercised as well. It displayed the enhanced status card, the three-part loading indicator, and the new guidance that active-scan evidence, relationships, and generated guidance are being resolved. Together with the verified Inventory empty state and Graph error state, this confirms the shared loading, empty, and error guidance after the polish update.

## Spatial intelligence — illustrative attack traversal and protected copilot

Quantum Descent now includes an explicitly labelled **Simulate path** action in its desktop WebGL experience. It performs a bounded breadth-first traversal only over the currently visible, scan-derived dependency edges; it does not create synthetic topology, call exploit tooling, or make claims about breach likelihood, reachability, or quantum capability. In the verified RSA-2048 evidence path, the completed view reported **12 entities reached** and **11 edges traversed**, with hit rings and active relationship paths visible in the scene. The accompanying summary retains the explicit caveat that it is an illustrative observed-path traversal, not an exploit demonstration, breach prediction, production reachability claim, or quantum-computing estimate. The **Clear simulation** action was exercised and removed the summary and attack styling while retaining the selected evidence context.

The responsive 390-pixel Spatial Mode view was also checked. It switches to the accessible two-dimensional entity-card fallback, communicates “Select an observed entity to descend,” and does not render the simulation action. This preserves the original mobile and reduced-motion interaction model without WebGL-only controls. The AI Analyst control remains visibly disabled whenever no saved scan key is available; attack traversal remains usable on clearly labelled seeded preview data because it reads only the active graph already on screen.

The new **AI Crypto Analyst** panel is available only for a saved scan and sends bounded messages through the protected `ecdat.chat` procedure. The procedure re-reads the requested scan under the authenticated user, builds a constrained context from canonical findings, relationships, recommendations, assumptions, and waves, and invokes the managed server-side model without exposing a browser key or local secret. The saved Mercury Payments scan was used to ask “Which observed assets are most at risk?” The analyst returned a scan-grounded prioritisation that named the observed public TLS entrypoint, settlement JWT signer, legacy webhook verifier, and ledger envelope encryption, then distinguished recommended migration planning from certainty. The response focused an allow-listed observed finding rather than accepting an arbitrary node identifier.

The GPT request now uses `max_completion_tokens`, which restored visible structured analyst output for `gpt-5-mini` where the legacy token cap had produced an empty response. Final TypeScript validation passed. The full Vitest suite passed with **33 tests** across thirteen files, including bounded traversal/sanitisation coverage, copilot response/focus allow-list coverage, and a mocked managed-LLM request-shape regression test.

## Command Center redesign — active-scan analytics and contextual navigation

The Command Center now consumes one normalized `buildCommandCenterViewModel` derived from the existing `useActiveEcdatScan` contract. It does not introduce a dashboard-specific fetch or duplicate source of truth. The view model reconciles current findings into risk counts, quantum exposure buckets, algorithm counts, generated migration candidates, active context, and visible saved-scan history. Migration candidates are deliberately limited to recommendations tied to observed quantum-vulnerable findings; they are ordered by generated priority, then current risk and criticality. A focused test confirms the risk distribution, quantum exposure composition, algorithm total, and candidate subset reconcile against the same finding population.

The revised top area uses a compact seeded-demo intake beside the active assessment rather than the former large intake panel. The assessment shows the saved-versus-preview source, name, scan-derived finding/action/evidence counts, potential HNDL caveat, and a reusable Recharts partial-arc readiness gauge. The desktop check of the saved **Atlas Treasury Platform** context showed 3 findings, 2 actions, 16 evidence links, 83 assets, 29% readiness, 2 critical findings, 2 quantum-vulnerable findings, and 2 potential HNDL findings. All planning and exposure labels remain explicitly evidence-derived and non-certifying.

The page now contains six accessible contextual KPI controls, risk and quantum-exposure donuts, an interactive top-algorithm distribution, migration candidates, recent scans for authenticated users, quick actions for unauthenticated users, and a restrained activity feed. The Critical Findings control was exercised end-to-end: it navigated to `/inventory?risk=critical`, and the CBOM Inventory opened with exactly the two critical Atlas evidence records filtered in. A migration candidate was also exercised and navigated to `/inventory?finding=java-core-rsa`, opening the matching RSA-2048 detail panel. These links preserve concrete risk, algorithm, or finding context instead of sending users to an unfiltered landing view.

At the 390-pixel mobile viewport, the intake, assessment gauge, six KPI cards, analytics, migration candidates, history, and activity feed reflowed into one readable vertical sequence without horizontal clipping. The Command Center now presents the existing `WorkspaceState` loading and retryable error treatments before any active findings resolve, preventing transient zero-valued charts or broken data visualisations. Final TypeScript validation passed and the complete Vitest suite passed with **34 tests** across fourteen files.

## CBOM Inventory redesign — full evidence detail and contextual exploration

The CBOM Inventory now consumes the shared active scan without an Inventory-specific data fetch. Its normalized utility layer exposes every persisted evidence field required by the redesigned page, including asset type, evidence description, provenance, usage context, risk dimensions, HNDL qualification, and generated recommendation type. The utility test reconciles summary totals to the finding population, filters direct search and quantum-vulnerable evidence, verifies deterministic Shift-appended multi-sort, and confirms a single-asset export contains only the selected observed finding.

The desktop Inventory now presents five scan-derived summary cards, a full evidence filter toolbar, active filter chips, a persisted visible-column selector, a 15/25/50 row setting, sort controls, pagination, and a thirteen-column table. The authenticated **Atlas Treasury Platform** context was checked with 3 total assets, 2 critical findings, 2 quantum-vulnerable findings, 2 potential HNDL exposures, and 93% mean evidence confidence. All values reconcile to the same three table rows; the table does not introduce any synthetic assets, applications, relationships, or quantum-state labels.

Direct evidence links now open an accessible right-side drawer. The `java-core-rsa` route was verified to open the observed Core banking client transport record. Its Identity & Usage tab showed scanner-backed source, library, version, data context, and provenance. The Risk Profile tab displayed the existing risk classification, HNDL qualification, data lifetime, and clearly labelled indicative migration estimate; it does not present a fabricated numeric classical-risk score. The Blast Radius tab showed the existing two-hop relationship lens and caveat, and the Recommendation tab showed the matching generated hybrid key-establishment path with its indicative-planning disclaimer.

The detail drawer’s contextual actions were verified. **Dependency graph** navigated to `/graph?finding=java-core-rsa` and focused Core banking client transport in the graph’s blast-radius lens. **Explore in Descent** navigated to `/descent?finding=java-core-rsa`; after the saved scan resolved, the view arrived at the evidence-backed risk-verdict depth. The drawer also provides a client-side single-asset ECDAT CycloneDX-oriented CBOM JSON download based strictly on the selected evidence row. The working route is `/descent`, rather than the unregistered `/quantum-descent` route named in the supplied design.

At 390 pixels, the table intentionally becomes compact evidence cards with asset/type/role, risk, algorithm, quantum state, environment, and confidence; no horizontal table scroll is required. The no-filter-results state was exercised with a non-matching search and offered the clear-filters recovery action. The development-only Inventory QA routes were then captured explicitly: `qaState=empty` showed the no-scan guidance and Command Center action, while `qaState=error` showed the retryable data-unavailable treatment. Keyboard support includes `Ctrl/Cmd+F` search focus, Enter/Space row opening, Arrow-key row movement, visible focus styles, and Escape-close behavior provided by the accessible drawer primitive. Final TypeScript validation passed and the complete Vitest suite passed with **38 tests** across fifteen files.

## Post-scan destination repair — Command Center retained after scan completion

The reported right-side container was the newly added Inventory evidence drawer. The scan-completion callback in the Command Center was previously routing every successful scan directly to `/inventory?finding=<first finding>`, which correctly opened the drawer but made it appear unsolicited after a scan.

The completion destination now remains `/`, so the Command Center refreshes with the newly saved active scan instead of opening Inventory or any drawer. The saved scan key remains persisted locally and both scan-list and detail queries are invalidated before the Command Center is retained. A focused unit test asserts the post-scan destination is the Command Center route.

The signed-in browser flow was exercised with a deterministic Python demo scan. During completion the page stayed at the Command Center URL; after it settled, it displayed a saved **Mercury Payments API** assessment with its scan-derived 4 findings, 3 actions, and 22 evidence links. No right-side Inventory detail drawer appeared. TypeScript passed and the full Vitest suite now passes with **39 tests** across sixteen files.

## CBOM inline detail correction — no sideways navigation

Following the requested removal of sideways CBOM navigation, the former fixed right-side drawer component was removed from the Inventory route and from the project. The default CBOM page now contains only the full-width summary, filters, and evidence table or mobile evidence cards. No finding is selected unless the user activates a row or arrives through an explicit `?finding=` deep link.

Row activation now adds the detail panel in the ordinary vertical page flow underneath the full-width table. It keeps the same scan-derived identity, risk, dependency lens, generated recommendation, cross-workspace actions, and single-asset CBOM export. The panel is dismissed by its visible **Close details** button or the Escape key; dismissal removes the finding parameter and restores the full-width inventory state. The regression suite now explicitly verifies that non-finding URLs leave the panel closed and that a `?finding=` URL selects only the named evidence record.

The signed-in **Sovereign Records Portal** Inventory was visually checked at desktop width: the default view presented three full-width CBOM records without a side panel. Selecting Inter-agency VPN profile displayed the detail panel below the table, retaining the expected action tabs and no overlay/backdrop. Closing it returned to the full-width table. At 390 pixels, the table became compact evidence cards and the selected Public payment TLS entrypoint detail remained below those cards, with no side panel or sideways transition. TypeScript passed and the full Vitest suite passed with **40 tests** across sixteen files.

## CBOM route-shell correction — persistent workspace sidebar removed

The clarified issue was the persistent **left-side intelligence-workspace navigation**, rather than the evidence detail panel. CBOM Inventory is now routed outside the shared `DashboardLayout`, so it no longer inherits the desktop sidebar, its collapse state, or its mobile drawer behavior. All other ECDAT routes remain in the established workspace shell.

The CBOM route now uses a compact, stable top frame with ECDAT identity, a workspace destination selector on larger screens, a Command Center return action, theme control, and account context. This preserves a clear escape route without consuming a fixed side column. The inventory content starts below this header at the full available width; its existing inline evidence details remain in normal page flow.

Desktop verification confirmed that the active **Sovereign Records Portal** inventory takes the full viewport width with no persistent left navigation and retains its full table, filters, summary cards, and inline detail behavior. At 390 pixels, the compact top frame showed only identity and essential controls, followed by stacked CBOM summaries, filters, and evidence cards—with no sidebar, drawer, or sideways transition. TypeScript passed and the full Vitest suite passed with **40 tests** across sixteen files.

## CBOM rebuild — specified full-width table and overlay detail drawer

The Inventory route has been rebuilt from scratch around the supplied implementation plan and is again scoped to `Inventory.tsx` inside the established workspace layout. The permanent split detail area and all prior inline-detail work have been removed from the page. The default state contains one full-width table region with **no selected finding**; the table is never reduced to make room for a detail panel.

The new table presents exactly eight sortable columns: Risk, Asset, Algorithm, Role, Library, Version, Quantum, and Confidence. Each header toggles ascending or descending order. It includes one evidence-backed search field, Risk Level and Quantum State dropdown filters, removable active-filter chips, 15-row pagination, a visible `Showing X–Y of Z` indicator, and a recoverable no-filter-results state. The signed-in Sovereign Records Portal scan was exercised with a `strongSwan` search, which reduced the observed inventory to Inter-agency VPN profile; clearing the chip restored all records. The Critical risk dropdown showed only the three critical observed findings. Asset sorting toggled visibly to ascending order, and a no-match search produced the expected clear-filters recovery state.

Clicking an observed row or using an explicit `?finding=` URL opens a fixed right-side overlay drawer over a dimmed, preserved table. It has an overlay backdrop, a visible close control, Escape-key dismissal, and deep-link selection. The drawer is populated only from the selected scan finding and presents Identity, Risk, Evidence, and Actions sections. Its actions retain the existing dependency-graph and Quantum Descent context links and single-asset CBOM download; migration guidance remains caveated as indicative. The default desktop table and `?finding=py-tls-rsa` overlay state were checked visually. At 390 pixels the table collapses into a compact first-column record presentation and the drawer’s `w-full` fixed overlay behavior is retained for the narrow screen.

Dedicated table-utility tests now cover combined filtering, selected-column sorting, bounded pagination, and the rule that no drawer opens unless an explicit finding deep link is present. TypeScript passed and the full Vitest suite passed with **44 tests** across seventeen files.

The rebuilt page’s explicit development-only quality-assurance routes were also exercised after the rewrite. `qaState=loading` displayed the stable evidence-resolution state without rendering the table prematurely. `qaState=empty` displayed the no-scan guidance and Command Center recovery action. `qaState=error` displayed the retryable inventory-unavailable treatment. These checks confirm that the page retains clear loading, no-scan, and recoverable failure behavior alongside the new full-width table and drawer flow.

## Dependency Graph rebuild — scan-derived SVG exploration and blast-radius lens

The Dependency Graph has been rebuilt around a new `graphUtils` evidence layer. `extractNodes` projects only source and target IDs present in the active scan’s relationship records into deterministic Service, Library, Crypto, Certificate, Endpoint, and Data columns. `buildEdges` accepts only observed relationship pairs, while the bounded chain and reverse-path helpers use existing scan relationships rather than constructing runtime topology, inferred services, or attack paths. Focused tests cover typed node extraction, positioned observed edges, bidirectional dependency-chain membership, reverse-path counts, complexity labels, and the absence of synthetic topology.

The new Graph page uses an interactive SVG rather than Canvas. It includes drag-to-pan, wheel and button zoom constrained to 0.45×–3×, Reset View, an application-scope dropdown, node/edge counters, curved relationship paths, a six-type legend, keyboard-selectable nodes, and Escape-key selection reset. A selected node brightens its observed ancestor/descendant chain; unrelated nodes and paths are dimmed. The selected relationship lens is explicitly labelled as an observed dependency view, not evidence of runtime reachability, operational impact, exploitability, or quantum capability.

The signed-in Sovereign Records Portal context was exercised with 14 graph nodes and 17 relationship records. A `?finding=gov-rsa-cert` graph deep link focused the matching observed certificate-authority path and populated the Blast-radius lens with one service, one evidence asset, two observed entities, and one relationship record. The **View affected assets** action opened `/inventory?finding=gov-rsa-cert` and the matching CBOM evidence detail. The **Create migration plan** action preserved the same finding key in the roadmap route. The default graph panel provides a type legend and selection guidance instead of forcing a selected entity.

At compact widths, the SVG preserves readable evidence labels in a horizontally explorable canvas instead of scaling every node down to an unusable size; the blast-radius panel follows beneath the graph. The Graph loading, no-relationship, and retryable-error QA routes were exercised after enabling the established development loading state. Final TypeScript validation passed and the full Vitest suite passed with **48 tests** across eighteen files.

Final interaction verification confirmed that dispatching the observed RSA-4096 node selection opens the relationship-derived blast-radius panel, illuminates only observed dependency-chain edges, and reports its scan-derived reverse-path counts. Escape restored the unselected legend state. Zoom-in changed the SVG transform and Reset View restored the default transform. The selected-evidence interaction remains stable through active-scan resolution; application-scope changes explicitly clear selection to avoid presenting a lens for an entity excluded from the current filtered graph.

The final SVG interaction refinement adds a transparent hit target around each node. A standard browser click on the RSA-4096 node then opened the Blast-radius lens without console dispatch, showing one service, zero endpoints, three evidence assets, four observed entities, and four relationship records for that reverse-path lens. The highlighted cyan edges were limited to the observed chain. This normal click result, together with Escape reset, zoom/reset controls, and the final **48-test** Vitest run, completes the graph interaction verification.

### Dependency Graph wheel-zoom removal

At the user’s request, scroll-wheel zoom was removed from the SVG canvas. A dispatched wheel event left the graph transform unchanged at `translate(0 0) scale(1)`. The visible Zoom In, Zoom Out, and Reset View controls remain the sole zoom mechanism; the Zoom In control and Reset View were exercised after the change. Canvas guidance now reads: “Drag to pan · use the zoom controls · Escape clears selection.” TypeScript passed and the full Vitest suite remained at **48 tests**.

## Evidence & Reports redesign — assessment package and traceable decision path

The former **Reports & export** utility route is now **Evidence & Reports** in the workspace navigation and global search. The page opens with an active-scan assessment package rather than download controls: source state, assessment status, target, Assets, High/Critical findings, quantum-vulnerable findings, quantum readiness, and an evidence-coverage calculation. Coverage is calculated only from findings that retain both source location and evidence text; it does not invent coverage, source records, historic scans, or impact values.

Four selectable report packages now provide an interactive preview for Executive posture, Technical CBOM, Quantum risk, and Migration plan. Implemented packages download as clearly labelled HTML assessment artifacts and the technical package retains the structured ECDAT CycloneDX-oriented CBOM JSON export. The preview surfaces derived readiness and risk distribution, observed relationship count, real generated recommendations, a CBOM explorer, pipeline-based export-readiness checks, and real saved-scan provenance/history only when saved scans are available.

The selected-finding Evidence chain explicitly distinguishes **Observed** source/context, **Derived** risk and relationship lens, **Estimated** indicative migration window, and **Recommended** generated guidance. The reverse relationship lens retains the caveat that it is not runtime reachability or exploit evidence. Its action buttons preserve the selected evidence key when opening Dependency Graph and Quantum Descent. The Migration Roadmap now reads an explicit `?finding=` key and presents an amber planning-context badge for the matched active finding; `/roadmap?finding=py-tls-rsa` visibly showed `RSA-2048 · Public payment TLS entrypoint`.

Desktop and 390-pixel mobile layouts were checked for the complete Evidence & Reports view. The mobile interface stacks the assessment package, report choices, preview, evidence chain, CBOM explorer, readiness, and provenance in a readable single column. Explicit `qaState=loading`, `qaState=empty`, and `qaState=error` routes were checked; they display stable preparation, recoverable no-assessment, and retryable unavailable states. TypeScript passed and the complete Vitest suite passed with **51 tests** across nineteen files, including new coverage for evidence-coverage/chain status and report-finding roadmap context.

### CBOM Explorer HTML export

The CBOM Explorer now exposes **Download CBOM HTML** beside **Export CBOM JSON**. The HTML control generates the existing scan-derived Technical CBOM package from the same active evidence model shown in the explorer, including asset, algorithm, risk, confidence, and retained source-location fields. The new control was confirmed in the full desktop Evidence & Reports view. TypeScript passed and the complete Vitest suite passed with **52 tests**.

## Unified Migration workspace — evidence-backed planning and local execution tracking

The workspace now exposes one **Migration** route that combines the former PQC guidance and roadmap workflows without duplicating the active-scan data source. It retains the Mosca-style planning inputs, adds explicit local-plan progress, a four-column priority kanban, and a sortable generated PQC recommendation table. Recommendation rows and kanban cards resolve to the same observed finding and generated candidate that produced them; no topology, recommendation, or execution status is fabricated.

Local migration-plan state is intentionally browser-scoped. Each item contains an observed finding key, asset, current algorithm, generated candidate, generated priority, displayed indicative effort, status, and timestamp. Duplicate additions are prevented; status cycles through **Planned → In Progress → Complete → Planned**; removal asks for confirmation; and unavailable local storage reports a visible warning instead of silently discarding the update. The progress bar distinguishes completed, in-progress, and planned items relative to the currently generated candidate set, with a caveat that plan tracking is not evidence of production implementation.

The migration detail drawer now exposes **Identity**, **Risk**, **Blast radius**, and **Migration** tabs. Its simulator shows observed current state, the generated candidate and compatibility notes, indicative effort and latency, an explicitly non-verified post-migration target, and scan-derived relationship counts. The same Migration simulator and Add to Plan behavior is available in the CBOM Inventory evidence detail panel. Relationship context remains caveated as a bounded evidence lens, not runtime reachability, operational impact, or exploit evidence.

Navigation now presents one sidebar **Migration** entry at `/migration`. Existing `/recommendations` and `/roadmap` routes remain as compatibility entry points to the unified page so prior links are not broken. Command Center candidates, Graph planning actions, Inventory evidence actions, Evidence & Reports actions, and generated-guidance search results now preserve the selected finding when opening `/migration?finding=…`. The legacy `/roadmap?finding=gov-rsa-cert` route was verified to load the unified Migration workspace after active data resolution.

On the saved Mercury Payments context, the workspace showed two generated candidates. Adding the RSA-2048 core-banking transport candidate created its P1 Immediate kanban card and changed progress from 0/2 to 1/2; cycling its status updated the tracker to **In Progress**. Selecting the card opened the drawer and displayed `RSA-2048 → X25519 + ML-KEM-1024`, its generated compatibility context, `4–8 engineer-weeks` indicative effort, and the scan-derived two service/endpoint and thirteen entity relationship lens. Desktop and 390-pixel mobile layouts were checked; explicit loading, empty, and error QA routes rendered stable preparation, guidance, and retry treatment. A development-only seeded-preview route rendered a distinct preview context with three active generated candidates rather than the signed-in saved-scan data. The migration-store tests also verify that storage-unavailable environments return a visible warning instead of failing silently. TypeScript passed and the complete Vitest suite passed with **56 tests** across twenty files.

## Migration roadmap rebuild — evidence-led decision layer

The Migration page was rebuilt from scratch around the supplied decision-and-execution flow rather than a table or kanban-first experience. It now begins with the active assessment’s quantum-readiness posture, scan-derived asset, vulnerability, high/critical, and potential-HNDL counts, followed by generated priority-band counts. These are explicitly labelled as scan posture and planning signals, not promises of production completion.

The new prioritisation matrix places only active-scan candidates on a five-by-five urgency-versus-effort lens. Urgency is an explainable bounded combination of observed risk, criticality, quantum and HNDL indicators, data lifetime, and migration timing. Effort is a relative planning lens from displayed indicative effort and bounded relationship breadth. Selecting a point updates the dossier with its observed current algorithm and usage, generated target and compatibility note, relationship-derived impact counts, relative effort factors, and the retained caveats against interpreting graph context as reachability, operational impact, or exploit evidence.

The page adds a visible current-to-target architecture comparison, a selected-asset Mosca decision lens, and an explicit statement that target posture values require a validated future scenario rather than being invented. The schedule now starts with a clearly labelled planning-only Prepare construct and then presents the active scan’s real remediation waves, scope, dependency gates, and indicative effort without fabricating wave completion. The status layer remains browser-local beneath the decision surface: candidates begin Discovered and can be explicitly moved through Planned, In Progress, and Verified.

The rebuilt route accepts `?finding=` context and retains graph and CBOM handoffs. Selecting the Atlas Treasury ECDSA P-384 matrix point updated the dossier to its Bouncy Castle 1.78 signature evidence, generated `ECDSA + ML-DSA-87` path, `5–10 engineer-weeks` indicative effort, and thirteen-entity relationship lens. Its dependency action navigated to `/graph?finding=java-hsm-ecdsa`, where the Graph focused Treasury document signer. Saved, seeded-preview, loading, empty, and error routes were checked along with 1280-pixel desktop and 390-pixel mobile layouts. TypeScript passed and the complete Vitest suite passed with **59 tests** across twenty-one files, including new migration-prioritisation tests.

## CBOM evolution — authoritative asset investigation hub

The CBOM Inventory was evolved rather than replaced. Its sortable eight-column evidence table, no-default-selection behavior, table pagination, and existing workspace composition remain intact. A new posture strip now states the active scan’s observed total assets and CBOM finding count alongside derived quantum-vulnerable and potential-HNDL counts, plus bounded service/endpoint and library relationship counts. These labels avoid treating relationship context as application ownership or operational reachability.

The existing search, risk, and quantum filters now add **Potential HNDL**, observed **Library**, and minimum **Confidence** controls. URL state, filter chips, clear behavior, sorting, pagination, and the open table context remain preserved. New pure utility coverage checks HNDL, library, confidence, and posture filtering without inventing assets or relationship records.

Row selection and `?finding=` deep links now open an **Asset Intelligence Drawer** that explicitly separates **Observed** identity, source evidence, provenance, usage, and data handling from **Derived** relationship/assessment context and the **Recommended** generated migration path. The drawer’s relationship section retains the bounded graph caveat, and assessment timing remains indicative. A prior active-source race was corrected so a requested finding remains selected while the saved scan resolves, rather than being discarded during the initial seeded preview.

The drawer links out rather than reproducing adjacent workspaces: **Inspect in Evidence & Reports** opened `/reports?finding=java-core-rsa` and showed the RSA evidence chain; **Open Migration** opened `/migration?finding=java-core-rsa` and focused the corresponding RSA-2048 dossier. Its Dependency Graph action uses the same focused finding handoff. Saved and seeded contexts, loading, empty, and retryable-error states, 1280-pixel desktop, and 390-pixel mobile layouts were checked. TypeScript passed and the complete Vitest suite passed with **61 tests** across twenty-one files.

## Command Center scanner-progress experience

The Discovery intake now presents a clear **Simulated scanner progress** panel during a deterministic scenario run. It advances through scope acceptance, AST scanning, dependency analysis, container inspection, and CBOM cataloguing, while showing a bounded simulated-discovery counter. The component explicitly states that it is a visual UI simulation only: it does not clone or inspect the entered repository. This preserves the existing seeded demo contract rather than implying unimplemented repository scanning.

On completion, the panel reports the real saved scenario’s `totalAssets` as the CBOM-catalogued count, displays all stages as complete, and remains briefly visible while the Command Center refreshes to the saved active assessment. A run of the Python web scenario visibly completed with **47 CBOM assets catalogued**, refreshed the Mercury Payments API assessment, and remained on the Command Center as required. The retry treatment was also checked through the development-only scanner error state; it states that no scan records were changed and exposes a retry action. The layout was checked at desktop and 390-pixel mobile widths. TypeScript passed and the complete Vitest suite passed with **63 tests** across twenty-two files, including scanner-progress helper coverage.

## Remediation Lab — standalone replacement for Quantum Descent

Quantum Descent has been removed from the active route, sidebar, global search, and its unused implementation files. It is replaced by **Remediation Lab**, an independent `/lab.html` Vite entry that has no dashboard shell, tRPC client, authentication query, Wouter router, or persisted scan mutation. The development Vite middleware was extended to deliver the separate entry and the production multi-page build now emits both `index.html` and `lab.html`. Legacy `/descent` URLs forward into the built-in standalone Lab scenario so older bookmarks do not reach a dead page.

The Lab supports three built-in scenarios—RSA key exchange, ECDSA signature, and AES storage—and compact custom context via a validated base64url hash. Only the finding key, algorithm, library, role, risk state, quantum/HNDL booleans, source location, planning timing, and confidence travel through this hash. A malformed hash produces a contained unsupported-context state rather than rendering unvalidated data. The five-stage interface is explicitly local and simulated: **Found**, **Proposed**, **Applied**, **Tested**, and **Verified**. It never reads, clones, changes, tests, or verifies a repository, dependency, production service, or cryptographic implementation.

The main sidebar now launches the built-in scenario in a new browser tab. Selected active findings in CBOM, Dependency Graph, and Migration open the Lab with their compact context. The CBOM handoff for `java-core-rsa` produced an isolated Lab page showing the retained `ledger-gateway/src/main/java/TlsClient.java:73` source location, Java JSSE library, 93% confidence, 18-year data lifetime, and 24-month planning window. The built-in RSA Lab loaded independently, progressed from Found to Proposed, and its 390-pixel mobile layout was checked. TypeScript passed, the production multi-page build succeeded, and the complete Vitest suite passed with **66 tests** across twenty-three files, including encoding and scenario validation coverage.

## Design-system visual overhaul — quantum-observatory intelligence layer

The supplied archive was reviewed as a prior ECDAT codebase rather than a separate asset package. Its Manrope, Space Grotesk, and DM Mono typography; deep navy surfaces; cyan/teal signals; compact status labels; and token-based dark/light foundations were retained as the baseline. The current implementation received a visual overhaul without replacing any data contract, route, scan workflow, graph interaction, export, migration action, or Lab behavior.

Shared Observatory tokens now add a deep ink canvas, cyan-violet orbital traces, fine analysis-grid texture, elevated analytical panels, and a clearer display-text hierarchy. The dashboard sidebar gains a sharper active-route signal and signal-line treatment. ECDAT headers now use a reusable observatory frame with evidence-led status, technical eyebrows, orbital linework, and stronger editorial contrast. Generic workspace cards retain their original data and actions while receiving consistent elevated panel surfaces, restrained cyan borders, and a coherent state hierarchy.

The Command Center, CBOM Asset Intelligence Drawer, Dependency Graph, Migration Roadmap, Evidence & Reports, loading/empty/error states, and the standalone Remediation Lab were checked after the overhaul. The Mobile 390-pixel views preserve single-column analysis, readable control areas, horizontal graph exploration, drawer behavior, and the independent Lab flow. Desktop captures showed the command surface, selected asset drawer, graph, migration posture, evidence pipeline, and Lab all using the same observatory framing. TypeScript passed and the full Vitest suite remained at **66 tests** across twenty-three files.

### Exact archive palette correction

The observatory overrides were corrected to use the supplied archive’s actual base palette rather than derived substitutes: `#06101c` ink, `#091423` panel, `#08111f` raised surface, `#67e8f9` signal cyan, `#c4b5fd` violet, and `#fde68a` amber. The primary and panel gradients now blend only these source-palette values and their opacity variants. A light-theme pass adds the archive’s `#edf4f7` and `#f8fbfc` surfaces with `#11243a` readable foreground, so the observatory header and panels no longer retain a dark-only surface when light mode is selected. Dark and light Command Center rendering were checked, then the default dark selection was restored. TypeScript passed and the full Vitest suite remained at **66 tests**.

### Live CodeHunters SIH reference palette correction

The live [CodeHunters SIH 2026 Problem Statements Explorer](https://www.codehuntersacademy.com/sih-2026-ps) was inspected directly before this correction. ECDAT now uses its actual charcoal and orange token set: `#060606` canvas, `#1b1b1c` cards, `#141414` raised layers, `#fc4c1f` primary orange, `#df3003` button orange, `#9f9f9f` body gray, `#ffffff` headings, `#ffffff14` borders, and `#fdc448` as the secondary warm accent. The previous cyan and violet observatory signals were removed from shared panels, controls, chart readiness, graph nodes and active paths, and the standalone Lab’s inherited surfaces.

Command Center, CBOM Inventory, Dependency Graph, Migration, Evidence & Reports, and the standalone Lab were reviewed at desktop size. Command Center and Lab also passed 390-pixel mobile review. The alternate light theme remained readable and the dark selection was restored. TypeScript passed and Vitest completed **66 tests across twenty-three files**.

### Colour-only restoration of the prior workspace UI

The later archive-derived top-navigation and component-structure replacement was removed at the user’s request. ECDAT has been restored to its prior workspace arrangement, including the original responsive sidebar shell, page-header layout, panel hierarchy, CBOM table/workspace arrangement, dependency-graph controls, Migration layout, Evidence & Reports structure, and standalone Lab frame. The CodeHunters Academy warm palette remains applied to the restored UI: black and charcoal foundations, orange/pink active treatments, warm status tones, and the prior dark/light theme control.

The remaining direct Dependency Graph legend colors were aligned to that warm palette without altering its visible node layout, pan operation, or visible button-only zoom controls. Command Center, CBOM Inventory, Dependency Graph, Migration, Evidence & Reports, and Remediation Lab were checked on desktop; Command Center and Graph were also checked at 390 pixels. TypeScript passed and Vitest completed **66 tests across twenty-three files**.

## Bold SIH competition-demo redesign

ECDAT was restyled as a judge-facing SIH competition demonstrator without inventing evidence, runtime capability, or migration completion. The persistent workspace shell now presents an **ECDAT / SIH 2026 / PS 26164** command deck, a compact judge-demo mission panel, numbered evidence-workspace navigation, a protected evidence search, an explicit Remediation Lab launch, and retained theme, notification, and account controls. Existing search keyboard access, authentication, route destinations, notifications, and new-tab Lab behavior were retained.

Shared page headers now use high-contrast mission framing, evidence and demo-ready status markers, a signal bar, and a warm charcoal/orange/red/gold system. Command Center, CBOM Inventory, Dependency Graph, Migration, and Evidence & Reports inherit bolder analytical cards, grid texture, hierarchy, and responsive framing. Migration’s remaining blue posture and effort-matrix treatments were replaced with warm status surfaces and a red-to-gold readiness signal. The Lab received the same dark command-deck canvas and card framing while retaining its explicit local-simulation safeguards.

Desktop captures covered Command Center, CBOM Inventory, Dependency Graph, Migration, Evidence & Reports, and the standalone Lab. At 390 pixels, Command Center, Inventory, Migration, and Lab maintained readable header hierarchy, stacked analytical cards, accessible utility controls, and touch-sized workspace actions. The interface retains reduced-motion rules and visible focus treatment. TypeScript passed and Vitest completed **66 tests across twenty-three files**.
