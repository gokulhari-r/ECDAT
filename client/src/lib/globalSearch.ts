export type SearchFinding = { findingKey: string; assetName: string; algorithm: string; riskLevel: string; quantumVulnerable: boolean; hndlExposure: boolean };
export type SearchRecommendation = { findingKey: string; title: string; candidate: string; priority: number };
export type GlobalSearchItem = { group: "Navigate" | "Observed evidence" | "Generated guidance"; label: string; detail: string; path: string; value: string };

const navigation: GlobalSearchItem[] = [
  { group: "Navigate", label: "Command center", detail: "Active scan posture and intake", path: "/", value: "command center dashboard" },
  { group: "Navigate", label: "CBOM inventory", detail: "Evidence-backed cryptographic assets", path: "/inventory", value: "inventory cbom assets" },
  { group: "Navigate", label: "Dependency graph", detail: "Observed relationship intelligence", path: "/graph", value: "dependency graph relationships" },
  { group: "Navigate", label: "PQC guidance", detail: "Generated context-aware recommendations", path: "/recommendations", value: "pqc guidance recommendations" },
  { group: "Navigate", label: "Migration roadmap", detail: "Dependency-aware remediation waves", path: "/roadmap", value: "roadmap migration waves" },
  { group: "Navigate", label: "Evidence & Reports", detail: "Assessment package, evidence chains, and exports", path: "/reports", value: "evidence reports export cbom assessment" },
  { group: "Navigate", label: "Quantum Descent", detail: "Normal and spatial evidence navigation", path: "/descent", value: "quantum descent spatial" },
];

export function buildGlobalSearchItems(findings: SearchFinding[], recommendations: SearchRecommendation[]) {
  const evidence = findings.map(finding => ({
    group: "Observed evidence" as const,
    label: finding.assetName,
    detail: `${finding.algorithm} · ${finding.riskLevel} risk${finding.hndlExposure ? " · potential HNDL" : ""}`,
    path: `/inventory?finding=${encodeURIComponent(finding.findingKey)}`,
    value: `${finding.assetName} ${finding.algorithm} ${finding.riskLevel}`,
  }));
  const guidance = recommendations.map(recommendation => ({
    group: "Generated guidance" as const,
    label: recommendation.title,
    detail: `Priority ${recommendation.priority} · ${recommendation.candidate}`,
    path: "/recommendations",
    value: `${recommendation.title} ${recommendation.candidate} ${recommendation.priority}`,
  }));
  return [...navigation, ...evidence, ...guidance];
}
