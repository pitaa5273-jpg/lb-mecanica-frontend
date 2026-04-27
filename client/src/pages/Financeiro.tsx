import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, DollarSign, TrendingUp, TrendingDown, Trash2, Download, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const LOGO_URL = "/manus-storage/lb-logo_9fa76d8d.jpg";
const CATEGORIAS_RECEITA = ["Serviço", "Venda de Peças", "Outros"];
const CATEGORIAS_DESPESA = ["Aluguel", "Energia", "Água", "Fornecedor", "Salário", "Material", "Imposto", "Outros"];

type LancForm = { tipo: "receita" | "despesa"; categoria: string; descricao: string; valor: string; data: string; formaPagamento: string; observacoes: string; };
const emptyForm: LancForm = { tipo: "receita", categoria: "", descricao: "", valor: "", data: new Date().toISOString().split("T")[0], formaPagamento: "", observacoes: "" };

export default function Financeiro() {
  const [open, setOpen] = useState(false);
  const [fechamentoOpen, setFechamentoOpen] = useState(false);
  const [form, setForm] = useState<LancForm>(emptyForm);
  const [fechForm, setFechForm] = useState({ dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0], dataFim: new Date().toISOString().split("T")[0], observacoes: "" });
  const utils = trpc.useUtils();

  const [dataInicio] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [dataFim] = useState(() => new Date());

  const { data: lancamentos = [], isLoading } = trpc.financeiro.list.useQuery();
  const { data: resumo } = trpc.financeiro.resumo.useQuery({ dataInicio, dataFim });
  const { data: fechamentos = [] } = trpc.financeiro.listFechamentos.useQuery();
  const { data: empresa } = trpc.empresa.get.useQuery();

  const createMutation = trpc.financeiro.create.useMutation({
    onSuccess: () => { toast.success("Lançamento registrado!"); utils.financeiro.list.invalidate(); utils.financeiro.resumo.invalidate(); setOpen(false); setForm(emptyForm); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.financeiro.delete.useMutation({
    onSuccess: () => { toast.success("Lançamento removido!"); utils.financeiro.list.invalidate(); utils.financeiro.resumo.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const fecharCaixaMutation = trpc.financeiro.fecharCaixa.useMutation({
    onSuccess: () => { toast.success("Caixa fechado com sucesso!"); utils.financeiro.listFechamentos.invalidate(); setFechamentoOpen(false); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao || !form.valor) { toast.error("Preencha descrição e valor"); return; }
    createMutation.mutate({ ...form, valor: form.valor, data: new Date(form.data + "T12:00:00") });
  };

  const handleFecharCaixa = (e: React.FormEvent) => {
    e.preventDefault();
    fecharCaixaMutation.mutate({ dataInicio: new Date(fechForm.dataInicio + "T00:00:00"), dataFim: new Date(fechForm.dataFim + "T23:59:59"), observacoes: fechForm.observacoes });
  };

  const formatCurrency = (v: any) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handlePrintRelatorio = () => {
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório Financeiro</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 20px; }
      .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #D4A017; padding-bottom: 15px; margin-bottom: 20px; }
      .logo { width: 70px; height: 70px; object-fit: contain; }
      .empresa-nome { font-size: 18px; font-weight: bold; color: #D4A017; }
      .titulo { text-align: center; font-size: 16px; font-weight: bold; margin: 15px 0; border: 2px solid #D4A017; padding: 8px; }
      .resumo { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px; }
      .resumo-box { border: 1px solid #ddd; padding: 12px; border-radius: 4px; text-align: center; }
      .resumo-box .label { font-size: 11px; text-transform: uppercase; color: #666; }
      .resumo-box .value { font-size: 18px; font-weight: bold; margin-top: 4px; }
      .receita { color: #16a34a; } .despesa { color: #dc2626; } .saldo { color: #D4A017; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #1a1a1a; color: #D4A017; padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
      td { padding: 7px 8px; border-bottom: 1px solid #eee; font-size: 12px; }
      tr:nth-child(even) td { background: #f9f9f9; }
      @media print { body { padding: 10px; } }
    </style></head><body>
    <div class="header">
      <img src="${LOGO_URL}" class="logo" alt="Logo" />
      <div style="text-align:right"><div class="empresa-nome">${(empresa as any)?.nome || "LB Mecânica Automotiva"}</div><p>Relatório Financeiro</p></div>
    </div>
    <div class="titulo">RELATÓRIO FINANCEIRO — ${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).toUpperCase()}</div>
    <div class="resumo">
      <div class="resumo-box"><div class="label">Receitas</div><div class="value receita">${formatCurrency(resumo?.receitas)}</div></div>
      <div class="resumo-box"><div class="label">Despesas</div><div class="value despesa">${formatCurrency(resumo?.despesas)}</div></div>
      <div class="resumo-box"><div class="label">Saldo</div><div class="value saldo">${formatCurrency(resumo?.saldo)}</div></div>
    </div>
    <table><thead><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Pagamento</th><th style="text-align:right">Valor</th></tr></thead>
    <tbody>
    ${(lancamentos as any[]).map(l => `<tr><td>${new Date(l.data).toLocaleDateString("pt-BR")}</td><td style="color:${l.tipo === "receita" ? "#16a34a" : "#dc2626"}">${l.tipo === "receita" ? "Receita" : "Despesa"}</td><td>${l.categoria || "—"}</td><td>${l.descricao}</td><td>${l.formaPagamento || "—"}</td><td style="text-align:right;font-weight:bold;color:${l.tipo === "receita" ? "#16a34a" : "#dc2626"}">${l.tipo === "receita" ? "+" : "-"}${formatCurrency(l.valor)}</td></tr>`).join("")}
    </tbody></table>
    <p style="margin-top:20px;font-size:10px;color:#666;text-align:center">Gerado em ${new Date().toLocaleString("pt-BR")}</p>
    </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/20 text-green-400"><DollarSign className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Financeiro</h1>
            <p className="text-muted-foreground text-sm">Controle de receitas e despesas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrintRelatorio} variant="outline" className="border-border gap-2 hidden md:flex"><Download className="w-4 h-4" />Exportar PDF</Button>
          <Button onClick={() => setFechamentoOpen(true)} variant="outline" className="border-border gap-2"><Lock className="w-4 h-4" />Fechar Caixa</Button>
          <Button onClick={() => { setForm(emptyForm); setOpen(true); }} className="bg-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" />Lançamento</Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-green-500/30 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div><p className="text-muted-foreground text-sm">Receitas (mês)</p><p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(resumo?.receitas)}</p></div>
            <div className="p-2.5 rounded-lg bg-green-500/20 text-green-400"><TrendingUp className="w-5 h-5" /></div>
          </div>
        </div>
        <div className="bg-card border border-red-500/30 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div><p className="text-muted-foreground text-sm">Despesas (mês)</p><p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(resumo?.despesas)}</p></div>
            <div className="p-2.5 rounded-lg bg-red-500/20 text-red-400"><TrendingDown className="w-5 h-5" /></div>
          </div>
        </div>
        <div className={`bg-card border rounded-xl p-5 ${(resumo?.saldo ?? 0) >= 0 ? "border-primary/30" : "border-red-500/30"}`}>
          <div className="flex items-start justify-between">
            <div><p className="text-muted-foreground text-sm">Saldo (mês)</p><p className={`text-2xl font-bold mt-1 ${(resumo?.saldo ?? 0) >= 0 ? "text-primary" : "text-red-400"}`}>{formatCurrency(resumo?.saldo)}</p></div>
            <div className={`p-2.5 rounded-lg ${(resumo?.saldo ?? 0) >= 0 ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-400"}`}><DollarSign className="w-5 h-5" /></div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="lancamentos" className="space-y-4">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="lancamentos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Lançamentos</TabsTrigger>
          <TabsTrigger value="fechamentos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Fechamentos de Caixa</TabsTrigger>
        </TabsList>

        <TabsContent value="lancamentos">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando...</div>
            ) : (lancamentos as any[]).length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum lançamento registrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-secondary/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Data</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Tipo</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Categoria</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Descrição</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Valor</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(lancamentos as any[]).map(l => (
                      <tr key={l.id} className="hover:bg-secondary/30">
                        <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(l.data).toLocaleDateString("pt-BR")}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${l.tipo === "receita" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{l.tipo === "receita" ? "Receita" : "Despesa"}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">{l.categoria || "—"}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{l.descricao}</td>
                        <td className={`px-4 py-3 text-right text-sm font-bold ${l.tipo === "receita" ? "text-green-400" : "text-red-400"}`}>
                          {l.tipo === "receita" ? "+" : "-"}{formatCurrency(l.valor)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => { if (confirm("Remover lançamento?")) deleteMutation.mutate({ id: l.id }); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="fechamentos">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {(fechamentos as any[]).length === 0 ? (
              <div className="p-12 text-center">
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum fechamento de caixa realizado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-secondary/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Período</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Receitas</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Despesas</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Saldo</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Obs.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(fechamentos as any[]).map(f => (
                      <tr key={f.id} className="hover:bg-secondary/30">
                        <td className="px-4 py-3 text-sm text-foreground">
                          {new Date(f.dataInicio).toLocaleDateString("pt-BR")} — {new Date(f.dataFim).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-green-400 font-semibold">{formatCurrency(f.totalReceitas)}</td>
                        <td className="px-4 py-3 text-right text-sm text-red-400 font-semibold">{formatCurrency(f.totalDespesas)}</td>
                        <td className={`px-4 py-3 text-right text-sm font-bold ${Number(f.saldoFinal) >= 0 ? "text-primary" : "text-red-400"}`}>{formatCurrency(f.saldoFinal)}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">{f.observacoes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Novo Lançamento Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader><DialogTitle className="text-foreground">Novo Lançamento</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-foreground">Tipo *</Label>
                <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v as any, categoria: "" }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Categoria</Label>
                <Select value={form.categoria} onValueChange={v => setForm(f => ({ ...f, categoria: v }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {(form.tipo === "receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-foreground">Descrição *</Label>
              <Input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descrição do lançamento" className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-foreground">Valor (R$) *</Label>
                <Input type="number" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="0,00" className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Data</Label>
                <Input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} className="bg-secondary border-border" />
              </div>
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
            <div className="space-y-1">
              <Label className="text-foreground">Observações</Label>
              <Textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} className="bg-secondary border-border resize-none" rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">Cancelar</Button>
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={createMutation.isPending}>Registrar Lançamento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fechar Caixa Dialog */}
      <Dialog open={fechamentoOpen} onOpenChange={setFechamentoOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="text-foreground">Fechar Caixa</DialogTitle></DialogHeader>
          <form onSubmit={handleFecharCaixa} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-foreground">Data Início</Label>
                <Input type="date" value={fechForm.dataInicio} onChange={e => setFechForm(f => ({ ...f, dataInicio: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Data Fim</Label>
                <Input type="date" value={fechForm.dataFim} onChange={e => setFechForm(f => ({ ...f, dataFim: e.target.value }))} className="bg-secondary border-border" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-foreground">Observações</Label>
              <Textarea value={fechForm.observacoes} onChange={e => setFechForm(f => ({ ...f, observacoes: e.target.value }))} className="bg-secondary border-border resize-none" rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFechamentoOpen(false)} className="border-border">Cancelar</Button>
              <Button type="submit" className="bg-primary text-primary-foreground gap-2" disabled={fecharCaixaMutation.isPending}><Lock className="w-4 h-4" />Fechar Caixa</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
