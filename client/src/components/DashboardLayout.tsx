import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/useMobile";
import { Compass, FileText, GitBranch, LayoutDashboard, LogOut, Moon, Orbit, Route, ScanSearch, ShieldCheck, Sun } from "lucide-react";
import { useLocation } from "wouter";

const menuItems = [
  { icon: LayoutDashboard, label: "Command center", path: "/" },
  { icon: ScanSearch, label: "CBOM inventory", path: "/inventory" },
  { icon: GitBranch, label: "Dependency graph", path: "/graph" },
  { icon: ShieldCheck, label: "PQC guidance", path: "/recommendations" },
  { icon: Route, label: "Migration roadmap", path: "/roadmap" },
  { icon: FileText, label: "Reports & export", path: "/reports" },
  { icon: Orbit, label: "Quantum Descent", path: "/descent" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  return <SidebarProvider defaultOpen>
    <Sidebar collapsible="icon" className="border-r border-white/8 bg-[#08111f] text-slate-100">
      <SidebarHeader className="h-[84px] border-b border-white/8 px-3 py-4">
        <button onClick={() => setLocation("/")} className="flex w-full items-center gap-3 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 via-teal-300 to-emerald-400 text-[#062132] shadow-[0_0_30px_rgba(45,212,191,0.25)]"><Compass className="h-5 w-5" strokeWidth={2.6} /></span>
          <span className="group-data-[collapsible=icon]:hidden"><span className="block font-display text-lg font-semibold tracking-[-0.03em]">ECDAT</span><span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-200/55">Quantum observatory</span></span>
        </button>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 group-data-[collapsible=icon]:hidden">Intelligence workspace</div>
        <SidebarMenu>{menuItems.map(item => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={location === item.path} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-10 rounded-lg text-slate-400 hover:bg-white/6 hover:text-white data-[active=true]:bg-cyan-300/10 data-[active=true]:text-cyan-100"><item.icon className="h-4 w-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/8 p-3">
        <Button onClick={toggleTheme} variant="outline" className="mb-3 w-full border-cyan-300/20 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}><span className="grid h-4 w-4 place-items-center">{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</span><span className="group-data-[collapsible=icon]:hidden">{theme === "dark" ? "Light theme" : "Dark theme"}</span></Button>
        {loading ? <div className="h-9 animate-pulse rounded-lg bg-white/5" /> : user ? <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"><Avatar className="h-8 w-8 border border-cyan-100/15"><AvatarFallback className="bg-cyan-200 text-xs font-bold text-[#062132]">{user.name?.slice(0, 1).toUpperCase() ?? "E"}</AvatarFallback></Avatar><div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-xs font-medium text-slate-200">{user.name ?? "ECDAT user"}</p><p className="truncate text-[11px] text-slate-500">Protected scan history</p></div><button onClick={logout} className="text-slate-500 transition hover:text-slate-200 group-data-[collapsible=icon]:hidden" aria-label="Sign out"><LogOut className="h-4 w-4" /></button></div> : <Button onClick={() => startLogin()} variant="outline" className="w-full border-cyan-300/20 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10"><ShieldCheck className="h-4 w-4" /><span className="group-data-[collapsible=icon]:hidden">Sign in to save</span></Button>}
      </SidebarFooter>
    </Sidebar>
    <SidebarInset className="min-h-screen bg-[#06101c] text-slate-100">{isMobile && <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/8 bg-[#08111f]/90 px-3 backdrop-blur-xl"><div className="flex items-center gap-3"><SidebarTrigger /><span className="font-display font-semibold">ECDAT</span></div><div className="flex items-center gap-2"><Button onClick={toggleTheme} variant="outline" size="icon" className="h-8 w-8 border-cyan-300/25 bg-cyan-300/5 text-cyan-100" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>{theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}</Button><Badge variant="outline" className="border-cyan-300/25 bg-cyan-300/5 text-[10px] text-cyan-100">DEMO READY</Badge></div></header>}<main className="min-h-screen p-4 md:p-7 lg:p-9">{children}</main></SidebarInset>
  </SidebarProvider>;
}
