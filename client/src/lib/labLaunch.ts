import { labUrlForFinding, type LabFinding } from "@/lib/labEncoding";

type LabLaunchableFinding = {
  findingKey: string;
  algorithm: string;
  library?: string | null;
  cryptoRole: string;
  riskLevel: string;
  quantumVulnerable: boolean;
  hndlExposure: boolean;
  sourceLocation: string;
  dataLifetimeYears: number;
  migrationMonths: number;
  confidence: number;
};

export function toLabFinding(finding: LabLaunchableFinding): LabFinding {
  return { findingKey: finding.findingKey, algorithm: finding.algorithm, library: finding.library ?? "Not observed", cryptoRole: finding.cryptoRole, riskLevel: finding.riskLevel, quantumVulnerable: finding.quantumVulnerable, hndlExposure: finding.hndlExposure, sourceLocation: finding.sourceLocation, dataLifetimeYears: finding.dataLifetimeYears, migrationMonths: finding.migrationMonths, confidence: finding.confidence };
}

export function openFindingInLab(finding: LabLaunchableFinding) {
  window.open(labUrlForFinding(toLabFinding(finding)), "_blank", "noopener,noreferrer");
}

export function openDemoLab() {
  window.open("/lab.html?scenario=rsa-key-exchange", "_blank", "noopener,noreferrer");
}
