import { Breadcrumb, EcdatHeader } from "@/components/EcdatHeader";
import { SpatialScene } from "@/components/SpatialScene";
import { WorkspaceState } from "@/components/WorkspaceState";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useActiveEcdatScan } from "@/hooks/useActiveEcdatScan";
import {
  buildBlastRadius,
  buildSpatialClusters,
  buildSpatialGraph,
  buildSpatialTimeline,
  highestRiskFinding,
  recommendationForFinding,
  relatedWaves,
  searchSpatialEntities,
  type SpatialFinding,
} from "@/lib/spatialProjection";
import { ArrowLeft, ChevronRight, CircleDot, Crosshair, ExternalLink, Focus, Grid3X3, History, Network, Orbit, Search, ShieldAlert, Sparkles, Waypoints, X } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocation } from "wouter";

type SpatialView = "enterprise" | "domain" | "ecosystem" | "artefact";
type SpatialLens = "enterprise" | "risk" | "dependency" | "cryptography" | "timeline" | "migration";

const normalStages = [
  { level: "L0", title: "Enterprise", text: "Overall cryptographic posture and readiness", icon: Orbit },
  { level: "L1", title: "System", text: "Business service and external exposure", icon: Search },
  { level: "L2", title: "Crypto assets", text: "Algorithms, libraries, certificates, and protocols", icon: CircleDot },
  { level: "L3", title: "Risk verdict", text: "Evidence-backed priority and migration action", icon: ShieldAlert },
];

const spatialLenses: Array<{ id: SpatialLens; label: string; icon: typeof Grid3X3 }> = [
  { id: "enterprise", label: "Enterprise", icon: Grid3X3 },
  { id: "risk", label: "Risk", icon: Focus },
  { id: "dependency", label: "Dependency", icon: Network },
  { id: "cryptography", label: "Cryptography", icon: CircleDot },
  { id: "timeline", label: "Timeline", icon: History },
  { id: "migration", label: "Migration", icon: Waypoints },
];

function useWebglCapability() {
  const [capability, setCapability] = useState<"checking" | "webgl" | "fallback">("checking");
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactViewport = window.matchMedia("(max-width: 700px)").matches;
    const canvas = document.createElement("canvas");
    const hasWebgl = Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    setCapability(hasWebgl && !reducedMotion && !compactViewport ? "webgl" : "fallback");
  }, []);
  return capability;
}

function findingNodeId(finding: SpatialFinding, graphNodes: ReturnType<typeof buildSpatialGraph>) {
  return graphNodes.find(node => node.findingKeys.includes(finding.findingKey) && ["asset", "certificate", "certificate-authority"].includes(node.kind))?.id
    ?? graphNodes.find(node => node.findingKeys.includes(finding.findingKey))?.id;
}

