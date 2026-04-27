import { eq, desc, and, gte, lte, sql, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  clientes, InsertCliente,
  veiculos, InsertVeiculo,
  pecas, InsertPeca,
  ordensServico, InsertOrdemServico,
  osItens, InsertOsItem,
  osFotos,
  orcamentos, InsertOrcamento,
  orcamentoItens,
  financeiro, InsertFinanceiro,
  fechamentosCaixa,
  garantias, InsertGarantia,
  empresa,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  await db.insert(users).values({ ...user, lastSignedIn: user.lastSignedIn ?? new Date() })
    .onDuplicateKeyUpdate({ set: { name: user.name, email: user.email, lastSignedIn: new Date() } });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Empresa ─────────────────────────────────────────────────────────────────
export async function getEmpresa() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(empresa).limit(1);
  return result[0] ?? null;
}

export async function upsertEmpresa(data: Partial<typeof empresa.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;
  const existing = await getEmpresa();
  if (existing) {
    await db.update(empresa).set(data).where(eq(empresa.id, existing.id));
    return { ...existing, ...data };
  } else {
    await db.insert(empresa).values({ nome: "LB Mecânica Automotiva", ...data });
    return await getEmpresa();
  }
}

// ─── Clientes ─────────────────────────────────────────────────────────────────
export async function listClientes(search?: string) {
  const db = await getDb();
  if (!db) return [];
  if (search) {
    return db.select().from(clientes)
      .where(or(like(clientes.nome, `%${search}%`), like(clientes.cpfCnpj, `%${search}%`), like(clientes.telefone, `%${search}%`)))
      .orderBy(desc(clientes.createdAt));
  }
  return db.select().from(clientes).orderBy(desc(clientes.createdAt));
}

export async function getCliente(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createCliente(data: InsertCliente) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(clientes).values(data);
  return result[0];
}

export async function updateCliente(id: number, data: Partial<InsertCliente>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(clientes).set(data).where(eq(clientes.id, id));
  return getCliente(id);
}

export async function deleteCliente(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(clientes).where(eq(clientes.id, id));
}

// ─── Veículos ─────────────────────────────────────────────────────────────────
export async function listVeiculos(clienteId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (clienteId) {
    return db.select().from(veiculos).where(eq(veiculos.clienteId, clienteId)).orderBy(desc(veiculos.createdAt));
  }
  return db.select().from(veiculos).orderBy(desc(veiculos.createdAt));
}

