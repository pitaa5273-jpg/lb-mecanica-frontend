import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Car, Edit2, Trash2, ClipboardList } from "lucide-react";
import { Link, useSearch } from "wouter";

type VeiculoForm = { clienteId: number; placa: string; modelo: string; marca: string; ano: string; cor: string; km: string; observacoes: string; };
const emptyForm: VeiculoForm = { clienteId: 0, placa: "", modelo: "", marca: "", ano: "", cor: "", km: "", observacoes: "" };

export default function Veiculos() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const clienteIdFilter = params.get("clienteId") ? Number(params.get("clienteId")) : undefined;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<VeiculoForm>(emptyForm);
  const utils = trpc.useUtils();

  const { data: veiculos = [], isLoading } = trpc.veiculos.list.useQuery({ clienteId: clienteIdFilter });
  const { data: clientes = [] } = trpc.clientes.list.useQuery();

  const createMutation = trpc.veiculos.create.useMutation({
    onSuccess: () => { toast.success("Veículo cadastrado!"); utils.veiculos.list.invalidate(); setOpen(false); setForm(emptyForm); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.veiculos.update.useMutation({
    onSuccess: () => { toast.success("Veículo atualizado!"); utils.veiculos.list.invalidate(); setOpen(false); setEditId(null); setForm(emptyForm); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.veiculos.delete.useMutation({
    onSuccess: () => { toast.success("Veículo removido!"); utils.veiculos.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openNew = () => { setEditId(null); setForm({ ...emptyForm, clienteId: clienteIdFilter || 0 }); setOpen(true); };
  const openEdit = (v: any) => { setEditId(v.id); setForm({ clienteId: v.clienteId, placa: v.placa, modelo: v.modelo, marca: v.marca || "", ano: v.ano || "", cor: v.cor || "", km: v.km || "", observacoes: v.observacoes || "" }); setOpen(true); };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.placa || !form.modelo || !form.clienteId) { toast.error("Placa, modelo e cliente são obrigatórios"); return; }
    if (editId) updateMutation.mutate({ id: editId, ...form });
    else createMutation.mutate(form);
  };

  const getClienteNome = (id: number) => (clientes as any[]).find(c => c.id === id)?.nome || "—";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400"><Car className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Veículos</h1>
            <p className="text-muted-foreground text-sm">{veiculos.length} veículo(s) cadastrado(s){clienteIdFilter ? " deste cliente" : ""}</p>
          </div>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> Novo Veículo
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : veiculos.length === 0 ? (
          <div className="p-12 text-center">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum veículo encontrado</p>
            <Button onClick={openNew} variant="outline" className="mt-4 gap-2"><Plus className="w-4 h-4" />Cadastrar primeiro veículo</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Veículo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Placa</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Ano / Cor</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(veiculos as any[]).map((v) => (
                  <tr key={v.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{v.marca} {v.modelo}</p>
                          <p className="text-xs text-muted-foreground">{v.placa}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="bg-secondary border border-border text-foreground text-xs font-mono px-2 py-1 rounded">{v.placa}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">{getClienteNome(v.clienteId)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">{v.ano || "—"} {v.cor ? `/ ${v.cor}` : ""}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/os?veiculoId=${v.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-400"><ClipboardList className="w-4 h-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={() => openEdit(v)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => { if (confirm("Remover veículo?")) deleteMutation.mutate({ id: v.id }); }}><Trash2 className="w-4 h-4" /></Button>
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
            <DialogTitle className="text-foreground">{editId ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <Label className="text-foreground">Cliente *</Label>
                <Select value={String(form.clienteId || "")} onValueChange={v => setForm(f => ({ ...f, clienteId: Number(v) }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {(clientes as any[]).map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Placa *</Label>
                <Input value={form.placa} onChange={e => setForm(f => ({ ...f, placa: e.target.value.toUpperCase() }))} placeholder="ABC-1234" className="bg-secondary border-border font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Modelo *</Label>
                <Input value={form.modelo} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} placeholder="Civic, Corolla, etc." className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Marca</Label>
                <Input value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} placeholder="Honda, Toyota, etc." className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Ano</Label>
                <Input value={form.ano} onChange={e => setForm(f => ({ ...f, ano: e.target.value }))} placeholder="2020" maxLength={4} className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Cor</Label>
                <Input value={form.cor} onChange={e => setForm(f => ({ ...f, cor: e.target.value }))} placeholder="Prata, Preto, etc." className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">KM Atual</Label>
                <Input value={form.km} onChange={e => setForm(f => ({ ...f, km: e.target.value }))} placeholder="50000" className="bg-secondary border-border" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-foreground">Observações</Label>
                <Textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} placeholder="Observações sobre o veículo..." className="bg-secondary border-border resize-none" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">Cancelar</Button>
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={createMutation.isPending || updateMutation.isPending}>
                {editId ? "Salvar Alterações" : "Cadastrar Veículo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