export default function QuantumDescent() {
  const workspace = useActiveEcdatScan();
  const [, setLocation] = useLocation();
  const { quantumReadiness, displayName, findings, hndlCount, recommendations, relationships, waves, totalAssets, criticalCount, quantumVulnerableCount, usingSavedScan } = workspace;
  const [normalLevel, setNormalLevel] = useState(0);
  const [isSpatialMode, setIsSpatialMode] = useState(() => new URLSearchParams(window.location.search).get("spatial") === "1");
  const [view, setView] = useState<SpatialView>("enterprise");
  const [lens, setLens] = useState<SpatialLens>("enterprise");
  const [selectedClusterId, setSelectedClusterId] = useState<string | undefined>();
  const [selectedFindingKey, setSelectedFindingKey] = useState<string | undefined>();
  const [selectedSceneId, setSelectedSceneId] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const webglCapability = useWebglCapability();

  const clusters = useMemo(() => buildSpatialClusters(findings), [findings]);
  const graphNodes = useMemo(() => buildSpatialGraph(relationships, findings), [relationships, findings]);
  const selectedCluster = useMemo(() => clusters.find(cluster => cluster.id === selectedClusterId), [clusters, selectedClusterId]);
  const selectedFinding = useMemo(() => findings.find(finding => finding.findingKey === selectedFindingKey) ?? highestRiskFinding(findings), [findings, selectedFindingKey]);
  const selectedFindingNode = useMemo(() => selectedFinding ? findingNodeId(selectedFinding, graphNodes) : undefined, [selectedFinding, graphNodes]);
  const blastRadius = useMemo(() => selectedFinding ? buildBlastRadius(selectedFinding, relationships) : { nodes: [], edges: [], summary: { evidenceNodes: 0, servicesAndEndpoints: 0, cryptoAssets: 0, algorithms: 0, libraries: 0, protectedData: 0 } }, [selectedFinding, relationships]);
  const timeline = useMemo(() => selectedFinding ? buildSpatialTimeline(selectedFinding) : undefined, [selectedFinding]);
  const recommendation = useMemo(() => recommendationForFinding(selectedFinding?.findingKey, recommendations), [selectedFinding, recommendations]);
  const migrationWaves = useMemo(() => relatedWaves(selectedFinding, waves), [selectedFinding, waves]);
  const searchResults = useMemo(() => searchSpatialEntities(query, findings, relationships), [query, findings, relationships]);
  const sceneGraphNodes = useMemo(() => {
    let nodes = graphNodes;
    if (view === "domain" && selectedCluster) nodes = nodes.filter(node => selectedCluster.findingKeys.some(key => node.findingKeys.includes(key)) || node.kind === "service");
    if (lens === "risk") nodes = [...nodes].sort((a, b) => b.riskWeight - a.riskWeight).slice(0, 9);
    if (lens === "cryptography") nodes = nodes.filter(node => ["asset", "algorithm", "certificate", "certificate-authority", "library"].includes(node.kind));
    if ((lens === "dependency" || view === "artefact") && blastRadius.nodes.length) nodes = nodes.filter(node => blastRadius.nodes.includes(node.id));
    return nodes;
  }, [graphNodes, view, selectedCluster, lens, blastRadius.nodes]);
  const sceneEdges = useMemo(() => {
    const visible = new Set(sceneGraphNodes.map(node => node.id));
    return relationships.filter(edge => visible.has(edge.sourceNode) && visible.has(edge.targetNode)).map(edge => ({ source: edge.sourceNode, target: edge.targetNode }));
  }, [relationships, sceneGraphNodes]);
  const fallbackEntities = useMemo(() => view === "enterprise"
    ? clusters.map(cluster => ({ id: cluster.id, label: cluster.label, meta: `${cluster.assetCount} assets · ${cluster.vulnerableCount} quantum-vulnerable`, weight: cluster.riskWeight }))
    : sceneGraphNodes.map(node => ({ id: node.id, label: node.label, meta: `${node.kind} · ${node.findingKeys.length || 1} observed evidence link${node.findingKeys.length === 1 ? "" : "s"}`, weight: node.riskWeight })), [view, clusters, sceneGraphNodes]);

  if (workspace.hasError) return <WorkspaceState state="error" title="Quantum Descent is unavailable" description="The active scan could not be resolved for this navigation view." onRetry={() => void workspace.retry()} />;
  if (workspace.isLoading && !findings.length) return <WorkspaceState state="loading" title="Preparing Quantum Descent" description="Resolving the active scan’s posture, evidence, and action paths." />;
  if (!findings.length) return <WorkspaceState state="empty" title="No active scan evidence" description="Run a seeded scan to explore enterprise posture through to specific risk decisions." />;

  const enterSpatialMode = () => {
    const focus = highestRiskFinding(findings);
    setSelectedFindingKey(focus?.findingKey);
    setSelectedSceneId(focus ? findingNodeId(focus, graphNodes) : undefined);
    setView("enterprise");
    setLens("enterprise");
    setIsSpatialMode(true);
  };

  const selectSceneEntity = (id: string) => {
    const cluster = clusters.find(item => item.id === id);
    if (cluster) {
      setSelectedClusterId(cluster.id);
      setSelectedFindingKey(cluster.findingKeys[0]);
      setSelectedSceneId(undefined);
      setView("domain");
      return;
    }
    const graphNode = graphNodes.find(node => node.id === id);
    setSelectedSceneId(id);
    if (graphNode?.findingKeys[0]) {
      setSelectedFindingKey(graphNode.findingKeys[0]);
      setView("artefact");
    } else {
      setView("ecosystem");
    }
  };

  const focusHighestRisk = () => {
    const focus = highestRiskFinding(findings);
    if (!focus) return;
    setSelectedFindingKey(focus.findingKey);
    setSelectedSceneId(findingNodeId(focus, graphNodes));
    setLens("risk");
    setView("artefact");
  };

  const handleSearchSelect = (id: string, kind: "finding" | "relationship") => {
    if (kind === "finding") {
      const finding = findings.find(item => item.findingKey === id);
      setSelectedFindingKey(id);
      setSelectedSceneId(finding ? findingNodeId(finding, graphNodes) : undefined);
      setView("artefact");
    } else {
      selectSceneEntity(id);
    }
    setQuery("");
  };

  const exitSpatialMode = () => {
    if (selectedFinding) {
      setLocation(`/inventory?finding=${encodeURIComponent(selectedFinding.findingKey)}`);
      return;
    }
    setIsSpatialMode(false);
  };

  if (isSpatialMode) {
    return <div className="spatial-mode-shell">
      <header className="spatial-mode-topbar">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={() => setIsSpatialMode(false)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-medium text-slate-300 hover:border-cyan-200/30 hover:text-cyan-100"><ArrowLeft className="h-3.5 w-3.5" />Normal mode</button>
          <div className="min-w-0"><p className="truncate font-display text-sm font-semibold tracking-tight text-white">Spatial Mode <span className="text-cyan-200/65">/ {displayName}</span></p><p className="hidden text-[10px] uppercase tracking-[0.16em] text-slate-500 sm:block">{usingSavedScan ? "Saved active scan" : "Seeded preview data"} · evidence-backed exploration</p></div>
        </div>
        <div className="flex items-center gap-2"><Badge variant="outline" className="hidden border-cyan-200/15 bg-cyan-300/[0.055] text-cyan-100 md:inline-flex">{webglCapability === "webgl" ? "WebGL spatial scene" : "Accessible 2D scene"}</Badge><button type="button" onClick={exitSpatialMode} className="inline-flex items-center gap-2 rounded-xl border border-rose-200/20 bg-rose-300/[0.07] px-3 py-2 text-xs font-medium text-rose-100 hover:bg-rose-300/[0.12]"><X className="h-3.5 w-3.5" />Exit to inventory</button></div>
      </header>
      <div className="spatial-mode-toolbar">
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto" aria-label="Spatial breadcrumb"><button type="button" onClick={() => { setView("enterprise"); setLens("enterprise"); }} className="spatial-crumb">Enterprise</button>{view !== "enterprise" ? <><ChevronRight className="h-3 w-3 shrink-0 text-slate-700" /><button type="button" onClick={() => setView("domain")} className="spatial-crumb">{selectedCluster?.label ?? "Domain"}</button></> : null}{["ecosystem", "artefact"].includes(view) ? <><ChevronRight className="h-3 w-3 shrink-0 text-slate-700" /><button type="button" onClick={() => setView("ecosystem")} className="spatial-crumb">{displayName}</button></> : null}{view === "artefact" && selectedFinding ? <><ChevronRight className="h-3 w-3 shrink-0 text-slate-700" /><button type="button" onClick={() => setView("artefact")} className="truncate text-cyan-100">{selectedFinding.algorithm}</button></> : null}</nav>
        <div className="relative min-w-[230px] flex-1 sm:max-w-sm"><Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-600" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search an observed asset or dependency" aria-label="Search Spatial Mode entities" className="h-9 border-white/10 bg-[#06101c]/90 pl-8 text-xs text-slate-200 placeholder:text-slate-600" />{searchResults.length ? <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#08111f] p-1 shadow-2xl">{searchResults.map(result => <button type="button" key={`${result.kind}-${result.id}`} onClick={() => handleSearchSelect(result.id, result.kind)} className="w-full rounded-lg px-3 py-2 text-left hover:bg-cyan-300/[0.08]"><span className="block text-xs font-medium text-slate-200">{result.label}</span><span className="mt-0.5 block text-[10px] text-slate-500">{result.subtitle}</span></button>)}</div> : null}</div>
      </div>
      <main className="spatial-mode-main">
        <aside className="spatial-mode-rail"><p className="px-1 text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-600">Explore</p><div className="mt-2 space-y-1">{spatialLenses.map(item => { const Icon = item.icon; return <button type="button" key={item.id} onClick={() => { setLens(item.id); if (item.id === "risk") focusHighestRisk(); if (item.id === "dependency" && selectedFinding) setView("artefact"); }} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs ${lens === item.id ? "bg-cyan-300/[0.11] text-cyan-100" : "text-slate-500 hover:bg-white/[0.035] hover:text-slate-200"}`}><Icon className="h-3.5 w-3.5" />{item.label}</button>; })}</div><div className="mt-5 border-t border-white/[0.07] pt-4"><button type="button" onClick={focusHighestRisk} className="flex w-full items-center gap-2 rounded-xl border border-rose-200/15 bg-rose-300/[0.055] px-3 py-2 text-left text-xs font-medium text-rose-100 hover:bg-rose-300/[0.1]"><Focus className="h-3.5 w-3.5" />Focus highest risk</button><button type="button" onClick={() => { setView("enterprise"); setLens("enterprise"); setSelectedClusterId(undefined); setSelectedSceneId(undefined); }} className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-slate-500 hover:bg-white/[0.035] hover:text-slate-200"><Orbit className="h-3.5 w-3.5" />Reset view</button></div><div className="mt-auto rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">Active scan</p><p className="mt-1 text-sm font-medium text-slate-200">{totalAssets} assets</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{criticalCount} critical · {quantumVulnerableCount} quantum-vulnerable · {quantumReadiness}% readiness</p></div></aside>
        <section className="spatial-stage"><div className="absolute left-5 top-5 z-10 rounded-2xl border border-white/10 bg-[#08111f]/85 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-cyan-200/60">{lens} lens / {view} level</p><p className="mt-1 max-w-[260px] text-xs leading-5 text-slate-400">{view === "enterprise" ? "Clusters are calculated from the active scan and limit detail until you descend." : "Entities and paths represent observed scan relationships at the selected level."}</p></div><div className="absolute bottom-4 left-5 z-10 flex gap-2">{webglCapability === "webgl" ? <><span className="rounded-full border border-white/10 bg-[#08111f]/85 px-2.5 py-1 text-[10px] text-slate-400">Drag to orbit</span><span className="rounded-full border border-white/10 bg-[#08111f]/85 px-2.5 py-1 text-[10px] text-slate-400">Scroll to zoom</span></> : <span className="rounded-full border border-white/10 bg-[#08111f]/85 px-2.5 py-1 text-[10px] text-slate-400">Select an observed entity to descend</span>}</div>{webglCapability === "webgl" ? <SpatialScene clusters={clusters} graphNodes={sceneGraphNodes} edges={sceneEdges} view={view} selectedId={selectedSceneId ?? selectedFindingNode} onSelect={selectSceneEntity} /> : <SpatialFallback entities={fallbackEntities} selectedId={selectedSceneId ?? selectedFindingNode} onSelect={selectSceneEntity} />}</section>
        <aside className="spatial-mode-detail" aria-live="polite">{selectedFinding ? <SpatialDetail finding={selectedFinding} recommendation={recommendation} waves={migrationWaves} lens={lens} timeline={timeline} blastRadius={blastRadius.summary} onShowBlastRadius={() => { setLens("dependency"); setView("artefact"); setSelectedSceneId(selectedFindingNode); }} /> : <div className="grid h-full place-items-center p-6 text-center text-sm text-slate-500">Select an observed cluster or entity to open its analysis panel.</div>}</aside>
      </main>
    </div>;
  }

  const activeStage = normalStages[normalLevel];
  const StageIcon = activeStage.icon;
  const detail = normalLevel === 0 ? `${quantumReadiness}% quantum readiness across the active scan.` : normalLevel === 1 ? displayName : normalLevel === 2 ? `${findings.length} sampled cryptographic findings with provenance.` : `${hndlCount} potential HNDL indicators and ${recommendations.length} prioritised action paths.`;
  return <div className="mx-auto max-w-[1350px]"><Breadcrumb section="Quantum Descent" /><EcdatHeader eyebrow="Signature navigation mode" title="Descend from posture to proof." description="Explore the normal hierarchy or enter a data-backed Spatial Mode to trace observed cryptographic assets, dependencies, risk context, and generated migration paths." /><div className="mt-6 flex flex-col gap-3 rounded-2xl border border-cyan-200/15 bg-cyan-300/[0.055] p-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-medium text-cyan-100">Spatial Mode is ready for the active scan.</p><p className="mt-1 text-xs leading-5 text-slate-400">Interactive clusters and links are derived from the same scan evidence as Inventory, Dependency Intelligence, PQC Guidance, and the Migration Roadmap.</p></div><button type="button" onClick={enterSpatialMode} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-200/25 bg-cyan-300/15 px-4 py-2.5 text-xs font-semibold tracking-[0.12em] text-cyan-50 hover:bg-cyan-300/20"><Sparkles className="h-3.5 w-3.5" />ENTER SPATIAL MODE</button></div><div className="mt-5 grid gap-5 lg:grid-cols-[0.65fr_1fr]"><section className="rounded-3xl border border-white/8 bg-[#091423] p-5"><p className="text-xs leading-5 text-slate-500">Normal-mode navigation levels</p><div className="mt-5 space-y-2">{normalStages.map((stage, index) => { const Icon = stage.icon; return <button key={stage.level} type="button" onClick={() => setNormalLevel(index)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${normalLevel === index ? "bg-cyan-300/10 text-cyan-100" : "text-slate-500 hover:bg-white/[0.035] hover:text-slate-300"}`}><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5"><Icon className="h-4 w-4" /></span><span><span className="block text-[10px] font-semibold uppercase tracking-[0.15em] opacity-60">{stage.level}</span><span className="block text-sm font-medium">{stage.title}</span></span></button>; })}</div></section><section className="relative min-h-[430px] overflow-hidden rounded-3xl border border-cyan-200/12 bg-[radial-gradient(circle_at_center,rgba(34,211,238,.14),transparent_18%),radial-gradient(circle_at_center,rgba(14,116,144,.13),transparent_43%),#071423] p-6"><div className="absolute inset-0 grid place-items-center"><div className="h-[76%] w-[76%] rounded-full border border-cyan-200/10" /><div className="absolute h-[52%] w-[52%] rounded-full border border-cyan-200/14" /><div className="absolute h-[30%] w-[30%] rounded-full border border-cyan-200/20" /></div><div className="relative z-10 flex h-full flex-col items-center justify-center text-center"><span className="grid h-16 w-16 place-items-center rounded-3xl border border-cyan-200/25 bg-cyan-300/10 text-cyan-100 shadow-[0_0_50px_rgba(34,211,238,.15)]"><StageIcon className="h-7 w-7" /></span><p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/60">{activeStage.level} / {activeStage.title}</p><h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-white">{activeStage.text}</h2><p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{detail}</p>{normalLevel < normalStages.length - 1 ? <button type="button" onClick={() => setNormalLevel(normalLevel + 1)} className="mt-7 inline-flex items-center gap-2 rounded-xl border border-cyan-200/20 bg-cyan-300/10 px-4 py-2 text-xs font-medium text-cyan-100 hover:bg-cyan-300/15">Descend one level <ChevronRight className="h-3.5 w-3.5" /></button> : null}</div></section></div></div>;
}

function SpatialFallback({ entities, selectedId, onSelect }: { entities: Array<{ id: string; label: string; meta: string; weight: number }>; selectedId?: string; onSelect: (id: string) => void }) {
  return <div className="spatial-fallback-scene" role="list" aria-label="Accessible two-dimensional spatial environment">{entities.map((entity, index) => <button type="button" role="listitem" key={entity.id} onClick={() => onSelect(entity.id)} className={`spatial-fallback-node spatial-fallback-node--${Math.min(entity.weight, 8)} ${selectedId === entity.id ? "spatial-fallback-node--selected" : ""}`} style={{ "--node-index": index } as CSSProperties}><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200/65">observed entity</span><strong>{entity.label}</strong><small>{entity.meta}</small></button>)}<div className="spatial-fallback-axis" /></div>;
}

function SpatialDetail({ finding, recommendation, waves, lens, timeline, blastRadius, onShowBlastRadius }: { finding: SpatialFinding; recommendation: ReturnType<typeof recommendationForFinding>; waves: ReturnType<typeof relatedWaves>; lens: SpatialLens; timeline: ReturnType<typeof buildSpatialTimeline> | undefined; blastRadius: ReturnType<typeof buildBlastRadius>["summary"]; onShowBlastRadius: () => void }) {
  const riskClass = finding.riskLevel.toLowerCase() === "critical" ? "text-rose-100 border-rose-200/20 bg-rose-300/[0.08]" : finding.riskLevel.toLowerCase() === "high" ? "text-amber-100 border-amber-200/20 bg-amber-200/[0.08]" : "text-cyan-100 border-cyan-200/20 bg-cyan-300/[0.08]";
  if (lens === "timeline" && timeline) return <TimelinePanel finding={finding} timeline={timeline} />;
  if (lens === "migration") return <MigrationPanel finding={finding} recommendation={recommendation} waves={waves} />;
  return <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-600">Selected cryptographic artefact</p><h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-white">{finding.algorithm}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{finding.assetName}</p></div><Badge variant="outline" className={riskClass}>{finding.riskLevel}</Badge></div><div className="mt-5 grid grid-cols-2 gap-2"><Metric label="Quantum status" value={finding.quantumVulnerable ? "Vulnerable" : "Monitored"} /><Metric label="HNDL" value={finding.hndlExposure ? "Potential exposure" : "Not qualified"} /><Metric label="Criticality" value={finding.criticality} /><Metric label="Confidence" value={`${finding.confidence}%`} /></div><div className="mt-5 border-t border-white/[0.07] pt-5"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">Observed context</p><div className="mt-3 space-y-3"><Meta label="Role" value={finding.cryptoRole} /><Meta label="Library / version" value={`${finding.library ?? "Not observed"}${finding.version ? ` · ${finding.version}` : ""}`} /><Meta label="Source evidence" value={finding.sourceLocation} mono /><Meta label="Usage" value={finding.usageContext} /></div></div><div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"><div className="flex items-center gap-2"><Crosshair className="h-3.5 w-3.5 text-cyan-200" /><p className="text-xs font-medium text-slate-200">Potential blast radius</p></div><p className="mt-2 text-[11px] leading-5 text-slate-500">{blastRadius.evidenceNodes} observed entities · {blastRadius.servicesAndEndpoints} services/endpoints · {blastRadius.cryptoAssets} crypto assets · {blastRadius.algorithms} algorithms</p><button type="button" onClick={onShowBlastRadius} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-100 hover:text-cyan-50">Show evidence path <ChevronRight className="h-3.5 w-3.5" /></button></div>{recommendation ? <div className="mt-4 rounded-2xl border border-emerald-200/12 bg-emerald-300/[0.045] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-200/70">Generated migration path</p><p className="mt-1 text-sm font-medium text-emerald-50">{recommendation.candidate}</p><p className="mt-2 text-[11px] leading-5 text-slate-400">{recommendation.indicativeEffort} · {recommendation.indicativeLatency}</p></div> : null}<a href={`/inventory?finding=${encodeURIComponent(finding.findingKey)}`} className="mt-5 inline-flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-100">Open normal evidence detail <ExternalLink className="h-3.5 w-3.5" /></a></div>;
}

function TimelinePanel({ finding, timeline }: { finding: SpatialFinding; timeline: NonNullable<ReturnType<typeof buildSpatialTimeline>> }) {
  const end = Math.max(timeline.dataEndYear, timeline.crqcEstimateYear, timeline.migrationEndYear);
  const span = Math.max(end - timeline.startYear, 1);
  const position = (year: number) => `${Math.min(100, Math.max(0, ((year - timeline.startYear) / span) * 100))}%`;
  return <div className="p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-600">Mosca-style planning window</p><h2 className="mt-2 font-display text-xl font-semibold text-white">{finding.algorithm}</h2><p className="mt-2 text-xs leading-5 text-slate-500">Configured planning inputs for the selected finding; the CRQC horizon is an estimate, not a certain prediction.</p><div className="relative mt-8 h-48 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"><div className="absolute bottom-10 left-5 right-5 h-px bg-slate-700" /><TimelineMarker label="Today" year={timeline.startYear} position="0%" tone="cyan" /><TimelineMarker label="Migration" year={timeline.migrationEndYear} position={position(timeline.migrationEndYear)} tone="emerald" /><TimelineMarker label="CRQC estimate" year={timeline.crqcEstimateYear} position={position(timeline.crqcEstimateYear)} tone="amber" /><TimelineMarker label="Data window" year={timeline.dataEndYear} position={position(timeline.dataEndYear)} tone={timeline.hndlExposed ? "rose" : "cyan"} /></div><div className="mt-5 rounded-2xl border border-amber-200/15 bg-amber-200/[0.05] p-4 text-xs leading-5 text-amber-50/90">{timeline.hndlExposed ? "Potential HNDL exposure is qualified under the active model because the data lifetime extends through the configured CRQC planning horizon." : "HNDL is not qualified by the active model for this finding. Revisit the data lifetime and planning assumptions when new evidence becomes available."}</div></div>;
}

function TimelineMarker({ label, year, position, tone }: { label: string; year: number; position: string; tone: "cyan" | "emerald" | "amber" | "rose" }) { const colors = { cyan: "bg-cyan-300 text-cyan-100", emerald: "bg-emerald-300 text-emerald-100", amber: "bg-amber-200 text-amber-100", rose: "bg-rose-300 text-rose-100" }; return <div className="absolute bottom-7 -translate-x-1/2" style={{ left: position }}><span className={`mx-auto block h-2.5 w-2.5 rounded-full ring-4 ring-[#0b1724] ${colors[tone].split(" ")[0]}`} /><p className={`mt-2 w-20 -translate-x-[36%] text-center text-[10px] font-medium ${colors[tone].split(" ")[1]}`}>{label}</p><p className="mt-0.5 w-20 -translate-x-[36%] text-center text-[10px] text-slate-500">{year}</p></div>; }

function MigrationPanel({ finding, recommendation, waves }: { finding: SpatialFinding; recommendation: ReturnType<typeof recommendationForFinding>; waves: ReturnType<typeof relatedWaves> }) { return <div className="p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-600">Generated PQC migration view</p><h2 className="mt-2 font-display text-xl font-semibold text-white">{finding.algorithm}</h2>{recommendation ? <><div className="mt-5 rounded-2xl border border-emerald-200/15 bg-emerald-300/[0.055] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-200/70">Recommended target</p><p className="mt-2 text-sm font-semibold text-emerald-50">{recommendation.candidate}</p><p className="mt-3 text-xs leading-5 text-slate-400">{recommendation.migrationNotes}</p></div><div className="mt-4 grid grid-cols-2 gap-2"><Metric label="Effort" value={recommendation.indicativeEffort.replace("Indicative: ", "")} /><Metric label="Latency" value={recommendation.indicativeLatency.replace("Indicative: ", "")} /></div><div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">Compatibility condition</p><p className="mt-1.5 text-xs leading-5 text-slate-400">{recommendation.compatibility}</p></div></> : <p className="mt-5 text-sm leading-6 text-slate-500">No generated PQC recommendation applies to this observed finding.</p>}<div className="mt-5"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">Relevant migration waves</p><div className="mt-3 space-y-2">{waves.map(wave => <div key={wave.wave} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-cyan-200/60">Wave {wave.wave}</p><p className="mt-1 text-xs font-medium text-slate-200">{wave.title}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{wave.indicativeEffort}</p></div>)}</div></div></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"><p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-600">{label}</p><p className="mt-1 text-xs font-medium leading-4 text-slate-200">{value}</p></div>; }
function Meta({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div><p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-600">{label}</p><p className={`mt-1 text-xs leading-5 text-slate-400 ${mono ? "font-mono text-[11px]" : ""}`}>{value}</p></div>; }
