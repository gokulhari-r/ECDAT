import { useAuth } from "@/_core/hooks/useAuth";
import { EcdatHeader } from "@/components/EcdatHeader";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { startLogin } from "@/const";
import { useActiveEcdatScan } from "@/hooks/useActiveEcdatScan";
import { riskTone, type ScenarioId } from "@/lib/ecdatUi";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArrowUpRight, BookOpenCheck, Boxes, Clock3, GitBranch, LockKeyhole, Play, ScanSearch, ShieldAlert, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const trend = [42, 38, 34, 29, 25, 23];

export default function Home() {
  const [scenario, setScenario] = useState<ScenarioId>("python-web");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const { data: catalog = [] } = trpc.ecdat.scenarioCatalog.useQuery();
  const { data: intakePreview } = trpc.ecdat.preview.useQuery({ scenario });
  const active = useActiveEcdatScan();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const runDemo = trpc.ecdat.runDemo.useMutation({
    onSuccess: async detail => {
      localStorage.setItem("ecdat-last-scan", detail.scan.scanKey);
      await utils.ecdat.scans.invalidate();
      await utils.ecdat.detail.invalidate();
      setLocation(`/inventory?finding=${encodeURIComponent(detail.findings[0]?.findingKey ?? "")}`);
    },
  });
  const scenarioInfo = catalog.find(item => item.id === scenario);
  const dashboardFindings = active.findings.length ? active.findings : intakePreview?.findings ?? [];
  const dashboardRecommendations = active.recommendations.length ? active.recommendations : intakePreview?.recommendations ?? [];
  const dashboardRelationships = active.relationships.length ? active.relationships : intakePreview?.relationships ?? [];
  const dashboardName = active.displayName === "Loading scenario" ? intakePreview?.displayName ?? "Loading scenario" : active.displayName;
  const dashboardTotalAssets = active.totalAssets || intakePreview?.totalAssets || 0;
  const dashboardQuantumVulnerable = active.quantumVulnerableCount || intakePreview?.quantumVulnerableCount || 0;
  const dashboardHndl = active.hndlCount || intakePreview?.hndlCount || 0;
  const dashboardReadiness = active.quantumReadiness || intakePreview?.quantumReadiness || 0;
  const riskCounts = dashboardFindings.reduce<Record<string, number>>((acc, finding) => { acc[finding.riskLevel] = (acc[finding.riskLevel] ?? 0) + 1; return acc; }, {});

  function selectScenario(next: ScenarioId) { setScenario(next); const target = catalog.find(item => item.id === next); if (target) setRepositoryUrl(target.repositoryPlaceholder); }
  function beginScan() { if (!isAuthenticated) return startLogin(); runDemo.mutate({ scenario, repositoryUrl: repositoryUrl.trim() || undefined }); }

  return <div className="mx-auto max-w-[1550px] space-y-7">
    <EcdatHeader eyebrow="Enterprise cryptographic discovery & analysis" title="Cryptography, made legible." description="Discover evidence, evaluate quantum exposure, and move from a cryptographic inventory to a defensible migration plan." />
    <section className="grid gap-5 xl:grid-cols-[1.4fr_0.95fr]">
      <div className="relative overflow-hidden rounded-3xl border border-cyan-200/12 bg-[#0a1727] p-6 shadow-2xl shadow-black/25 md:p-8"><div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" /><div className="relative"><div className="mb-6 flex items-center justify-between"><Badge className="gap-1.5 border border-cyan-200/20 bg-cyan-300/10 text-cyan-100"><Sparkles className="h-3.5 w-3.5" />Zero-friction intake</Badge><span className="text-xs text-slate-500">Seeded demo mode</span></div><h2 className="max-w-xl font-display text-2xl font-semibold tracking-[-0.04em] text-white">Begin with a target. Leave with a decision path.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Enter a repository target and select a deterministic scenario. This demonstration stores your target and runs the chosen evidence-backed scenario; it does not clone or process a private repository.</p><div className="mt-6 flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><GitBranch className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><Input value={repositoryUrl} onChange={event => setRepositoryUrl(event.target.value)} placeholder={scenarioInfo?.repositoryPlaceholder ?? "https://github.com/organisation/repository"} className="h-11 border-white/10 bg-[#06101c] pl-10 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-300/40" /></div><Button onClick={beginScan} disabled={runDemo.isPending} className="h-11 bg-cyan-200 px-5 font-semibold text-[#072033] hover:bg-cyan-100"><Play className="h-4 w-4 fill-current" />{runDemo.isPending ? "Saving scan…" : isAuthenticated ? "Start demo scan" : "Sign in to save scan"}</Button></div><div className="mt-7 grid gap-3 sm:grid-cols-2">{catalog.map(item => <button key={item.id} onClick={() => selectScenario(item.id as ScenarioId)} className={`group rounded-2xl border p-4 text-left transition-all ${scenario === item.id ? "border-cyan-200/35 bg-cyan-300/8 shadow-[0_10px_30px_rgba(34,211,238,0.08)]" : "border-white/7 bg-white/[0.025] hover:border-white/16 hover:bg-white/[0.05]"}`}><div className="flex items-start justify-between gap-3"><span className="font-medium text-slate-100">{item.label}</span><ArrowUpRight className={`h-4 w-4 transition ${scenario === item.id ? "text-cyan-200" : "text-slate-600 group-hover:text-slate-300"}`} /></div><p className="mt-1.5 min-h-10 text-xs leading-5 text-slate-500">{item.description}</p><div className="mt-3 flex flex-wrap gap-1.5">{item.badges.map((badge: string) => <span key={badge} className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-slate-400">{badge}</span>)}</div></button>)}</div></div></div>
      <div className="rounded-3xl border border-white/8 bg-[#091423] p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">{active.usingSavedScan ? "Saved assessment" : "Current assessment"}</p><h3 className="mt-1 font-display text-xl font-semibold tracking-[-0.03em] text-white">{dashboardName}</h3></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200"><ScanSearch className="h-5 w-5" /></span></div><div className="mt-6 rounded-2xl border border-white/7 bg-[#06101c]/70 p-4"><div className="flex items-center justify-between text-xs"><span className="text-slate-400">Scan confidence</span><span className="font-semibold text-cyan-100">Evidence model ready</span></div><Progress value={active.isLoading && !intakePreview ? 35 : 100} className="mt-3 h-2 bg-white/6 [&>div]:bg-gradient-to-r [&>div]:from-cyan-300 [&>div]:to-emerald-300" /><div className="mt-3 grid grid-cols-3 gap-2 text-center"><MiniMetric value={dashboardFindings.length || "—"} label="sampled findings" /><MiniMetric value={dashboardRecommendations.length || "—"} label="actions" /><MiniMetric value={dashboardRelationships.length || "—"} label="evidence links" /></div></div><div className="mt-5 rounded-xl border border-amber-200/10 bg-amber-200/[0.035] p-3 text-xs leading-5 text-amber-100/85"><AlertTriangle className="mr-2 inline h-4 w-4 text-amber-200" />HNDL indicators show potential exposure under stated planning assumptions; they are not claims of present decryption.</div></div>
    </section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Cryptographic assets" value={dashboardTotalAssets || "—"} note="Active scan inventory count" icon={Boxes} /><MetricCard label="Quantum-vulnerable" value={dashboardQuantumVulnerable || "—"} note="Requires role-aware review" icon={ShieldAlert} tone="rose" /><MetricCard label="Potential HNDL exposure" value={dashboardHndl || "—"} note="Recalculated from active assumptions" icon={LockKeyhole} tone="amber" /><MetricCard label="Quantum readiness" value={`${dashboardReadiness || "—"}%`} note="Active scan posture" icon={BookOpenCheck} tone="emerald" /></section>
    <section className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]"><div className="rounded-3xl border border-white/8 bg-[#091423] p-6"><div className="flex items-center justify-between"><div><h3 className="font-display text-xl font-semibold text-white">Risk distribution</h3><p className="mt-1 text-xs text-slate-500">Sampled evidence by decision tier</p></div><Badge variant="outline" className="border-white/10 text-slate-400">{dashboardFindings.length} observed</Badge></div><div className="mt-6 space-y-4">{["Critical", "High", "Medium", "Low"].map(level => { const count = riskCounts[level] ?? 0; const percentage = dashboardFindings.length ? (count / dashboardFindings.length) * 100 : 0; return <div key={level}><div className="mb-1.5 flex justify-between text-xs"><span className="text-slate-300">{level}</span><span className="text-slate-500">{count} findings</span></div><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className={`h-full rounded-full ${level === "Critical" ? "bg-rose-300" : level === "High" ? "bg-amber-200" : level === "Medium" ? "bg-cyan-200" : "bg-emerald-300"}`} style={{ width: `${Math.max(percentage, count ? 8 : 0)}%` }} /></div></div>})}</div><div className="mt-6 grid gap-2 sm:grid-cols-2">{dashboardFindings.slice(0, 2).map(finding => <button key={finding.findingKey} onClick={() => setLocation(`/inventory?finding=${encodeURIComponent(finding.findingKey)}`)} className="rounded-xl border border-white/7 bg-white/[0.025] p-3 text-left transition hover:border-cyan-200/20 hover:bg-cyan-300/[0.04]"><div className="flex items-start justify-between gap-3"><span className="text-xs font-medium text-slate-200">{finding.algorithm}</span><span className={`rounded-md px-2 py-0.5 text-[10px] ring-1 ${riskTone[finding.riskLevel]}`}>{finding.riskLevel}</span></div><p className="mt-2 truncate text-xs text-slate-500">{finding.sourceLocation}</p><p className="mt-2 text-[10px] font-medium text-cyan-100">View evidence detail →</p></button>)}</div></div><div className="rounded-3xl border border-white/8 bg-[#091423] p-6"><div className="flex items-center justify-between"><div><h3 className="font-display text-xl font-semibold text-white">Exposure outlook</h3><p className="mt-1 text-xs text-slate-500">Illustrative demo history, not live telemetry</p></div><Clock3 className="h-5 w-5 text-cyan-200" /></div><div className="mt-7 flex h-32 items-end gap-3">{trend.map((height, index) => <div key={height} className="flex flex-1 flex-col items-center gap-2"><div className={`w-full rounded-t-md bg-gradient-to-t ${index === trend.length - 1 ? "from-cyan-300 to-emerald-200" : "from-cyan-500/35 to-cyan-200/70"}`} style={{ height: `${height * 2.1}px` }} /><span className="text-[10px] text-slate-600">W{index + 1}</span></div>)}</div><div className="mt-6 rounded-2xl border border-cyan-200/10 bg-cyan-300/[0.04] p-4"><p className="text-xs text-cyan-100">Priority signal</p><p className="mt-1 text-sm leading-6 text-slate-400">Address shared cryptographic dependencies before isolated changes when they connect multiple high-impact assets.</p></div></div></section>
  </div>;
}
function MiniMetric({ value, label }: { value: string | number; label: string }) { return <div><p className="font-display text-lg text-white">{value}</p><p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p></div>; }
