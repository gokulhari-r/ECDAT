import { describe, expect, it } from "vitest";
import { decodeFinding, encodeFinding, type LabFinding } from "./labEncoding";
import { buildScenarioFromFinding, labScenarios } from "./labScenarios";

const finding: LabFinding = {
  findingKey: "py-tls-rsa",
  algorithm: "RSA-2048",
  library: "OpenSSL",
  cryptoRole: "Key exchange",
  riskLevel: "Critical",
  quantumVulnerable: true,
  hndlExposure: true,
  sourceLocation: "src/config/tls.ts:42",
  dataLifetimeYears: 15,
  migrationMonths: 18,
  confidence: 94,
};

describe("standalone Lab context", () => {
  it("round-trips only the compact finding fields through base64url context", () => {
    const encoded = encodeFinding(finding);
    expect(encoded).not.toMatch(/[+/=]/);
    expect(decodeFinding(`#f=${encoded}`)).toEqual(finding);
  });

  it("rejects malformed URL context instead of rendering unvalidated data", () => {
    expect(decodeFinding("not-a-valid-context")).toBeNull();
    expect(decodeFinding("eyJmb28iOiJiYXIifQ")).toBeNull();
  });

  it("creates a clearly simulated scenario with an algorithm-appropriate candidate", () => {
    expect(labScenarios["rsa-key-exchange"]?.candidate).toContain("ML-KEM");
    expect(buildScenarioFromFinding(finding).diff.some(line => line.type === "add")).toBe(true);
  });
});
