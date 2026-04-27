import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { loginLocal } from "./localAuth";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "@shared/const";
import { SignJWT } from "jose";
import { ENV } from "./_core/env";
import { storagePut } from "./storage";
import * as db from "./db";
import { broadcastEvent, EVENTS } from "./_core/websocket";

const JWT_SECRET = new TextEncoder().encode(ENV.cookieSecret || "lb-mecanica-secret-2024");

// ─── Auth ─────────────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  loginLocal: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const result = await loginLocal(input.username, input.password);
      if (!result) throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciais inválidas" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, result.token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      return { success: true, user: result.user };
    }),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ─── Empresa ─────────────────────────────────────────────────────────────────
const empresaRouter = router({
  get: publicProcedure.query(() => db.getEmpresa()),
  update: protectedProcedure
    .input(z.object({
      nome: z.string().optional(),
      cnpj: z.string().optional(),
      endereco: z.string().optional(),
      telefone: z.string().optional(),
      email: z.string().optional(),
      logoUrl: z.string().optional(),
    }))
    .mutation(({ input }) => db.upsertEmpresa(input)),
});

// ─── Clientes ─────────────────────────────────────────────────────────────────
const clientesRouter = router({
  list: protectedProcedure.input(z.object({ search: z.string().optional() }).optional()).query(({ input }) => db.listClientes(input?.search)),
  get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getCliente(input.id)),
  create: protectedProcedure
    .input(z.object({
      nome: z.string().min(1),
      telefone: z.string().optional(),
      cpfCnpj: z.string().optional(),
      email: z.string().optional(),
      endereco: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().optional(),
      cep: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => { const cliente = await db.createCliente(input); broadcastEvent(EVENTS.CLIENTE_CRIADO, cliente); return cliente; }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      telefone: z.string().optional(),
      cpfCnpj: z.string().optional(),
      email: z.string().optional(),
      endereco: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().optional(),
      cep: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => { const { id, ...data } = input; const cliente = await db.updateCliente(id, data); broadcastEvent(EVENTS.CLIENTE_ATUALIZADO, cliente); return cliente; }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await db.deleteCliente(input.id); broadcastEvent(EVENTS.CLIENTE_REMOVIDO, { id: input.id }); return { success: true }; }),
});

// ─── Veículos ─────────────────────────────────────────────────────────────────
const veiculosRouter = router({
  list: protectedProcedure.input(z.object({ clienteId: z.number().optional() }).optional()).query(({ input }) => db.listVeiculos(input?.clienteId)),
  get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getVeiculo(input.id)),
  create: protectedProcedure
    .input(z.object({
      clienteId: z.number(),
      placa: z.string().min(1),
      modelo: z.string().min(1),
      marca: z.string().optional(),
      ano: z.string().optional(),
      cor: z.string().optional(),
      km: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => { const veiculo = await db.createVeiculo(input); broadcastEvent(EVENTS.VEICULO_CRIADO, veiculo); return veiculo; }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      clienteId: z.number().optional(),
      placa: z.string().optional(),
      modelo: z.string().optional(),
      marca: z.string().optional(),
      ano: z.string().optional(),
      cor: z.string().optional(),
      km: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => { const { id, ...data } = input; const veiculo = await db.updateVeiculo(id, data); broadcastEvent(EVENTS.VEICULO_ATUALIZADO, veiculo); return veiculo; }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await db.deleteVeiculo(input.id); broadcastEvent(EVENTS.VEICULO_REMOVIDO, { id: input.id }); return { success: true }; }),
});

// ─── Peças ────────────────────────────────────────────────────────────────────
const pecasRouter = router({
  list: protectedProcedure.input(z.object({ search: z.string().optional() }).optional()).query(({ input }) => db.listPecas(input?.search)),
  get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getPeca(input.id)),
  create: protectedProcedure
    .input(z.object({
      nome: z.string().min(1),
      codigo: z.string().optional(),
      descricao: z.string().optional(),
      quantidade: z.number().default(0),
      precoCompra: z.string().default("0"),
      precoVenda: z.string().default("0"),
      unidade: z.string().optional(),
    }))
    .mutation(async ({ input }) => { const peca = await db.createPeca(input as any); broadcastEvent(EVENTS.PECA_CRIADA, peca); return peca; }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      codigo: z.string().optional(),
      descricao: z.string().optional(),
      quantidade: z.number().optional(),
      precoCompra: z.string().optional(),
      precoVenda: z.string().optional(),
      unidade: z.string().optional(),
    }))
    .mutation(async ({ input }) => { const { id, ...data } = input; const peca = await db.updatePeca(id, data as any); broadcastEvent(EVENTS.PECA_ATUALIZADA, peca); return peca; }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await db.deletePeca(input.id); broadcastEvent(EVENTS.PECA_REMOVIDA, { id: input.id }); return { success: true }; }),
});

