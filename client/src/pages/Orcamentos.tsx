import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, Eye, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = { pendente: "Pendente", aprovado: "Aprovado", reprovado: "Reprovado", expirado: "Expirado" };

type OrcForm = { clienteId: number; veiculoId: number; validadeDias: number; observacoes: string; };
const emptyForm: OrcForm = { clienteId: 0, veiculoId: 0, validadeDias: 7, observacoes: "" };

export default function Orcamentos() {
  const [filterStatus, setFilterStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<OrcForm>(emptyForm);
  const utils = trpc.useUtils();

  const { data: orcamentos = [], isLoading } = trpc.orcamentos.list.useQuery();
  const { data: clientes = [] } = trpc.clientes.list.useQuery();
  const { data: veiculos = [] } = trpc.veiculos.list.useQuery({ clienteId: form.clienteId || undefined });

  const createMutation = trpc.orcamentos.create.useMutation({
    onSuccess: (orc: any) => { toast.success(`Orçamento ${orc?.numero} criado!`); utils.orcamentos.list.invalidate(); setOpen(false); setForm(emptyForm); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.orcamentos.delete.useMutation({
    onSuccess: () => { toast.success("Orçamento removido!"); utils.orcamentos.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId || !form.veiculoId) { toast.error("Selecione cliente e veículo"); return; }
    createMutation.mutate(form as any);
  };

  const getClienteNome = (id: number) => (clientes as any[]).find(c => c.id === id)?.nome || "—";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400"><FileText className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Orçamentos</h1>
            <p className="text-muted-foreground text-sm">{(orcamentos as any[]).length} orçamento(s)</p>
          </div>
        </div>
        <Button onClick={() => { setForm(emptyForm); setOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> Novo Orçamento
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["", "pendente", "aprovado", "reprovado", "expirado"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-all border", filterStatus === s ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/40")}>
            {s === "" ? "Todos" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : (orcamentos as any[]).length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum orçamento encontrado</p>
            <Button onClick={() => setOpen(true)} variant="outline" className="mt-4 gap-2"><Plus className="w-4 h-4" />Criar primeiro orçamento</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Número</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Cliente</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase hidden lg:table-cell">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Data</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(orcamentos as any[]).map((orc) => (
                  <tr key={orc.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono font-bold text-cyan-400 text-sm">{orc.numero}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-foreground">{getClienteNome(orc.clienteId)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full status-${orc.status}`}>{STATUS_LABELS[orc.status]}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-right text-sm font-semibold text-foreground">
                      {Number(orc.valorTotal || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(orc.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/orcamentos/${orc.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"><Eye className="w-4 h-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => { if (confirm("Remover orçamento?")) deleteMutation.mutate({ id: orc.id }); }}><Trash2 className="w-4 h-4" /></Button>
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
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader><DialogTitle className="text-foreground">Novo Orçamento</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label className="text-foreground">Validade (dias)</Label>
              <Input type="number" value={form.validadeDias} onChange={e => setForm(f => ({ ...f, validadeDias: Number(e.target.value) }))} className="bg-secondary border-border" />
            </div>
            <div className="space-y-1">
              <Label className="text-foreground">Observações</Label>
              <Textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} className="bg-secondary border-border resize-none" rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">Cancelar</Button>
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={createMutation.isPending}>Criar Orçamento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
