import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Breadcrumb, EcdatHeader } from "@/components/EcdatHeader";
import { WorkspaceState } from "@/components/WorkspaceState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useActiveEcdatScan } from "@/hooks/useActiveEcdatScan";
import { buildEdges, computeBlastRadius, computeChain, extractNodes, graphColumnLabels, type EvidenceGraphNode } from "@/lib/graphUtils";
import { ArrowRight, Crosshair, FlaskConical, GitBranch, Move, Network, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { openFindingInLab } from "@/lib/labLaunch";

const MIN_ZOOM = 0.45;
const MAX_ZOOM = 3;

const nodeRadii: Record<string, number> = { service: 18, library: 14, algorithm: 16, asset: 16, certificate: 15, "certificate-authority": 16, endpoint: 13, data: 14, entity: 12 };

function clampZoom(value: number) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(value.toFixed(2))));
}

function GraphNode({ node, selected, chained, onSelect }: { node: EvidenceGraphNode; selected: boolean; chained: boolean; onSelect: (id: string) => void }) {
  const radius = nodeRadii[node.type] ?? nodeRadii.entity;
  const label = node.label.length > 24 ? `${node.label.slice(0, 23)}…` : node.label;
  const dimmed = !selected && !chained;
  return <g transform={`translate(${node.x} ${node.y})`} role="button" tabIndex={0} aria-label={`Select ${node.label} ${node.type} node`} className="cursor-pointer outline-none" opacity={dimmed ? 0.35 : 1} onPointerDown={event => { event.stopPropagation(); onSelect(node.id); }} onClick={event => { event.stopPropagation(); onSelect(node.id); }} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(node.id); } }}>
    <rect x="-76" y="-42" width="152" height="96" rx="14" fill="transparent" pointerEvents="all" />
    {selected && <circle r={radius + 9} fill="none" stroke="#fc4c1f" strokeWidth="1.5" strokeOpacity="0.65" className="animate-pulse" />}
    <circle r={radius} fill="#141414" stroke={selected ? "#fc4c1f" : node.color} strokeWidth={selected ? 3 : 1.75} />
    <circle r={Math.max(3, radius * 0.24)} fill={node.color} />
    <text y={radius + 19} textAnchor="middle" fill={selected ? "#ffffff" : "#dedede"} fontSize="13" fontWeight={selected ? "700" : "500"}>{label}</text>
    <text y={radius + 34} textAnchor="middle" fill={node.color} fontSize="9" fontWeight="700" letterSpacing="1.2">{node.type.toUpperCase()}</text>
  </g>;
}

function GraphEdge({ edge, active }: { edge: ReturnType<typeof buildEdges>[number]; active: boolean }) {
  const source = edge.source!;
  const target = edge.target!;
  const middle = (source.x + target.x) / 2;
  const path = `M ${source.x} ${source.y} C ${middle} ${source.y}, ${middle} ${target.y}, ${target.x} ${target.y}`;
  return <path d={path} fill="none" stroke={active ? "#fc4c1f" : "#9f9f9f"} strokeWidth={active ? 2.5 : 1.15} strokeOpacity={active ? 0.92 : 0.3} filter={active ? "url(#chainGlow)" : undefined} />;
}