export async function getVeiculo(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(veiculos).where(eq(veiculos.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createVeiculo(data: InsertVeiculo) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(veiculos).values(data);
  const result = await db.select().from(veiculos).where(eq(veiculos.clienteId, data.clienteId)).orderBy(desc(veiculos.createdAt)).limit(1);
  return result[0];
}

export async function updateVeiculo(id: number, data: Partial<InsertVeiculo>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(veiculos).set(data).where(eq(veiculos.id, id));
  return getVeiculo(id);
}

export async function deleteVeiculo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(veiculos).where(eq(veiculos.id, id));
}

// ─── Peças ────────────────────────────────────────────────────────────────────
export async function listPecas(search?: string) {
  const db = await getDb();
  if (!db) return [];
  if (search) {
    return db.select().from(pecas)
      .where(or(like(pecas.nome, `%${search}%`), like(pecas.codigo, `%${search}%`)))
      .orderBy(desc(pecas.createdAt));
  }
  return db.select().from(pecas).orderBy(desc(pecas.createdAt));
}

export async function getPeca(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(pecas).where(eq(pecas.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createPeca(data: InsertPeca) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(pecas).values(data);
  const result = await db.select().from(pecas).orderBy(desc(pecas.createdAt)).limit(1);
  return result[0];
}

export async function updatePeca(id: number, data: Partial<InsertPeca>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(pecas).set(data).where(eq(pecas.id, id));
  return getPeca(id);
}

export async function deletePeca(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(pecas).where(eq(pecas.id, id));
}

// ─── Ordens de Serviço ────────────────────────────────────────────────────────
export async function listOS(filters?: { status?: string; clienteId?: number; veiculoId?: number; dataInicio?: Date; dataFim?: Date }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.status) conditions.push(eq(ordensServico.status, filters.status as any));
  if (filters?.clienteId) conditions.push(eq(ordensServico.clienteId, filters.clienteId));
  if (filters?.veiculoId) conditions.push(eq(ordensServico.veiculoId, filters.veiculoId));
  if (filters?.dataInicio) conditions.push(gte(ordensServico.dataEntrada, filters.dataInicio));
  if (filters?.dataFim) conditions.push(lte(ordensServico.dataEntrada, filters.dataFim));
  const query = conditions.length > 0
    ? db.select().from(ordensServico).where(and(...conditions)).orderBy(desc(ordensServico.createdAt))
    : db.select().from(ordensServico).orderBy(desc(ordensServico.createdAt));
  return query;
}

export async function getOS(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(ordensServico).where(eq(ordensServico.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createOS(data: InsertOrdemServico) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const count = await db.select({ count: sql<number>`count(*)` }).from(ordensServico);
  const num = (Number(count[0]?.count) || 0) + 1;
  const numero = `OS${String(num).padStart(5, "0")}`;
  await db.insert(ordensServico).values({ ...data, numero });
  const result = await db.select().from(ordensServico).orderBy(desc(ordensServico.createdAt)).limit(1);
  return result[0];
}

export async function updateOS(id: number, data: Partial<InsertOrdemServico>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(ordensServico).set(data).where(eq(ordensServico.id, id));
  return getOS(id);
}

export async function deleteOS(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(ordensServico).where(eq(ordensServico.id, id));
}

// ─── Itens da OS ──────────────────────────────────────────────────────────────
export async function listOsItens(osId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(osItens).where(eq(osItens.osId, osId)).orderBy(osItens.id);
}

export async function createOsItem(data: InsertOsItem) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(osItens).values(data);
  const result = await db.select().from(osItens).where(eq(osItens.osId, data.osId)).orderBy(desc(osItens.id)).limit(1);
  return result[0];
}

export async function deleteOsItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(osItens).where(eq(osItens.id, id));
}

export async function deleteOsItensByOs(osId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(osItens).where(eq(osItens.osId, osId));
}

// ─── Fotos da OS ──────────────────────────────────────────────────────────────
export async function listOsFotos(osId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(osFotos).where(eq(osFotos.osId, osId)).orderBy(osFotos.id);
}

export async function createOsFoto(data: typeof osFotos.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(osFotos).values(data);
  const result = await db.select().from(osFotos).where(eq(osFotos.osId, data.osId)).orderBy(desc(osFotos.id)).limit(1);
  return result[0];
}

export async function deleteOsFoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(osFotos).where(eq(osFotos.id, id));
}

// ─── Orçamentos ───────────────────────────────────────────────────────────────
export async function listOrcamentos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orcamentos).orderBy(desc(orcamentos.createdAt));
}

export async function getOrcamento(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orcamentos).where(eq(orcamentos.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createOrcamento(data: InsertOrcamento) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const count = await db.select({ count: sql<number>`count(*)` }).from(orcamentos);
  const num = (Number(count[0]?.count) || 0) + 1;
  const numero = `ORC${String(num).padStart(5, "0")}`;
  await db.insert(orcamentos).values({ ...data, numero });
  const result = await db.select().from(orcamentos).orderBy(desc(orcamentos.createdAt)).limit(1);
  return result[0];
}

export async function updateOrcamento(id: number, data: Partial<InsertOrcamento>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(orcamentos).set(data).where(eq(orcamentos.id, id));
  return getOrcamento(id);
}

export async function deleteOrcamento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(orcamentos).where(eq(orcamentos.id, id));
}

export async function listOrcamentoItens(orcamentoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orcamentoItens).where(eq(orcamentoItens.orcamentoId, orcamentoId)).orderBy(orcamentoItens.id);
}

export async function createOrcamentoItem(data: typeof orcamentoItens.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(orcamentoItens).values(data);
  const result = await db.select().from(orcamentoItens).where(eq(orcamentoItens.orcamentoId, data.orcamentoId)).orderBy(desc(orcamentoItens.id)).limit(1);
  return result[0];
}

export async function deleteOrcamentoItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(orcamentoItens).where(eq(orcamentoItens.id, id));
}

export async function deleteOrcamentoItensByOrcamento(orcamentoId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(orcamentoItens).where(eq(orcamentoItens.orcamentoId, orcamentoId));
}

