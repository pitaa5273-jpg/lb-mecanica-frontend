import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock do banco de dados
vi.mock("./db", () => ({
  getEmpresa: vi.fn().mockResolvedValue({ id: 1, nome: "LB Mecânica Automotiva", cnpj: "00.000.000/0001-00" }),
  upsertEmpresa: vi.fn().mockResolvedValue({ id: 1, nome: "LB Mecânica Automotiva" }),
  listClientes: vi.fn().mockResolvedValue([{ id: 1, nome: "João Silva", telefone: "11999999999" }]),
  getCliente: vi.fn().mockResolvedValue({ id: 1, nome: "João Silva" }),
  createCliente: vi.fn().mockResolvedValue({ id: 2, nome: "Maria Santos" }),
  updateCliente: vi.fn().mockResolvedValue({ id: 1, nome: "João Silva Atualizado" }),
  deleteCliente: vi.fn().mockResolvedValue(true),
  listVeiculos: vi.fn().mockResolvedValue([{ id: 1, placa: "ABC-1234", modelo: "Civic", marca: "Honda" }]),
  getVeiculo: vi.fn().mockResolvedValue({ id: 1, placa: "ABC-1234" }),
  createVeiculo: vi.fn().mockResolvedValue({ id: 2, placa: "XYZ-9876" }),
  updateVeiculo: vi.fn().mockResolvedValue({ id: 1 }),
  deleteVeiculo: vi.fn().mockResolvedValue(true),
  listPecas: vi.fn().mockResolvedValue([{ id: 1, nome: "Filtro de Óleo", precoVenda: "45.00" }]),
  getPeca: vi.fn().mockResolvedValue({ id: 1, nome: "Filtro de Óleo" }),
  createPeca: vi.fn().mockResolvedValue({ id: 2, nome: "Pastilha de Freio" }),
  updatePeca: vi.fn().mockResolvedValue({ id: 1 }),
  deletePeca: vi.fn().mockResolvedValue(true),
  listOS: vi.fn().mockResolvedValue([]),
  getOS: vi.fn().mockResolvedValue(null),
  createOS: vi.fn().mockResolvedValue({ id: 1, numero: "OS-2024-0001" }),
  updateOS: vi.fn().mockResolvedValue({ id: 1 }),
  deleteOS: vi.fn().mockResolvedValue(true),
  listOsItens: vi.fn().mockResolvedValue([]),
  createOsItem: vi.fn().mockResolvedValue({ id: 1 }),
  deleteOsItem: vi.fn().mockResolvedValue(true),
  listOsFotos: vi.fn().mockResolvedValue([]),
  createOsFoto: vi.fn().mockResolvedValue({ id: 1 }),
  deleteOsFoto: vi.fn().mockResolvedValue(true),
  listOrcamentos: vi.fn().mockResolvedValue([]),
  getOrcamento: vi.fn().mockResolvedValue(null),
  createOrcamento: vi.fn().mockResolvedValue({ id: 1, numero: "ORC-2024-0001" }),
  updateOrcamento: vi.fn().mockResolvedValue({ id: 1 }),
  deleteOrcamento: vi.fn().mockResolvedValue(true),
  listOrcamentoItens: vi.fn().mockResolvedValue([]),
  createOrcamentoItem: vi.fn().mockResolvedValue({ id: 1 }),
  deleteOrcamentoItem: vi.fn().mockResolvedValue(true),
  deleteOrcamentoItensByOrcamento: vi.fn().mockResolvedValue(true),
  listFinanceiro: vi.fn().mockResolvedValue([]),
  createFinanceiro: vi.fn().mockResolvedValue({ id: 1 }),
  updateFinanceiro: vi.fn().mockResolvedValue({ id: 1 }),
  deleteFinanceiro: vi.fn().mockResolvedValue(true),
  getResumoFinanceiro: vi.fn().mockResolvedValue({ receitas: 1000, despesas: 500, saldo: 500 }),
  createFechamentoCaixa: vi.fn().mockResolvedValue({ id: 1 }),
  listFechamentosCaixa: vi.fn().mockResolvedValue([]),
  listGarantias: vi.fn().mockResolvedValue([]),
  getGarantia: vi.fn().mockResolvedValue(null),
  createGarantia: vi.fn().mockResolvedValue({ id: 1, numero: "GAR-2024-0001" }),
  updateGarantia: vi.fn().mockResolvedValue({ id: 1 }),
  getRelatorioOS: vi.fn().mockResolvedValue({ total: 5, abertas: 2, emAndamento: 1, concluidas: 2, canceladas: 0, lista: [] }),
  getTopPecas: vi.fn().mockResolvedValue([]),
  getClientesAtivos: vi.fn().mockResolvedValue([]),
}));

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin",
      email: "admin@lbmecanica.com",
      name: "Admin",
      loginMethod: "local",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("LB Mecânica - Módulo Empresa", () => {
  it("deve retornar dados da empresa", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.empresa.get();
    expect(result).toBeDefined();
  });
});

describe("LB Mecânica - Módulo Clientes", () => {
  it("deve listar clientes", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clientes.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("deve criar um cliente", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clientes.create({ nome: "Maria Santos", telefone: "11988888888" });
    expect(result).toBeDefined();
  });
});

describe("LB Mecânica - Módulo Veículos", () => {
  it("deve listar veículos", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.veiculos.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("deve criar um veículo", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.veiculos.create({ clienteId: 1, placa: "XYZ-9876", modelo: "Corolla", marca: "Toyota", ano: "2022" });
    expect(result).toBeDefined();
  });
});

describe("LB Mecânica - Módulo Peças", () => {
  it("deve listar peças", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.pecas.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("LB Mecânica - Módulo Financeiro", () => {
  it("deve retornar resumo financeiro", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.financeiro.resumo({
      dataInicio: new Date("2024-01-01"),
      dataFim: new Date("2024-12-31"),
    });
    expect(result).toHaveProperty("receitas");
    expect(result).toHaveProperty("despesas");
    expect(result).toHaveProperty("saldo");
  });
});

describe("LB Mecânica - Módulo Relatórios", () => {
  it("deve retornar relatório de OS com estatísticas", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.relatorios.os({
      dataInicio: new Date("2024-01-01"),
      dataFim: new Date("2024-12-31"),
    });
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("concluidas");
  });
});

describe("LB Mecânica - Dashboard", () => {
  it("deve retornar estatísticas do dashboard", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.stats();
    expect(result).toHaveProperty("totalOS");
    expect(result).toHaveProperty("totalClientes");
    expect(result).toHaveProperty("receitasMes");
  });
});
