import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useWebSocket, EVENTS } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import html2pdf from "html2pdf.js";

export default function PainelGarantias() {
  const { subscribe } = useWebSocket();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [viewingGarantia, setViewingGarantia] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data: garantias = [], isLoading } = trpc.garantias.list.useQuery();
  const { data: clientes = [] } = trpc.clientes.list.useQuery();
  const { data: osList = [] } = trpc.os.list.useQuery();
  const { data: empresa } = trpc.empresa.get.useQuery();

  // Sincronização em tempo real
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    unsubscribers.push(
      subscribe(EVENTS.GARANTIA_CRIADA, () => {
        utils.garantias.list.invalidate();
        setLastUpdate(new Date());
      })
    );
    unsubscribers.push(
      subscribe(EVENTS.GARANTIA_ATUALIZADA, () => {
        utils.garantias.list.invalidate();
        setLastUpdate(new Date());
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [subscribe, utils]);

  const getClienteNome = (id: number) => (clientes as any[]).find((c) => c.id === id)?.nome || "—";
  const getClienteData = (id: number) => (clientes as any[]).find((c) => c.id === id);
  const getOSData = (id: number) => (osList as any[]).find((o) => o.id === id);

  const isValida = (dataEmissao: string) => {
    const emissao = new Date(dataEmissao);
    const vencimento = new Date(emissao.getTime() + 90 * 24 * 60 * 60 * 1000);
    return vencimento > new Date();
  };

  const exportarPDF = (garantia: any) => {
    const cliente = getClienteData(garantia.clienteId);
    const os = getOSData(garantia.osId);

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4a574; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #d4a574; margin-bottom: 5px; }
            .title { font-size: 20px; font-weight: bold; margin: 20px 0; }
            .section { margin: 20px 0; }
            .section-title { font-weight: bold; font-size: 14px; background-color: #f5f5f5; padding: 8px; margin-bottom: 10px; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .signature-area { margin-top: 40px; display: flex; justify-content: space-between; }
            .signature-line { width: 200px; text-align: center; border-top: 1px solid #333; margin-top: 30px; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">${(empresa as any)?.nome || "LB MECÂNICA AUTOMOTIVA"}</div>
            <p style="margin: 5px 0; font-size: 12px; color: #666;">CNPJ: ${(empresa as any)?.cnpj || "—"}</p>
            <p style="margin: 5px 0; font-size: 12px; color: #666;">${(empresa as any)?.endereco || "—"}</p>
            <p style="margin: 5px 0; font-size: 12px; color: #666;">Tel: ${(empresa as any)?.telefone || "—"}</p>
          </div>

          <div class="title">TERMO DE GARANTIA - 90 DIAS</div>

          <div class="section">
            <div class="section-title">DADOS DO CLIENTE</div>
            <div class="info-row">
              <span class="label">Nome:</span>
              <span class="value">${cliente?.nome || "—"}</span>
            </div>
            <div class="info-row">
              <span class="label">CPF/CNPJ:</span>
              <span class="value">${cliente?.cpfCnpj || "—"}</span>
            </div>
            <div class="info-row">
              <span class="label">Telefone:</span>
              <span class="value">${cliente?.telefone || "—"}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${cliente?.email || "—"}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">DADOS DO VEÍCULO</div>
            <div class="info-row">
              <span class="label">Placa:</span>
              <span class="value">${os?.placa || "—"}</span>
            </div>
            <div class="info-row">
              <span class="label">Modelo:</span>
              <span class="value">${os?.modelo || "—"}</span>
            </div>
            <div class="info-row">
              <span class="label">Marca:</span>
              <span class="value">${os?.marca || "—"}</span>
            </div>
            <div class="info-row">
              <span class="label">Ano:</span>
              <span class="value">${os?.ano || "—"}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">SERVIÇOS REALIZADOS</div>
            <p style="white-space: pre-wrap; font-size: 12px;">${garantia.descricaoServicos || "Serviços conforme ordem de serviço"}</p>
          </div>

          <div class="section">
            <div class="section-title">CONDIÇÕES DE GARANTIA</div>
            <p style="font-size: 12px; line-height: 1.6;">
              A LB Mecânica Automotiva garante os serviços realizados pelo período de 90 (noventa) dias a partir da data de emissão deste termo.
              A garantia cobre defeitos de mão de obra e não cobre desgaste natural, falta de manutenção ou uso inadequado do veículo.
            </p>
          </div>

          <div class="section">
            <div class="section-title">INFORMAÇÕES ADICIONAIS</div>
            <div class="info-row">
              <span class="label">Data de Emissão:</span>
              <span class="value">${new Date(garantia.dataEmissao).toLocaleDateString("pt-BR")}</span>
            </div>
            <div class="info-row">
              <span class="label">Data de Vencimento:</span>
              <span class="value">${new Date(new Date(garantia.dataEmissao).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value">${isValida(garantia.dataEmissao) ? "VÁLIDA" : "EXPIRADA"}</span>
            </div>
          </div>

          <div class="signature-area">
            <div class="signature-line">
              <p style="margin: 0; font-size: 12px;">Assinatura do Cliente</p>
            </div>
            <div class="signature-line">
              <p style="margin: 0; font-size: 12px;">Assinatura da Oficina</p>
            </div>
          </div>

          <div class="footer">
            <p>Documento gerado automaticamente pelo sistema LB Mecânica Automotiva</p>
            <p>Garantia válida apenas com apresentação deste termo</p>
          </div>
        </body>
      </html>
    `;

    const element = document.createElement("div");
    element.innerHTML = htmlContent;

    const opt = {
      margin: 10,
      filename: `garantia-${garantia.id}.pdf`,
      image: { type: "png" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    (html2pdf() as any).set(opt).from(element).save();
    toast.success("PDF gerado com sucesso!");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Garantias</h1>
            <p className="text-muted-foreground text-sm">
              {lastUpdate ? `Atualizado em ${lastUpdate.toLocaleTimeString("pt-BR")}` : "Sincronizando..."}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : garantias.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma garantia encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Nº OS
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Data Emissão
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(garantias as any[]).map((g) => {
                  const valida = isValida(g.dataEmissao);
                  return (
                    <tr key={g.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground text-sm">{getClienteNome(g.clienteId)}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-muted-foreground">#{getOSData(g.osId)?.numero || "—"}</p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-sm text-muted-foreground">{new Date(g.dataEmissao).toLocaleDateString("pt-BR")}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            valida ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          )}
                        >
                          {valida ? "Válida" : "Expirada"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-400"
                            onClick={() => setViewingGarantia(g.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-green-400"
                            onClick={() => exportarPDF(g)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
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

      {/* Modal de Visualização */}
      {viewingGarantia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Visualizar Garantia</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingGarantia(null)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              {(() => {
                const g = (garantias as any[]).find((x) => x.id === viewingGarantia);
                if (!g) return null;

                const cliente = getClienteData(g.clienteId);
                const os = getOSData(g.osId);
                const valida = isValida(g.dataEmissao);

                return (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-foreground mb-2">Cliente</h3>
                      <p className="text-sm text-muted-foreground">{cliente?.nome}</p>
                      <p className="text-sm text-muted-foreground">CPF/CNPJ: {cliente?.cpfCnpj}</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-foreground mb-2">Veículo</h3>
                      <p className="text-sm text-muted-foreground">Placa: {os?.placa}</p>
                      <p className="text-sm text-muted-foreground">Modelo: {os?.modelo} {os?.marca}</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-foreground mb-2">Informações</h3>
                      <p className="text-sm text-muted-foreground">
                        Emissão: {new Date(g.dataEmissao).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {new Date(new Date(g.dataEmissao).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}
                      </p>
                      <p className={cn("text-sm font-medium mt-2", valida ? "text-green-400" : "text-red-400")}>
                        Status: {valida ? "VÁLIDA" : "EXPIRADA"}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Button
                        className="w-full gap-2"
                        onClick={() => {
                          exportarPDF(g);
                          setViewingGarantia(null);
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Baixar PDF
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
