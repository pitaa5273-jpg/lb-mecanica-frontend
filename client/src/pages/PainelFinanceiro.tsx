import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useWebSocket, EVENTS } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PainelFinanceiro() {
  const { subscribe } = useWebSocket();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const utils = trpc.useUtils();

  const { data: lancamentos = [], isLoading } = trpc.financeiro.list.useQuery();

  const deleteMutation = trpc.financeiro.delete.useMutation({
    onSuccess: () => {
      toast.success("Lançamento removido!");
      utils.financeiro.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // Sincronização em tempo real
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    unsubscribers.push(
      subscribe(EVENTS.LANCAMENTO_CRIADO, () => {
        utils.financeiro.list.invalidate();
        setLastUpdate(new Date());
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.LANCAMENTO_REMOVIDO, () => {
        utils.financeiro.list.invalidate();
        setLastUpdate(new Date());
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.CAIXA_FECHADO, () => {
        utils.financeiro.list.invalidate();
        setLastUpdate(new Date());
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [subscribe, utils]);

  const formatCurrency = (v: any) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const totalReceitas = (lancamentos as any[])
    .filter((l) => l.tipo === "receita")
    .reduce((acc, l) => acc + Number(l.valor || 0), 0);

  const totalDespesas = (lancamentos as any[])
    .filter((l) => l.tipo === "despesa")
    .reduce((acc, l) => acc + Number(l.valor || 0), 0);

  const lucro = totalReceitas - totalDespesas;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Financeiro</h1>
            <p className="text-muted-foreground text-sm">
              {lastUpdate ? `Atualizado em ${lastUpdate.toLocaleTimeString("pt-BR")}` : "Sincronizando..."}
            </p>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalReceitas)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalDespesas)}</p>
          </CardContent>
        </Card>

        <Card className={cn("bg-card border-border", lucro >= 0 ? "border-green-500/30" : "border-red-500/30")}>
          <CardHeader className="pb-2">
            <CardTitle className={cn("text-sm font-medium flex items-center gap-2", lucro >= 0 ? "text-green-400" : "text-red-400")}>
              <DollarSign className="w-4 h-4" />
              Lucro/Prejuízo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn("text-2xl font-bold", lucro >= 0 ? "text-green-400" : "text-red-400")}>
              {formatCurrency(lucro)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lançamentos */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="border-b border-border px-4 py-3 bg-secondary/50">
          <h3 className="text-sm font-semibold text-foreground">Lançamentos Recentes</h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : lancamentos.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum lançamento encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50 hidden sm:table-header-group">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(lancamentos as any[]).map((l) => (
                  <tr key={l.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground font-medium">{l.descricao}</p>
                      <p className="text-xs text-muted-foreground">{new Date(l.data).toLocaleDateString("pt-BR")}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn("px-2 py-1 rounded text-xs font-medium", l.tipo === "receita" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}
                      >
                        {l.tipo === "receita" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td className={cn("px-4 py-3 text-right font-medium", l.tipo === "receita" ? "text-green-400" : "text-red-400")}>
                      {l.tipo === "receita" ? "+" : "-"} {formatCurrency(l.valor)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm("Remover lançamento?")) {
                              deleteMutation.mutate({ id: l.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
