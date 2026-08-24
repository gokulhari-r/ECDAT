# ECDAT Spatial Environment — Implementation Map

## Purpose and boundary

Spatial Mode extends **Quantum Descent**; it does not replace ECDAT’s normal evidence, inventory, risk, graph, roadmap, or report workflows. The experience starts on `/descent`, retains the current active scan, and can return the selected finding to the corresponding normal-mode evidence workflow. All quantities, node labels, risk states, relationship chains, recommendations, and waves are derived from `useActiveEcdatScan()` rather than a separate spatial-only dataset.

> The intended interaction is to descend from an enterprise posture into a specific observed cryptographic artefact, then inspect its relationship context, estimated risk window, and applicable migration path.

## Requirement-to-platform mapping

| Spatial requirement | Existing source of truth | Spatial implementation decision |
|---|---|---|
| Enterprise and domain hierarchy | `displayName`, `findings`, `totalAssets`, `criticalCount`, `quantumVulnerableCount`, and `quantumReadiness` from the active scan | The enterprise node is the current scan. Data-state, environment, and criticality are calculated clusters that show only current-level entities. |
| Application / service level | `displayName` and service nodes from `relationships` | A single scanned workload is presented as the application/service layer; related endpoints and dependencies sit beneath it. The design leaves the hierarchy extensible for multi-service scan inputs. |
| Artefacts, libraries, certificates, algorithms, and data | Findings plus the existing `type:value` relationship node convention | Nodes are created from actual finding keys and relationship endpoints. Artefact nodes retain finding provenance, source location, confidence, and observed context. |
| Risk hierarchy and Risk Focus | Finding `riskLevel`, `quantumRisk`, `quantumVulnerable`, `hndlExposure`, `criticality` | Visual size, color, central position, and emphasis are calculated from risk rather than decorative styling. Focus mode uses the highest weighted observed finding. |
| Dependency / blast-radius view | `relationships` and `server/ecdatGraph.ts` graph semantics | The client isolates direct evidence-backed neighbours of the selected entity, dims unrelated nodes, and reports counted affected asset, library, algorithm, endpoint, certificate, and data nodes. It does not claim runtime reachability. |
| Search-to-descent | Finding names, algorithms, libraries, and relationship labels | Search resolves to an observed finding or graph node, changes level, selects it, and opens its detail panel. |
| Mosca-style timeline and HNDL | Finding `dataLifetimeYears`, `migrationMonths`, `hndlExposure` plus active scan readiness | The timeline shows configured planning inputs and labels CRQC timing as an estimate, not a prediction. HNDL is displayed only when derived by the current risk model. |
| Migration view | Scan `recommendations` and `waves` | The selected finding’s generated recommendation and relevant migration waves provide the proposed hybrid/PQC path, compatibility note, and expressly indicative effort and latency. |
| Level of detail and scale | Derived hierarchy level and current scan data | Only the selected hierarchy level is rendered. The WebGL scene limits labels and node count, while the accessible fallback exposes the same data as structured controls. |
| Back, home, breadcrumb, reset, and exit | Component state and normal ECDAT routes | Breadcrumb segments return to their represented spatial level. Exit preserves the selection in the route query string so normal-mode pages can later resolve the same finding. |
| 2D fallback and accessibility | Responsive browser capability check and semantic control panel | A structured 2D scene and keyboard-accessible entity list remain available when WebGL is unavailable or reduced-motion is preferred. |

## Spatial hierarchy for the current scan contract

| Level | Represents | Derived data |
|---|---|---|
| L0 | Enterprise / active scan | Scan metrics and grouped domain clusters |
| L1 | Domain cluster | Criticality, environment, or data-state groups drawn from findings |
| L2 | Application and dependency ecosystem | Active scan display name, observed endpoints, libraries, assets, and certificates |
| L3 | Cryptographic artefact | Finding metadata joined to algorithm, library, certificate, data, and endpoint relationships |
| L4 | Risk, blast radius, timeline, migration | Existing risk fields, HNDL status, relationships, recommendation, and waves |

## Product safeguards

Spatial Mode must never hardcode enterprise impact counts, create synthetic attack simulations, or present estimates as factual certainty. The scene must clearly identify seeded preview data for signed-out users and preserve the existing saved-scan fallback behavior for authenticated users.

## Zumerlab style adaptation

The supplied Zumerlab reference contributes a **focus-driven navigation** language rather than a wholesale page redesign. The transferable cues are a deep blue-black field with a centered atmospheric bloom, a small top status capsule, a confident amber-to-coral focal accent, compact elevated selection cards, fine blue boundaries, and a deliberate “zoom into what matters” hierarchy. The same direction will be applied to ECDAT only where it improves spatial orientation and entity selection.

| Reference cue | ECDAT Spatial Mode adaptation | Safeguard |
|---|---|---|
| Centered depth field and restrained blue bloom | Strengthen the spatial canvas depth gradient, grid, and camera-focus composition | No decorative objects or simulated attacks; visible nodes remain active-scan entities. |
| Warm amber-to-coral focal accent | Use a measured amber/coral emphasis for selected or highest-risk entities and their relationship path | Keep critical/high/medium/low risk distinctions legible and do not let the accent override risk semantics. |
| Compact dark selection cards | Restyle node labels, search results, breadcrumbs, and lens controls as consistent elevated investigation cards | Preserve keyboard focus, readable metadata, and the existing data labels. |
| Focus-driven navigation messaging | Introduce concise “focus / descend / inspect” visual hierarchy within the current controls | Retain explicit normal-mode escape, reset, breadcrumb, and Inventory exit routes. |
| Controlled expressive motion | Use short transform/opacity transitions for lens changes and node emphasis when motion is allowed | Respect `prefers-reduced-motion`; the existing 2D fallback remains non-WebGL and keyboard accessible. |
