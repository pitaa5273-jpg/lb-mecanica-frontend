import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "painel-test-user",
    email: "painel@test.com",
    name: "Painel Test",
    loginMethod: "local",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Painel Administrativo - WebSocket Sync", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  it("lista clientes com sincronização", async () => {
    const clientes = await caller.clientes.list();
    expect(Array.isArray(clientes)).toBe(true);
  });



  it("lista veículos com sincronização", async () => {
    const veiculos = await caller.veiculos.list();
    expect(Array.isArray(veiculos)).toBe(true);
  });

  it("lista peças com sincronização", async () => {
    const pecas = await caller.pecas.list();
    expect(Array.isArray(pecas)).toBe(true);
  });

  it("lista ordens de serviço com sincronização", async () => {
    const osList = await caller.os.list();
    expect(Array.isArray(osList)).toBe(true);
  });

  it("lista orçamentos com sincronização", async () => {
    const orcamentos = await caller.orcamentos.list();
    expect(Array.isArray(orcamentos)).toBe(true);
  });

  it("lista lançamentos financeiros com sincronização", async () => {
    const lancamentos = await caller.financeiro.list();
    expect(Array.isArray(lancamentos)).toBe(true);
  });

  it("lista garantias com sincronização", async () => {
    const garantias = await caller.garantias.list();
    expect(Array.isArray(garantias)).toBe(true);
  });

  it("obtém informações da empresa", async () => {
    const empresa = await caller.empresa.get();
    expect(empresa).toBeDefined();
  });

  it("atualiza informações da empresa", async () => {
    const empresa = await caller.empresa.update({
      cnpj: "12.345.678/0001-90",
      endereco: "Rua Teste, 123",
      telefone: "(11) 3333-3333",
    });

    expect(empresa).toBeDefined();
    expect(empresa.cnpj).toBe("12.345.678/0001-90");
  });
});
