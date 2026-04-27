import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useWebSocket, EVENTS } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, Package, ClipboardList, TrendingUp, DollarSign, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Painel() {
  const { subscribe } = useWebSocket();
  const [lastUpdate, setLastUpdate] = useState<string>("Nunca");
  const [syncStatus, setSyncStatus] = useState<"conectado" | "desconectado">("desconectado");
  const utils = trpc.useUtils();

  // Queries
  const { data: clientes = [] } = trpc.clientes.list.useQuery();
  const { data: veiculos = [] } = trpc.veiculos.list.useQuery();
  const { data: pecas = [] } = trpc.pecas.list.useQuery();
  const { data: osList = [] } = trpc.os.list.useQuery();
  const { data: orcamentos = [] } = trpc.orcamentos.list.useQuery();
  const { data: empresa } = trpc.empresa.get.useQuery();

  // Sincronização em tempo real
  useEffect(() => {
    setSyncStatus("conectado");
    const unsubscribers: (() => void)[] = [];

    // Clientes
    unsubscribers.push(
      subscribe(EVENTS.CLIENTE_CRIADO, () => {
        utils.clientes.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.CLIENTE_ATUALIZADO, () => {
        utils.clientes.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.CLIENTE_REMOVIDO, () => {
        utils.clientes.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );

    // Veículos
    unsubscribers.push(
      subscribe(EVENTS.VEICULO_CRIADO, () => {
        utils.veiculos.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.VEICULO_ATUALIZADO, () => {
        utils.veiculos.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.VEICULO_REMOVIDO, () => {
        utils.veiculos.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );

    // Peças
    unsubscribers.push(
      subscribe(EVENTS.PECA_CRIADA, () => {
        utils.pecas.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.PECA_ATUALIZADA, () => {
        utils.pecas.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.PECA_REMOVIDA, () => {
        utils.pecas.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );

    // Ordens de Serviço
    unsubscribers.push(
      subscribe(EVENTS.OS_CRIADA, () => {
        utils.os.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.OS_ATUALIZADA, () => {
        utils.os.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.OS_REMOVIDA, () => {
        utils.os.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.OS_STATUS_MUDOU, () => {
        utils.os.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );

    // Orçamentos
    unsubscribers.push(
      subscribe(EVENTS.ORCAMENTO_CRIADO, () => {
        utils.orcamentos.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.ORCAMENTO_ATUALIZADO, () => {
        utils.orcamentos.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.ORCAMENTO_REMOVIDO, () => {
        utils.orcamentos.list.invalidate();
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [subscribe, utils]);

  const osAberta = (osList as any[]).filter((o) => o.status === "aberta").length;
  const osEmAndamento = (osList as any[]).filter((o) => o.status === "em_andamento").length;
  const osConcluida = (osList as any[]).filter((o) => o.status === "concluida").length;
  const pecasEstoque = (pecas as any[]).reduce((acc, p) => acc + (p.quantidade || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground text-sm mt-1">Sincronização em tempo real com o aplicativo</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2", syncStatus === "conectado" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
            <div className={cn("w-2 h-2 rounded-full", syncStatus === "conectado" ? "bg-green-400 animate-pulse" : "bg-red-400")} />
            {syncStatus === "conectado" ? "Conectado" : "Desconectado"}
          </div>
          <div className="text-xs text-muted-foreground">
            <p>Última atualização: {lastUpdate}</p>
          </div>
        </div>
      </div>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{(clientes as any[]).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total cadastrado</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-400" />
              Veículos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{(veiculos as any[]).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total cadastrado</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              Peças em Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{pecasEstoque}</div>
            <p className="text-xs text-muted-foreground mt-1">Unidades</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-amber-500" />
              Ordens de Serviço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{(osList as any[]).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Status de OS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-blue-400">OS Abertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{osAberta}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-amber-400">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{osEmAndamento}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-green-400">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{osConcluida}</div>
          </CardContent>
        </Card>
      </div>

      {/* Info da Empresa */}
      {empresa && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="text-foreground font-medium">{(empresa as any)?.nome || "LB Mecânica Automotiva"}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">CNPJ</p>
                <p className="text-foreground font-medium">{(empresa as any)?.cnpj || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="text-foreground font-medium">{(empresa as any)?.telefone || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="text-foreground font-medium">{(empresa as any)?.endereco || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links para Painéis Específicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/painel/clientes">
          <Card className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Ver todos os clientes</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/painel/veiculos">
          <Card className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-400 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Veículos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Ver todos os veículos</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/painel/os">
          <Card className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-400 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Ordens de Serviço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Ver todas as OS</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/painel/pecas">
          <Card className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-500 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Peças
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Ver todas as peças</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Info de Sincronização */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-blue-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Sincronização em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-300">
          <p>✓ Este painel está sincronizado com o aplicativo em tempo real via WebSockets.</p>
          <p>✓ Qualquer mudança no aplicativo aparecerá aqui automaticamente.</p>
          <p>✓ Mudanças neste painel também serão refletidas no aplicativo.</p>
        </CardContent>
      </Card>
    </div>
  );
}
