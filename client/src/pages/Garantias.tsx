import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Shield, Download, Eye, Pen } from "lucide-react";
import { useSearch } from "wouter";

const LOGO_URL = "/manus-storage/lb-logo_9fa76d8d.jpg";

export default function Garantias() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const osIdParam = params.get("osId") ? Number(params.get("osId")) : undefined;

  const [open, setOpen] = useState(!!osIdParam);
  const [assinaturaOpen, setAssinaturaOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    osId: osIdParam || 0,
    clienteId: 0,
    veiculoId: 0,
    servicosGarantidos: "",
    condicoesGarantia: "Esta garantia cobre defeitos nos serviços realizados por 90 dias a partir da data de emissão. Não cobre danos causados por mau uso, acidentes, desgaste natural ou intervenções de terceiros.",
    dataVencimento: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [assinaturaBase64, setAssinaturaBase64] = useState("");
  const utils = trpc.useUtils();

  const { data: garantias = [], isLoading } = trpc.garantias.list.useQuery();
  const { data: clientes = [] } = trpc.clientes.list.useQuery();
  const { data: veiculos = [] } = trpc.veiculos.list.useQuery({ clienteId: form.clienteId || undefined });
  const { data: osList = [] } = trpc.os.list.useQuery();
  const { data: empresa } = trpc.empresa.get.useQuery();

  const createMutation = trpc.garantias.create.useMutation({
    onSuccess: () => { toast.success("Garantia criada!"); utils.garantias.list.invalidate(); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.garantias.update.useMutation({
    onSuccess: () => { toast.success("Assinatura salva!"); utils.garantias.list.invalidate(); setAssinaturaOpen(false); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId || !form.veiculoId || !form.servicosGarantidos) { toast.error("Preencha todos os campos obrigatórios"); return; }
    createMutation.mutate({ ...form, dataVencimento: new Date(form.dataVencimento + "T12:00:00"), osId: form.osId || 0 });
  };

  // Canvas drawing
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke();
  };
  const stopDraw = () => { setDrawing(false); setAssinaturaBase64(canvasRef.current?.toDataURL() || ""); };
  const clearCanvas = () => { const ctx = canvasRef.current?.getContext("2d"); ctx?.clearRect(0, 0, 400, 150); setAssinaturaBase64(""); };
  const saveAssinatura = () => {
    if (!selectedId || !assinaturaBase64) { toast.error("Faça a assinatura primeiro"); return; }
    updateMutation.mutate({ id: selectedId, assinaturaCliente: assinaturaBase64 });
  };

  const getClienteNome = (id: number) => (clientes as any[]).find(c => c.id === id)?.nome || "—";
  const getVeiculo = (id: number) => (veiculos as any[]).find(v => v.id === id);
  const formatDate = (d: any) => new Date(d).toLocaleDateString("pt-BR");

  const handlePrintGarantia = (g: any) => {
    const cliente = (clientes as any[]).find(c => c.id === g.clienteId);
    const veiculo = (veiculos as any[]).find(v => v.id === g.veiculoId) || getVeiculo(g.veiculoId);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Termo de Garantia</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 30px; max-width: 800px; margin: 0 auto; }
      .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #D4A017; padding-bottom: 20px; margin-bottom: 25px; }
      .logo { width: 90px; height: 90px; object-fit: contain; }
      .empresa-info { text-align: right; }
      .empresa-nome { font-size: 22px; font-weight: bold; color: #D4A017; }
      .titulo { text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; color: #1a1a1a; border: 2px solid #D4A017; padding: 10px; background: #fffbf0; }
      .numero { text-align: center; font-size: 13px; color: #666; margin-bottom: 20px; }
      .section { margin-bottom: 20px; }
      .section h3 { font-size: 12px; text-transform: uppercase; color: #D4A017; font-weight: bold; border-bottom: 1px solid #D4A017; padding-bottom: 5px; margin-bottom: 10px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
      .info-item { margin-bottom: 6px; }
      .info-label { font-size: 10px; text-transform: uppercase; color: #888; }
      .info-value { font-size: 13px; font-weight: 500; }
      .servicos-box { border: 1px solid #ddd; padding: 12px; border-radius: 4px; background: #f9f9f9; white-space: pre-wrap; line-height: 1.6; }
      .condicoes-box { border: 1px solid #ddd; padding: 12px; border-radius: 4px; font-size: 11px; color: #555; line-height: 1.6; }
      .validade-box { background: #fff3cd; border: 2px solid #D4A017; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; }
      .validade-box .dias { font-size: 28px; font-weight: bold; color: #D4A017; }
      .validade-box .texto { font-size: 12px; color: #666; }
      .assinaturas { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; }
      .assinatura-box { text-align: center; }
      .assinatura-img { max-width: 200px; max-height: 80px; margin: 0 auto 5px; display: block; }
      .assinatura-linha { border-top: 1px solid #333; padding-top: 5px; font-size: 11px; color: #666; }
      .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
      @media print { body { padding: 15px; } }
    </style></head><body>
    <div class="header">
      <img src="${LOGO_URL}" class="logo" alt="Logo" />
      <div class="empresa-info">
        <div class="empresa-nome">${(empresa as any)?.nome || "LB Mecânica Automotiva"}</div>
        ${empresa ? `<p>${(empresa as any).cnpj ? `CNPJ: ${(empresa as any).cnpj}` : ""}</p><p>${(empresa as any).endereco || ""}</p><p>${(empresa as any).telefone || ""}</p>` : ""}
      </div>
    </div>
    <div class="titulo">TERMO DE GARANTIA</div>
    <div class="numero">Nº ${g.numero} — Emitido em ${formatDate(g.dataEmissao)}</div>
    <div class="section">
      <h3>Dados do Cliente e Veículo</h3>
      <div class="info-grid">
        <div>
          <div class="info-item"><div class="info-label">Nome do Cliente</div><div class="info-value">${cliente?.nome || "—"}</div></div>
          <div class="info-item"><div class="info-label">CPF/CNPJ</div><div class="info-value">${cliente?.cpfCnpj || "—"}</div></div>
          <div class="info-item"><div class="info-label">Telefone</div><div class="info-value">${cliente?.telefone || "—"}</div></div>
        </div>
        <div>
          <div class="info-item"><div class="info-label">Veículo</div><div class="info-value">${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : "—"}</div></div>
          <div class="info-item"><div class="info-label">Placa</div><div class="info-value" style="font-size:16px;font-weight:bold;font-family:monospace">${veiculo?.placa || "—"}</div></div>
          <div class="info-item"><div class="info-label">Ano / Cor</div><div class="info-value">${veiculo?.ano || "—"} / ${veiculo?.cor || "—"}</div></div>
        </div>
      </div>
    </div>
    <div class="section">
      <h3>Serviços Garantidos</h3>
      <div class="servicos-box">${g.servicosGarantidos}</div>
    </div>
    <div class="validade-box">
      <div class="dias">90 DIAS</div>
      <div class="texto">Esta garantia é válida por <strong>90 dias</strong> a partir da data de emissão</div>
      <div class="texto" style="margin-top:5px">Vencimento: <strong>${formatDate(g.dataVencimento)}</strong></div>
    </div>
    <div class="section">
      <h3>Condições da Garantia</h3>
      <div class="condicoes-box">${g.condicoesGarantia || "Conforme termos estabelecidos."}</div>
    </div>
    <div class="assinaturas">
      <div class="assinatura-box">
        ${g.assinaturaCliente ? `<img src="${g.assinaturaCliente}" class="assinatura-img" alt="Assinatura" />` : "<div style='height:60px'></div>"}
        <div class="assinatura-linha">${cliente?.nome || "Cliente"}</div>
      </div>
      <div class="assinatura-box">
        ${g.assinaturaResponsavel ? `<img src="${g.assinaturaResponsavel}" class="assinatura-img" alt="Assinatura" />` : "<div style='height:60px'></div>"}
        <div class="assinatura-linha">${(empresa as any)?.nome || "LB Mecânica Automotiva"} — Responsável</div>
      </div>
    </div>
    <div class="footer">${(empresa as any)?.nome || "LB Mecânica Automotiva"} — Documento gerado em ${new Date().toLocaleString("pt-BR")}</div>
    </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><Shield className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Garantias</h1>
            <p className="text-muted-foreground text-sm">{(garantias as any[]).length} garantia(s) emitida(s)</p>
          </div>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" />Nova Garantia</Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : (garantias as any[]).length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma garantia emitida</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Número</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase hidden lg:table-cell">Veículo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Vencimento</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(garantias as any[]).map((g) => {
                  const vencida = new Date(g.dataVencimento) < new Date();
                  return (
                    <tr key={g.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3"><span className="font-mono font-bold text-emerald-400 text-sm">{g.numero}</span></td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-foreground">{getClienteNome(g.clienteId)}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground font-mono">{(veiculos as any[]).find(v => v.id === g.veiculoId)?.placa || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(g.dataVencimento)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${vencida ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>{vencida ? "Vencida" : "Válida"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={() => handlePrintGarantia(g)}><Download className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-emerald-400" onClick={() => { setSelectedId(g.id); setAssinaturaOpen(true); }}><Pen className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nova Garantia Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-foreground">Emitir Termo de Garantia</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-foreground">OS Vinculada</Label>
                <Select value={String(form.osId || "")} onValueChange={v => setForm(f => ({ ...f, osId: Number(v) }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione a OS" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {(osList as any[]).filter(o => o.status === "concluida").map(o => <SelectItem key={o.id} value={String(o.id)}>{o.numero}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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
                <Label className="text-foreground">Data de Vencimento</Label>
                <Input type="date" value={form.dataVencimento} onChange={e => setForm(f => ({ ...f, dataVencimento: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-foreground">Serviços Garantidos *</Label>
                <Textarea value={form.servicosGarantidos} onChange={e => setForm(f => ({ ...f, servicosGarantidos: e.target.value }))} placeholder="Descreva detalhadamente os serviços que estão cobertos pela garantia..." className="bg-secondary border-border resize-none" rows={4} />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-foreground">Condições da Garantia</Label>
                <Textarea value={form.condicoesGarantia} onChange={e => setForm(f => ({ ...f, condicoesGarantia: e.target.value }))} className="bg-secondary border-border resize-none" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">Cancelar</Button>
              <Button type="submit" className="bg-primary text-primary-foreground gap-2" disabled={createMutation.isPending}><Shield className="w-4 h-4" />Emitir Garantia</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assinatura Dialog */}
      <Dialog open={assinaturaOpen} onOpenChange={setAssinaturaOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader><DialogTitle className="text-foreground">Assinatura Digital do Cliente</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Peça ao cliente para assinar no campo abaixo com o mouse ou toque:</p>
            <div className="border-2 border-border rounded-lg overflow-hidden bg-white">
              <canvas ref={canvasRef} width={400} height={150} className="w-full cursor-crosshair"
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearCanvas} className="border-border">Limpar</Button>
              <Button onClick={saveAssinatura} className="bg-primary text-primary-foreground gap-2 flex-1" disabled={updateMutation.isPending}><Pen className="w-4 h-4" />Salvar Assinatura</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
