import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useWebSocket, EVENTS } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PainelPecas() {
  const { subscribe } = useWebSocket();
  const [search, setSearch] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const utils = trpc.useUtils();

  const { data: pecas = [], isLoading } = trpc.pecas.list.useQuery({ search: search || undefined });
  const deleteMutation = trpc.pecas.delete.useMutation({
    onSuccess: () => {
      toast.success("Peça removida!");
      utils.pecas.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // Sincronização em tempo real
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    unsubscribers.push(
      subscribe(EVENTS.PECA_CRIADA, () => {
        utils.pecas.list.invalidate();
        setLastUpdate(new Date());
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.PECA_ATUALIZADA, () => {
        utils.pecas.list.invalidate();
        setLastUpdate(new Date());
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.PECA_REMOVIDA, () => {
        utils.pecas.list.invalidate();
        setLastUpdate(new Date());
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [subscribe, utils]);

  const formatCurrency = (v: any) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Peças</h1>
            <p className="text-muted-foreground text-sm">
              {lastUpdate ? `Atualizado em ${lastUpdate.toLocaleTimeString("pt-BR")}` : "Sincronizando..."}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary border-border"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : pecas.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma peça encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Código
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Preço Custo
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Preço Venda
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(pecas as any[]).map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground text-sm">{p.nome}</p>
                        {p.descricao && <p className="text-xs text-muted-foreground">{p.descricao}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-muted-foreground font-mono">{p.codigo || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <span className={cn("px-2 py-1 rounded text-xs font-medium", p.quantidade <= 5 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400")}>
                          {p.quantidade}
                        </span>
                        {p.quantidade <= 5 && <AlertTriangle className="w-3 h-3 text-red-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-right text-sm text-muted-foreground">
                      {formatCurrency(p.precoCompra)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-right text-sm font-medium text-foreground">
                      {formatCurrency(p.precoVenda)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm("Remover peça?")) {
                              deleteMutation.mutate({ id: p.id });
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
