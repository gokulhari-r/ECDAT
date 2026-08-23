import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Graph from "./pages/Graph";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import NotFound from "./pages/NotFound";
import QuantumDescent from "./pages/QuantumDescent";
import Recommendations from "./pages/Recommendations";
import Reports from "./pages/Reports";
import Roadmap from "./pages/Roadmap";
import { Route, Switch } from "wouter";

function Router() {
  return <DashboardLayout><Switch>
    <Route path="/" component={Home} />
    <Route path="/inventory" component={Inventory} />
    <Route path="/graph" component={Graph} />
    <Route path="/recommendations" component={Recommendations} />
    <Route path="/roadmap" component={Roadmap} />
    <Route path="/reports" component={Reports} />
    <Route path="/descent" component={QuantumDescent} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch></DashboardLayout>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
