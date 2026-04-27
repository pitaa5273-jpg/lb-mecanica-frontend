import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";

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

type EventCallback = (data: any) => void;

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  const callbacksRef = useRef<Map<string, Set<EventCallback>>>(new Map());

  useEffect(() => {
    if (!user) return;

    // Conectar ao WebSocket
    const socket = io(window.location.origin, {
      auth: { token: "local-auth" },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("[WebSocket] Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("[WebSocket] Connection error:", error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const subscribe = useCallback((event: string, callback: EventCallback) => {
    if (!socketRef.current) return () => {};

    if (!callbacksRef.current.has(event)) {
      callbacksRef.current.set(event, new Set());

      // Registrar listener no socket
      socketRef.current.on(event, (data) => {
        const callbacks = callbacksRef.current.get(event);
        if (callbacks) {
          callbacks.forEach((cb) => cb(data));
        }
      });
    }

    const callbacks = callbacksRef.current.get(event)!;
    callbacks.add(callback);

    // Retornar função para desinscrever
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        callbacksRef.current.delete(event);
        socketRef.current?.off(event);
      }
    };
  }, []);

  return { subscribe };
}
