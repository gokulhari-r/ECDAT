import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronRight } from "lucide-react";

export function EcdatHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="flex flex-col gap-4 border-b border-white/8 pb-6 md:flex-row md:items-end md:justify-between"><div><div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/60"><span className="h-1.5 w-1.5 rounded-full bg-cyan-200" />{eyebrow}</div><h1 className="font-display text-3xl font-semibold tracking-[-0.045em] text-white md:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p></div><Badge variant="outline" className="w-fit gap-1.5 border-emerald-300/20 bg-emerald-300/5 px-3 py-1.5 text-emerald-100"><CheckCircle2 className="h-3.5 w-3.5" />Evidence-led analysis</Badge></div>;
}

export function Breadcrumb({ section }: { section: string }) { return <div className="mb-5 flex items-center gap-1 text-xs text-slate-500"><span>Workspace</span><ChevronRight className="h-3 w-3" /><span className="text-slate-300">{section}</span></div>; }
