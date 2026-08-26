import { type SeedFinding } from "../ecdatSeed";
import { evaluateFindingRisk } from "../ecdatRisk";
import { Unzip, UnzipInflate } from "fflate";

const MAX_FILES = 40;
const MAX_FILE_BYTES = 120_000;
const MAX_TOTAL_BYTES = 600_000;
const MAX_ARCHIVE_BYTES = 3_000_000;
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".java", ".go"]);
const ANALYSIS_FILENAMES = new Set(["requirements.txt", "pyproject.toml", "setup.cfg", "package.json", "pom.xml", "build.gradle", "go.mod", "dockerfile", ".env", "nginx.conf"]);
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
  confidence?: number;
  deriveAlgorithm?: (content: string) => string;
};

const STATIC_RULES: StaticRule[] = [
  { id: "node-aes-gcm", extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"], expression: /createCipheriv\s*\(\s*["'`]aes-(?:128|192|256)-gcm["'`]/i, algorithm: "AES-GCM", cryptoRole: "Encryption", library: "Node.js crypto", quantumVulnerable: false, quantumRisk: "Low", classicalRisk: "Low", usageContext: "Authenticated encryption call detected" },
  { id: "node-rsa", extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"], expression: /(?:generateKeyPair|createSign|publicEncrypt)\s*\(\s*["'`]rsa/i, algorithm: "RSA", cryptoRole: "Signature or key establishment", library: "Node.js crypto", quantumVulnerable: true, quantumRisk: "High", classicalRisk: "Low", usageContext: "RSA cryptographic operation detected" },
  { id: "webcrypto-rsa", extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"], expression: /(?:RSA-OAEP|RSASSA-PKCS1-v1_5|RSA-PSS)/i, algorithm: "RSA", cryptoRole: "Encryption or signature", library: "Web Crypto API", quantumVulnerable: true, quantumRisk: "High", classicalRisk: "Low", usageContext: "Web Crypto RSA algorithm identifier detected" },
  { id: "python-aesgcm", extensions: [".py"], expression: /\bAESGCM\s*\(/, algorithm: "AES-GCM", cryptoRole: "Encryption", library: "cryptography", quantumVulnerable: false, quantumRisk: "Low", classicalRisk: "Low", usageContext: "Python AES-GCM construction detected" },
  { id: "python-rsa", extensions: [".py"], expression: /rsa\.generate_private_key\s*\(/, algorithm: "RSA", cryptoRole: "Key establishment or signature", library: "cryptography", quantumVulnerable: true, quantumRisk: "High", classicalRisk: "Low", usageContext: "Python RSA key generation detected" },
  { id: "python-passlib", extensions: [".py"], expression: /(?:from\s+passlib(?:\.|\s+import)|import\s+passlib|CryptContext\s*\()/i, algorithm: "Password hashing scheme not observed", cryptoRole: "Password hashing", library: "passlib", quantumVulnerable: false, quantumRisk: "Low", classicalRisk: "Low", usageContext: "passlib wrapper-library usage detected", confidence: 85, deriveAlgorithm: content => content.match(/(?:schemes\s*=\s*\[|scheme\s*=\s*["'])(?:\s*["'])?([A-Za-z0-9_-]+)/i)?.[1] ?? "Password hashing scheme not observed" },
  { id: "python-pyjwt", extensions: [".py"], expression: /(?:import\s+jwt\b|from\s+jwt\s+import|from\s+PyJWT\b|jwt\.(?:encode|decode)\s*\()/i, algorithm: "JWT algorithm not observed", cryptoRole: "Token signature", library: "PyJWT", quantumVulnerable: false, quantumRisk: "Not inferred", classicalRisk: "Not inferred", usageContext: "PyJWT wrapper-library usage detected", confidence: 88, deriveAlgorithm: content => content.match(/algorithm\s*=\s*["']([A-Za-z0-9-]+)["']/i)?.[1] ?? "JWT algorithm not observed" },
  { id: "python-argon2", extensions: [".py"], expression: /(?:from\s+argon2\b|import\s+argon2\b)/i, algorithm: "Argon2", cryptoRole: "Password hashing", library: "argon2-cffi", quantumVulnerable: false, quantumRisk: "Low", classicalRisk: "Low", usageContext: "Argon2 wrapper-library usage detected", confidence: 92 },
  { id: "python-jose", extensions: [".py"], expression: /(?:from\s+jose\b|import\s+jose\b|from\s+python_jwt\b)/i, algorithm: "JOSE algorithm not observed", cryptoRole: "Token signature", library: "JOSE", quantumVulnerable: false, quantumRisk: "Not inferred", classicalRisk: "Not inferred", usageContext: "JOSE wrapper-library usage detected", confidence: 86 },
  { id: "python-ssl", extensions: [".py"], expression: /(?:from\s+ssl\s+import|import\s+ssl\b|from\s+OpenSSL\b|import\s+OpenSSL\b|import\s+paramiko\b)/i, algorithm: "TLS or SSH parameters not observed", cryptoRole: "Transport security", library: "Python SSL wrapper", quantumVulnerable: false, quantumRisk: "Not inferred", classicalRisk: "Not inferred", usageContext: "Python transport-security wrapper usage detected", confidence: 78 },
  { id: "java-aes-gcm", extensions: [".java"], expression: /Cipher\.getInstance\s*\(\s*["'`]AES\/GCM/i, algorithm: "AES-GCM", cryptoRole: "Encryption", library: "Java Cryptography Architecture", quantumVulnerable: false, quantumRisk: "Low", classicalRisk: "Low", usageContext: "Java AES-GCM cipher construction detected" },
  { id: "java-rsa", extensions: [".java"], expression: /(?:KeyPairGenerator|Signature)\.getInstance\s*\(\s*["'`](?:RSA|SHA\d+withRSA)/i, algorithm: "RSA", cryptoRole: "Key establishment or signature", library: "Java Cryptography Architecture", quantumVulnerable: true, quantumRisk: "High", classicalRisk: "Low", usageContext: "Java RSA primitive selection detected" },
  { id: "go-aes", extensions: [".go"], expression: /aes\.NewCipher\s*\(/, algorithm: "AES", cryptoRole: "Encryption", library: "Go crypto", quantumVulnerable: false, quantumRisk: "Low", classicalRisk: "Low", usageContext: "Go AES cipher construction detected" },
  { id: "go-rsa", extensions: [".go"], expression: /rsa\.(?:GenerateKey|EncryptOAEP|Sign)/, algorithm: "RSA", cryptoRole: "Key establishment or signature", library: "Go crypto", quantumVulnerable: true, quantumRisk: "High", classicalRisk: "Low", usageContext: "Go RSA operation detected" },
  { id: "go-ecdsa", extensions: [".go"], expression: /ecdsa\.(?:GenerateKey|Sign|Verify)/, algorithm: "ECDSA", cryptoRole: "Signature", library: "Go crypto", quantumVulnerable: true, quantumRisk: "High", classicalRisk: "Low", usageContext: "Go ECDSA operation detected" },
];

type DependencyRule = Omit<StaticRule, "extensions" | "expression" | "deriveAlgorithm"> & { packages: string[]; manifestNames: string[] };

const DEPENDENCY_RULES: DependencyRule[] = [
  { id: "manifest-passlib", packages: ["passlib"], manifestNames: ["requirements.txt", "pyproject.toml", "setup.cfg"], algorithm: "Password hashing scheme not observed", cryptoRole: "Password hashing", library: "passlib", quantumVulnerable: false, quantumRisk: "Low", classicalRisk: "Low", usageContext: "Dependency manifest declares passlib", confidence: 72 },
  { id: "manifest-pyjwt", packages: ["pyjwt"], manifestNames: ["requirements.txt", "pyproject.toml", "setup.cfg"], algorithm: "JWT algorithm not observed", cryptoRole: "Token signature", library: "PyJWT", quantumVulnerable: false, quantumRisk: "Not inferred", classicalRisk: "Not inferred", usageContext: "Dependency manifest declares PyJWT", confidence: 76 },
  { id: "manifest-argon2", packages: ["argon2-cffi", "argon2_cffi"], manifestNames: ["requirements.txt", "pyproject.toml", "setup.cfg"], algorithm: "Argon2", cryptoRole: "Password hashing", library: "argon2-cffi", quantumVulnerable: false, quantumRisk: "Low", classicalRisk: "Low", usageContext: "Dependency manifest declares Argon2 support", confidence: 80 },
  { id: "manifest-jose", packages: ["python-jose", "jose"], manifestNames: ["requirements.txt", "pyproject.toml", "setup.cfg", "package.json"], algorithm: "JOSE algorithm not observed", cryptoRole: "Token signature", library: "JOSE", quantumVulnerable: false, quantumRisk: "Not inferred", classicalRisk: "Not inferred", usageContext: "Dependency manifest declares JOSE support", confidence: 74 },
  { id: "manifest-bcrypt", packages: ["bcrypt"], manifestNames: ["requirements.txt", "pyproject.toml", "setup.cfg", "package.json"], algorithm: "bcrypt", cryptoRole: "Password hashing", library: "bcrypt", quantumVulnerable: false, quantumRisk: "Low", classicalRisk: "Low", usageContext: "Dependency manifest declares bcrypt", confidence: 82 },
  { id: "manifest-crypto-js", packages: ["crypto-js", "node-forge", "jsonwebtoken"], manifestNames: ["package.json"], algorithm: "Cryptographic package parameters not observed", cryptoRole: "Cryptographic library", library: "JavaScript crypto package", quantumVulnerable: false, quantumRisk: "Not inferred", classicalRisk: "Not inferred", usageContext: "Dependency manifest declares a JavaScript cryptographic package", confidence: 72 },
  { id: "manifest-bouncycastle", packages: ["bouncycastle", "nimbus-jose-jwt", "spring-security-crypto"], manifestNames: ["pom.xml", "build.gradle"], algorithm: "JVM cryptographic package parameters not observed", cryptoRole: "Cryptographic library", library: "JVM crypto package", quantumVulnerable: false, quantumRisk: "Not inferred", classicalRisk: "Not inferred", usageContext: "Dependency manifest declares a JVM cryptographic package", confidence: 72 },
  { id: "manifest-go-crypto", packages: ["golang.org/x/crypto"], manifestNames: ["go.mod"], algorithm: "Go x/crypto", cryptoRole: "Cryptographic library", library: "golang.org/x/crypto", quantumVulnerable: false, quantumRisk: "Not inferred", classicalRisk: "Not inferred", usageContext: "Dependency manifest declares Go extended crypto", confidence: 76 },
];

const CONFIG_RULES: StaticRule[] = [
  { id: "config-jwt", extensions: [".env", ".yml", ".yaml", ".toml", ".ini", ".cfg", ".conf", ".py", ".dockerfile"], expression: /^\s*(?:JWT_SECRET|JWT_ALGORITHM|jwt_algorithm)\b/im, algorithm: "JWT configuration parameter not observed", cryptoRole: "Token signature", library: "Configuration", quantumVulnerable: false, quantumRisk: "Not inferred", classicalRisk: "Not inferred", usageContext: "JWT configuration key detected; its value was not collected", confidence: 65 },
  { id: "config-encryption", extensions: [".env", ".yml", ".yaml", ".toml", ".ini", ".cfg", ".conf", ".dockerfile"], expression: /^\s*(?:ENCRYPTION_KEY|AES_KEY|TLS_MIN_VERSION|ssl_protocols|ssl_certificate|SSLCertificateFile)\b/im, algorithm: "TLS or encryption configuration parameter not observed", cryptoRole: "Transport or encryption configuration", library: "Configuration", quantumVulnerable: false, quantumRisk: "Not inferred", classicalRisk: "Not inferred", usageContext: "Cryptographic configuration key detected; its value was not collected", confidence: 64 },
];

export class RepositoryScanError extends Error {
  constructor(message: string, readonly code: "input" | "rate-limit" | "access" | "response" = "response") {
    super(message);
    this.name = "RepositoryScanError";
  }
}

export function parsePublicGitHubRepository(input: string): PublicGitHubRepository {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new RepositoryScanError("Enter a valid public GitHub repository URL.", "input");
  }
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com" || url.username || url.password || url.port) {
    throw new RepositoryScanError("Only standard HTTPS public GitHub repository URLs are supported by this MVP.", "input");
  }
  const [owner, rawRepository, ...rest] = url.pathname.split("/").filter(Boolean);
  const repository = rawRepository?.replace(/\.git$/i, "");
  if (!owner || !repository || rest.length || !/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new RepositoryScanError("Use a repository root URL in the form https://github.com/owner/repository.", "input");
  }
  return { owner, repository, canonicalUrl: `https://github.com/${owner}/${repository}` };
}

function extensionFor(path: string) {
  const filename = path.split("/").at(-1);
  if (filename === "Dockerfile") return ".dockerfile";
  if (filename === ".env") return ".env";
  const dot = path.lastIndexOf(".");
  return dot === -1 ? "" : path.slice(dot).toLowerCase();
}

function isAllowedAnalysisPath(path: string, size: number) {
  const segments = path.split("/");
  if (segments.some(segment => EXCLUDED_PATH_SEGMENTS.has(segment)) || path.endsWith(".min.js") || size > MAX_FILE_BYTES) return false;
  return SOURCE_EXTENSIONS.has(extensionFor(path)) || ANALYSIS_FILENAMES.has(path.split("/").at(-1)?.toLowerCase() ?? "");
}

function lineNumber(content: string, offset: number) {
  return content.slice(0, offset).split(/\r?\n/).length;
}

function safeKeyPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28);
}

function createFinding(repository: PublicGitHubRepository, branch: string, file: RepositorySourceFile, rule: StaticRule, match: RegExpExecArray, assetType: "Source file" | "Dependency manifest" | "Configuration file"): SeedFinding {
  const assessment = evaluateFindingRisk({ quantumVulnerable: rule.quantumVulnerable, sensitivity: "Not classified", fallbackDataLifetimeYears: 0, fallbackMigrationMonths: 0, crqcHorizonYears: 9 });
  const location = `${repository.owner}/${repository.repository}@${branch}:${file.path}:${lineNumber(file.content, match.index ?? 0)}`;
  return {
    findingKey: `repo-${safeKeyPart(file.path)}-${rule.id}`,
    assetName: file.path,
    assetType,
    algorithm: rule.deriveAlgorithm?.(file.content) ?? rule.algorithm,
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
    confidence: rule.confidence ?? 76,
    evidence: `Static ${assetType.toLowerCase()} pattern ${rule.id} matched at ${location}. Repository content was read as text and was not executed.`,
    provenance: `Bounded public GitHub static analysis of ${repository.canonicalUrl} at branch ${branch}.`,
  };
}

function dependencyExpression(packages: string[]) {
  return new RegExp(`(?:^|[\\s"'/:<>=])(${packages.map(value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?:[\\s"'@<>=:;,]|$)`, "im");
}

export function analyzeRepositoryFiles(repository: PublicGitHubRepository, branch: string, files: RepositorySourceFile[]): SeedFinding[] {
  const findings: SeedFinding[] = [];
  const seen = new Set<string>();
  for (const file of files) {
    const extension = extensionFor(file.path);
    const filename = file.path.split("/").at(-1)?.toLowerCase() ?? "";
    const applicableRules = [...STATIC_RULES, ...CONFIG_RULES];
    for (const rule of applicableRules) {
      if (!rule.extensions.includes(extension)) continue;
      const match = rule.expression.exec(file.content);
      if (!match || match.index === undefined) continue;
      const identity = `${file.path}:${rule.id}`;
      if (seen.has(identity)) continue;
      seen.add(identity);
      findings.push(createFinding(repository, branch, file, rule, match, CONFIG_RULES.includes(rule) ? "Configuration file" : "Source file"));
    }
    for (const rule of DEPENDENCY_RULES) {
      if (!rule.manifestNames.includes(filename)) continue;
      const expression = dependencyExpression(rule.packages);
      const match = expression.exec(file.content);
      if (!match || match.index === undefined || seen.has(`${file.path}:${rule.id}`)) continue;
      seen.add(`${file.path}:${rule.id}`);
      findings.push(createFinding(repository, branch, file, { ...rule, extensions: [], expression }, match, "Dependency manifest"));
    }
  }
  return findings;
}

type FetchHeaders = { get: (name: string) => string | null } | Record<string, string | undefined>;
type FetchResponse = { ok: boolean; status: number; headers?: FetchHeaders; json: () => Promise<unknown>; text: () => Promise<string>; arrayBuffer: () => Promise<ArrayBuffer> };
type Fetcher = (url: string, init?: RequestInit) => Promise<FetchResponse>;

function getHeader(response: FetchResponse, name: string) {
  const headers = response.headers;
  if (!headers) return undefined;
  if (typeof (headers as { get?: unknown }).get === "function") return (headers as { get: (key: string) => string | null }).get(name) ?? undefined;
  const record = headers as Record<string, string | undefined>;
  return record[name.toLowerCase()] ?? record[name];
}

function rateLimitMessage(response: FetchResponse) {
  const retryAfter = getHeader(response, "retry-after");
  const reset = getHeader(response, "x-ratelimit-reset");
  if (retryAfter) return `GitHub is temporarily limiting repository analysis. Wait about ${retryAfter} seconds, then retry.`;
  if (reset && Number.isFinite(Number(reset))) return `GitHub is temporarily limiting repository analysis. Retry after ${new Date(Number(reset) * 1000).toLocaleTimeString()}.`;
  return "GitHub is temporarily limiting repository analysis from this service. Wait a few minutes, then retry.";
}

async function fetchJson<T>(url: string, fetcher: Fetcher): Promise<T> {
  const response = await fetcher(url, { headers: { Accept: "application/vnd.github+json", "User-Agent": "ECDAT-static-scanner" } });
  if (!response.ok) {
    if (response.status === 403 || response.status === 429) throw new RepositoryScanError(rateLimitMessage(response), "rate-limit");
    throw new RepositoryScanError(`GitHub repository metadata could not be read (HTTP ${response.status}).`, "access");
  }
  return response.json() as Promise<T>;
}

async function fetchSourceText(url: string, fetcher: Fetcher) {
  const response = await fetcher(url, { headers: { Accept: "text/plain", "User-Agent": "ECDAT-static-scanner" } });
  if (!response.ok) return undefined;
  const content = await response.text();
  return content.length <= MAX_FILE_BYTES ? content : undefined;
}

function joinChunks(chunks: Uint8Array[], size: number) {
  const joined = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.length;
  }
  return joined;
}

function extractArchiveSourceFiles(archive: Uint8Array) {
  const files: RepositorySourceFile[] = [];
  let uncompressedBytes = 0;
  let extractionError: Error | undefined;
  const unzip = new Unzip(file => {
    const path = file.name.replace(/^[^/]+\//, "");
    const expectedBytes = file.originalSize ?? 0;
    if (files.length >= MAX_FILES || !isAllowedAnalysisPath(path, expectedBytes) || expectedBytes > MAX_FILE_BYTES || uncompressedBytes + expectedBytes > MAX_TOTAL_BYTES) return;
    const chunks: Uint8Array[] = [];
    let size = 0;
    file.ondata = (error, data, final) => {
      if (error) { extractionError = error; return; }
      size += data.length;
      if (size > MAX_FILE_BYTES || uncompressedBytes + size > MAX_TOTAL_BYTES) { extractionError = new RepositoryScanError("Repository archive exceeded static-analysis limits."); return; }
      chunks.push(data);
      if (final) {
        uncompressedBytes += size;
        files.push({ path, content: new TextDecoder().decode(joinChunks(chunks, size)) });
      }
    };
    file.start();
  });
  unzip.register(UnzipInflate);
  unzip.push(archive, true);
  if (extractionError) throw extractionError;
  return files;
}

async function readDefaultBranchFromRepositoryPage(repository: PublicGitHubRepository, fetcher: Fetcher) {
  const response = await fetcher(repository.canonicalUrl, { headers: { Accept: "text/html", "User-Agent": "ECDAT-static-scanner" } });
  if (!response.ok) return undefined;
  const page = await response.text();
  const branch = page.match(/"defaultBranch"\s*:\s*"([A-Za-z0-9._/-]+)"/)?.[1] ?? page.match(/data-default-branch="([A-Za-z0-9._/-]+)"/)?.[1];
  return branch && /^[A-Za-z0-9._/-]+$/.test(branch) ? branch : undefined;
}

async function scanArchiveFallback(repository: PublicGitHubRepository, fetcher: Fetcher): Promise<RepositoryScanResult | undefined> {
  const defaultBranch = await readDefaultBranchFromRepositoryPage(repository, fetcher);
  const candidates = Array.from(new Set([defaultBranch, "main", "master"].filter((branch): branch is string => Boolean(branch))));
  for (const branch of candidates) {
    const archiveResponse = await fetcher(`https://codeload.github.com/${repository.owner}/${repository.repository}/zip/refs/heads/${encodeURIComponent(branch)}`, { headers: { Accept: "application/zip", "User-Agent": "ECDAT-static-scanner" } });
    if (!archiveResponse.ok) continue;
    const archive = new Uint8Array(await archiveResponse.arrayBuffer());
    if (archive.length > MAX_ARCHIVE_BYTES) throw new RepositoryScanError("Repository archive exceeded the 3 MB static-analysis download limit.");
    const files = extractArchiveSourceFiles(archive);
    return { repository, branch, findings: analyzeRepositoryFiles(repository, branch, files), scannedFileCount: files.length, skippedFileCount: 0 };
  }
  return undefined;
}

export async function scanPublicGitHubRepository(repositoryUrl: string, fetcher: Fetcher = fetch): Promise<RepositoryScanResult> {
  const repository = parsePublicGitHubRepository(repositoryUrl);
  let metadata: { default_branch?: string };
  try {
    metadata = await fetchJson<{ default_branch?: string }>(`https://api.github.com/repos/${repository.owner}/${repository.repository}`, fetcher);
  } catch (error) {
    if (error instanceof RepositoryScanError && error.code === "rate-limit") {
      const fallback = await scanArchiveFallback(repository, fetcher);
      if (fallback) return fallback;
    }
    throw error;
  }
  const branch = metadata.default_branch;
  if (!branch || !/^[A-Za-z0-9._/-]+$/.test(branch)) throw new RepositoryScanError("The public repository did not provide a valid default branch.");
  const tree = await fetchJson<{ tree?: Array<{ path?: string; type?: string; size?: number }> }>(`https://api.github.com/repos/${repository.owner}/${repository.repository}/git/trees/${encodeURIComponent(branch)}?recursive=1`, fetcher);
  const candidates = (tree.tree ?? []).filter(item => item.type === "blob" && typeof item.path === "string" && isAllowedAnalysisPath(item.path, item.size ?? 0)).sort((left, right) => Number(ANALYSIS_FILENAMES.has((right.path ?? "").split("/").at(-1)?.toLowerCase() ?? "")) - Number(ANALYSIS_FILENAMES.has((left.path ?? "").split("/").at(-1)?.toLowerCase() ?? ""))).slice(0, MAX_FILES);
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
