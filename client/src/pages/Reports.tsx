import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Breadcrumb, EcdatHeader } from "@/components/EcdatHeader";
import { WorkspaceState } from "@/components/WorkspaceState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useActiveEcdatScan } from "@/hooks/useActiveEcdatScan";
import { defaultScenario, downloadText } from "@/lib/ecdatUi";
import { trpc } from "@/lib/trpc";
import { Check, ChevronDown, Download, Eye, FileCode2, FileJson2, FileText, Sparkles } from "lucide-react";

type DownloadKind = "cbom" | "html";
type ExportProperty = { name: string; value: string };
type ExportComponent = { "bom-ref": string; name: string; properties: ExportProperty[] };

export default function Reports() {
  const { isAuthenticated, loading } = useAuth();
  const workspace = useActiveEcdatScan();
  const [generating, setGenerating] = useState<DownloadKind | null>(null);
  const scans = trpc.ecdat.scans.useQuery(undefined, { enabled: isAuthenticated });
  const scanKey = scans.data?.[0]?.scanKey;
  const savedExport = trpc.ecdat.export.useQuery({ scanKey: scanKey ?? "pending" }, { enabled: Boolean(scanKey) });
  const previewExport = trpc.ecdat.previewExport.useQuery({ scenario: defaultScenario }, { enabled: !scanKey });
  const qaState = import.meta.env.DEV && typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("qaState") : null;
  const forceError = qaState === "error";
  const forceEmpty = qaState === "empty";
  const usingPreview = !scanKey;
  const payload = usingPreview ? previewExport.data : savedExport.data;
  const exportLoading = usingPreview ? previewExport.isLoading : savedExport.isLoading;

  if (forceError || scans.isError || savedExport.isError || previewExport.isError || workspace.hasError) {
    return <WorkspaceState state="error" title="Export data is unavailable" description="The saved scan or seeded preview export could not be prepared." onRetry={() => { void scans.refetch(); void savedExport.refetch(); void previewExport.refetch(); void workspace.retry(); }} />;
  }

  const ready = Boolean(payload) && !forceEmpty;
  const sourceLabel = usingPreview ? "Seeded demo preview" : "Saved active scan";
  const sourceDescription = usingPreview
    ? "Preview downloads use deterministic seeded evidence and require no sign-in or database record."
    : "Downloads are generated from your latest saved scan and retain its evidence context.";
  const previewComponents = (payload?.cbom.components ?? []) as ExportComponent[];

  const download = (kind: DownloadKind) => {
    if (!payload || generating) return;
    setGenerating(kind);
    window.setTimeout(() => {
      if (kind === "cbom") downloadText(usingPreview ? "ecdat-preview-cbom.json" : "ecdat-cbom.json", JSON.stringify(payload.cbom, null, 2), "application/json");
      else downloadText(usingPreview ? "ecdat-preview-executive-report.html" : "ecdat-executive-report.html", payload.reportHtml, "text/html");
      setGenerating(null);
    }, 220);
  };

  return <div className="mx-auto max-w-[1550px]">
    <Breadcrumb section="Reports & export" />
    <EcdatHeader eyebrow="Portable evidence" title="Export the intelligence, not just a chart." description="Download a CycloneDX-oriented CBOM JSON record or executive HTML summary from a saved scan. When no saved scan is available, ECDAT provides clearly labelled seeded-preview exports for demo exploration." />
    <div className="mt-6 flex flex-wrap items-center gap-2" aria-live="polite">
      <Badge variant="outline" className={usingPreview ? "border-amber-200/20 bg-amber-300/[0.06] text-amber-100" : "border-emerald-200/20 bg-emerald-300/[0.04] text-emerald-100"}>{usingPreview ? <Sparkles className="mr-1.5 h-3.5 w-3.5" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}{sourceLabel}</Badge>
      <p className="text-xs text-slate-500">{sourceDescription}</p>
    </div>
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <ExportCard icon={FileJson2} title="CycloneDX-oriented CBOM JSON" description="Prototype CBOM export with assets, evidence, provenance, confidence, and quantum-risk context. Validate the selected target schema before production use." disabled={!ready} actionLabel={generating === "cbom" || exportLoading ? "Generating JSON…" : "Download JSON"} onClick={() => download("cbom")} />
      <ExportCard icon={FileText} title="Executive HTML report" description="A concise decision document with posture metrics and evidence-backed cryptographic inventory rows." disabled={!ready} actionLabel={generating === "html" || exportLoading ? "Generating report…" : "Download HTML"} onClick={() => download("html")} />
    </div>
    <section className="mt-5 rounded-2xl border border-white/8 bg-[#091423] p-5"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100"><FileCode2 className="h-5 w-5" /></span><div><p className="font-medium text-slate-100">Export readiness</p><p className="mt-1 text-xs leading-5 text-slate-500">{forceEmpty ? "No exportable evidence is available in this QA state." : ready ? sourceDescription : loading || exportLoading ? "Preparing the export payload…" : "No exportable evidence is available yet."}</p></div></div>{ready ? <Badge variant="outline" className="w-fit border-emerald-200/20 bg-emerald-300/[0.04] text-emerald-100"><Check className="mr-1.5 h-3.5 w-3.5" />Ready to download</Badge> : <Badge variant="outline" className="w-fit border-white/10 bg-white/[0.025] text-slate-400">Preparing evidence</Badge>}</div></section>
    <Collapsible className="mt-5 rounded-2xl border border-white/8 bg-[#091423]" disabled={!ready}><CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left disabled:cursor-not-allowed"><span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.04] text-cyan-100"><Eye className="h-4 w-4" /></span><span><span className="block text-sm font-medium text-slate-100">Preview exported evidence</span><span className="mt-0.5 block text-xs text-slate-500">Review a small, read-only sample before downloading.</span></span></span><ChevronDown className="h-4 w-4 text-slate-500" /></CollapsibleTrigger><CollapsibleContent className="border-t border-white/8 px-5 py-4"><div className="grid gap-3 md:grid-cols-3">{previewComponents.slice(0, 3).map(component => <article key={component["bom-ref"]} className="rounded-xl border border-white/8 bg-white/[0.025] p-3"><p className="truncate text-sm font-medium text-slate-200">{component.name}</p><p className="mt-1 text-xs text-cyan-100">{component.properties.find(property => property.name === "ecdat:algorithm")?.value}</p><p className="mt-2 text-[11px] text-slate-500">{component.properties.find(property => property.name === "ecdat:risk-level")?.value} risk · {component.properties.find(property => property.name === "ecdat:confidence")?.value} confidence</p></article>)}</div><p className="mt-4 text-xs leading-5 text-slate-500">Preview is intentionally limited. The download includes all observed components and their evidence properties.</p></CollapsibleContent></Collapsible>
  </div>;
}

function ExportCard({ icon: Icon, title, description, disabled, actionLabel, onClick }: { icon: typeof FileJson2; title: string; description: string; disabled: boolean; actionLabel: string; onClick: () => void }) {
  return <article className="rounded-3xl border border-white/8 bg-[#091423] p-6"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100"><Icon className="h-5 w-5" /></span><h2 className="mt-5 font-display text-xl font-semibold text-white">{title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p><Button onClick={onClick} disabled={disabled} className="mt-6 bg-white/8 text-slate-100 hover:bg-white/12 disabled:opacity-45"><Download className="h-4 w-4" />{actionLabel}</Button></article>;
}
