
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTicketById } from "@/api/ticketApi";
import { sendTicketReply } from "@/api/messageApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useTicketSocket from "@/hooks/useTicketSocket";

export default function AuthorTicketDetails() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadConversation = useCallback(async () => {
    const ticketData = await getTicketById(ticketId);

    setTicket(ticketData.ticket);
    setMessages(ticketData.messages ?? []);
  }, [ticketId]);

  useEffect(() => {
    loadConversation()
      .catch((err) => {
        setError(
          err.response?.data?.message || "Could not load this conversation."
        );
      })
      .finally(() => setLoading(false));
  }, [loadConversation]);

  const handleReply = async (event) => {
    event.preventDefault();
    if (!reply.trim()) return;

    try {
      setSending(true);
      setError("");

      await sendTicketReply(ticketId, reply.trim());
      setReply("");
      await loadConversation();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not send your reply."
      );
    } finally {
      setSending(false);
    }
  };

  const handleNewMessage = useCallback(
  (payload) => {
    if (payload.ticketId !== ticketId) return;

    setMessages((previousMessages) => {
      const newMessage = payload.message;
      if (newMessage.visibility === "internal") return previousMessages;

      // Avoid adding the same message twice.
      if (
        previousMessages.some(
          (message) => message._id === newMessage._id
        )
      ) {
        return previousMessages;
      }

      return [...previousMessages, newMessage];
    });
  },
  [ticketId, setMessages]
);

const handleStatusChange = useCallback(
  (payload) => {
    if (payload.ticketId !== ticketId) return;

    setTicket((previousTicket) => {
      if (!previousTicket) return previousTicket;

      return {
        ...previousTicket,
        status: payload.status,
      };
    });
  },
  [ticketId, setTicket]
);

// Register the handlers with your Socket.IO hook.
useTicketSocket({
  onMessage: handleNewMessage,
  onStatus: handleStatusChange,
});

  if (loading) return <p>Loading conversation...</p>;

  if (error && !ticket) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error}</p>
        <Button variant="outline" asChild>
          <Link to="/author/tickets">Back to tickets</Link>
        </Button>
      </div>
    );
  }

  if (!ticket) return <p>Ticket not found.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/author/tickets"
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to tickets
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{ticket.subject}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {ticket.ticketNumber || ticket._id} · {ticket.status}
        </p>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
          Your request
        </p>
        <p className="whitespace-pre-wrap text-sm">{ticket.description}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Conversation</h2>

        {messages.length === 0 && (
          <p className="text-sm text-slate-500">
            No replies yet. Our support team will respond here.
          </p>
        )}

        {messages
          .filter((message) => message.visibility !== "internal")
          .map((message) => (
            <div
              key={message._id}
              className={`rounded-xl border p-4 ${
                message.sender?.role === "admin"
                  ? "bg-emerald-50"
                  : "bg-white"
              }`}
            >
              <div className="mb-2 flex flex-wrap justify-between gap-2">
                <span className="text-sm font-semibold">
                  {message.sender?.name ||
                    (message.sender?.role === "admin"
                      ? "BookLeaf Support"
                      : "You")}
                </span>
                <span className="text-xs text-slate-500">
                  {message.createdAt
                    ? new Date(message.createdAt).toLocaleString()
                    : ""}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{message.body}</p>
            </div>
          ))}
      </section>

      {!["Resolved", "Closed"].includes(ticket.status) && (
        <form
          onSubmit={handleReply}
          className="space-y-3 rounded-xl border bg-white p-5"
        >
          <label htmlFor="reply" className="text-sm font-medium">
            Send a reply
          </label>
          <Textarea
            id="reply"
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Write your message to BookLeaf Support..."
            rows={4}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={sending || !reply.trim()}>
              {sending ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
