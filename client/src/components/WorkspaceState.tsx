import { Button } from "@/components/ui/button";
import { AlertTriangle, LoaderCircle, SearchX } from "lucide-react";

export function WorkspaceState({ state, title, description, onRetry }: { state: "loading" | "error" | "empty"; title: string; description: string; onRetry?: () => void }) {
  const Icon = state === "loading" ? LoaderCircle : state === "error" ? AlertTriangle : SearchX;
  return <div className="mx-auto grid min-h-[300px] max-w-xl place-items-center px-5"><div className="w-full rounded-3xl border border-white/8 bg-[#091423] p-8 text-center"><span className={`mx-auto grid h-11 w-11 place-items-center rounded-2xl ${state === "error" ? "bg-rose-300/10 text-rose-200" : "bg-cyan-300/10 text-cyan-100"}`}><Icon className={`h-5 w-5 ${state === "loading" ? "animate-spin" : ""}`} /></span><h2 className="mt-4 font-display text-xl font-semibold text-white">{title}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">{description}</p>{onRetry ? <Button variant="outline" onClick={onRetry} className="mt-5 border-cyan-300/20 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10">Try again</Button> : null}</div></div>;
}
