import jsPDF from 'jspdf';
import 'jspdf-autotable';

const logoUrl = '/logo.png';
const companyName = 'LB MECÂNICA AUTOMOTIVA';
const companyPhone = '(XX) XXXXX-XXXX';
const companyEmail = 'contato@lbmecanica.com';
const companyAddress = 'Rua Exemplo, 123 - Cidade, Estado';

// Função auxiliar para adicionar header
const addHeader = (doc, title) => {
  // Logo
  doc.addImage(logoUrl, 'PNG', 14, 10, 20, 20);
  
  // Título e informações da empresa
  doc.setFontSize(14);
  doc.setTextColor(255, 165, 0);
  doc.text(companyName, 40, 15);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(companyPhone, 40, 21);
  doc.text(companyEmail, 40, 26);
  
  // Título do documento
  doc.setFontSize(16);
  doc.setTextColor(26, 26, 26);
  doc.text(title, 14, 45);
  
  // Linha separadora
  doc.setDrawColor(255, 165, 0);
  doc.line(14, 48, 196, 48);
};

// Função auxiliar para adicionar footer
const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
};

// Gerar PDF de Ordem de Serviço
export const generateOSPDF = (osData) => {
  const doc = new jsPDF();
  
  addHeader(doc, 'ORDEM DE SERVIÇO');
  
  let yPosition = 55;
  
  // Informações da OS
  doc.setFontSize(11);
  doc.setTextColor(26, 26, 26);
  doc.text(`Nº OS: ${osData.numero || 'N/A'}`, 14, yPosition);
  doc.text(`Data: ${new Date(osData.data).toLocaleDateString('pt-BR')}`, 120, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.text(`Status: ${osData.status || 'Pendente'}`, 14, yPosition);
  doc.text(`Vencimento: ${new Date(osData.vencimento).toLocaleDateString('pt-BR')}`, 120, yPosition);
  
  // Informações do Cliente
  yPosition += 15;
  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('CLIENTE', 14, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  doc.text(`Nome: ${osData.cliente?.nome || 'N/A'}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Telefone: ${osData.cliente?.telefone || 'N/A'}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Email: ${osData.cliente?.email || 'N/A'}`, 14, yPosition);
  
  // Informações do Veículo
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('VEÍCULO', 14, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  doc.text(`Placa: ${osData.veiculo?.placa || 'N/A'}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Modelo: ${osData.veiculo?.modelo || 'N/A'}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Ano: ${osData.veiculo?.ano || 'N/A'}`, 14, yPosition);
  
  // Descrição dos Serviços
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('SERVIÇOS', 14, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  
  const servicos = osData.servicos || [];
  servicos.forEach((servico, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(`${index + 1}. ${servico.descricao || 'N/A'} - R$ ${(servico.valor || 0).toFixed(2)}`, 14, yPosition);
    yPosition += 5;
  });
  
  // Total
  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(255, 165, 0);
  doc.text(`TOTAL: R$ ${(osData.total || 0).toFixed(2)}`, 14, yPosition);
  
  addFooter(doc);
  
  doc.save(`OS_${osData.numero || 'documento'}.pdf`);
};

// Gerar PDF de Orçamento
export const generateOrcamentoPDF = (orcamentoData) => {
  const doc = new jsPDF();
  
  addHeader(doc, 'ORÇAMENTO');
  
  let yPosition = 55;
  
  // Informações do Orçamento
  doc.setFontSize(11);
  doc.setTextColor(26, 26, 26);
  doc.text(`Nº Orçamento: ${orcamentoData.numero || 'N/A'}`, 14, yPosition);
  doc.text(`Data: ${new Date(orcamentoData.data).toLocaleDateString('pt-BR')}`, 120, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.text(`Validade: ${new Date(orcamentoData.validade).toLocaleDateString('pt-BR')}`, 14, yPosition);
  doc.text(`Status: ${orcamentoData.status || 'Pendente'}`, 120, yPosition);
  
  // Informações do Cliente
  yPosition += 15;
  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('CLIENTE', 14, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  doc.text(`Nome: ${orcamentoData.cliente?.nome || 'N/A'}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Telefone: ${orcamentoData.cliente?.telefone || 'N/A'}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Email: ${orcamentoData.cliente?.email || 'N/A'}`, 14, yPosition);
  
  // Informações do Veículo
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('VEÍCULO', 14, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  doc.text(`Placa: ${orcamentoData.veiculo?.placa || 'N/A'}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Modelo: ${orcamentoData.veiculo?.modelo || 'N/A'}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Ano: ${orcamentoData.veiculo?.ano || 'N/A'}`, 14, yPosition);
  
  // Descrição dos Serviços
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('SERVIÇOS ORÇADOS', 14, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  
  const servicos = orcamentoData.servicos || [];
  servicos.forEach((servico, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(`${index + 1}. ${servico.descricao || 'N/A'} - R$ ${(servico.valor || 0).toFixed(2)}`, 14, yPosition);
    yPosition += 5;
  });
  
  // Total
  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(255, 165, 0);
  doc.text(`TOTAL DO ORÇAMENTO: R$ ${(orcamentoData.total || 0).toFixed(2)}`, 14, yPosition);
  
  yPosition += 10;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Este orçamento é válido conforme data acima. Sujeito a alterações sem aviso prévio.', 14, yPosition);
  
  addFooter(doc);
  
  doc.save(`Orcamento_${orcamentoData.numero || 'documento'}.pdf`);
};

// Gerar PDF de Garantia
export const generateGarantiaPDF = (garantiaData) => {
  const doc = new jsPDF();
  
  addHeader(doc, 'CERTIFICADO DE GARANTIA');
  
  let yPosition = 55;
  
  // Informações da Garantia
  doc.setFontSize(11);
  doc.setTextColor(26, 26, 26);
  doc.text(`Nº Certificado: ${garantiaData.numero || 'N/A'}`, 14, yPosition);
  doc.text(`Data de Emissão: ${new Date(garantiaData.dataEmissao).toLocaleDateString('pt-BR')}`, 120, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.text(`Período de Garantia: ${garantiaData.periodo || 'N/A'}`, 14, yPosition);
  doc.text(`Vencimento: ${new Date(garantiaData.vencimento).toLocaleDateString('pt-BR')}`, 120, yPosition);
  
  // Informações do Cliente
  yPosition += 15;
  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('CLIENTE', 14, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  doc.text(`Nome: ${garantiaData.cliente?.nome || 'N/A'}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Telefone: ${garantiaData.cliente?.telefone || 'N/A'}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Email: ${garantiaData.cliente?.email || 'N/A'}`, 14, yPosition);
  
  // Informações do Veículo
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('VEÍCULO', 14, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  doc.text(`Placa: ${garantiaData.veiculo?.placa || 'N/A'}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Modelo: ${garantiaData.veiculo?.modelo || 'N/A'}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Ano: ${garantiaData.veiculo?.ano || 'N/A'}`, 14, yPosition);
  
  // Serviços com Garantia
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('SERVIÇOS COM GARANTIA', 14, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  
  const servicos = garantiaData.servicos || [];
  servicos.forEach((servico, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(`${index + 1}. ${servico.descricao || 'N/A'}`, 14, yPosition);
    yPosition += 5;
  });
  
  // Termos e Condições
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('TERMOS E CONDIÇÕES', 14, yPosition);
  
  yPosition += 7;
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  
  const terms = [
    '• A garantia cobre defeitos de fabricação e mão de obra.',
    '• Não cobre desgaste natural ou uso inadequado.',
    '• Válida apenas com apresentação deste certificado.',
    '• Sujeita aos termos e condições da empresa.'
  ];
  
  terms.forEach(term => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(term, 14, yPosition);
    yPosition += 5;
  });
  
  addFooter(doc);
  
  doc.save(`Garantia_${garantiaData.numero || 'documento'}.pdf`);
};

export default {
  generateOSPDF,
  generateOrcamentoPDF,
  generateGarantiaPDF
};
