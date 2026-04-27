import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit2, Trash2, Users, Phone, MapPin, FileText, Car, ClipboardList } from "lucide-react";
import { Link } from "wouter";

type ClienteForm = { nome: string; telefone: string; cpfCnpj: string; email: string; endereco: string; cidade: string; estado: string; cep: string; observacoes: string; };
const emptyForm: ClienteForm = { nome: "", telefone: "", cpfCnpj: "", email: "", endereco: "", cidade: "", estado: "", cep: "", observacoes: "" };

export default function Clientes() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ClienteForm>(emptyForm);
  const utils = trpc.useUtils();

  const { data: clientes = [], isLoading } = trpc.clientes.list.useQuery({ search: search || undefined });

  const createMutation = trpc.clientes.create.useMutation({
    onSuccess: () => { toast.success("Cliente cadastrado!"); utils.clientes.list.invalidate(); setOpen(false); setForm(emptyForm); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.clientes.update.useMutation({
    onSuccess: () => { toast.success("Cliente atualizado!"); utils.clientes.list.invalidate(); setOpen(false); setEditId(null); setForm(emptyForm); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.clientes.delete.useMutation({
    onSuccess: () => { toast.success("Cliente removido!"); utils.clientes.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openNew = () => { setEditId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (c: any) => { setEditId(c.id); setForm({ nome: c.nome, telefone: c.telefone || "", cpfCnpj: c.cpfCnpj || "", email: c.email || "", endereco: c.endereco || "", cidade: c.cidade || "", estado: c.estado || "", cep: c.cep || "", observacoes: c.observacoes || "" }); setOpen(true); };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome) { toast.error("Nome é obrigatório"); return; }
    if (editId) updateMutation.mutate({ id: editId, ...form });
    else createMutation.mutate(form);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400"><Users className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground text-sm">{clientes.length} cliente(s) cadastrado(s)</p>
          </div>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, CPF/CNPJ ou telefone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : clientes.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            <Button onClick={openNew} variant="outline" className="mt-4 gap-2"><Plus className="w-4 h-4" />Cadastrar primeiro cliente</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Telefone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">CPF/CNPJ</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Cidade</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clientes.map((c: any) => (
                  <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {c.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{c.nome}</p>
                          {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {c.telefone && <div className="flex items-center gap-1 text-sm text-muted-foreground"><Phone className="w-3 h-3" />{c.telefone}</div>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">{c.cpfCnpj || "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {c.cidade && <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="w-3 h-3" />{c.cidade}{c.estado ? ` - ${c.estado}` : ""}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/veiculos?clienteId=${c.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-400" title="Ver veículos"><Car className="w-4 h-4" /></Button>
                        </Link>
                        <Link href={`/os?clienteId=${c.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-400" title="Histórico de OS"><ClipboardList className="w-4 h-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={() => openEdit(c)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => { if (confirm("Remover cliente?")) deleteMutation.mutate({ id: c.id }); }}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editId ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <Label className="text-foreground">Nome *</Label>
                <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome completo" className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Telefone</Label>
                <Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(00) 00000-0000" className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">CPF / CNPJ</Label>
                <Input value={form.cpfCnpj} onChange={e => setForm(f => ({ ...f, cpfCnpj: e.target.value }))} placeholder="000.000.000-00" className="bg-secondary border-border" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-foreground">E-mail</Label>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" className="bg-secondary border-border" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-foreground">Endereço</Label>
                <Input value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} placeholder="Rua, número, bairro" className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Cidade</Label>
                <Input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} placeholder="Cidade" className="bg-secondary border-border" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-foreground">Estado</Label>
                  <Input value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} placeholder="SP" maxLength={2} className="bg-secondary border-border" />
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground">CEP</Label>
                  <Input value={form.cep} onChange={e => setForm(f => ({ ...f, cep: e.target.value }))} placeholder="00000-000" className="bg-secondary border-border" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-foreground">Observações</Label>
                <Textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} placeholder="Observações sobre o cliente..." className="bg-secondary border-border resize-none" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">Cancelar</Button>
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={createMutation.isPending || updateMutation.isPending}>
                {editId ? "Salvar Alterações" : "Cadastrar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