export default function Graph() {
  const workspace = useActiveEcdatScan();
  const [, setLocation] = useLocation();
  const requestedFinding = useMemo(() => new URLSearchParams(window.location.search).get("finding"), []);
  const [selected, setSelected] = useState<string | null>(null);
  const [appFilter, setAppFilter] = useState("all");
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragOrigin = useRef<{ x: number; y: number; panX: number; panY: number; moved: boolean } | null>(null);
  const nodes = useMemo(() => extractNodes(workspace.relationships, workspace.findings), [workspace.findings, workspace.relationships]);
  const serviceNodes = useMemo(() => nodes.filter(node => node.type === "service"), [nodes]);

  useEffect(() => {
    if (!requestedFinding || selected) return;
    const match = nodes.find(node => node.findingKeys.includes(requestedFinding));
    if (match) setSelected(match.id);
  }, [nodes, requestedFinding, selected]);

  const filteredRelationships = useMemo(() => {
    if (appFilter === "all") return workspace.relationships;
    const scope = computeChain(appFilter, workspace.relationships);
    return workspace.relationships.filter(edge => scope.has(edge.sourceNode) && scope.has(edge.targetNode));
  }, [appFilter, workspace.relationships]);
  const visibleNodes = useMemo(() => extractNodes(filteredRelationships, workspace.findings), [filteredRelationships, workspace.findings]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const chain = useMemo(() => selected ? computeChain(selected, filteredRelationships) : new Set<string>(), [filteredRelationships, selected]);
  const edges = useMemo(() => buildEdges(filteredRelationships, visibleNodes, chain), [chain, filteredRelationships, visibleNodes]);
  const blast = useMemo(() => selected ? computeBlastRadius(selected, filteredRelationships) : null, [filteredRelationships, selected]);
  const selectedNode = useMemo(() => visibleNodes.find(node => node.id === selected), [selected, visibleNodes]);
  const selectedFindingKey = selectedNode?.findingKeys[0];
  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  if (workspace.hasError) return <WorkspaceState state="error" title="Dependency graph is unavailable" description="The current relationship evidence could not be retrieved." onRetry={() => void workspace.retry()} />;
  if (workspace.isLoading && !workspace.relationships.length) return <WorkspaceState state="loading" title="Building the dependency graph" description="Connecting observed services, libraries, algorithms, certificates, endpoints, and data paths." />;
  if (!workspace.relationships.length) return <WorkspaceState state="empty" title="No relationship evidence yet" description="Run a seeded scan to populate the service, library, algorithm, certificate, endpoint, and data graph." />;

  return <div className="mx-auto max-w-[1620px]">
    <Breadcrumb section="Dependency graph" />
    <EcdatHeader eyebrow="Dependency intelligence" title="Trace evidence through the dependency chain." description="Every visible node and relationship is derived from the active scan. The highlighted chain is an observed relationship lens, not a runtime-reachability or exploit claim." />

    <div className="mt-7 flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-[#091423] p-3">
      <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#06101c] px-3 py-2 text-xs text-slate-400">Application scope
        <select value={appFilter} onChange={event => { setAppFilter(event.target.value); setSelected(null); }} className="ml-auto min-w-0 flex-1 bg-transparent text-right text-xs text-slate-100 outline-none">
          <option value="all">All observed services</option>
          {serviceNodes.map(node => <option key={node.id} value={node.id}>{node.label}</option>)}
        </select>
      </label>
      <Badge variant="outline" className="border-white/10 bg-white/[0.025] text-slate-400">{visibleNodes.length} nodes</Badge>
      <Badge variant="outline" className="border-white/10 bg-white/[0.025] text-slate-400">{edges.length} edges</Badge>
      <div className="ml-auto flex items-center gap-2">
        <Button size="icon" variant="outline" aria-label="Zoom graph in" onClick={() => setTransform(current => ({ ...current, scale: clampZoom(current.scale + 0.15) }))} className="border-white/10 bg-[#06101c] text-slate-300"><ZoomIn className="h-4 w-4" /></Button>
        <Button size="icon" variant="outline" aria-label="Zoom graph out" onClick={() => setTransform(current => ({ ...current, scale: clampZoom(current.scale - 0.15) }))} className="border-white/10 bg-[#06101c] text-slate-300"><ZoomOut className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={resetView} className="border-white/10 bg-[#06101c] text-slate-300"><RotateCcw className="mr-2 h-3.5 w-3.5" />Reset view</Button>
      </div>
    </div>

    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-3xl border border-white/8 bg-[#191c1f]">
        <div className="overflow-x-auto overscroll-x-contain [scrollbar-color:#334155_transparent]">
        <svg ref={svgRef} className="h-[590px] min-w-[880px] w-full touch-none select-none" viewBox="0 0 1120 620" role="img" aria-label="Interactive graph of observed cryptographic relationships" onPointerDown={event => { dragOrigin.current = { x: event.clientX, y: event.clientY, panX: transform.x, panY: transform.y, moved: false }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={event => { const origin = dragOrigin.current; if (!origin) return; const dx = (event.clientX - origin.x) / transform.scale; const dy = (event.clientY - origin.y) / transform.scale; if (Math.abs(dx) + Math.abs(dy) > 3) origin.moved = true; setTransform(current => ({ ...current, x: origin.panX + dx, y: origin.panY + dy })); }} onPointerUp={event => { if (!dragOrigin.current) return; dragOrigin.current = null; event.currentTarget.releasePointerCapture(event.pointerId); }}>
          <defs><filter id="chainGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter><pattern id="graphGrid" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M 42 0 L 0 0 0 42" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="1" /></pattern></defs>
          <rect width="1120" height="620" fill="url(#graphGrid)" />
          <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
            {graphColumnLabels.map((label, index) => <text key={label} x={105 + index * 175} y="45" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700" letterSpacing="1.4">{label.toUpperCase()}</text>)}
            {edges.map((edge, index) => <GraphEdge key={`${edge.sourceNode}-${edge.targetNode}-${index}`} edge={edge} active={edge.highlighted} />)}
            {visibleNodes.map(node => <GraphNode key={node.id} node={node} selected={node.id === selected} chained={!selected || chain.has(node.id)} onSelect={setSelected} />)}
          </g>
        </svg>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-white/8 bg-[#06101c]/50 px-5 py-3 text-[11px] text-slate-500"><Move className="h-3.5 w-3.5" />Drag to pan · use the zoom controls · Escape clears selection</div>
      </section>

      <aside className="rounded-3xl border border-white/8 bg-[#091423] p-5">
        {selectedNode && blast ? <BlastRadiusPanel node={selectedNode} blast={blast} onInventory={() => setLocation(`/inventory${selectedFindingKey ? `?finding=${selectedFindingKey}` : ""}`)} onRoadmap={() => setLocation(`/migration${selectedFindingKey ? `?finding=${selectedFindingKey}` : ""}`)} onLab={() => { const finding = workspace.findings.find(item => item.findingKey === selectedFindingKey); if (finding) openFindingInLab(finding); }} /> : <GraphLegend />}
      </aside>
    </div>
  </div>;
}

function GraphLegend() {
  const legend = [{ label: "Service", color: "#fc4c1f" }, { label: "Library", color: "#fdc448" }, { label: "Algorithm", color: "#ff0003" }, { label: "Certificate", color: "#3eb75e" }, { label: "Endpoint", color: "#fdc448" }, { label: "Data", color: "#fc4c1f" }];
  return <><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100"><Network className="h-4 w-4" /></span><div><p className="text-sm font-medium text-slate-100">Blast-radius lens</p><p className="text-xs text-slate-500">Select an observed entity</p></div></div><div className="mt-6 rounded-2xl border border-white/7 bg-[#06101c]/70 p-4 text-sm leading-6 text-slate-400">Select a node to highlight its observed dependency chain and inspect a reverse-path impact lens.</div><div className="mt-5 space-y-2">{legend.map(item => <div key={item.label} className="flex items-center gap-2 rounded-lg border border-white/7 bg-white/[0.025] px-3 py-2 text-xs text-slate-300"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</div>)}</div></>;
}

function BlastRadiusPanel({ node, blast, onInventory, onRoadmap, onLab }: { node: EvidenceGraphNode; blast: ReturnType<typeof computeBlastRadius>; onInventory: () => void; onRoadmap: () => void; onLab: () => void }) {
  const nearby = Array.from(blast.nodeIds).filter(id => id !== node.id).slice(0, 6).map(id => id.replace(/^[^:]+:/, ""));
  return <><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100"><Crosshair className="h-4 w-4" /></span><div className="min-w-0"><p className="text-sm font-medium text-slate-100">Blast-radius lens</p><p className="truncate text-xs text-slate-500">{node.label}</p></div></div><div className="mt-5 grid grid-cols-3 gap-2"><Metric label="Services" value={blast.services} /><Metric label="Endpoints" value={blast.endpoints} /><Metric label="Assets" value={blast.assets} /></div><div className="mt-4 rounded-xl border border-white/7 bg-[#06101c]/70 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Observed path complexity</p><p className="mt-1 text-sm font-semibold text-cyan-100">{blast.complexity}</p><p className="mt-2 text-xs leading-5 text-slate-400">{blast.nodeIds.size} observed entities · {blast.edges.length} relationship records in the reverse-path lens.</p></div>{nearby.length ? <div className="mt-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Affected observed entities</p><div className="mt-2 space-y-2">{nearby.map(item => <p key={item} className="truncate rounded-lg border border-white/7 bg-white/[0.025] px-3 py-2 text-xs text-slate-300">{item}</p>)}</div></div> : <p className="mt-4 text-xs leading-5 text-slate-500">No reverse relationship records were found for this observed entity.</p>}<div className="mt-5 space-y-2"><Button onClick={onInventory} className="w-full bg-cyan-200 text-[#072033] hover:bg-cyan-100">View affected assets <ArrowRight className="ml-2 h-3.5 w-3.5" /></Button><Button onClick={onRoadmap} variant="outline" className="w-full border-white/10 text-slate-200"><GitBranch className="mr-2 h-3.5 w-3.5" />Create migration plan</Button><Button onClick={onLab} variant="outline" className="w-full border-cyan-200/20 bg-cyan-300/[0.05] text-cyan-100"><FlaskConical className="mr-2 h-3.5 w-3.5" />Open selected finding in Lab</Button></div><div className="mt-5 rounded-xl border border-amber-200/10 bg-amber-200/[0.035] p-3 text-xs leading-5 text-amber-100/85">This is a relationship-derived prioritisation signal, not proof of runtime reachability, operational impact, or exploitability.</div></>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-white/7 bg-white/[0.025] p-2 text-center"><p className="font-display text-lg text-white">{value}</p><p className="mt-1 text-[9px] uppercase tracking-wider text-slate-600">{label}</p></div>; }
