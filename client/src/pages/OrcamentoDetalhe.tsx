import { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Download, FileText } from "lucide-react";

const STATUS_LABELS: Record<string, string> = { pendente: "Pendente", aprovado: "Aprovado", reprovado: "Reprovado", expirado: "Expirado" };
const LOGO_URL = "/manus-storage/lb-logo_9fa76d8d.jpg";

export default function OrcamentoDetalhe() {
  const params = useParams<{ id: string }>();
  const orcId = Number(params.id);
  const utils = trpc.useUtils();

  const { data: orc, isLoading } = trpc.orcamentos.get.useQuery({ id: orcId });
  const { data: itens = [] } = trpc.orcamentos.listItens.useQuery({ orcamentoId: orcId });
  const { data: clientes = [] } = trpc.clientes.list.useQuery();
  const { data: veiculos = [] } = trpc.veiculos.list.useQuery();
  const { data: pecas = [] } = trpc.pecas.list.useQuery();
  const { data: empresa } = trpc.empresa.get.useQuery();

  const [addItemOpen, setAddItemOpen] = useState(false);
  const [itemForm, setItemForm] = useState({ tipo: "servico" as "servico" | "peca", descricao: "", pecaId: 0, quantidade: "1", valorUnitario: "0" });

  const addItemMutation = trpc.orcamentos.addItem.useMutation({
    onSuccess: () => { toast.success("Item adicionado!"); utils.orcamentos.listItens.invalidate({ orcamentoId: orcId }); setAddItemOpen(false); setItemForm({ tipo: "servico", descricao: "", pecaId: 0, quantidade: "1", valorUnitario: "0" }); },
    onError: (e) => toast.error(e.message),
  });
  const removeItemMutation = trpc.orcamentos.removeItem.useMutation({
    onSuccess: () => { toast.success("Item removido!"); utils.orcamentos.listItens.invalidate({ orcamentoId: orcId }); },
    onError: (e) => toast.error(e.message),
  });
  const updateStatusMutation = trpc.orcamentos.update.useMutation({
    onSuccess: () => { toast.success("Status atualizado!"); utils.orcamentos.get.invalidate({ id: orcId }); },
    onError: (e) => toast.error(e.message),
  });

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const total = String(Number(itemForm.quantidade) * Number(itemForm.valorUnitario));
    addItemMutation.mutate({ orcamentoId: orcId, ...itemForm, valorTotal: total, pecaId: itemForm.pecaId || undefined });
  };

  const getClienteNome = (id: number) => (clientes as any[]).find(c => c.id === id)?.nome || "—";
  const getVeiculo = (id: number) => (veiculos as any[]).find(v => v.id === id);
  const formatCurrency = (v: any) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handlePrint = () => {
    const veiculo = getVeiculo((orc as any)?.veiculoId);
    const cliente = (clientes as any[]).find(c => c.id === (orc as any)?.clienteId);
    const totalGeral = (itens as any[]).reduce((acc, i) => acc + Number(i.valorTotal), 0) - Number((orc as any)?.desconto || 0);
    const dataValidade = new Date((orc as any)?.createdAt);
    dataValidade.setDate(dataValidade.getDate() + ((orc as any)?.validadeDias || 7));

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Orçamento ${(orc as any)?.numero}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; background: #fff; padding: 20px; }
      .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #D4A017; padding-bottom: 15px; margin-bottom: 20px; }
      .logo { width: 80px; height: 80px; object-fit: contain; }
      .empresa-info { text-align: right; }
      .empresa-nome { font-size: 20px; font-weight: bold; color: #D4A017; }
      .titulo { text-align: center; font-size: 18px; font-weight: bold; margin: 15px 0; color: #1a1a1a; border: 2px solid #D4A017; padding: 8px; }
      .numero { font-size: 14px; color: #666; text-align: center; margin-bottom: 15px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
      .info-box { border: 1px solid #ddd; padding: 10px; border-radius: 4px; }
      .info-box h3 { font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
      .info-box p { font-size: 12px; margin: 2px 0; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
      th { background: #1a1a1a; color: #D4A017; padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
      td { padding: 7px 8px; border-bottom: 1px solid #eee; font-size: 12px; }
      tr:nth-child(even) td { background: #f9f9f9; }
      .total-row td { font-weight: bold; background: #f0f0f0; }
      .grand-total td { font-weight: bold; font-size: 14px; background: #D4A017; color: #1a1a1a; }
      .obs { border: 1px solid #ddd; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
      .obs h3 { font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 6px; }
      .validade { background: #fff3cd; border: 1px solid #D4A017; padding: 8px; border-radius: 4px; text-align: center; margin-bottom: 20px; font-size: 11px; }
      .assinatura { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
      .assinatura-linha { border-top: 1px solid #333; padding-top: 5px; text-align: center; font-size: 11px; color: #666; }
      @media print { body { padding: 10px; } }
    </style></head><body>
    <div class="header">
      <img src="${LOGO_URL}" class="logo" alt="Logo" />
      <div class="empresa-info">
        <div class="empresa-nome">${(empresa as any)?.nome || "LB Mecânica Automotiva"}</div>
        ${empresa ? `<p>${(empresa as any).cnpj ? `CNPJ: ${(empresa as any).cnpj}` : ""}</p><p>${(empresa as any).endereco || ""}</p><p>${(empresa as any).telefone || ""}</p>` : ""}
      </div>
    </div>
    <div class="titulo">ORÇAMENTO</div>
    <div class="numero">Nº ${(orc as any)?.numero} — Emitido em ${new Date((orc as any)?.createdAt).toLocaleDateString("pt-BR")}</div>
    <div class="info-grid">
      <div class="info-box"><h3>Cliente</h3><p><strong>${cliente?.nome || "—"}</strong></p><p>${cliente?.telefone || ""}</p><p>${cliente?.cpfCnpj || ""}</p><p>${cliente?.endereco || ""}</p></div>
      <div class="info-box"><h3>Veículo</h3><p><strong>${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : "—"}</strong></p><p>Placa: ${veiculo?.placa || "—"}</p><p>Ano: ${veiculo?.ano || "—"} | Cor: ${veiculo?.cor || "—"}</p></div>
    </div>
    <table><thead><tr><th>Tipo</th><th>Descrição</th><th style="text-align:center">Qtd</th><th style="text-align:right">Unit.</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>
    ${(itens as any[]).map(i => `<tr><td>${i.tipo === "servico" ? "Serviço" : "Peça"}</td><td>${i.descricao}</td><td style="text-align:center">${Number(i.quantidade)}</td><td style="text-align:right">${formatCurrency(i.valorUnitario)}</td><td style="text-align:right">${formatCurrency(i.valorTotal)}</td></tr>`).join("")}
    ${(orc as any)?.desconto > 0 ? `<tr class="total-row"><td colspan="4" style="text-align:right">Desconto:</td><td style="text-align:right;color:red">-${formatCurrency((orc as any)?.desconto)}</td></tr>` : ""}
    <tr class="grand-total"><td colspan="4" style="text-align:right">TOTAL GERAL:</td><td style="text-align:right">${formatCurrency(totalGeral)}</td></tr>
    </tbody></table>
    ${(orc as any)?.observacoes ? `<div class="obs"><h3>Observações</h3><p>${(orc as any)?.observacoes}</p></div>` : ""}
    <div class="validade">⚠️ Este orçamento é válido por <strong>${(orc as any)?.validadeDias || 7} dias</strong> a partir da data de emissão — até <strong>${dataValidade.toLocaleDateString("pt-BR")}</strong></div>
    <div class="assinatura">
      <div class="assinatura-linha">Assinatura do Cliente</div>
      <div class="assinatura-linha">${(empresa as any)?.nome || "LB Mecânica Automotiva"}</div>
    </div>
    </body></html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
  };

  if (isLoading) return <div className="p-6 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!orc) return <div className="p-6 text-center text-muted-foreground">Orçamento não encontrado</div>;

  const totalItens = (itens as any[]).reduce((acc, i) => acc + Number(i.valorTotal), 0);
  const totalGeral = totalItens - Number((orc as any).desconto || 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/orcamentos">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" />Voltar</Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400"><FileText className="w-5 h-5" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground font-mono">{(orc as any).numero}</h1>
                <span className={`text-xs font-medium px-2 py-1 rounded-full status-${(orc as any).status}`}>{STATUS_LABELS[(orc as any).status]}</span>
              </div>
              <p className="text-muted-foreground text-sm">{getClienteNome((orc as any).clienteId)}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" className="border-border gap-2"><Download className="w-4 h-4" />Exportar PDF</Button>
        </div>
      </div>

      {/* Status update */}
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
        <Label className="text-foreground text-sm font-medium">Alterar Status:</Label>
        <Select value={(orc as any).status} onValueChange={v => updateStatusMutation.mutate({ id: orcId, status: v as any })}>
          <SelectTrigger className="bg-secondary border-border w-40"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-card border-border">
            {["pendente", "aprovado", "reprovado", "expirado"].map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Items */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-foreground">Itens do Orçamento</h3>
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
                    <td className="px-4 py-2.5 text-right text-sm text-muted-foreground">{formatCurrency(item.valorUnitario)}</td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-foreground">{formatCurrency(item.valorTotal)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeItemMutation.mutate({ id: item.id })}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-secondary/50 font-bold">
                  <td colSpan={4} className="px-4 py-3 text-right text-sm text-foreground">Total Geral:</td>
                  <td className="px-4 py-3 text-right text-base text-primary">{formatCurrency(totalGeral)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

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
                    {(pecas as any[]).map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nome} — {formatCurrency(p.precoVenda)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1">
                <Label className="text-foreground">Descrição</Label>
                <Input value={itemForm.descricao} onChange={e => setItemForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Ex: Troca de óleo..." className="bg-secondary border-border" />
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