// ─── Financeiro ───────────────────────────────────────────────────────────────
export async function listFinanceiro(filters?: { tipo?: string; dataInicio?: Date; dataFim?: Date }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.tipo) conditions.push(eq(financeiro.tipo, filters.tipo as any));
  if (filters?.dataInicio) conditions.push(gte(financeiro.data, filters.dataInicio));
  if (filters?.dataFim) conditions.push(lte(financeiro.data, filters.dataFim));
  const query = conditions.length > 0
    ? db.select().from(financeiro).where(and(...conditions)).orderBy(desc(financeiro.data))
    : db.select().from(financeiro).orderBy(desc(financeiro.data));
  return query;
}

export async function createFinanceiro(data: InsertFinanceiro) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(financeiro).values(data);
  const result = await db.select().from(financeiro).orderBy(desc(financeiro.createdAt)).limit(1);
  return result[0];
}

export async function updateFinanceiro(id: number, data: Partial<InsertFinanceiro>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(financeiro).set(data).where(eq(financeiro.id, id));
}

export async function deleteFinanceiro(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(financeiro).where(eq(financeiro.id, id));
}

export async function getResumoFinanceiro(dataInicio: Date, dataFim: Date) {
  const db = await getDb();
  if (!db) return { receitas: 0, despesas: 0, saldo: 0 };
  const items = await db.select().from(financeiro)
    .where(and(gte(financeiro.data, dataInicio), lte(financeiro.data, dataFim)));
  const receitas = items.filter(i => i.tipo === "receita").reduce((s, i) => s + Number(i.valor), 0);
  const despesas = items.filter(i => i.tipo === "despesa").reduce((s, i) => s + Number(i.valor), 0);
  return { receitas, despesas, saldo: receitas - despesas };
}

export async function createFechamentoCaixa(data: typeof fechamentosCaixa.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(fechamentosCaixa).values(data);
  const result = await db.select().from(fechamentosCaixa).orderBy(desc(fechamentosCaixa.createdAt)).limit(1);
  return result[0];
}

export async function listFechamentosCaixa() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fechamentosCaixa).orderBy(desc(fechamentosCaixa.createdAt));
}

// ─── Garantias ────────────────────────────────────────────────────────────────
export async function listGarantias() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(garantias).orderBy(desc(garantias.createdAt));
}

export async function getGarantia(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(garantias).where(eq(garantias.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createGarantia(data: InsertGarantia) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const count = await db.select({ count: sql<number>`count(*)` }).from(garantias);
  const num = (Number(count[0]?.count) || 0) + 1;
  const numero = `GAR${String(num).padStart(5, "0")}`;
  await db.insert(garantias).values({ ...data, numero });
  const result = await db.select().from(garantias).orderBy(desc(garantias.createdAt)).limit(1);
  return result[0];
}

export async function updateGarantia(id: number, data: Partial<InsertGarantia>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(garantias).set(data).where(eq(garantias.id, id));
  return getGarantia(id);
}

// ─── Relatórios ───────────────────────────────────────────────────────────────
export async function getRelatorioOS(dataInicio: Date, dataFim: Date) {
  const db = await getDb();
  if (!db) return { total: 0, abertas: 0, emAndamento: 0, concluidas: 0, canceladas: 0, lista: [] };
  const lista = await db.select().from(ordensServico)
    .where(and(gte(ordensServico.dataEntrada, dataInicio), lte(ordensServico.dataEntrada, dataFim)))
    .orderBy(desc(ordensServico.dataEntrada));
  return {
    total: lista.length,
    abertas: lista.filter(o => o.status === 'aberta').length,
    emAndamento: lista.filter(o => o.status === 'em_andamento').length,
    concluidas: lista.filter(o => o.status === 'concluida').length,
    canceladas: lista.filter(o => o.status === 'cancelada').length,
    lista,
  };
}

export async function getTopPecas() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    pecaId: osItens.pecaId,
    descricao: osItens.descricao,
    total: sql<number>`sum(${osItens.quantidade})`,
  }).from(osItens).where(eq(osItens.tipo, "peca")).groupBy(osItens.pecaId, osItens.descricao).orderBy(desc(sql`sum(${osItens.quantidade})`)).limit(10);
  return result;
}

export async function getClientesAtivos() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    clienteId: ordensServico.clienteId,
    totalOS: sql<number>`count(*)`,
  }).from(ordensServico).groupBy(ordensServico.clienteId).orderBy(desc(sql`count(*)`)).limit(10);
  return result;
}
