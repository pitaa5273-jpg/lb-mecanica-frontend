import { useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, Camera, Upload, X, Save, ClipboardList, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = { aberta: "Aberta", em_andamento: "Em Andamento", concluida: "Concluída", cancelada: "Cancelada" };
const STATUS_OPTIONS = ["aberta", "em_andamento", "concluida", "cancelada"];

export default function OsDetalhe() {
  const params = useParams<{ id: string }>();
  const osId = Number(params.id);
  const utils = trpc.useUtils();

  const { data: os, isLoading } = trpc.os.get.useQuery({ id: osId });
  const { data: itens = [] } = trpc.os.listItens.useQuery({ osId });
  const { data: fotos = [] } = trpc.os.listFotos.useQuery({ osId });
  const { data: clientes = [] } = trpc.clientes.list.useQuery();
  const { data: pecas = [] } = trpc.pecas.list.useQuery();

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [itemForm, setItemForm] = useState({ tipo: "servico" as "servico" | "peca", descricao: "", pecaId: 0, quantidade: "1", valorUnitario: "0" });
  const [uploadingEtapa, setUploadingEtapa] = useState<"antes" | "durante" | "depois" | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = trpc.os.update.useMutation({
    onSuccess: () => { toast.success("OS atualizada!"); utils.os.get.invalidate({ id: osId }); setEditMode(false); },
    onError: (e) => toast.error(e.message),
  });
  const addItemMutation = trpc.os.addItem.useMutation({
    onSuccess: () => { toast.success("Item adicionado!"); utils.os.listItens.invalidate({ osId }); setAddItemOpen(false); setItemForm({ tipo: "servico", descricao: "", pecaId: 0, quantidade: "1", valorUnitario: "0" }); },
    onError: (e) => toast.error(e.message),
  });
  const removeItemMutation = trpc.os.removeItem.useMutation({
    onSuccess: () => { toast.success("Item removido!"); utils.os.listItens.invalidate({ osId }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteFotoMutation = trpc.os.deleteFoto.useMutation({
    onSuccess: () => { toast.success("Foto removida!"); utils.os.listFotos.invalidate({ osId }); },
    onError: (e) => toast.error(e.message),
  });
  const uploadFotoMutation = trpc.os.uploadFoto.useMutation({
    onSuccess: () => { toast.success("Foto enviada!"); utils.os.listFotos.invalidate({ osId }); setUploadingEtapa(null); setUploadingPhoto(false); },
    onError: (e) => { toast.error(e.message); setUploadingPhoto(false); },
  });

  const handleSaveEdit = () => {
    const total = (Number(editData.valorServicos || os?.valorServicos || 0) + Number(editData.valorPecas || os?.valorPecas || 0) - Number(editData.desconto || os?.desconto || 0));
    updateMutation.mutate({ id: osId, ...editData, valorTotal: String(total) });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const total = String(Number(itemForm.quantidade) * Number(itemForm.valorUnitario));
    addItemMutation.mutate({ osId, ...itemForm, valorTotal: total, pecaId: itemForm.pecaId || undefined });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingEtapa) return;
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      uploadFotoMutation.mutate({ osId, etapa: uploadingEtapa, base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const getClienteNome = (id: number) => (clientes as any[]).find(c => c.id === id)?.nome || "—";
  const formatCurrency = (v: any) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (isLoading) return <div className="p-6 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!os) return <div className="p-6 text-center text-muted-foreground">OS não encontrada</div>;

  const fotosPorEtapa = (etapa: string) => (fotos as any[]).filter(f => f.etapa === etapa);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/os">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" />Voltar</Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400"><ClipboardList className="w-5 h-5" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground font-mono">{(os as any).numero}</h1>
                <span className={`text-xs font-medium px-2 py-1 rounded-full status-${(os as any).status}`}>{STATUS_LABELS[(os as any).status]}</span>
              </div>
              <p className="text-muted-foreground text-sm">{getClienteNome((os as any).clienteId)}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)} className="border-border">Cancelar</Button>
              <Button onClick={handleSaveEdit} className="bg-primary text-primary-foreground gap-2" disabled={updateMutation.isPending}><Save className="w-4 h-4" />Salvar</Button>
            </>
          ) : (
            <Button onClick={() => { setEditData({}); setEditMode(true); }} variant="outline" className="border-border gap-2">Editar OS</Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Informações</TabsTrigger>
          <TabsTrigger value="itens" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Itens ({(itens as any[]).length})</TabsTrigger>
          <TabsTrigger value="fotos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Fotos ({(fotos as any[]).length})</TabsTrigger>
        </TabsList>

        {/* Informações */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Status da OS</h3>
              {editMode ? (
                <Select value={editData.status || (os as any).status} onValueChange={v => setEditData((d: any) => ({ ...d, status: v }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <span className={`text-sm font-medium px-3 py-1.5 rounded-full status-${(os as any).status}`}>{STATUS_LABELS[(os as any).status]}</span>
              )}
            </div>

            {/* Valores */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Valores</h3>
              {editMode ? (
                <div className="grid grid-cols-3 gap-2">
                  <div><Label className="text-xs text-muted-foreground">Serviços</Label><Input type="number" step="0.01" value={editData.valorServicos ?? (os as any).valorServicos ?? "0"} onChange={e => setEditData((d: any) => ({ ...d, valorServicos: e.target.value }))} className="bg-secondary border-border h-8 text-sm" /></div>
                  <div><Label className="text-xs text-muted-foreground">Peças</Label><Input type="number" step="0.01" value={editData.valorPecas ?? (os as any).valorPecas ?? "0"} onChange={e => setEditData((d: any) => ({ ...d, valorPecas: e.target.value }))} className="bg-secondary border-border h-8 text-sm" /></div>
                  <div><Label className="text-xs text-muted-foreground">Desconto</Label><Input type="number" step="0.01" value={editData.desconto ?? (os as any).desconto ?? "0"} onChange={e => setEditData((d: any) => ({ ...d, desconto: e.target.value }))} className="bg-secondary border-border h-8 text-sm" /></div>
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Serviços:</span><span>{formatCurrency((os as any).valorServicos)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Peças:</span><span>{formatCurrency((os as any).valorPecas)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Desconto:</span><span className="text-red-400">-{formatCurrency((os as any).desconto)}</span></div>
                  <div className="flex justify-between border-t border-border pt-1 font-bold"><span>Total:</span><span className="text-primary text-base">{formatCurrency((os as any).valorTotal)}</span></div>
                </div>
              )}
            </div>

            {/* Problema */}
            <div className="md:col-span-2 bg-card border border-border rounded-xl p-4 space-y-2">
              <h3 className="font-semibold text-foreground text-sm">Descrição do Problema</h3>
              {editMode ? (
                <Textarea value={editData.descricaoProblema ?? (os as any).descricaoProblema ?? ""} onChange={e => setEditData((d: any) => ({ ...d, descricaoProblema: e.target.value }))} className="bg-secondary border-border resize-none" rows={3} />
              ) : (
                <p className="text-sm text-muted-foreground">{(os as any).descricaoProblema || "Não informado"}</p>
              )}
            </div>

            {/* Serviços realizados */}
            <div className="md:col-span-2 bg-card border border-border rounded-xl p-4 space-y-2">
              <h3 className="font-semibold text-foreground text-sm">Serviços Realizados</h3>
              {editMode ? (
                <Textarea value={editData.servicosRealizados ?? (os as any).servicosRealizados ?? ""} onChange={e => setEditData((d: any) => ({ ...d, servicosRealizados: e.target.value }))} className="bg-secondary border-border resize-none" rows={4} placeholder="Descreva os serviços realizados..." />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{(os as any).servicosRealizados || "Não informado"}</p>
              )}
            </div>
          </div>

          {/* Gerar garantia */}
          {(os as any).status === "concluida" && (
            <Link href={`/garantias?osId=${osId}`}>
              <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 gap-2">
                <Shield className="w-4 h-4" />Gerar Termo de Garantia
              </Button>
            </Link>
          )}
        </TabsContent>

        {/* Itens */}
        <TabsContent value="itens" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Serviços e Peças</h3>
            <Button onClick={() => setAddItemOpen(true)} size="sm" className="bg-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" />Adicionar Item</Button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {(itens as any[]).length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Nenhum item adicionado</div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-border bg-secondary/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Descrição</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Qtd</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Unit.</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Total</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(itens as any[]).map(item => (
                    <tr key={item.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.tipo === "servico" ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"}`}>{item.tipo === "servico" ? "Serviço" : "Peça"}</span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-foreground">{item.descricao}</td>
                      <td className="px-4 py-2.5 text-center text-sm text-muted-foreground">{Number(item.quantidade)}</td>
                      <td className="px-4 py-2.5 text-right text-sm text-muted-foreground">{Number(item.valorUnitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                      <td className="px-4 py-2.5 text-right text-sm font-semibold text-foreground">{Number(item.valorTotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeItemMutation.mutate({ id: item.id })}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* Fotos */}
        <TabsContent value="fotos" className="space-y-6">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {(["antes", "durante", "depois"] as const).map(etapa => (
            <div key={etapa} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground capitalize">{etapa.charAt(0).toUpperCase() + etapa.slice(1)} ({fotosPorEtapa(etapa).length})</h3>
                <Button size="sm" variant="outline" className="border-border gap-2" onClick={() => { setUploadingEtapa(etapa); fileInputRef.current?.click(); }} disabled={uploadingPhoto && uploadingEtapa === etapa}>
                  {uploadingPhoto && uploadingEtapa === etapa ? <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  Adicionar Foto
                </Button>
              </div>
              {fotosPorEtapa(etapa).length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors" onClick={() => { setUploadingEtapa(etapa); fileInputRef.current?.click(); }}>
                  <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Clique para adicionar fotos de <strong>{etapa}</strong></p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {fotosPorEtapa(etapa).map((foto: any) => (
                    <div key={foto.id} className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-secondary">
                      <img src={foto.url} alt={etapa} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={() => deleteFotoMutation.mutate({ id: foto.id })}><X className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="text-foreground">Adicionar Item</DialogTitle></DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-foreground">Tipo</Label>
              <Select value={itemForm.tipo} onValueChange={v => setItemForm(f => ({ ...f, tipo: v as any, descricao: "", pecaId: 0 }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="servico">Serviço</SelectItem>
                  <SelectItem value="peca">Peça</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {itemForm.tipo === "peca" ? (
              <div className="space-y-1">
                <Label className="text-foreground">Peça</Label>
                <Select value={String(itemForm.pecaId || "")} onValueChange={v => { const p = (pecas as any[]).find(p => p.id === Number(v)); setItemForm(f => ({ ...f, pecaId: Number(v), descricao: p?.nome || "", valorUnitario: String(p?.precoVenda || 0) })); }}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione a peça" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {(pecas as any[]).map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nome} — {Number(p.precoVenda).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1">
                <Label className="text-foreground">Descrição do Serviço</Label>
                <Input value={itemForm.descricao} onChange={e => setItemForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Ex: Troca de óleo, Alinhamento..." className="bg-secondary border-border" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-foreground">Quantidade</Label>
                <Input type="number" step="0.01" value={itemForm.quantidade} onChange={e => setItemForm(f => ({ ...f, quantidade: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Valor Unitário (R$)</Label>
                <Input type="number" step="0.01" value={itemForm.valorUnitario} onChange={e => setItemForm(f => ({ ...f, valorUnitario: e.target.value }))} className="bg-secondary border-border" />
              </div>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-sm">
              <span className="text-muted-foreground">Total: </span>
              <span className="font-bold text-primary">{(Number(itemForm.quantidade) * Number(itemForm.valorUnitario)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddItemOpen(false)} className="border-border">Cancelar</Button>
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={addItemMutation.isPending}>Adicionar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
