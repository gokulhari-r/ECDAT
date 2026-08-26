import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { startLogin } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { useActiveEcdatScan } from "@/hooks/useActiveEcdatScan";
import { buildGlobalSearchItems } from "@/lib/globalSearch";
import { Bell, Compass, FileText, FlaskConical, GitBranch, LayoutDashboard, LogOut, Moon, Route, ScanSearch, Search, ShieldAlert, ShieldCheck, Sun } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "wouter";

const menuItems = [
  { icon: LayoutDashboard, label: "Command center", path: "/" },
  { icon: ScanSearch, label: "CBOM inventory", path: "/inventory" },
  { icon: GitBranch, label: "Dependency graph", path: "/graph" },
  { icon: Route, label: "Migration", path: "/migration" },
  { icon: FileText, label: "Evidence & Reports", path: "/reports" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const workspace = useActiveEcdatScan();
  const [location, setLocation] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const searchItems = useMemo(() => buildGlobalSearchItems(workspace.findings, workspace.recommendations), [workspace.findings, workspace.recommendations]);
  const notifications = useMemo(() => workspace.findings.filter(finding => finding.hndlExposure || finding.riskLevel === "Critical").slice(0, 4), [workspace.findings]);
  const baseLocation = location.split("?")[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initialized = sessionStorage.getItem("ecdat-workspace-initialized") === "1";
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("ecdat-workspace-initialized", "1");
      setInitializing(false);
    }, reducedMotion || initialized ? 0 : 520);
    return () => window.clearTimeout(timer);
  }, []);

  const navigate = (path: string) => {
    setLocation(path);
    setSearchOpen(false);
    setNotificationOpen(false);
  };

  return <>
    <div className="academy-app-shell">
      <header className="academy-site-header">
        <div className="academy-header-inner">
          <button type="button" onClick={() => navigate("/")} className="academy-brand" aria-label="Go to Command Center">
            <span className="academy-brand-mark"><Compass className="h-5 w-5" strokeWidth={2.6} /></span>
            <span><span className="academy-brand-name">ECDAT</span><span className="academy-brand-subtitle">Crypto intelligence</span></span>
          </button>
          <nav className="academy-nav" aria-label="ECDAT workspace">
            {menuItems.map(item => <button type="button" key={item.path} onClick={() => navigate(item.path)} data-active={baseLocation === item.path} className="academy-nav-item"><item.icon className="mr-1.5 inline h-3.5 w-3.5" />{item.label}</button>)}
          </nav>
          <div className="academy-header-tools">
            <button type="button" className="academy-tool-button" onClick={() => setSearchOpen(true)} aria-label="Search workspace"><Search className="h-4 w-4" /></button>
            <button type="button" className="academy-tool-button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
            <button type="button" className="academy-tool-button relative" onClick={() => setNotificationOpen(true)} aria-label="Open active risk notifications"><Bell className="h-4 w-4" />{notifications.length ? <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#f9004d] px-1 text-[9px] font-bold text-white">{notifications.length}</span> : null}</button>
            {loading ? <span className="academy-tool-button animate-pulse" /> : user ? <div className="academy-user"><Avatar className="h-9 w-9 border border-white/10"><AvatarFallback className="bg-[#191c1f] text-xs font-bold text-white">{user.name?.slice(0, 1).toUpperCase() ?? "E"}</AvatarFallback></Avatar><div className="academy-user-copy"><strong>{user.name ?? "ECDAT user"}</strong><span>Protected history</span></div><button type="button" onClick={logout} className="academy-tool-button" aria-label="Sign out"><LogOut className="h-4 w-4" /></button></div> : <Button onClick={() => startLogin()} className="academy-tool-button academy-tool-button--accent"><ShieldCheck className="mr-2 h-4 w-4" />Sign in</Button>}
          </div>
        </div>
      </header>
      <main className="academy-workspace">{children}</main>
    </div>

    <CommandDialog open={searchOpen} onOpenChange={setSearchOpen} title="Search ECDAT workspace" description="Search routes, observed scan evidence, and generated guidance." className="max-w-2xl border-[#212529] bg-[#191c1f] text-white">
      <CommandInput placeholder="Search routes, evidence, or migration guidance…" />
      <CommandList><CommandEmpty className="text-[#9f9f9f]">No workspace result found.</CommandEmpty>{(["Navigate", "Observed evidence", "Generated guidance"] as const).map(group => {
        const items = searchItems.filter(item => item.group === group);
        return items.length ? <CommandGroup key={group} heading={group}>{items.map(item => <CommandItem key={`${item.group}-${item.path}-${item.label}`} value={item.value} onSelect={() => navigate(item.path)} className="text-[#dee2e6] data-[selected=true]:bg-[#f9004d]/15 data-[selected=true]:text-white"><Search className="h-3.5 w-3.5 text-[#f9004d]" /><span className="min-w-0"><span className="block truncate text-xs font-medium">{item.label}</span><span className="mt-0.5 block truncate text-[10px] text-[#9f9f9f]">{item.detail}</span></span>{item.group === "Navigate" ? <CommandShortcut>GO</CommandShortcut> : null}</CommandItem>)}</CommandGroup> : null;
      })}</CommandList>
    </CommandDialog>

    <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}><DialogContent className="max-w-md border-[#212529] bg-[#191c1f] text-white"><DialogHeader><DialogTitle className="flex items-center gap-2"><Bell className="h-4 w-4 text-[#f9004d]" />Active risk signals</DialogTitle><DialogDescription className="text-[#9f9f9f]">Derived from the current scan’s critical or HNDL-qualified findings.</DialogDescription></DialogHeader><div className="space-y-2">{notifications.length ? notifications.map(finding => <button type="button" key={finding.findingKey} onClick={() => navigate(`/inventory?finding=${encodeURIComponent(finding.findingKey)}`)} className="w-full rounded-md border border-[#212529] bg-black p-3 text-left hover:border-[#f9004d] hover:bg-[#f9004d]/[.07]"><div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#fc4c1f]" /><span><span className="block text-sm font-medium text-white">{finding.assetName}</span><span className="mt-1 block text-xs text-[#9f9f9f]">{finding.algorithm} · {finding.riskLevel} risk{finding.hndlExposure ? " · potential HNDL" : ""}</span></span></div></button>) : <p className="rounded-md border border-[#212529] bg-black p-4 text-sm text-[#9f9f9f]">No critical or HNDL-qualified signals are present in the active scan.</p>}</div></DialogContent></Dialog>
    {initializing ? <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80] grid place-items-center bg-black/95"><div className="flex flex-col items-center"><span className="grid h-14 w-14 place-items-center rounded-md bg-[#f9004d] text-white"><Compass className="h-6 w-6" /></span><p className="mt-4 font-display text-2xl font-bold tracking-[.08em] text-white">ECDAT</p><p className="mt-1 text-[11px] font-bold uppercase tracking-[.2em] text-[#f9004d]">Cryptographic intelligence</p><span className="mt-5 h-1 w-28 overflow-hidden rounded-full bg-white/10"><span className="block h-full w-2/3 rounded-full bg-[#f9004d]" /></span></div></div> : null}
  </>;
}
