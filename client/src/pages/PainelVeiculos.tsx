import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useWebSocket, EVENTS } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function PainelVeiculos() {
  const { subscribe } = useWebSocket();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const utils = trpc.useUtils();

  const { data: veiculos = [], isLoading } = trpc.veiculos.list.useQuery();
  const { data: clientes = [] } = trpc.clientes.list.useQuery();

  const deleteMutation = trpc.veiculos.delete.useMutation({
    onSuccess: () => {
      toast.success("Veículo removido!");
      utils.veiculos.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // Sincronização em tempo real
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    unsubscribers.push(
      subscribe(EVENTS.VEICULO_CRIADO, () => {
        utils.veiculos.list.invalidate();
        setLastUpdate(new Date());
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.VEICULO_ATUALIZADO, () => {
        utils.veiculos.list.invalidate();
        setLastUpdate(new Date());
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.VEICULO_REMOVIDO, () => {
        utils.veiculos.list.invalidate();
        setLastUpdate(new Date());
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [subscribe, utils]);

  const getClienteNome = (id: number) => (clientes as any[]).find((c) => c.id === id)?.nome || "—";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Veículos</h1>
            <p className="text-muted-foreground text-sm">
              {lastUpdate ? `Atualizado em ${lastUpdate.toLocaleTimeString("pt-BR")}` : "Sincronizando..."}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : veiculos.length === 0 ? (
          <div className="p-12 text-center">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum veículo encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Veículo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Placa
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Ano
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(veiculos as any[]).map((v) => (
                  <tr key={v.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground text-sm">{v.marca} {v.modelo}</p>
                        {v.cor && <p className="text-xs text-muted-foreground">Cor: {v.cor}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm font-mono font-bold text-foreground">{v.placa}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                      {getClienteNome(v.clienteId)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">{v.ano || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/os?veiculoId=${v.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-400"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm("Remover veículo?")) {
                              deleteMutation.mutate({ id: v.id });
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
