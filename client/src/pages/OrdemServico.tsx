import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ClipboardList, Eye, Edit2, Trash2, Search, ArrowLeft } from "lucide-react";
import { Link, useSearch } from "wouter";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = { aberta: "Aberta", em_andamento: "Em Andamento", concluida: "Concluída", cancelada: "Cancelada" };

type OSForm = { clienteId: number; veiculoId: number; status: string; descricaoProblema: string; kmEntrada: string; formaPagamento: string; observacoes: string; };
const emptyForm: OSForm = { clienteId: 0, veiculoId: 0, status: "aberta", descricaoProblema: "", kmEntrada: "", formaPagamento: "", observacoes: "" };

export default function OrdemServico() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const veiculoIdFilter = params.get("veiculoId") ? Number(params.get("veiculoId")) : undefined;
  const clienteIdFilter = params.get("clienteId") ? Number(params.get("clienteId")) : undefined;

  const [filterStatus, setFilterStatus] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<OSForm>(emptyForm);
  const utils = trpc.useUtils();

  const queryInput = { ...(filterStatus ? { status: filterStatus } : {}), ...(veiculoIdFilter ? { veiculoId: veiculoIdFilter } : {}), ...(clienteIdFilter ? { clienteId: clienteIdFilter } : {}) };
  const { data: osList = [], isLoading } = trpc.os.list.useQuery(Object.keys(queryInput).length > 0 ? queryInput : undefined);
  const { data: clientes = [] } = trpc.clientes.list.useQuery();
  const { data: veiculos = [] } = trpc.veiculos.list.useQuery({ clienteId: form.clienteId || undefined });
  const { data: veiculoInfo } = trpc.veiculos.get.useQuery({ id: veiculoIdFilter! }, { enabled: !!veiculoIdFilter });
  const clienteInfo = clienteIdFilter ? (clientes as any[]).find(c => c.id === clienteIdFilter) : null;

  const createMutation = trpc.os.create.useMutation({
    onSuccess: (os) => { toast.success(`OS ${(os as any)?.numero} criada!`); utils.os.list.invalidate(); setOpen(false); setForm(emptyForm); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.os.delete.useMutation({
    onSuccess: () => { toast.success("OS removida!"); utils.os.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId || !form.veiculoId) { toast.error("Selecione cliente e veículo"); return; }
    createMutation.mutate(form as any);
  };

  const getClienteNome = (id: number) => (clientes as any[]).find(c => c.id === id)?.nome || "—";
  const getVeiculoInfo = (id: number) => { const v = (veiculos as any[]).find(v => v.id === id); return v ? `${v.marca || ""} ${v.modelo} - ${v.placa}` : "—"; };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(veiculoIdFilter || clienteIdFilter) && (
            <Link href={clienteIdFilter ? "/clientes" : "/veiculos"}>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" />Voltar</Button>
            </Link>
          )}
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400"><ClipboardList className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Ordens de Serviço</h1>
            <p className="text-muted-foreground text-sm">
              {veiculoIdFilter && veiculoInfo ? (
                <span>Histórico: <strong className="text-foreground">{(veiculoInfo as any).marca} {(veiculoInfo as any).modelo} — {(veiculoInfo as any).placa}</strong></span>
              ) : clienteIdFilter && clienteInfo ? (
                <span>Histórico do cliente: <strong className="text-foreground">{clienteInfo.nome}</strong></span>
              ) : (
                <span>{(osList as any[]).length} OS encontrada(s)</span>
              )}
            </p>
          </div>
        </div>
        <Button onClick={() => { setForm(emptyForm); setOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> Nova OS
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {["", "aberta", "em_andamento", "concluida", "cancelada"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-all border", filterStatus === s ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/40")}>
            {s === "" ? "Todas" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : (osList as any[]).length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma OS encontrada</p>
            <Button onClick={() => setOpen(true)} variant="outline" className="mt-4 gap-2"><Plus className="w-4 h-4" />Criar primeira OS</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Número</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Veículo</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Data</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(osList as any[]).map((os) => (
                  <tr key={os.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-primary text-sm">{os.numero}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-foreground">{getClienteNome(os.clienteId)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">{os.veiculoId}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full status-${os.status}`}>{STATUS_LABELS[os.status]}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-right text-sm font-semibold text-foreground">
                      {Number(os.valorTotal || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(os.dataEntrada).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/os/${os.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"><Eye className="w-4 h-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => { if (confirm("Remover OS?")) deleteMutation.mutate({ id: os.id }); }}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nova Ordem de Serviço</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-foreground">Cliente *</Label>
                <Select value={String(form.clienteId || "")} onValueChange={v => setForm(f => ({ ...f, clienteId: Number(v), veiculoId: 0 }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {(clientes as any[]).map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Veículo *</Label>
                <Select value={String(form.veiculoId || "")} onValueChange={v => setForm(f => ({ ...f, veiculoId: Number(v) }))} disabled={!form.clienteId}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione o veículo" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {(veiculos as any[]).map(v => <SelectItem key={v.id} value={String(v.id)}>{v.marca} {v.modelo} - {v.placa}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">KM Entrada</Label>
                <Input value={form.kmEntrada} onChange={e => setForm(f => ({ ...f, kmEntrada: e.target.value }))} placeholder="Ex: 50000" className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Forma de Pagamento</Label>
                <Select value={form.formaPagamento} onValueChange={v => setForm(f => ({ ...f, formaPagamento: v }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Transferência", "Boleto"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-foreground">Descrição do Problema</Label>
                <Textarea value={form.descricaoProblema} onChange={e => setForm(f => ({ ...f, descricaoProblema: e.target.value }))} placeholder="Descreva o problema relatado pelo cliente..." className="bg-secondary border-border resize-none" rows={3} />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-foreground">Observações</Label>
                <Textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} placeholder="Observações internas..." className="bg-secondary border-border resize-none" rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">Cancelar</Button>
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={createMutation.isPending}>
                Criar Ordem de Serviço
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
