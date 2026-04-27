import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useWebSocket, EVENTS } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Search, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  aberta: "Aberta",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  aberta: "bg-blue-500/20 text-blue-400",
  em_andamento: "bg-amber-500/20 text-amber-400",
  concluida: "bg-green-500/20 text-green-400",
  cancelada: "bg-red-500/20 text-red-400",
};

export default function PainelOS() {
  const { subscribe } = useWebSocket();
  const [filterStatus, setFilterStatus] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const utils = trpc.useUtils();

  const { data: osList = [], isLoading } = trpc.os.list.useQuery(
    filterStatus ? { status: filterStatus } : undefined
  );
  const { data: clientes = [] } = trpc.clientes.list.useQuery();
  const { data: veiculos = [] } = trpc.veiculos.list.useQuery();

  const deleteMutation = trpc.os.delete.useMutation({
    onSuccess: () => {
      toast.success("OS removida!");
      utils.os.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // Sincronização em tempo real
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    unsubscribers.push(
      subscribe(EVENTS.OS_CRIADA, () => {
        utils.os.list.invalidate();
        setLastUpdate(new Date());
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.OS_ATUALIZADA, () => {
        utils.os.list.invalidate();
        setLastUpdate(new Date());
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.OS_REMOVIDA, () => {
        utils.os.list.invalidate();
        setLastUpdate(new Date());
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.OS_STATUS_MUDOU, () => {
        utils.os.list.invalidate();
        setLastUpdate(new Date());
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [subscribe, utils]);

  const getClienteNome = (id: number) => (clientes as any[]).find((c) => c.id === id)?.nome || "—";
  const getVeiculoInfo = (id: number) => {
    const v = (veiculos as any[]).find((v) => v.id === id);
    return v ? `${v.marca || ""} ${v.modelo} - ${v.placa}` : "—";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Ordens de Serviço</h1>
            <p className="text-muted-foreground text-sm">
              {lastUpdate ? `Atualizado em ${lastUpdate.toLocaleTimeString("pt-BR")}` : "Sincronizando..."}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {["", "aberta", "em_andamento", "concluida", "cancelada"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
              filterStatus === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-muted-foreground border-border hover:border-primary/40"
            )}
          >
            {s === "" ? "Todas" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : osList.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma OS encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Nº OS
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Veículo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(osList as any[]).map((os) => (
                  <tr key={os.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground text-sm">#{os.numero}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-muted-foreground">{getClienteNome(os.clienteId)}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-sm text-muted-foreground">{getVeiculoInfo(os.veiculoId)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded text-xs font-medium", STATUS_COLORS[os.status])}>
                        {STATUS_LABELS[os.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/os/${os.id}`}>
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
                            if (confirm("Remover OS?")) {
                              deleteMutation.mutate({ id: os.id });
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
