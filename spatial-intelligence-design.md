# Spatial Intelligence Upgrade Design

## Scope and evidence contract

The supplied upgrade is incorporated into the existing **Quantum Descent Spatial Mode**, not as a separate graph or security-claiming subsystem. Both features derive their nodes, edges, risks, migration waves, and recommendation context from the same active ECDAT scan data already used by Inventory, Dependency Graph, PQC Guidance, Migration Roadmap, and Spatial Mode.

| Capability | Data source | User-facing constraint |
| --- | --- | --- |
| Attack propagation | Visible `sceneGraphNodes` and `sceneEdges` projected from active relationships | An illustrative traversal of observed dependency paths; not an exploit, breach prediction, qubit estimate, or proof of reachability. |
| Blast report | Traversed graph nodes/edges plus scan risk weights | Reports evidence-graph reachability only, with a visible modelling caveat. |
| Crypto Analyst | Protected saved scan detail via `getScanDetail` | Available only for authenticated saved scans; never receives client-managed secrets or invents scan evidence. |
| Copilot focus action | Existing finding keys and graph node IDs | The response can focus only an observed finding selected from the current scan’s allow-listed keys. |

## Attack traversal design

The simulation accepts the currently selected **visible scene node** as its source. It performs a bounded breadth-first traversal across the current visible relationship graph, with a deterministic maximum of 30 edges and no client network activity. The rendered particle, temporary edge coloring, hit rings, and summary are visual explanations of the calculated traversal. Reset removes all temporary animation state and returns the scene to its existing risk encoding.

> The simulator describes **illustrative dependency-path propagation under observed scan evidence**. It does not claim that a quantum attack can exploit, compromise, or reach those entities in production.

## Copilot design

The copilot uses the managed server-side `invokeLLM` helper with the live-verified `gpt-5-mini` model. A protected tRPC mutation validates ownership through the existing scan-detail query, limits prior conversational turns and message length, and sends only the current scan’s concise context. No local `.env` file, frontend credential, external web search, automatic system action, or persistence of chat content is introduced.

The model must return a structured answer containing a concise markdown response and an optional `focusFindingKey`. The server constrains that field to the active scan’s actual finding keys, so a client highlight can only select existing observed evidence. The prompt states that Mosca inputs, effort, latency, and CRQC timing are planning assumptions or indicative estimates, not certainty.

## Interaction design

Spatial Mode gains two opt-in controls when WebGL is available: **Simulate path** and **AI Analyst**. The accessible 2D fallback retains normal evidence exploration and displays a clear statement that attack animation and the copilot require the WebGL/saved-scan contexts respectively. The attack summary and analyst panel coexist with the selected finding detail; neither changes the active scan, recommendations, risk scoring, or migration data.

## Verification requirements

The implementation requires pure traversal and prompt-context tests, authentication-gate coverage for the copilot, TypeScript and full Vitest regression runs, a WebGL visual check for start/complete/reset behaviour, a saved-scan copilot check, and a mobile fallback check. All outputs retain explicit language distinguishing simulation and generated guidance from observed security facts.
