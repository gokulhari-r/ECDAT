export type ExportFinding = {
  findingKey: string;
  assetName: string;
  assetType: string;
  algorithm: string;
  cryptoRole: string;
  library: string | null;
  version: string | null;
  sourceLocation: string;
  usageContext: string;
  confidence: number;
  evidence: string;
  provenance: string;
  riskLevel: string;
  quantumRisk: string;
};

export function buildCycloneDxOrientedCbom(input: {
  scanKey: string;
  displayName: string;
  createdAt: Date | string;
  findings: ExportFinding[];
}) {
  return {
    bomFormat: "ECDAT CycloneDX-oriented CBOM",
    specVersion: "0.1",
    serialNumber: `urn:uuid:${input.scanKey}`,
    metadata: {
      timestamp: new Date(input.createdAt).toISOString(),
      component: { type: "application", name: input.displayName },
      tools: [{ vendor: "ECDAT", name: "ECDAT", version: "0.1.0" }],
      note: "This is an ECDAT prototype export shaped for CBOM interoperability. Validate the selected target schema before production use.",
    },
    components: input.findings.map(finding => ({
      "bom-ref": finding.findingKey,
      type: finding.assetType.toLowerCase().includes("library") ? "library" : "cryptographic-asset",
      name: finding.assetName,
      version: finding.version ?? undefined,
      properties: [
        { name: "ecdat:algorithm", value: finding.algorithm },
        { name: "ecdat:role", value: finding.cryptoRole },
        { name: "ecdat:library", value: finding.library ?? "Not observed" },
        { name: "ecdat:location", value: finding.sourceLocation },
        { name: "ecdat:usage-context", value: finding.usageContext },
        { name: "ecdat:risk-level", value: finding.riskLevel },
        { name: "ecdat:quantum-risk", value: finding.quantumRisk },
        { name: "ecdat:confidence", value: `${finding.confidence}%` },
        { name: "ecdat:evidence", value: finding.evidence },
        { name: "ecdat:provenance", value: finding.provenance },
      ],
    })),
  };
}

export function buildExecutiveHtml(input: {
  displayName: string;
  criticalCount: number;
  quantumVulnerableCount: number;
  hndlCount: number;
  quantumReadiness: number;
  findings: ExportFinding[];
}) {
  const findingRows = input.findings
    .map(
      finding => `<tr><td>${finding.assetName}</td><td>${finding.algorithm}</td><td>${finding.cryptoRole}</td><td>${finding.riskLevel}</td><td>${finding.confidence}%</td></tr>`
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><title>ECDAT executive report</title><style>body{font-family:Arial,sans-serif;color:#14233d;margin:44px}h1{font-size:28px}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{padding:10px;border-bottom:1px solid #d9e2ef;text-align:left}th{background:#eef4fb}.metric{display:inline-block;padding:14px 18px;margin:0 10px 10px 0;background:#f5f8fc;border-radius:10px}.note{color:#52647d;font-size:12px;margin-top:28px}</style></head><body><h1>ECDAT Executive Report — ${input.displayName}</h1><div class="metric"><strong>${input.criticalCount}</strong><br>Critical findings</div><div class="metric"><strong>${input.quantumVulnerableCount}</strong><br>Quantum-vulnerable assets</div><div class="metric"><strong>${input.hndlCount}</strong><br>Potential HNDL exposures</div><div class="metric"><strong>${input.quantumReadiness}%</strong><br>Quantum readiness</div><h2>Evidence-backed inventory</h2><table><thead><tr><th>Asset</th><th>Algorithm</th><th>Role</th><th>Risk</th><th>Confidence</th></tr></thead><tbody>${findingRows}</tbody></table><p class="note">Effort and latency estimates used by ECDAT are indicative planning aids, not implementation commitments. HNDL entries identify potential exposure under the scan's stated assumptions.</p></body></html>`;
}
