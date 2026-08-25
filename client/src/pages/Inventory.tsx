import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Database, SearchX } from "lucide-react";
import { Breadcrumb, EcdatHeader } from "@/components/EcdatHeader";
import { InventoryFilters } from "@/components/InventoryFilters";
import { InventoryEvidencePanel } from "@/components/InventoryEvidencePanel";
import { InventorySummaryBar } from "@/components/InventorySummaryBar";
import { InventoryTable } from "@/components/InventoryTable";
import { WorkspaceState } from "@/components/WorkspaceState";
import { Button } from "@/components/ui/button";
import { useActiveEcdatScan } from "@/hooks/useActiveEcdatScan";
import { buildInventorySummary, filterInventoryFindings, inventoryColumnKeys, inventoryFindingFromSearch, inventoryOptions, loadInventoryColumns, nextInventorySort, saveInventoryColumns, sortInventoryFindings, type InventoryColumnKey, type InventoryFilters as FilterState, type InventorySort } from "@/lib/inventoryUtils";

const columnStorageKey = "ecdat-inventory-columns-v1";
const defaultFilters: FilterState = { query: "", assetType: "all", risk: "all", quantum: "all", application: "all" };
const pageSizes = [15, 25, 50] as const;

function getInitialState() {
  const params = new URLSearchParams(window.location.search);
  const risk = params.get("risk");
  return {
    finding: inventoryFindingFromSearch(window.location.search),
    filters: {
      query: params.get("query") ?? params.get("algorithm") ?? "",
      assetType: params.get("type") ?? "all",
      risk: risk ? `${risk.slice(0, 1).toUpperCase()}${risk.slice(1).toLowerCase()}` : "all",
      quantum: params.get("quantum") ?? "all",
      application: params.get("application") ?? "all",
    } satisfies FilterState,
  };
}

