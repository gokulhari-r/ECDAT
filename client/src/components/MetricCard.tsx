import type { LucideIcon } from "lucide-react";

export function MetricCard({ label, value, note, icon: Icon, tone = "cyan" }: { label: string; value: string | number; note: string; icon: LucideIcon; tone?: "cyan" | "rose" | "amber" | "emerald" }) {
  const tones = { cyan: "from-cyan-300/15 to-cyan-300/0 text-cyan-100 ring-cyan-200/15", rose: "from-rose-300/15 to-rose-300/0 text-rose-100 ring-rose-200/15", amber: "from-amber-200/15 to-amber-200/0 text-amber-100 ring-amber-200/15", emerald: "from-emerald-300/15 to-emerald-300/0 text-emerald-100 ring-emerald-200/15" };
  return <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 ring-1 ${tones[tone]}`}><Icon className="absolute right-4 top-4 h-5 w-5 opacity-55" /><p className="text-xs font-medium text-slate-400">{label}</p><p className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-white">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></div>;
}
