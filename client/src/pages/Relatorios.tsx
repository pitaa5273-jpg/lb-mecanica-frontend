import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { BarChart2, Download, Users, Package, Wrench, TrendingUp } from "lucide-react";

const LOGO_URL = "/manus-storage/lb-logo_9fa76d8d.jpg";
const COLORS = ["#D4A017", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444"];

export default function Relatorios() {
  const [dataInicio, setDataInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split("T")[0]);

  const { data: relOS } = trpc.relatorios.os.useQuery({ dataInicio: new Date(dataInicio + "T00:00:00"), dataFim: new Date(dataFim + "T23:59:59") });
  const { data: topPecas = [] } = trpc.relatorios.topPecas.useQuery();
  const { data: clientesAtivos = [] } = trpc.relatorios.clientesAtivos.useQuery();
  const { data: finResumo } = trpc.relatorios.financeiro.useQuery({ dataInicio: new Date(dataInicio + "T00:00:00"), dataFim: new Date(dataFim + "T23:59:59") });
  const { data: empresa } = trpc.empresa.get.useQuery();

  const formatCurrency = (v: any) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const osStatusData = relOS ? [
    { name: "Abertas", value: relOS.abertas, color: "#3b82f6" },
    { name: "Em Andamento", value: relOS.emAndamento, color: "#D4A017" },
    { name: "Concluídas", value: relOS.concluidas, color: "#10b981" },
  ].filter(d => d.value > 0) : [];

  const handlePrint = () => {
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório Gerencial</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 20px; }
      .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #D4A017; padding-bottom: 15px; margin-bottom: 20px; }
      .logo { width: 70px; height: 70px; object-fit: contain; }
      .empresa-nome { font-size: 18px; font-weight: bold; color: #D4A017; }
      .titulo { text-align: center; font-size: 16px; font-weight: bold; margin: 15px 0; border: 2px solid #D4A017; padding: 8px; }
      .periodo { text-align: center; font-size: 12px; color: #666; margin-bottom: 20px; }
      .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
      .card { border: 1px solid #ddd; padding: 12px; border-radius: 4px; text-align: center; }
      .card .label { font-size: 10px; text-transform: uppercase; color: #666; }
      .card .value { font-size: 20px; font-weight: bold; margin-top: 4px; color: #D4A017; }
      .section { margin-bottom: 20px; }
      .section h3 { font-size: 13px; font-weight: bold; color: #D4A017; border-bottom: 1px solid #D4A017; padding-bottom: 5px; margin-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #1a1a1a; color: #D4A017; padding: 7px; text-align: left; font-size: 11px; }
      td { padding: 6px 7px; border-bottom: 1px solid #eee; font-size: 12px; }
      tr:nth-child(even) td { background: #f9f9f9; }
      @media print { body { padding: 10px; } }
    </style></head><body>
    <div class="header">
      <img src="${LOGO_URL}" class="logo" alt="Logo" />
      <div style="text-align:right"><div class="empresa-nome">${(empresa as any)?.nome || "LB Mecânica Automotiva"}</div>${empresa ? `<p>${(empresa as any).cnpj ? `CNPJ: ${(empresa as any).cnpj}` : ""}</p><p>${(empresa as any).endereco || ""}</p>` : ""}</div>
    </div>
    <div class="titulo">RELATÓRIO GERENCIAL</div>
    <div class="periodo">Período: ${new Date(dataInicio).toLocaleDateString("pt-BR")} a ${new Date(dataFim).toLocaleDateString("pt-BR")}</div>
    <div class="cards">
      <div class="card"><div class="label">Total OS</div><div class="value">${relOS?.total || 0}</div></div>
      <div class="card"><div class="label">Concluídas</div><div class="value">${relOS?.concluidas || 0}</div></div>
      <div class="card"><div class="label">Receitas</div><div class="value" style="font-size:14px">${formatCurrency(finResumo?.receitas)}</div></div>
      <div class="card"><div class="label">Saldo</div><div class="value" style="font-size:14px;color:${(finResumo?.saldo || 0) >= 0 ? "#10b981" : "#ef4444"}">${formatCurrency(finResumo?.saldo)}</div></div>
    </div>
    <div class="section"><h3>Peças Mais Utilizadas</h3>
    <table><thead><tr><th>Peça</th><th>Código</th><th style="text-align:right">Qtd. Utilizada</th></tr></thead><tbody>
    ${(topPecas as any[]).slice(0, 10).map(p => `<tr><td>${p.nome}</td><td>${p.codigo || "—"}</td><td style="text-align:right">${p.totalUsado}</td></tr>`).join("")}
    </tbody></table></div>
    <div class="section"><h3>Clientes Mais Ativos</h3>
    <table><thead><tr><th>Cliente</th><th>Telefone</th><th style="text-align:right">OS Realizadas</th></tr></thead><tbody>
    ${(clientesAtivos as any[]).slice(0, 10).map(c => `<tr><td>${c.nome}</td><td>${c.telefone || "—"}</td><td style="text-align:right">${c.totalOS}</td></tr>`).join("")}
    </tbody></table></div>
    <p style="margin-top:20px;font-size:10px;color:#999;text-align:center">Gerado em ${new Date().toLocaleString("pt-BR")}</p>
    </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400"><BarChart2 className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground text-sm">Análise gerencial da oficina</p>
          </div>
        </div>
        <Button onClick={handlePrint} variant="outline" className="border-border gap-2"><Download className="w-4 h-4" />Exportar PDF</Button>
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <Label className="text-foreground text-sm">Data Início</Label>
          <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="bg-secondary border-border w-40" />
        </div>
        <div className="space-y-1">
          <Label className="text-foreground text-sm">Data Fim</Label>
          <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="bg-secondary border-border w-40" />
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total de OS", value: relOS?.total || 0, icon: Wrench, color: "text-blue-400", bg: "bg-blue-500/20" },
          { label: "OS Concluídas", value: relOS?.concluidas || 0, icon: Wrench, color: "text-green-400", bg: "bg-green-500/20" },
          { label: "Receitas", value: formatCurrency(finResumo?.receitas), icon: TrendingUp, color: "text-primary", bg: "bg-primary/20" },
          { label: "Saldo", value: formatCurrency(finResumo?.saldo), icon: TrendingUp, color: (finResumo?.saldo || 0) >= 0 ? "text-green-400" : "text-red-400", bg: (finResumo?.saldo || 0) >= 0 ? "bg-green-500/20" : "bg-red-500/20" },
        ].map((card, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-xs">{card.label}</p>
                <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}><card.icon className="w-4 h-4" /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status OS */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Wrench className="w-4 h-4 text-primary" />Status das OS</h3>
          {osStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={osStatusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {osStatusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Sem dados no período</div>}
        </div>

        {/* Top Peças */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-primary" />Peças Mais Utilizadas</h3>
          {(topPecas as any[]).length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={(topPecas as any[]).slice(0, 6)} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="nome" tick={{ fill: "#888", fontSize: 10 }} />
                <YAxis tick={{ fill: "#888", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff" }} />
                <Bar dataKey="totalUsado" fill="#D4A017" radius={[4, 4, 0, 0]} name="Qtd. Usada" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Sem dados</div>}
        </div>
      </div>

      {/* Clientes Ativos */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Clientes Mais Ativos</h3>
        {(clientesAtivos as any[]).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Sem dados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left pb-3 text-xs font-semibold text-muted-foreground uppercase">Cliente</th>
                  <th className="text-left pb-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Telefone</th>
                  <th className="text-right pb-3 text-xs font-semibold text-muted-foreground uppercase">OS Realizadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(clientesAtivos as any[]).slice(0, 10).map((c, i) => (
                  <tr key={c.id} className="hover:bg-secondary/30">
                    <td className="py-2.5 text-sm text-foreground flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      {c.nome}
                    </td>
                    <td className="py-2.5 hidden md:table-cell text-sm text-muted-foreground">{c.telefone || "—"}</td>
                    <td className="py-2.5 text-right"><span className="font-bold text-primary">{c.totalOS}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
