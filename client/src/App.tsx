import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Veiculos from "./pages/Veiculos";
import OrdemServico from "./pages/OrdemServico";
import OsDetalhe from "./pages/OsDetalhe";
import Pecas from "./pages/Pecas";
import Orcamentos from "./pages/Orcamentos";
import OrcamentoDetalhe from "./pages/OrcamentoDetalhe";
import Financeiro from "./pages/Financeiro";
import Garantias from "./pages/Garantias";
import Relatorios from "./pages/Relatorios";
import Empresa from "./pages/Empresa";
import Painel from "./pages/Painel";
import PainelClientes from "./pages/PainelClientes";
import PainelOS from "./pages/PainelOS";
import PainelPecas from "./pages/PainelPecas";
import PainelVeiculos from "./pages/PainelVeiculos";
import PainelOrcamentos from "./pages/PainelOrcamentos";
import PainelFinanceiro from "./pages/PainelFinanceiro";
import PainelGarantias from "./pages/PainelGarantias";
import PainelRelatorios from "./pages/PainelRelatorios";
import PainelEmpresa from "./pages/PainelEmpresa";
import DashboardLayout from "./components/DashboardLayout";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Redirect to="/login" />;
  return <DashboardLayout><Component /></DashboardLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/clientes" component={() => <ProtectedRoute component={Clientes} />} />
      <Route path="/veiculos" component={() => <ProtectedRoute component={Veiculos} />} />
      <Route path="/os" component={() => <ProtectedRoute component={OrdemServico} />} />
      <Route path="/os/:id" component={() => <ProtectedRoute component={OsDetalhe} />} />
      <Route path="/pecas" component={() => <ProtectedRoute component={Pecas} />} />
      <Route path="/orcamentos" component={() => <ProtectedRoute component={Orcamentos} />} />
      <Route path="/orcamentos/:id" component={() => <ProtectedRoute component={OrcamentoDetalhe} />} />
      <Route path="/financeiro" component={() => <ProtectedRoute component={Financeiro} />} />
      <Route path="/garantias" component={() => <ProtectedRoute component={Garantias} />} />
      <Route path="/relatorios" component={() => <ProtectedRoute component={Relatorios} />} />
      <Route path="/empresa" component={() => <ProtectedRoute component={Empresa} />} />
      <Route path="/painel" component={() => <ProtectedRoute component={Painel} />} />
      <Route path="/painel/clientes" component={() => <ProtectedRoute component={PainelClientes} />} />
      <Route path="/painel/os" component={() => <ProtectedRoute component={PainelOS} />} />
      <Route path="/painel/pecas" component={() => <ProtectedRoute component={PainelPecas} />} />
      <Route path="/painel/veiculos" component={() => <ProtectedRoute component={PainelVeiculos} />} />
      <Route path="/painel/orcamentos" component={() => <ProtectedRoute component={PainelOrcamentos} />} />
      <Route path="/painel/financeiro" component={() => <ProtectedRoute component={PainelFinanceiro} />} />
      <Route path="/painel/garantias" component={() => <ProtectedRoute component={PainelGarantias} />} />
      <Route path="/painel/relatorios" component={() => <ProtectedRoute component={PainelRelatorios} />} />
      <Route path="/painel/empresa" component={() => <ProtectedRoute component={PainelEmpresa} />} />
      <Route component={() => <Redirect to="/" />} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster theme="dark" position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
