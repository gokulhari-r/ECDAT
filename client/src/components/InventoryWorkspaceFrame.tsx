import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { Compass, Moon, Sun } from "lucide-react";
import { useLocation } from "wouter";

const workspaceDestinations = [
  { label: "Command center", path: "/" },
  { label: "CBOM inventory", path: "/inventory" },
  { label: "Dependency graph", path: "/graph" },
  { label: "PQC guidance", path: "/recommendations" },
  { label: "Migration roadmap", path: "/roadmap" },
  { label: "Reports & export", path: "/reports" },
  { label: "Quantum Descent", path: "/descent" },
];

export function InventoryWorkspaceFrame({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();
  const baseLocation = location.split("?")[0];
  return <div className="min-h-screen bg-[#06101c] text-slate-100"><header className="sticky top-0 z-30 border-b border-white/8 bg-[#08111f]/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-[1800px] items-center gap-3 px-4 md:px-7"><button onClick={() => setLocation("/")} className="flex shrink-0 items-center gap-2 text-left"><span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-300 via-teal-300 to-emerald-400 text-[#062132]"><Compass className="h-4 w-4" strokeWidth={2.6} /></span><span><span className="block font-display text-sm font-semibold tracking-[-0.03em] text-white">ECDAT</span><span className="hidden text-[9px] font-medium uppercase tracking-[0.16em] text-cyan-200/60 sm:block">Quantum observatory</span></span></button><div className="ml-auto flex min-w-0 items-center gap-2"><label className="hidden min-w-0 items-center gap-2 text-xs text-slate-500 sm:flex">Workspace<select aria-label="Navigate workspace" value={baseLocation} onChange={event => setLocation(event.target.value)} className="h-9 max-w-44 rounded-lg border border-white/10 bg-[#06101c] px-2 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-cyan-200/60">{workspaceDestinations.map(destination => <option key={destination.path} value={destination.path}>{destination.label}</option>)}</select></label><Button onClick={() => setLocation("/")} variant="outline" size="sm" className="hidden border-white/10 bg-white/[0.025] text-slate-300 hover:bg-white/[0.06] md:inline-flex">Command center</Button><Button onClick={toggleTheme} variant="outline" size="icon" className="h-9 w-9 border-cyan-300/25 bg-cyan-300/5 text-cyan-100" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>{loading ? <span className="h-8 w-8 animate-pulse rounded-full bg-white/5" /> : user ? <span className="grid h-8 w-8 place-items-center rounded-full border border-cyan-200/20 bg-cyan-200 text-xs font-bold text-[#062132]" title={user.name ?? "ECDAT user"}>{user.name?.slice(0, 1).toUpperCase() ?? "E"}</span> : <Button onClick={startLogin} size="sm" className="bg-cyan-200 text-[#072033] hover:bg-cyan-100">Sign in</Button>}</div></div></header><main className="min-h-screen p-4 md:p-7 lg:p-9">{children}</main></div>;
}