// ─── Ordens de Serviço ────────────────────────────────────────────────────────
const osRouter = router({
  list: protectedProcedure
    .input(z.object({ status: z.string().optional(), clienteId: z.number().optional(), veiculoId: z.number().optional(), dataInicio: z.date().optional(), dataFim: z.date().optional() }).optional())
    .query(({ input }) => db.listOS(input)),
  get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getOS(input.id)),
  create: protectedProcedure
    .input(z.object({
      clienteId: z.number(),
      veiculoId: z.number(),
      status: z.enum(["aberta", "em_andamento", "concluida", "cancelada"]).default("aberta"),
      descricaoProblema: z.string().optional(),
      servicosRealizados: z.string().optional(),
      observacoes: z.string().optional(),
      kmEntrada: z.string().optional(),
      kmSaida: z.string().optional(),
      previsaoEntrega: z.date().optional(),
      valorServicos: z.string().optional(),
      valorPecas: z.string().optional(),
      desconto: z.string().optional(),
      valorTotal: z.string().optional(),
      formaPagamento: z.string().optional(),
    }))
    .mutation(async ({ input }) => { const os = await db.createOS(input as any); broadcastEvent(EVENTS.OS_CRIADA, os); return os; }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["aberta", "em_andamento", "concluida", "cancelada"]).optional(),
      descricaoProblema: z.string().optional(),
      servicosRealizados: z.string().optional(),
      observacoes: z.string().optional(),
      kmEntrada: z.string().optional(),
      kmSaida: z.string().optional(),
      previsaoEntrega: z.date().optional(),
      dataConclusao: z.date().optional(),
      valorServicos: z.string().optional(),
      valorPecas: z.string().optional(),
      desconto: z.string().optional(),
      valorTotal: z.string().optional(),
      formaPagamento: z.string().optional(),
    }))
    .mutation(async ({ input }) => { const { id, ...data } = input; const os = await db.updateOS(id, data as any); if (input.status) broadcastEvent(EVENTS.OS_STATUS_MUDOU, { id, status: input.status }); broadcastEvent(EVENTS.OS_ATUALIZADA, os); return os; }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await db.deleteOS(input.id); broadcastEvent(EVENTS.OS_REMOVIDA, { id: input.id }); return { success: true }; }),
  // Itens
  listItens: protectedProcedure.input(z.object({ osId: z.number() })).query(({ input }) => db.listOsItens(input.osId)),
  addItem: protectedProcedure
    .input(z.object({
      osId: z.number(),
      tipo: z.enum(["servico", "peca"]),
      descricao: z.string().min(1),
      pecaId: z.number().optional(),
      quantidade: z.string().default("1"),
      valorUnitario: z.string().default("0"),
      valorTotal: z.string().default("0"),
    }))
    .mutation(({ input }) => db.createOsItem(input as any)),
  removeItem: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteOsItem(input.id)),
  // Fotos
  listFotos: protectedProcedure.input(z.object({ osId: z.number() })).query(({ input }) => db.listOsFotos(input.osId)),
  uploadFoto: protectedProcedure
    .input(z.object({
      osId: z.number(),
      etapa: z.enum(["antes", "durante", "depois"]),
      base64: z.string(),
      mimeType: z.string().default("image/jpeg"),
      descricao: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const key = `os-fotos/${input.osId}/${input.etapa}/${Date.now()}.jpg`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return db.createOsFoto({ osId: input.osId, etapa: input.etapa, url, fileKey: key, descricao: input.descricao });
    }),
  deleteFoto: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteOsFoto(input.id)),
});

// ─── Orçamentos ───────────────────────────────────────────────────────────────
const orcamentosRouter = router({
  list: protectedProcedure.query(() => db.listOrcamentos()),
  get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getOrcamento(input.id)),
  create: protectedProcedure
    .input(z.object({
      clienteId: z.number(),
      veiculoId: z.number(),
      descricao: z.string().optional(),
      observacoes: z.string().optional(),
      validadeAte: z.date().optional(),
      valorServicos: z.string().optional(),
      valorPecas: z.string().optional(),
      desconto: z.string().optional(),
      valorTotal: z.string().optional(),
    }))
    .mutation(({ input }) => db.createOrcamento(input as any)),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pendente", "aprovado", "reprovado", "expirado"]).optional(),
      descricao: z.string().optional(),
      observacoes: z.string().optional(),
      validadeAte: z.date().optional(),
      valorServicos: z.string().optional(),
      valorPecas: z.string().optional(),
      desconto: z.string().optional(),
      valorTotal: z.string().optional(),
    }))
    .mutation(({ input }) => { const { id, ...data } = input; return db.updateOrcamento(id, data as any); }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteOrcamento(input.id)),
  listItens: protectedProcedure.input(z.object({ orcamentoId: z.number() })).query(({ input }) => db.listOrcamentoItens(input.orcamentoId)),
  addItem: protectedProcedure
    .input(z.object({
      orcamentoId: z.number(),
      tipo: z.enum(["servico", "peca"]),
      descricao: z.string().min(1),
      pecaId: z.number().optional(),
      quantidade: z.string().default("1"),
      valorUnitario: z.string().default("0"),
      valorTotal: z.string().default("0"),
    }))
    .mutation(({ input }) => db.createOrcamentoItem(input as any)),
  removeItem: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteOrcamentoItem(input.id)),
  clearItens: protectedProcedure.input(z.object({ orcamentoId: z.number() })).mutation(({ input }) => db.deleteOrcamentoItensByOrcamento(input.orcamentoId)),
});

