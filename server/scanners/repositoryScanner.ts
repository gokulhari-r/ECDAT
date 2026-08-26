import { type SeedFinding } from "../ecdatSeed";
import { evaluateFindingRisk } from "../ecdatRisk";

const MAX_FILES = 40;
const MAX_FILE_BYTES = 120_000;
const MAX_TOTAL_BYTES = 600_000;
const ALLOWED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".java", ".go"]);
const EXCLUDED_PATH_SEGMENTS = new Set([".git", "node_modules", "vendor", "dist", "build", "coverage"]);

export type PublicGitHubRepository = {
  owner: string;
  repository: string;
  canonicalUrl: string;
};

export type RepositorySourceFile = { path: string; content: string };
export type RepositoryScanResult = {
  repository: PublicGitHubRepository;
  branch: string;
  findings: SeedFinding[];
  scannedFileCount: number;
  skippedFileCount: number;
};

type StaticRule = {
  id: string;
  extensions: string[];
  expression: RegExp;
  algorithm: string;
  cryptoRole: string;
  library: string;
  quantumVulnerable: boolean;
  quantumRisk: string;
  classicalRisk: string;
  usageContext: string;
};

const STATIC_RULES: StaticRule[] = [
  { id: "node-aes-gcm", extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"], expression: /createCipheriv\s*\(\s*["'`]aes-(?:128|192|256)-gcm["'`]/i, algorithm: "AES-GCM", cryptoRole: "Encryption", library: "Node.js crypto", quantumVulnerable: false, quantumRisk: "Low", classicalRisk: "Low", usageContext: "Authenticated encryption call detected" },
  { id: "node-rsa", extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"], expression: /(?:generateKeyPair|createSign|publicEncrypt)\s*\(\s*["'`]rsa/i, algorithm: "RSA", cryptoRole: "Signature or key establishment", library: "Node.js crypto", quantumVulnerable: true, quantumRisk: "High", classicalRisk: "Low", usageContext: "RSA cryptographic operation detected" },
  { id: "webcrypto-rsa", extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"], expression: /(?:RSA-OAEP|RSASSA-PKCS1-v1_5|RSA-PSS)/i, algorithm: "RSA", cryptoRole: "Encryption or signature", library: "Web Crypto API", quantumVulnerable: true, quantumRisk: "High", classicalRisk: "Low", usageContext: "Web Crypto RSA algorithm identifier detected" },
  { id: "python-aesgcm", extensions: [".py"], expression: /\bAESGCM\s*\(/, algorithm: "AES-GCM", cryptoRole: "Encryption", library: "cryptography", quantumVulnerable: false, quantumRisk: "Low", classicalRisk: "Low", usageContext: "Python AES-GCM construction detected" },
  { id: "python-rsa", extensions: [".py"], expression: /rsa\.generate_private_key\s*\(/, algorithm: "RSA", cryptoRole: "Key establishment or signature", library: "cryptography", quantumVulnerable: true, quantumRisk: "High", classicalRisk: "Low", usageContext: "Python RSA key generation detected" },
  { id: "java-aes-gcm", extensions: [".java"], expression: /Cipher\.getInstance\s*\(\s*["'`]AES\/GCM/i, algorithm: "AES-GCM", cryptoRole: "Encryption", library: "Java Cryptography Architecture", quantumVulnerable: false, quantumRisk: "Low", classicalRisk: "Low", usageContext: "Java AES-GCM cipher construction detected" },
  { id: "java-rsa", extensions: [".java"], expression: /(?:KeyPairGenerator|Signature)\.getInstance\s*\(\s*["'`](?:RSA|SHA\d+withRSA)/i, algorithm: "RSA", cryptoRole: "Key establishment or signature", library: "Java Cryptography Architecture", quantumVulnerable: true, quantumRisk: "High", classicalRisk: "Low", usageContext: "Java RSA primitive selection detected" },
  { id: "go-aes", extensions: [".go"], expression: /aes\.NewCipher\s*\(/, algorithm: "AES", cryptoRole: "Encryption", library: "Go crypto", quantumVulnerable: false, quantumRisk: "Low", classicalRisk: "Low", usageContext: "Go AES cipher construction detected" },
  { id: "go-rsa", extensions: [".go"], expression: /rsa\.(?:GenerateKey|EncryptOAEP|Sign)/, algorithm: "RSA", cryptoRole: "Key establishment or signature", library: "Go crypto", quantumVulnerable: true, quantumRisk: "High", classicalRisk: "Low", usageContext: "Go RSA operation detected" },
  { id: "go-ecdsa", extensions: [".go"], expression: /ecdsa\.(?:GenerateKey|Sign|Verify)/, algorithm: "ECDSA", cryptoRole: "Signature", library: "Go crypto", quantumVulnerable: true, quantumRisk: "High", classicalRisk: "Low", usageContext: "Go ECDSA operation detected" },
];

export class RepositoryScanError extends Error {}

export function parsePublicGitHubRepository(input: string): PublicGitHubRepository {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new RepositoryScanError("Enter a valid public GitHub repository URL.");
  }
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com" || url.username || url.password || url.port) {
    throw new RepositoryScanError("Only standard HTTPS public GitHub repository URLs are supported by this MVP.");
  }
  const [owner, rawRepository, ...rest] = url.pathname.split("/").filter(Boolean);
  const repository = rawRepository?.replace(/\.git$/i, "");
  if (!owner || !repository || rest.length || !/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new RepositoryScanError("Use a repository root URL in the form https://github.com/owner/repository.");
  }
  return { owner, repository, canonicalUrl: `https://github.com/${owner}/${repository}` };
}

function extensionFor(path: string) {
  if (path === "Dockerfile") return ".dockerfile";
  const dot = path.lastIndexOf(".");
  return dot === -1 ? "" : path.slice(dot).toLowerCase();
}

function isAllowedSourcePath(path: string, size: number) {
  const segments = path.split("/");
  if (segments.some(segment => EXCLUDED_PATH_SEGMENTS.has(segment)) || path.endsWith(".min.js") || size > MAX_FILE_BYTES) return false;
  return ALLOWED_EXTENSIONS.has(extensionFor(path));
}

function lineNumber(content: string, offset: number) {
  return content.slice(0, offset).split(/\r?\n/).length;
}

function safeKeyPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28);
}

export function analyzeRepositoryFiles(repository: PublicGitHubRepository, branch: string, files: RepositorySourceFile[]): SeedFinding[] {
  const findings: SeedFinding[] = [];
  const seen = new Set<string>();
  for (const file of files) {
    const extension = extensionFor(file.path);
    for (const rule of STATIC_RULES) {
      if (!rule.extensions.includes(extension)) continue;
      const match = rule.expression.exec(file.content);
      if (!match || match.index === undefined) continue;
      const identity = `${file.path}:${rule.id}`;
      if (seen.has(identity)) continue;
      seen.add(identity);
      const assessment = evaluateFindingRisk({
        quantumVulnerable: rule.quantumVulnerable,
        sensitivity: "Not classified",
        fallbackDataLifetimeYears: 0,
        fallbackMigrationMonths: 0,
        crqcHorizonYears: 9,
      });
      const location = `${repository.owner}/${repository.repository}@${branch}:${file.path}:${lineNumber(file.content, match.index)}`;
      findings.push({
        findingKey: `repo-${safeKeyPart(file.path)}-${rule.id}`,
        assetName: file.path,
        assetType: "Source file",
        algorithm: rule.algorithm,
        cryptoRole: rule.cryptoRole,
        library: rule.library,
        version: null,
        sourceLocation: location,
        usageContext: rule.usageContext,
        dataState: "Not inferred from static analysis",
        environment: "Public source repository",
        sensitivity: "Not classified",
        criticality: "Not classified",
        riskLevel: assessment.level,
        classicalRisk: rule.classicalRisk,
        quantumRisk: rule.quantumRisk,
        quantumVulnerable: rule.quantumVulnerable,
        hndlExposure: assessment.hndlExposure,
        dataLifetimeYears: assessment.dataLifetimeYears,
        migrationMonths: assessment.migrationMonths,
        confidence: 76,
        evidence: `Static source pattern ${rule.id} matched at ${location}. Repository content was read as text and was not executed.`,
        provenance: `Bounded public GitHub static analysis of ${repository.canonicalUrl} at branch ${branch}.`,
      });
    }
  }
  return findings;
}

type FetchResponse = { ok: boolean; status: number; json: () => Promise<unknown>; text: () => Promise<string> };
type Fetcher = (url: string, init?: RequestInit) => Promise<FetchResponse>;

async function fetchJson<T>(url: string, fetcher: Fetcher): Promise<T> {
  const response = await fetcher(url, { headers: { Accept: "application/vnd.github+json", "User-Agent": "ECDAT-static-scanner" } });
  if (!response.ok) throw new RepositoryScanError(`GitHub repository metadata could not be read (HTTP ${response.status}).`);
  return response.json() as Promise<T>;
}

async function fetchSourceText(url: string, fetcher: Fetcher) {
  const response = await fetcher(url, { headers: { Accept: "text/plain", "User-Agent": "ECDAT-static-scanner" } });
  if (!response.ok) return undefined;
  const content = await response.text();
  return content.length <= MAX_FILE_BYTES ? content : undefined;
}

export async function scanPublicGitHubRepository(repositoryUrl: string, fetcher: Fetcher = fetch): Promise<RepositoryScanResult> {
  const repository = parsePublicGitHubRepository(repositoryUrl);
  const metadata = await fetchJson<{ default_branch?: string }>(`https://api.github.com/repos/${repository.owner}/${repository.repository}`, fetcher);
  const branch = metadata.default_branch;
  if (!branch || !/^[A-Za-z0-9._/-]+$/.test(branch)) throw new RepositoryScanError("The public repository did not provide a valid default branch.");
  const tree = await fetchJson<{ tree?: Array<{ path?: string; type?: string; size?: number }> }>(`https://api.github.com/repos/${repository.owner}/${repository.repository}/git/trees/${encodeURIComponent(branch)}?recursive=1`, fetcher);
  const candidates = (tree.tree ?? []).filter(item => item.type === "blob" && typeof item.path === "string" && isAllowedSourcePath(item.path, item.size ?? 0)).slice(0, MAX_FILES);
  const files: RepositorySourceFile[] = [];
  let byteBudget = MAX_TOTAL_BYTES;
  for (const candidate of candidates) {
    const path = candidate.path!;
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const content = await fetchSourceText(`https://raw.githubusercontent.com/${repository.owner}/${repository.repository}/${encodeURIComponent(branch)}/${encodedPath}`, fetcher);
    if (!content || content.length > byteBudget) continue;
    byteBudget -= content.length;
    files.push({ path, content });
  }
  const findings = analyzeRepositoryFiles(repository, branch, files);
  return { repository, branch, findings, scannedFileCount: files.length, skippedFileCount: Math.max(0, (tree.tree?.length ?? 0) - files.length) };
}