export default function Inventory() {
  const workspace = useActiveEcdatScan();
  const [, setLocation] = useLocation();
  const initial = useMemo(getInitialState, []);
  const qaState = useMemo(() => import.meta.env.DEV ? new URLSearchParams(window.location.search).get("qaState") : null, []);
  const searchRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<FilterState>(initial.filters);
  const [selected, setSelected] = useState<string | null>(initial.finding);
  const [sorting, setSorting] = useState<InventorySort[]>([{ key: "risk", direction: "desc" }]);
  const [columns, setColumns] = useState<InventoryColumnKey[]>(() => loadInventoryColumns(columnStorageKey));
  const [pageSize, setPageSize] = useState<(typeof pageSizes)[number]>(15);
  const [page, setPage] = useState(1);
  const { findings, displayName } = workspace;
  const options = useMemo(() => inventoryOptions(findings), [findings]);
  const summary = useMemo(() => buildInventorySummary(findings), [findings]);
  const filtered = useMemo(() => filterInventoryFindings(findings, filters), [findings, filters]);
  const sorted = useMemo(() => sortInventoryFindings(filtered, sorting), [filtered, sorting]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeFinding = findings.find(finding => finding.findingKey === selected);
  const activeRecommendation = workspace.recommendations.find(recommendation => recommendation.findingKey === selected);

  useEffect(() => { setPage(1); }, [filters, sorting, pageSize]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") { event.preventDefault(); searchRef.current?.focus(); } if (event.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => {
    const params = new URLSearchParams();
    if (selected) params.set("finding", selected);
    if (filters.assetType !== "all") params.set("type", filters.assetType);
    if (filters.risk !== "all") params.set("risk", filters.risk.toLowerCase());
    if (filters.quantum !== "all") params.set("quantum", filters.quantum);
    if (filters.application !== "all") params.set("application", filters.application);
    if (filters.query) params.set("query", filters.query);
    if (qaState) params.set("qaState", qaState);
    window.history.replaceState(null, "", `/inventory${params.size ? `?${params.toString()}` : ""}`);
  }, [filters, qaState, selected]);

  function toggleColumn(column: InventoryColumnKey) {
    setColumns(current => {
      const next = current.includes(column) ? current.filter(item => item !== column) : inventoryColumnKeys.filter(item => current.includes(item) || item === column);
      if (!next.length) return current;
      saveInventoryColumns(columnStorageKey, next);
      return next;
    });
  }
  function selectFinding(findingKey: string) { setSelected(findingKey); }
  function clearFilters() { setFilters(defaultFilters); setPage(1); }

  if (workspace.hasError) return <WorkspaceState state="error" title="Inventory data is unavailable" description="The current scan view could not be loaded. Retry to restore the evidence-backed inventory." onRetry={() => void workspace.retry()} />;
  if (workspace.isLoading && !findings.length) return <WorkspaceState state="loading" title="Loading cryptographic inventory" description="Resolving evidence-backed findings, related risk context, and provenance." />;
  if (!findings.length) return <div className="mx-auto max-w-[720px] text-center"><WorkspaceState state="empty" title="No scan data yet" description="Run a scan from the Command Center to populate the cryptographic inventory." /><Button onClick={() => setLocation("/")} className="mt-4 bg-cyan-200 text-[#072033] hover:bg-cyan-100">Go to Command Center</Button></div>;

  return <div className="mx-auto max-w-[1550px] space-y-5"><Breadcrumb section="CBOM inventory" /><EcdatHeader eyebrow="Evidence-backed CBOM" title="A crypto inventory with receipts." description="Every record keeps its algorithm, role, location, version, usage context, confidence, and scanner provenance close to the decision." /><InventorySummaryBar summary={summary} /><InventoryFilters filters={filters} onFiltersChange={setFilters} assetTypes={options.assetTypes} quantumStates={options.quantumStates} applicationName={displayName} columns={columns} onToggleColumn={toggleColumn} onClear={clearFilters} searchRef={searchRef} />
    <section className="overflow-hidden rounded-3xl border border-white/8 bg-[#091423]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4 md:px-5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100"><Database className="h-4 w-4" /></span><div><p className="text-sm font-medium text-slate-100">Cryptographic asset explorer</p><p className="mt-0.5 text-xs text-slate-500">{filtered.length} matching of {findings.length} observed records · Shift+click adds a sort</p></div></div><label className="flex items-center gap-2 text-xs text-slate-500">Rows<select value={pageSize} onChange={event => setPageSize(Number(event.target.value) as (typeof pageSizes)[number])} className="h-8 rounded-lg border border-white/10 bg-[#06101c] px-2 text-xs text-slate-300">{pageSizes.map(size => <option key={size} value={size}>{size}</option>)}</select></label></div>{visible.length ? <InventoryTable findings={visible} columns={columns} sorting={sorting} selected={selected} onSort={(key, append) => setSorting(current => nextInventorySort(current, key, append))} onSelect={selectFinding} onMove={setSelected} /> : <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.04] text-slate-500"><SearchX className="h-5 w-5" /></span><h2 className="mt-4 font-display text-xl font-semibold text-slate-100">No assets match your filters</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Try adjusting your search or filter criteria to return to observed evidence.</p><Button variant="outline" onClick={clearFilters} className="mt-5 border-white/10 bg-white/[0.03] text-slate-200">Clear all filters</Button></div>}<div className="flex flex-col gap-3 border-t border-white/[0.07] px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5"><p className="text-xs text-slate-500">Page {currentPage} / {totalPages}</p><div className="flex gap-2"><Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setPage(current => Math.max(1, current - 1))} className="border-white/10 bg-transparent text-slate-300">Prev</Button><Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setPage(current => Math.min(totalPages, current + 1))} className="border-white/10 bg-transparent text-slate-300">Next</Button></div></div></section>{activeFinding ? <InventoryEvidencePanel finding={activeFinding} relationships={workspace.relationships} recommendation={activeRecommendation} displayName={displayName} onClose={() => setSelected(null)} onNavigate={setLocation} /> : null}
  </div>;
}
