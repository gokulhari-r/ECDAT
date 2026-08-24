import { useAuth } from "@/_core/hooks/useAuth";
import { defaultScenario } from "@/lib/ecdatUi";
import { trpc } from "@/lib/trpc";
import { chooseActiveSource, selectLatestScanKey } from "@/lib/activeScanSelection";

type ActiveScanView = {
  displayName: string;
  totalAssets: number;
  criticalCount: number;
  quantumVulnerableCount: number;
  hndlCount: number;
  quantumReadiness: number;
  findings: Array<{ findingKey: string; assetName: string; algorithm: string; library: string | null; version: string | null; usageContext: string; sourceLocation: string; confidence: number; provenance: string; cryptoRole: string; dataState: string; environment: string; sensitivity: string; criticality: string; classicalRisk: string; quantumRisk: string; dataLifetimeYears: number; migrationMonths: number; quantumVulnerable: boolean; hndlExposure: boolean; riskLevel: string }>;
  recommendations: Array<{ findingKey: string; title: string; candidate: string; migrationNotes: string; compatibility: string; indicativeEffort: string; indicativeLatency: string; priority: number }>;
  relationships: Array<{ sourceNode: string; targetNode: string; relationship: string; evidence: string; confidence: number }>;
  waves: Array<{ wave: number; title: string; rationale: string; scope: string; indicativeEffort: string; dependencies: string }>;
  assumptions: unknown[];
};

export function useActiveEcdatScan() {
  const { isAuthenticated } = useAuth();
  const scans = trpc.ecdat.scans.useQuery(undefined, { enabled: isAuthenticated });
  const scanKey = selectLatestScanKey(scans.data, isAuthenticated);
  const detail = trpc.ecdat.detail.useQuery({ scanKey: scanKey ?? "pending" }, { enabled: Boolean(scanKey) });
  const preview = trpc.ecdat.preview.useQuery({ scenario: defaultScenario });
  const saved: ActiveScanView | undefined = detail.data ? {
    displayName: detail.data.scan.displayName,
    totalAssets: detail.data.scan.totalAssets,
    criticalCount: detail.data.scan.criticalCount,
    quantumVulnerableCount: detail.data.scan.quantumVulnerableCount,
    hndlCount: detail.data.scan.hndlCount,
    quantumReadiness: detail.data.scan.quantumReadiness,
    findings: detail.data.findings,
    recommendations: detail.data.recommendations,
    relationships: detail.data.relationships,
    waves: detail.data.waves,
    assumptions: detail.data.assumptions,
  } : undefined;
  const fallback: ActiveScanView | undefined = preview.data ? { ...preview.data, assumptions: [] } : undefined;
  const active = chooseActiveSource({ isAuthenticated, saved, fallback });
  return {
    scanKey,
    isAuthenticated,
    usingSavedScan: Boolean(isAuthenticated && saved),
    isLoading: scans.isLoading || detail.isLoading || preview.isLoading,
    hasError: Boolean(scans.error || detail.error || preview.error),
    retry: () => Promise.all([scans.refetch(), detail.refetch(), preview.refetch()]),
    displayName: active?.displayName ?? "Loading scenario",
    totalAssets: active?.totalAssets ?? 0,
    criticalCount: active?.criticalCount ?? 0,
    quantumVulnerableCount: active?.quantumVulnerableCount ?? 0,
    hndlCount: active?.hndlCount ?? 0,
    quantumReadiness: active?.quantumReadiness ?? 0,
    findings: active?.findings ?? [],
    recommendations: active?.recommendations ?? [],
    relationships: active?.relationships ?? [],
    waves: active?.waves ?? [],
    assumptions: active?.assumptions ?? [],
    detail,
  };
}
