
import { useEffect } from "react";
import { socket } from "@/lib/socket";

export default function useTicketSocket(handlers = {}) {
  useEffect(() => {
    const onMessage = (payload) => handlers.onMessage?.(payload);
    const onStatus = (payload) => handlers.onStatus?.(payload);
    const onNewTicket = (payload) => handlers.onNewTicket?.(payload);
    const onAICompleted = (payload) => handlers.onAICompleted?.(payload);
    const onAIFailed = (payload) => handlers.onAIFailed?.(payload);

    socket.connect();

    socket.on("ticket:message", onMessage);
    socket.on("ticket:status", onStatus);
    socket.on("ticket:new", onNewTicket);
    socket.on("ticket:ai-completed", onAICompleted);
    socket.on("ticket:ai-failed", onAIFailed);

    return () => {
      socket.off("ticket:message", onMessage);
      socket.off("ticket:status", onStatus);
      socket.off("ticket:new", onNewTicket);
      socket.off("ticket:ai-completed", onAICompleted);
      socket.off("ticket:ai-failed", onAIFailed);
      socket.disconnect();
    };
  }, [
    handlers.onMessage,
    handlers.onStatus,
    handlers.onNewTicket,
    handlers.onAICompleted,
    handlers.onAIFailed,
  ]);
}
