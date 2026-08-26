import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, CheckCircle2, GitBranch, ShieldAlert, Trash2 } from "lucide-react";
import { Breadcrumb, EcdatHeader } from "@/components/EcdatHeader";
import { KanbanBoard } from "@/components/KanbanBoard";
import { MigrationSimulator } from "@/components/MigrationSimulator";
import { MoscaPlanner } from "@/components/MoscaPlanner";
import { PqcRecommendationTable } from "@/components/PqcRecommendationTable";
import { ProgressTracker } from "@/components/ProgressTracker";
import { WorkspaceState } from "@/components/WorkspaceState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveEcdatScan } from "@/hooks/useActiveEcdatScan";
import { riskTone } from "@/lib/ecdatUi";
import { clearPlan, getPlan, removeItem, updateStatus, addItem, type MigrationDraft } from "@/lib/migrationStore";
import { buildBlastRadius, recommendationForFinding } from "@/lib/spatialProjection";

export default function Migration() {
  const workspace = useActiveEcdatScan();
  const [, setLocation] = useLocation();
  const [planItems, setPlanItems] = useState(() => getPlan().items);
  const [storageWarning, setStorageWarning] = useState<string | null>(() => getPlan().warning);
  const requestedFinding = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("finding");
  const [selectedFindingKey, setSelectedFindingKey] = useState<string | null>(requestedFinding);
  const selectedFinding = workspace.findings.find(finding => finding.findingKey === selectedFindingKey);
  const selectedRecommendation = recommendationForFinding(selectedFinding?.findingKey, workspace.recommendations);
  const selectedBlast = selectedFinding ? buildBlastRadius(selectedFinding, workspace.relationships) : null;

  useEffect(() => { if (requestedFinding && workspace.findings.some(finding => finding.findingKey === requestedFinding)) setSelectedFindingKey(requestedFinding); }, [requestedFinding, workspace.findings]);

  const commit = (result: { items: typeof planItems; warning: string | null }) => { setPlanItems(result.items); setStorageWarning(result.warning); };
  const addToPlan = (item: MigrationDraft) => commit(addItem(item));
  const removeFromPlan = (findingKey: string) => commit(removeItem(findingKey));
  const cycleStatus = (findingKey: string) => commit(updateStatus(findingKey));
  const resetPlan = () => { if (window.confirm("Clear all locally stored migration plan items?")) commit(clearPlan()); };
  const plannedKeys = useMemo(() => new Set(planItems.map(item => item.findingKey)), [planItems]);

  if (workspace.hasError) return <WorkspaceState state="error" title="Migration workspace is unavailable" description="The active scan could not be used to assemble migration guidance and relationship context." onRetry={() => void workspace.retry()} />;
  if (workspace.isLoading && (!workspace.findings.length || workspace.isForceLoading)) return <WorkspaceState state="loading" title="Preparing migration workspace" description="Resolving scan evidence, generated migration candidates, planning assumptions, and dependency context." />;
  if (!workspace.recommendations.length) return <WorkspaceState state="empty" title="No migration candidates yet" description="Run a scan to generate evidence-backed PQC guidance and begin an explicit migration plan." />;

  return <div className="mx-auto max-w-[1550px]">
    <Breadcrumb section="Migration" />
    <EcdatHeader eyebrow="From discovery to execution" title="Migration workspace" description="Turn active scan evidence and generated PQC guidance into a locally tracked, dependency-aware migration plan. Plan status is stored in this browser; scan evidence and recommendations remain the source of truth." />
    <div className="mt-5 flex flex-wrap items-center gap-2"><Badge variant="outline" className={workspace.usingSavedScan ? "border-emerald-200/20 bg-emerald-300/[0.06] text-emerald-100" : "border-amber-200/20 bg-amber-300/[0.06] text-amber-100"}>{workspace.usingSavedScan ? "Saved scan context" : "Seeded preview context"}</Badge><Badge variant="outline" className="border-cyan-200/20 bg-cyan-300/[0.05] text-cyan-100">{workspace.recommendations.length} generated candidate{workspace.recommendations.length === 1 ? "" : "s"}</Badge>{requestedFinding && selectedFinding ? <Badge variant="outline" className="border-violet-200/20 bg-violet-300/[0.06] text-violet-100">Focused: {selectedFinding.algorithm} · {selectedFinding.assetName}</Badge> : null}</div>
    {storageWarning ? <div role="status" className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200/15 bg-amber-300/[0.05] p-4 text-sm text-amber-100"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>{storageWarning} The visible plan will remain available for this session only.</p></div> : null}

    <div className="mt-7 space-y-7"><MoscaPlanner /><ProgressTracker items={planItems} availableCount={workspace.recommendations.length} /><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/60">Prioritised execution</p><h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-white">Plan, validate, then migrate</h2></div>{planItems.length ? <Button variant="outline" onClick={resetPlan} className="border-rose-200/15 bg-rose-300/[0.04] text-rose-100 hover:bg-rose-300/[0.1]"><Trash2 className="h-4 w-4" />Clear local plan</Button> : null}</div><KanbanBoard items={planItems} onStatusChange={cycleStatus} onRemove={removeFromPlan} onCardClick={setSelectedFindingKey} /><PqcRecommendationTable recommendations={workspace.recommendations} findings={workspace.findings} planItems={planItems} onAdd={addToPlan} onRowClick={setSelectedFindingKey} /></div>

    <Sheet open={Boolean(selectedFinding)} onOpenChange={open => { if (!open) setSelectedFindingKey(null); }}><SheetContent side="right" className="w-full overflow-y-auto border-white/10 bg-[#08111f] p-0 text-slate-100 sm:max-w-xl"><SheetHeader className="border-b border-white/8 p-5 pr-12"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className={selectedFinding ? riskTone[selectedFinding.riskLevel] ?? "border-white/10 text-slate-300" : "border-white/10 text-slate-300"}>{selectedFinding?.riskLevel}</Badge>{selectedFinding?.quantumVulnerable ? <Badge variant="outline" className="border-rose-200/20 bg-rose-300/[0.06] text-rose-100">Quantum-vulnerable</Badge> : null}</div><SheetTitle className="mt-3 font-display text-xl text-white">{selectedFinding?.assetName}</SheetTitle><SheetDescription className="mt-1 text-slate-500">{selectedFinding?.algorithm} · {selectedFinding?.cryptoRole} · evidence-backed migration context</SheetDescription></SheetHeader>{selectedFinding && selectedBlast ? <Tabs defaultValue="identity" className="flex min-h-0 flex-1 flex-col"><div className="border-b border-white/8 px-5 py-3"><TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-white/[0.04] p-1"><TabsTrigger value="identity">Identity</TabsTrigger><TabsTrigger value="risk">Risk</TabsTrigger><TabsTrigger value="blast">Blast radius</TabsTrigger><TabsTrigger value="migration">Migration</TabsTrigger></TabsList></div><div className="flex-1 overflow-y-auto p-5"><TabsContent value="identity" className="m-0"><DetailSection title="Observed identity" items={[["Algorithm", selectedFinding.algorithm], ["Role", selectedFinding.cryptoRole], ["Library", selectedFinding.library ?? "Not observed"], ["Version", selectedFinding.version ?? "Not observed"], ["Source", selectedFinding.sourceLocation], ["Usage", selectedFinding.usageContext]]} /></TabsContent><TabsContent value="risk" className="m-0"><div className="grid gap-3 sm:grid-cols-2"><Metric label="Current risk" value={selectedFinding.riskLevel} /><Metric label="Quantum exposure" value={selectedFinding.quantumVulnerable ? "Vulnerable" : selectedFinding.quantumRisk} /><Metric label="Potential HNDL" value={selectedFinding.hndlExposure ? "Qualified" : "Not qualified"} /><Metric label="Migration window" value={`${selectedFinding.migrationMonths} months`} /></div><p className="mt-5 rounded-2xl border border-amber-200/10 bg-amber-300/[0.04] p-4 text-xs leading-5 text-amber-100">Risk is derived from the active assessment context. Planning estimates require protocol, performance, and operational validation.</p></TabsContent><TabsContent value="blast" className="m-0"><div className="grid gap-3 sm:grid-cols-2"><Metric label="Services / endpoints" value={String(selectedBlast.summary.servicesAndEndpoints)} /><Metric label="Observed entities" value={String(selectedBlast.summary.evidenceNodes)} /><Metric label="Libraries" value={String(selectedBlast.summary.libraries)} /><Metric label="Crypto assets" value={String(selectedBlast.summary.cryptoAssets)} /></div><p className="mt-5 rounded-2xl border border-violet-200/10 bg-violet-300/[0.04] p-4 text-xs leading-5 text-violet-100">This bounded relationship lens is derived from active scan edges. It is not runtime reachability, operational impact, or exploit evidence.</p><Button variant="outline" onClick={() => setLocation(`/graph?finding=${encodeURIComponent(selectedFinding.findingKey)}`)} className="mt-5 border-white/10 bg-white/[0.025] text-slate-200"><GitBranch className="h-4 w-4" />View in dependency graph</Button></TabsContent><TabsContent value="migration" className="m-0"><MigrationSimulator finding={selectedFinding} recommendation={selectedRecommendation} blast={selectedBlast} planned={plannedKeys.has(selectedFinding.findingKey)} onAdd={addToPlan} /></TabsContent></div></Tabs> : null}</SheetContent></Sheet>
  </div>;
}

function DetailSection({ title, items }: { title: string; items: Array<[string, string]> }) { return <section><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-200/60">{title}</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{items.map(([label, value]) => <Metric key={label} label={label} value={value} />)}</div></section>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">{label}</p><p className="mt-2 break-words text-sm leading-5 text-slate-200">{value}</p></div>; }
