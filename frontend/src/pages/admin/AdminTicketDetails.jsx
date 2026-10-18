
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTicketById } from "@/api/ticketApi";
import { regenerateTicketAI } from "@/api/ticketApi";
import { sendTicketReply } from "@/api/messageApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminTicketDetails() {
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const data = await getTicketById(ticketId);
        setTicket(data.ticket);
        setDraft(data.ticket.aiDraft || "");
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load ticket."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [ticketId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setNotice("");

    try {
      const data = await regenerateTicketAI(ticketId);

      setTicket((previous) => ({
        ...previous,
        aiCategory: data.aiCategory,
        aiPriority: data.aiPriority,
        aiReasoning: data.aiReasoning,
        aiStatus: data.aiStatus,
      }));

      setDraft(data.aiDraft || "");
      setNotice("AI suggestion generated. Review it before sending.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "AI is unavailable. You can write a reply manually."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();

    if (!draft.trim()) {
      setError("Write a reply before sending.");
      return;
    }

    setSending(true);
    setError("");
    setNotice("");

    try {
      await sendTicketReply(ticketId, draft.trim());
      setDraft("");
      setNotice("Reply sent successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not send the reply."
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>Loading ticket...</p>;

  if (!ticket) {
    return <p className="text-red-600">{error || "Ticket not found."}</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm text-slate-500">
          {ticket.ticketNumber || ticket._id}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{ticket.subject}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Category: {ticket.category || "Unclassified"}
          {" · "}
          Priority: {ticket.priority || "Unassigned"}
          {" · "}
          Status: {ticket.status}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Author's Message</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">
            {ticket.description}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Assistance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>
              Suggested category:{" "}
              <strong>{ticket.aiCategory || "Not analyzed"}</strong>
            </span>
            <span>
              Suggested priority:{" "}
              <strong>{ticket.aiPriority || "Not analyzed"}</strong>
            </span>
          </div>

          {ticket.aiReasoning && (
            <p className="text-sm text-slate-500">
              Reason: {ticket.aiReasoning}
            </p>
          )}

          {ticket.aiStatus === "Failed" && (
            <p className="text-sm text-amber-700">
              AI is unavailable. You can still respond manually.
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate AI Draft"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review and Send Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Generate an AI draft or write your own response..."
              rows={8}
              required
            />

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            {notice && (
              <p role="status" className="text-sm text-emerald-700">
                {notice}
              </p>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={sending || !draft.trim()}>
                {sending ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
