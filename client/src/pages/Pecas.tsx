import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle } from "lucide-react";

type PecaForm = { nome: string; codigo: string; descricao: string; quantidade: number; precoCompra: string; precoVenda: string; unidade: string; };
const emptyForm: PecaForm = { nome: "", codigo: "", descricao: "", quantidade: 0, precoCompra: "0", precoVenda: "0", unidade: "un" };

export default function Pecas() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PecaForm>(emptyForm);
  const utils = trpc.useUtils();

  const { data: pecas = [], isLoading } = trpc.pecas.list.useQuery({ search: search || undefined });

  const createMutation = trpc.pecas.create.useMutation({
    onSuccess: () => { toast.success("Peça cadastrada!"); utils.pecas.list.invalidate(); setOpen(false); setForm(emptyForm); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.pecas.update.useMutation({
    onSuccess: () => { toast.success("Peça atualizada!"); utils.pecas.list.invalidate(); setOpen(false); setEditId(null); setForm(emptyForm); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.pecas.delete.useMutation({
    onSuccess: () => { toast.success("Peça removida!"); utils.pecas.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openNew = () => { setEditId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (p: any) => { setEditId(p.id); setForm({ nome: p.nome, codigo: p.codigo || "", descricao: p.descricao || "", quantidade: p.quantidade, precoCompra: String(p.precoCompra), precoVenda: String(p.precoVenda), unidade: p.unidade || "un" }); setOpen(true); };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome) { toast.error("Nome é obrigatório"); return; }
    if (editId) updateMutation.mutate({ id: editId, ...form });
    else createMutation.mutate(form);
  };

  const formatCurrency = (v: any) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400"><Package className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Peças</h1>
            <p className="text-muted-foreground text-sm">{(pecas as any[]).length} peça(s) cadastrada(s)</p>
          </div>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> Nova Peça
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou código..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : (pecas as any[]).length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma peça encontrada</p>
            <Button onClick={openNew} variant="outline" className="mt-4 gap-2"><Plus className="w-4 h-4" />Cadastrar primeira peça</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Peça</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Código</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estoque</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Compra</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Venda</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(pecas as any[]).map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{p.nome}</p>
                          {p.descricao && <p className="text-xs text-muted-foreground truncate max-w-xs">{p.descricao}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground font-mono">{p.codigo || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {p.quantidade <= 5 && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                        <span className={`text-sm font-semibold ${p.quantidade <= 0 ? "text-red-400" : p.quantidade <= 5 ? "text-amber-400" : "text-green-400"}`}>
                          {p.quantidade} {p.unidade}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-right text-sm text-muted-foreground">{formatCurrency(p.precoCompra)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-primary">{formatCurrency(p.precoVenda)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={() => openEdit(p)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => { if (confirm("Remover peça?")) deleteMutation.mutate({ id: p.id }); }}><Trash2 className="w-4 h-4" /></Button>
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
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editId ? "Editar Peça" : "Nova Peça"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <Label className="text-foreground">Nome *</Label>
                <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome da peça" className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Código</Label>
                <Input value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} placeholder="COD-001" className="bg-secondary border-border font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Unidade</Label>
                <Input value={form.unidade} onChange={e => setForm(f => ({ ...f, unidade: e.target.value }))} placeholder="un, kg, m, lt" className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Quantidade em Estoque</Label>
                <Input type="number" value={form.quantidade} onChange={e => setForm(f => ({ ...f, quantidade: Number(e.target.value) }))} className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Preço de Compra (R$)</Label>
                <Input type="number" step="0.01" value={form.precoCompra} onChange={e => setForm(f => ({ ...f, precoCompra: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Preço de Venda (R$)</Label>
                <Input type="number" step="0.01" value={form.precoVenda} onChange={e => setForm(f => ({ ...f, precoVenda: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-foreground">Descrição</Label>
                <Textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descrição da peça..." className="bg-secondary border-border resize-none" rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">Cancelar</Button>
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={createMutation.isPending || updateMutation.isPending}>
                {editId ? "Salvar Alterações" : "Cadastrar Peça"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
