import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import type { User } from "../../drizzle/schema";

export interface AuthenticatedSocket extends Socket {
  user?: User;
}

let io: SocketIOServer | null = null;

export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { 
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket", "polling"],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    // Token validation happens in the frontend - for now we accept all connections
    // In production, verify the JWT token here
    next();
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function broadcastEvent(event: string, data: any) {
  if (io) {
    io.emit(event, data);
  }
}

export function broadcastToRoom(room: string, event: string, data: any) {
  if (io) {
    io.to(room).emit(event, data);
  }
}

// Events para sincronização em tempo real
export const EVENTS = {
  // Clientes
  CLIENTE_CRIADO: "cliente:criado",
  CLIENTE_ATUALIZADO: "cliente:atualizado",
  CLIENTE_REMOVIDO: "cliente:removido",

  // Veículos
  VEICULO_CRIADO: "veiculo:criado",
  VEICULO_ATUALIZADO: "veiculo:atualizado",
  VEICULO_REMOVIDO: "veiculo:removido",

  // Ordem de Serviço
  OS_CRIADA: "os:criada",
  OS_ATUALIZADA: "os:atualizada",
  OS_REMOVIDA: "os:removida",
  OS_STATUS_MUDOU: "os:status-mudou",

  // Peças
  PECA_CRIADA: "peca:criada",
  PECA_ATUALIZADA: "peca:atualizada",
  PECA_REMOVIDA: "peca:removida",

  // Orçamento
  ORCAMENTO_CRIADO: "orcamento:criado",
  ORCAMENTO_ATUALIZADO: "orcamento:atualizado",
  ORCAMENTO_REMOVIDO: "orcamento:removido",

  // Financeiro
  LANCAMENTO_CRIADO: "lancamento:criado",
  LANCAMENTO_REMOVIDO: "lancamento:removido",
  CAIXA_FECHADO: "caixa:fechado",

  // Garantia
  GARANTIA_CRIADA: "garantia:criada",
  GARANTIA_ATUALIZADA: "garantia:atualizada",

  // Empresa
  EMPRESA_ATUALIZADA: "empresa:atualizada",
};
