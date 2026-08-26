import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Graph from "./pages/Graph";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Migration from "./pages/Migration";
import NotFound from "./pages/NotFound";
import QuantumDescent from "./pages/QuantumDescent";
import Reports from "./pages/Reports";
import { Route, Switch } from "wouter";

function Router() {
  return <DashboardLayout><Switch>
    <Route path="/" component={Home} />
    <Route path="/inventory" component={Inventory} />
    <Route path="/graph" component={Graph} />
    <Route path="/migration" component={Migration} />
    <Route path="/recommendations" component={Migration} />
    <Route path="/roadmap" component={Migration} />
    <Route path="/reports" component={Reports} />
    <Route path="/descent" component={QuantumDescent} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch></DashboardLayout>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark" switchable><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
