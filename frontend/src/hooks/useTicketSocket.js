
import { useEffect, useRef } from "react";
import { socket } from "@/lib/socket";

export default function useTicketSocket(handlers = {}) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const onMessage = (payload) => handlersRef.current.onMessage?.(payload);
    const onStatus = (payload) => handlersRef.current.onStatus?.(payload);
    const onNewTicket = (payload) => handlersRef.current.onNewTicket?.(payload);
    const onAICompleted = (payload) => handlersRef.current.onAICompleted?.(payload);
    const onAIFailed = (payload) => handlersRef.current.onAIFailed?.(payload);
    const onConnectError = (error) => {
      handlersRef.current.onConnectError?.(error);
    };

    socket.on("connect_error", onConnectError);
    socket.on("ticket:message", onMessage);
    socket.on("ticket:status", onStatus);
    socket.on("ticket:new", onNewTicket);
    socket.on("ticket:ai-completed", onAICompleted);
    socket.on("ticket:ai-failed", onAIFailed);
    // Attach listeners before starting the handshake so the first server
    // event cannot arrive before this page is subscribed.
    if (!socket.connected) socket.connect();

    return () => {
      socket.off("ticket:message", onMessage);
      socket.off("ticket:status", onStatus);
      socket.off("ticket:new", onNewTicket);
      socket.off("ticket:ai-completed", onAICompleted);
      socket.off("ticket:ai-failed", onAIFailed);
      socket.off("connect_error", onConnectError);
    };
  }, []);
}
