import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users (auth local) ───────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Empresa ─────────────────────────────────────────────────────────────────
export const empresa = mysqlTable("empresa", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull().default("LB Mecânica Automotiva"),
  cnpj: varchar("cnpj", { length: 20 }),
  endereco: text("endereco"),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 200 }),
  logoUrl: text("logoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Empresa = typeof empresa.$inferSelect;

// ─── Clientes ─────────────────────────────────────────────────────────────────
export const clientes = mysqlTable("clientes", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull(),
  telefone: varchar("telefone", { length: 20 }),
  cpfCnpj: varchar("cpfCnpj", { length: 20 }),
  email: varchar("email", { length: 200 }),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 10 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;

// ─── Veículos ─────────────────────────────────────────────────────────────────
export const veiculos = mysqlTable("veiculos", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("clienteId").notNull(),
  placa: varchar("placa", { length: 10 }).notNull(),
  modelo: varchar("modelo", { length: 100 }).notNull(),
  marca: varchar("marca", { length: 100 }),
  ano: varchar("ano", { length: 4 }),
  cor: varchar("cor", { length: 50 }),
  km: varchar("km", { length: 20 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Veiculo = typeof veiculos.$inferSelect;
export type InsertVeiculo = typeof veiculos.$inferInsert;

// ─── Peças ────────────────────────────────────────────────────────────────────
export const pecas = mysqlTable("pecas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull(),
  codigo: varchar("codigo", { length: 50 }),
  descricao: text("descricao"),
  quantidade: int("quantidade").notNull().default(0),
  precoCompra: decimal("precoCompra", { precision: 10, scale: 2 }).notNull().default("0"),
  precoVenda: decimal("precoVenda", { precision: 10, scale: 2 }).notNull().default("0"),
  unidade: varchar("unidade", { length: 20 }).default("un"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Peca = typeof pecas.$inferSelect;
export type InsertPeca = typeof pecas.$inferInsert;

// ─── Ordens de Serviço ────────────────────────────────────────────────────────
export const ordensServico = mysqlTable("ordensServico", {
  id: int("id").autoincrement().primaryKey(),
  numero: varchar("numero", { length: 20 }).notNull(),
  clienteId: int("clienteId").notNull(),
  veiculoId: int("veiculoId").notNull(),
  status: mysqlEnum("status", ["aberta", "em_andamento", "concluida", "cancelada"]).default("aberta").notNull(),
  descricaoProblema: text("descricaoProblema"),
  servicosRealizados: text("servicosRealizados"),
  observacoes: text("observacoes"),
  kmEntrada: varchar("kmEntrada", { length: 20 }),
  kmSaida: varchar("kmSaida", { length: 20 }),
  previsaoEntrega: timestamp("previsaoEntrega"),
  dataEntrada: timestamp("dataEntrada").defaultNow().notNull(),
  dataConclusao: timestamp("dataConclusao"),
  valorServicos: decimal("valorServicos", { precision: 10, scale: 2 }).default("0"),
  valorPecas: decimal("valorPecas", { precision: 10, scale: 2 }).default("0"),
  desconto: decimal("desconto", { precision: 10, scale: 2 }).default("0"),
  valorTotal: decimal("valorTotal", { precision: 10, scale: 2 }).default("0"),
  formaPagamento: varchar("formaPagamento", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OrdemServico = typeof ordensServico.$inferSelect;
export type InsertOrdemServico = typeof ordensServico.$inferInsert;

// ─── Itens da OS ──────────────────────────────────────────────────────────────
export const osItens = mysqlTable("osItens", {
  id: int("id").autoincrement().primaryKey(),
  osId: int("osId").notNull(),
  tipo: mysqlEnum("tipo", ["servico", "peca"]).notNull(),
  descricao: varchar("descricao", { length: 300 }).notNull(),
  pecaId: int("pecaId"),
  quantidade: decimal("quantidade", { precision: 10, scale: 2 }).notNull().default("1"),
  valorUnitario: decimal("valorUnitario", { precision: 10, scale: 2 }).notNull().default("0"),
  valorTotal: decimal("valorTotal", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OsItem = typeof osItens.$inferSelect;
export type InsertOsItem = typeof osItens.$inferInsert;

// ─── Fotos da OS ──────────────────────────────────────────────────────────────
export const osFotos = mysqlTable("osFotos", {
  id: int("id").autoincrement().primaryKey(),
  osId: int("osId").notNull(),
  etapa: mysqlEnum("etapa", ["antes", "durante", "depois"]).notNull(),
  url: text("url").notNull(),
  fileKey: text("fileKey").notNull(),
  descricao: varchar("descricao", { length: 300 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OsFoto = typeof osFotos.$inferSelect;

// ─── Orçamentos ───────────────────────────────────────────────────────────────
export const orcamentos = mysqlTable("orcamentos", {
  id: int("id").autoincrement().primaryKey(),
  numero: varchar("numero", { length: 20 }).notNull(),
  clienteId: int("clienteId").notNull(),
  veiculoId: int("veiculoId").notNull(),
  status: mysqlEnum("status", ["pendente", "aprovado", "reprovado", "expirado"]).default("pendente").notNull(),
  descricao: text("descricao"),
  observacoes: text("observacoes"),
  validadeAte: timestamp("validadeAte"),
  valorServicos: decimal("valorServicos", { precision: 10, scale: 2 }).default("0"),
  valorPecas: decimal("valorPecas", { precision: 10, scale: 2 }).default("0"),
  desconto: decimal("desconto", { precision: 10, scale: 2 }).default("0"),
  valorTotal: decimal("valorTotal", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Orcamento = typeof orcamentos.$inferSelect;
export type InsertOrcamento = typeof orcamentos.$inferInsert;

// ─── Itens do Orçamento ───────────────────────────────────────────────────────
export const orcamentoItens = mysqlTable("orcamentoItens", {
  id: int("id").autoincrement().primaryKey(),
  orcamentoId: int("orcamentoId").notNull(),
  tipo: mysqlEnum("tipo", ["servico", "peca"]).notNull(),
  descricao: varchar("descricao", { length: 300 }).notNull(),
  pecaId: int("pecaId"),
  quantidade: decimal("quantidade", { precision: 10, scale: 2 }).notNull().default("1"),
  valorUnitario: decimal("valorUnitario", { precision: 10, scale: 2 }).notNull().default("0"),
  valorTotal: decimal("valorTotal", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrcamentoItem = typeof orcamentoItens.$inferSelect;

// ─── Financeiro ───────────────────────────────────────────────────────────────
export const financeiro = mysqlTable("financeiro", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", ["receita", "despesa"]).notNull(),
  categoria: varchar("categoria", { length: 100 }),
  descricao: varchar("descricao", { length: 300 }).notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  data: timestamp("data").defaultNow().notNull(),
  osId: int("osId"),
  formaPagamento: varchar("formaPagamento", { length: 50 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Financeiro = typeof financeiro.$inferSelect;
export type InsertFinanceiro = typeof financeiro.$inferInsert;

// ─── Fechamento de Caixa ──────────────────────────────────────────────────────
export const fechamentosCaixa = mysqlTable("fechamentosCaixa", {
  id: int("id").autoincrement().primaryKey(),
  dataInicio: timestamp("dataInicio").notNull(),
  dataFim: timestamp("dataFim").notNull(),
  totalReceitas: decimal("totalReceitas", { precision: 10, scale: 2 }).default("0"),
  totalDespesas: decimal("totalDespesas", { precision: 10, scale: 2 }).default("0"),
  saldoFinal: decimal("saldoFinal", { precision: 10, scale: 2 }).default("0"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FechamentoCaixa = typeof fechamentosCaixa.$inferSelect;

// ─── Garantias ────────────────────────────────────────────────────────────────
export const garantias = mysqlTable("garantias", {
  id: int("id").autoincrement().primaryKey(),
  osId: int("osId").notNull(),
  clienteId: int("clienteId").notNull(),
  veiculoId: int("veiculoId").notNull(),
  numero: varchar("numero", { length: 20 }).notNull(),
  dataEmissao: timestamp("dataEmissao").defaultNow().notNull(),
  dataVencimento: timestamp("dataVencimento").notNull(),
  servicosGarantidos: text("servicosGarantidos").notNull(),
  condicoesGarantia: text("condicoesGarantia"),
  assinaturaCliente: text("assinaturaCliente"),
  assinaturaResponsavel: text("assinaturaResponsavel"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Garantia = typeof garantias.$inferSelect;
export type InsertGarantia = typeof garantias.$inferInsert;
