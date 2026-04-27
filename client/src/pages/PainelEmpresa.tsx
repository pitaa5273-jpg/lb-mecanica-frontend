import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useWebSocket, EVENTS } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function PainelEmpresa() {
  const { subscribe } = useWebSocket();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const utils = trpc.useUtils();

  const { data: empresa } = trpc.empresa.get.useQuery();
  const updateMutation = trpc.empresa.update.useMutation({
    onSuccess: () => {
      toast.success("Empresa atualizada!");
      utils.empresa.get.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const [formData, setFormData] = useState({
    cnpj: "",
    endereco: "",
    telefone: "",
  });

  useEffect(() => {
    if (empresa) {
      setFormData({
        cnpj: (empresa as any).cnpj || "",
        endereco: (empresa as any).endereco || "",
        telefone: (empresa as any).telefone || "",
      });
    }
  }, [empresa]);

  // Sincronização em tempo real
  useEffect(() => {
    const unsub = subscribe(EVENTS.EMPRESA_ATUALIZADA, () => {
      utils.empresa.get.invalidate();
      setLastUpdate(new Date());
    });

    return () => {
      unsub();
    };
  }, [subscribe, utils]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      cnpj: formData.cnpj || undefined,
      endereco: formData.endereco || undefined,
      telefone: formData.telefone || undefined,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Configurações da Empresa</h1>
            <p className="text-muted-foreground text-sm">
              {lastUpdate ? `Atualizado em ${lastUpdate.toLocaleTimeString("pt-BR")}` : "Sincronizando..."}
            </p>
          </div>
        </div>
      </div>

      {/* Informações da Empresa */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Nome da Empresa</p>
            <p className="text-lg font-bold text-foreground">{(empresa as any)?.nome || "LB Mecânica Automotiva"}</p>
            <p className="text-xs text-muted-foreground mt-1">Este valor é configurado no sistema e não pode ser alterado aqui.</p>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Edição */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Editar Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">CNPJ</label>
              <Input
                placeholder="XX.XXX.XXX/0001-XX"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Endereço</label>
              <Input
                placeholder="Rua, número, complemento"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Telefone</label>
              <Input
                placeholder="(XX) XXXXX-XXXX"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={updateMutation.isPending}
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-blue-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-300">
          <p>✓ Os dados da empresa aparecem automaticamente em todos os documentos gerados (orçamentos, garantias, relatórios).</p>
          <p>✓ As alterações são sincronizadas em tempo real com o aplicativo.</p>
          <p>✓ A logo e nome da empresa são configurados no sistema.</p>
        </CardContent>
      </Card>
    </div>
  );
}
