import { describe, expect, it } from "vitest";
import { analyzeRepositoryFiles, parsePublicGitHubRepository, scanPublicGitHubRepository } from "./repositoryScanner";

const repository = parsePublicGitHubRepository("https://github.com/example/crypto-service");

describe("repository scanner MVP", () => {
  it("only accepts a public HTTPS GitHub repository root", () => {
    expect(repository).toMatchObject({ owner: "example", repository: "crypto-service" });
    expect(() => parsePublicGitHubRepository("http://github.com/example/repo")).toThrow("Only standard HTTPS");
    expect(() => parsePublicGitHubRepository("https://github.com/example/repo/tree/main")).toThrow("repository root URL");
    expect(() => parsePublicGitHubRepository("https://127.0.0.1/example/repo")).toThrow("Only standard HTTPS");
  });

  it("finds supported crypto patterns in a local source fixture without executing content", () => {
    const findings = analyzeRepositoryFiles(repository, "main", [
      { path: "src/transport.ts", content: "import { createCipheriv } from 'node:crypto';\nconst cipher = createCipheriv('aes-256-gcm', key, iv);" },
      { path: "src/keys.py", content: "from cryptography.hazmat.primitives.asymmetric import rsa\nkey = rsa.generate_private_key(public_exponent=65537, key_size=2048)" },
      { path: "src/ignored.txt", content: "createCipheriv('aes-256-gcm', key, iv)" },
    ]);
    expect(findings).toHaveLength(2);
    expect(findings.map(finding => finding.algorithm)).toEqual(["AES-GCM", "RSA"]);
    expect(findings[0]?.sourceLocation).toContain("src/transport.ts:2");
    expect(findings[1]?.quantumVulnerable).toBe(true);
    expect(findings.every(finding => finding.evidence.includes("not executed"))).toBe(true);
  });

  it("uses bounded GitHub metadata and raw-source requests without cloning repositories", async () => {
    const requests: string[] = [];
    const fetcher = async (url: string) => {
      requests.push(url);
      if (url.includes("/repos/example/crypto-service") && !url.includes("/git/trees/")) return { ok: true, status: 200, json: async () => ({ default_branch: "main" }), text: async () => "" };
      if (url.includes("/git/trees/")) return { ok: true, status: 200, json: async () => ({ tree: [{ path: "src/main.go", type: "blob", size: 80 }, { path: "node_modules/x.js", type: "blob", size: 12 }] }), text: async () => "" };
      return { ok: true, status: 200, json: async () => ({}), text: async () => "package main\nfunc main() { aes.NewCipher(key) }" };
    };
    const result = await scanPublicGitHubRepository("https://github.com/example/crypto-service", fetcher);
    expect(result.scannedFileCount).toBe(1);
    expect(result.findings[0]?.algorithm).toBe("AES");
    expect(requests).toHaveLength(3);
    expect(requests.some(request => request.includes("git clone"))).toBe(false);
  });
});
