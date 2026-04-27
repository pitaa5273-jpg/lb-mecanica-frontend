import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useWebSocket, EVENTS } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";

export default function PainelRelatorios() {
  const { subscribe } = useWebSocket();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const utils = trpc.useUtils();

  const { data: relatorioOS, isLoading: loadingOS } = trpc.relatorios.os.useQuery({ dataInicio: new Date(new Date().setDate(1)), dataFim: new Date() });
  const { data: relatorioPecas, isLoading: loadingPecas } = trpc.relatorios.topPecas.useQuery();
  const { data: relatorioClientes, isLoading: loadingClientes } = trpc.relatorios.clientesAtivos.useQuery();
  const { data: empresa } = trpc.empresa.get.useQuery();

  // Sincronização em tempo real
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    unsubscribers.push(
      subscribe(EVENTS.OS_CRIADA, () => {
        utils.relatorios.os.invalidate();
        setLastUpdate(new Date());
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.OS_ATUALIZADA, () => {
        utils.relatorios.os.invalidate();
        setLastUpdate(new Date());
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.PECA_CRIADA, () => {
        utils.relatorios.topPecas.invalidate();
        setLastUpdate(new Date());
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.CLIENTE_CRIADO, () => {
        utils.relatorios.clientesAtivos.invalidate();
        setLastUpdate(new Date());
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [subscribe, utils]);

  const exportarRelatorioOS = () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4a574; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #d4a574; margin-bottom: 5px; }
            .title { font-size: 18px; font-weight: bold; margin: 20px 0; }
            .section { margin: 20px 0; }
            .section-title { font-weight: bold; font-size: 14px; background-color: #f5f5f5; padding: 8px; margin-bottom: 10px; }
            .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .stat-box { padding: 15px; background-color: #f9f9f9; border-left: 4px solid #d4a574; }
            .stat-label { font-size: 12px; color: #666; }
            .stat-value { font-size: 24px; font-weight: bold; color: #333; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">${(empresa as any)?.nome || "LB MECÂNICA AUTOMOTIVA"}</div>
            <p style="margin: 5px 0; font-size: 12px; color: #666;">CNPJ: ${(empresa as any)?.cnpj || "—"}</p>
          </div>

          <div class="title">RELATÓRIO DE ORDENS DE SERVIÇO</div>

          <div class="stats">
            <div class="stat-box">
              <div class="stat-label">Total de OS</div>
              <div class="stat-value">${relatorioOS?.total || 0}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">OS Abertas</div>
              <div class="stat-value">${relatorioOS?.abertas || 0}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">OS em Andamento</div>
              <div class="stat-value">${relatorioOS?.emAndamento || 0}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">OS Concluídas</div>
              <div class="stat-value">${relatorioOS?.concluidas || 0}</div>
            </div>
          </div>

          <div class="footer">
            <p>Relatório gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
          </div>
        </body>
      </html>
    `;

    const element = document.createElement("div");
    element.innerHTML = htmlContent;

    const opt = {
      margin: 10,
      filename: `relatorio-os-${new Date().getTime()}.pdf`,
      image: { type: "png" as const },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    (html2pdf() as any).set(opt).from(element).save();
    toast.success("Relatório de OS exportado!");
  };

  const exportarRelatorioPecas = () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4a574; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #d4a574; margin-bottom: 5px; }
            .title { font-size: 18px; font-weight: bold; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #f5f5f5; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #d4a574; }
            td { padding: 8px; border-bottom: 1px solid #eee; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">${(empresa as any)?.nome || "LB MECÂNICA AUTOMOTIVA"}</div>
            <p style="margin: 5px 0; font-size: 12px; color: #666;">CNPJ: ${(empresa as any)?.cnpj || "—"}</p>
          </div>

          <div class="title">PEÇAS MAIS UTILIZADAS</div>

          <table>
            <thead>
              <tr>
                <th>Peça</th>
                <th>Quantidade de Usos</th>
              </tr>
            </thead>
            <tbody>
              ${(relatorioPecas as any[])?.map((p) => `
                <tr>
                  <td>${p.nome}</td>
                  <td>${p.quantidade}</td>
                </tr>
              `).join("") || "<tr><td colspan='2'>Sem dados</td></tr>"}
            </tbody>
          </table>

          <div class="footer">
            <p>Relatório gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
          </div>
        </body>
      </html>
    `;

    const element = document.createElement("div");
    element.innerHTML = htmlContent;

    const opt = {
      margin: 10,
      filename: `relatorio-pecas-${new Date().getTime()}.pdf`,
      image: { type: "png" as const },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    (html2pdf() as any).set(opt).from(element).save();
    toast.success("Relatório de peças exportado!");
  };

  const exportarRelatorioClientes = () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4a574; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #d4a574; margin-bottom: 5px; }
            .title { font-size: 18px; font-weight: bold; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #f5f5f5; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #d4a574; }
            td { padding: 8px; border-bottom: 1px solid #eee; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">${(empresa as any)?.nome || "LB MECÂNICA AUTOMOTIVA"}</div>
            <p style="margin: 5px 0; font-size: 12px; color: #666;">CNPJ: ${(empresa as any)?.cnpj || "—"}</p>
          </div>

          <div class="title">CLIENTES ATIVOS</div>

          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Número de OS</th>
              </tr>
            </thead>
            <tbody>
              ${(relatorioClientes as any[])?.map((c) => `
                <tr>
                  <td>${c.nome}</td>
                  <td>${c.osCount}</td>
                </tr>
              `).join("") || "<tr><td colspan='2'>Sem dados</td></tr>"}
            </tbody>
          </table>

          <div class="footer">
            <p>Relatório gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
          </div>
        </body>
      </html>
    `;

    const element = document.createElement("div");
    element.innerHTML = htmlContent;

    const opt = {
      margin: 10,
      filename: `relatorio-clientes-${new Date().getTime()}.pdf`,
      image: { type: "png" as const },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    (html2pdf() as any).set(opt).from(element).save();
    toast.success("Relatório de clientes exportado!");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground text-sm">
              {lastUpdate ? `Atualizado em ${lastUpdate.toLocaleTimeString("pt-BR")}` : "Sincronizando..."}
            </p>
          </div>
        </div>
      </div>

      {/* Relatório de OS */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Ordens de Serviço</CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={exportarRelatorioOS}
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingOS ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : relatorioOS ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-foreground">{relatorioOS.total}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-xs text-blue-400">Abertas</p>
                  <p className="text-lg font-bold text-blue-400">{relatorioOS.abertas}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <p className="text-xs text-amber-400">Em Andamento</p>
                  <p className="text-lg font-bold text-amber-400">{relatorioOS.emAndamento}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-xs text-green-400">Concluídas</p>
                  <p className="text-lg font-bold text-green-400">{relatorioOS.concluidas}</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Sem dados</p>
          )}
        </CardContent>
      </Card>

      {/* Relatório de Peças */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Peças Mais Utilizadas</CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={exportarRelatorioPecas}
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingPecas ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : relatorioPecas && (relatorioPecas as any[]).length > 0 ? (
            <div className="space-y-2">
              {(relatorioPecas as any[]).map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-secondary rounded">
                  <p className="text-sm text-foreground">{p.nome}</p>
                  <p className="text-sm font-medium text-muted-foreground">{p.quantidade} usos</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Sem dados</p>
          )}
        </CardContent>
      </Card>

      {/* Relatório de Clientes */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Clientes Ativos</CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={exportarRelatorioClientes}
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingClientes ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : relatorioClientes && (relatorioClientes as any[]).length > 0 ? (
            <div className="space-y-2">
              {(relatorioClientes as any[]).map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-secondary rounded">
                  <p className="text-sm text-foreground">{c.nome}</p>
                  <p className="text-sm font-medium text-muted-foreground">{c.osCount} OS</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Sem dados</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
