
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTicketById, regenerateTicketAI, updateTicketClassification, updateTicketStatus, updateTicketAssignment } from "@/api/ticketApi";
import { addInternalNote, sendTicketReply } from "@/api/messageApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useTicketSocket from "@/hooks/useTicketSocket";
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
  const [note, setNote] = useState("");
  const [messages, setMessages] = useState([]);

  useTicketSocket({
    onMessage: (payload) => {
      if (payload.ticketId !== ticketId || !payload.message) return;
      setMessages((current) => current.some((message) => message._id === payload.message._id)
        ? current
        : [...current, payload.message]);
    },
    onStatus: (payload) => {
      if (payload.ticketId === ticketId) setTicket((current) => current ? { ...current, status: payload.status } : current);
    },
  });

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const data = await getTicketById(ticketId);
        setTicket(data.ticket);
        setMessages(data.messages ?? []);
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

  const saveClassification = async (changes) => {
    try { const data = await updateTicketClassification(ticketId, changes); setTicket(data.ticket); }
    catch (err) { setError(err.response?.data?.message || "Could not update ticket."); }
  };

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
      const refreshed = await getTicketById(ticketId); setMessages(refreshed.messages ?? []);
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

      <Card><CardContent className="grid gap-4 p-4 sm:grid-cols-4">
        <label className="space-y-1 text-sm">Category<Select value={ticket.category} onValueChange={(category) => saveClassification({ category })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Royalty & Payments", "ISBN & Metadata Issues", "Printing & Quality", "Distribution & Availability", "Book Status & Production Updates", "General Inquiry"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></label>
        <label className="space-y-1 text-sm">Priority<Select value={ticket.priority} onValueChange={(priority) => saveClassification({ priority })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Critical", "High", "Medium", "Low"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></label>
        <label className="space-y-1 text-sm">Status<Select value={ticket.status} onValueChange={async (status) => { try { const data = await updateTicketStatus(ticketId, status); setTicket(data.ticket); } catch (err) { setError(err.response?.data?.message || "Could not update status."); } }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Open", "In Progress", "Resolved", "Closed"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></label>
        <div className="space-y-1 text-sm">Assignment<p>{ticket.assignedTo?.name || "Unassigned"}</p><Button size="sm" variant="outline" onClick={async () => { try { const data = await updateTicketAssignment(ticketId); setTicket(data.ticket); } catch (err) { setError(err.response?.data?.message || "Could not assign ticket."); } }}>Assign to me</Button></div>
      </CardContent></Card>

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

      <Card><CardHeader><CardTitle>Conversation and internal notes</CardTitle></CardHeader><CardContent className="space-y-3">
        {messages.map((message) => <div key={message._id} className={`rounded border p-3 ${message.visibility === "internal" ? "bg-amber-50" : "bg-white"}`}><p className="text-xs text-muted-foreground">{message.sender?.name || "Support"} · {message.visibility}</p><p className="whitespace-pre-wrap text-sm">{message.body}</p></div>)}
        <form className="space-y-2" onSubmit={async (event) => { event.preventDefault(); try { await addInternalNote(ticketId, note); setNote(""); const data = await getTicketById(ticketId); setMessages(data.messages ?? []); } catch (err) { setError(err.response?.data?.message || "Could not save note."); } }}><Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Internal note (only admins can see this)" rows={3} /><Button type="submit" variant="outline" disabled={!note.trim()}>Add internal note</Button></form>
      </CardContent></Card>

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