// ─── Financeiro ───────────────────────────────────────────────────────────────
const financeiroRouter = router({
  list: protectedProcedure
    .input(z.object({ tipo: z.string().optional(), dataInicio: z.date().optional(), dataFim: z.date().optional() }).optional())
    .query(({ input }) => db.listFinanceiro(input)),
  create: protectedProcedure
    .input(z.object({
      tipo: z.enum(["receita", "despesa"]),
      categoria: z.string().optional(),
      descricao: z.string().min(1),
      valor: z.string(),
      data: z.date().optional(),
      osId: z.number().optional(),
      formaPagamento: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(({ input }) => db.createFinanceiro({ ...input, data: input.data ?? new Date() } as any)),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      tipo: z.enum(["receita", "despesa"]).optional(),
      categoria: z.string().optional(),
      descricao: z.string().optional(),
      valor: z.string().optional(),
      data: z.date().optional(),
      formaPagamento: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(({ input }) => { const { id, ...data } = input; return db.updateFinanceiro(id, data as any); }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteFinanceiro(input.id)),
  resumo: protectedProcedure
    .input(z.object({ dataInicio: z.date(), dataFim: z.date() }))
    .query(({ input }) => db.getResumoFinanceiro(input.dataInicio, input.dataFim)),
  fecharCaixa: protectedProcedure
    .input(z.object({
      dataInicio: z.date(),
      dataFim: z.date(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const resumo = await db.getResumoFinanceiro(input.dataInicio, input.dataFim);
      return db.createFechamentoCaixa({
        dataInicio: input.dataInicio,
        dataFim: input.dataFim,
        totalReceitas: String(resumo.receitas),
        totalDespesas: String(resumo.despesas),
        saldoFinal: String(resumo.saldo),
        observacoes: input.observacoes,
      });
    }),
  listFechamentos: protectedProcedure.query(() => db.listFechamentosCaixa()),
});

// ─── Garantias ────────────────────────────────────────────────────────────────
const garantiasRouter = router({
  list: protectedProcedure.query(() => db.listGarantias()),
  get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getGarantia(input.id)),
  create: protectedProcedure
    .input(z.object({
      osId: z.number(),
      clienteId: z.number(),
      veiculoId: z.number(),
      servicosGarantidos: z.string().min(1),
      condicoesGarantia: z.string().optional(),
      dataVencimento: z.date(),
    }))
    .mutation(({ input }) => db.createGarantia(input as any)),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      assinaturaCliente: z.string().optional(),
      assinaturaResponsavel: z.string().optional(),
      condicoesGarantia: z.string().optional(),
    }))
    .mutation(({ input }) => { const { id, ...data } = input; return db.updateGarantia(id, data as any); }),
});

// ─── Relatórios ───────────────────────────────────────────────────────────────
const relatoriosRouter = router({
  os: protectedProcedure
    .input(z.object({ dataInicio: z.date(), dataFim: z.date() }))
    .query(({ input }) => db.getRelatorioOS(input.dataInicio, input.dataFim)),
  topPecas: protectedProcedure.query(() => db.getTopPecas()),
  clientesAtivos: protectedProcedure.query(() => db.getClientesAtivos()),
  financeiro: protectedProcedure
    .input(z.object({ dataInicio: z.date(), dataFim: z.date() }))
    .query(({ input }) => db.getResumoFinanceiro(input.dataInicio, input.dataFim)),
});

// ─── Dashboard ────────────────────────────────────────────────────────────────
const dashboardRouter = router({
  stats: protectedProcedure.query(async () => {
    const [osList, clientesList, pecasList, financeiroList] = await Promise.all([
      db.listOS(),
      db.listClientes(),
      db.listPecas(),
      db.listFinanceiro(),
    ]);
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const receitas = financeiroList.filter(f => f.tipo === "receita" && f.data >= inicioMes).reduce((s, f) => s + Number(f.valor), 0);
    const despesas = financeiroList.filter(f => f.tipo === "despesa" && f.data >= inicioMes).reduce((s, f) => s + Number(f.valor), 0);
    return {
      totalOS: osList.length,
      osAbertas: osList.filter(o => o.status === "aberta").length,
      osEmAndamento: osList.filter(o => o.status === "em_andamento").length,
      osConcluidas: osList.filter(o => o.status === "concluida").length,
      totalClientes: clientesList.length,
      totalPecas: pecasList.length,
      receitasMes: receitas,
      despesasMes: despesas,
      lucroMes: receitas - despesas,
    };
  }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  empresa: empresaRouter,
  clientes: clientesRouter,
  veiculos: veiculosRouter,
  pecas: pecasRouter,
  os: osRouter,
  orcamentos: orcamentosRouter,
  financeiro: financeiroRouter,
  garantias: garantiasRouter,
  relatorios: relatoriosRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
