import { useCallback, useEffect, useState } from "react";
import { getTickets } from "@/api/ticketApi";
import TicketTable from "@/components/common/TicketTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useTicketSocket from "@/hooks/useTicketSocket";

const categories = ["Royalty & Payments", "ISBN & Metadata Issues", "Printing & Quality", "Distribution & Availability", "Book Status & Production Updates", "General Inquiry"];
export default function AdminTickets() {
  const [filters, setFilters] = useState({ status: "all", priority: "all", category: "all", from: "", to: "", search: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value && value !== "all"));
      const data = await getTickets(params);
      setTickets(data.tickets ?? []);
    } catch (err) { setError(err.response?.data?.message || "Failed to load tickets."); }
    finally { setLoading(false); }
  }, [filters]);
  useEffect(() => { load(); }, [load]);
  useTicketSocket({ onNewTicket: load, onAICompleted: load, onAIFailed: load, onMessage: load, onStatus: load });
  const active = tickets.filter((ticket) => !["Resolved", "Closed"].includes(ticket.status));
  const stats = [
    ["Tickets shown", tickets.length],
    ["Open", tickets.filter((ticket) => ticket.status === "Open").length],
    ["Critical active", active.filter((ticket) => ticket.priority === "Critical").length],
    ["Unresolved over 7 days", active.filter((ticket) => Date.now() - new Date(ticket.createdAt).getTime() > 7 * 86400000).length],
  ];
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold">Support Tickets</h1><p className="mt-1 text-sm text-muted-foreground">Review, prioritize, and resolve author requests.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value]) => <Card key={label}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{value}</CardContent></Card>)}</div>
    <Card><CardHeader className="gap-4"><CardTitle>All tickets</CardTitle>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Input placeholder="Search tickets…" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
        <Select value={filters.status} onValueChange={(status) => setFilters((f) => ({ ...f, status }))}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{["all", "Open", "In Progress", "Resolved", "Closed"].map((v) => <SelectItem key={v} value={v}>{v === "all" ? "All statuses" : v}</SelectItem>)}</SelectContent></Select>
        <Select value={filters.priority} onValueChange={(priority) => setFilters((f) => ({ ...f, priority }))}><SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent>{["all", "Critical", "High", "Medium", "Low"].map((v) => <SelectItem key={v} value={v}>{v === "all" ? "All priorities" : v}</SelectItem>)}</SelectContent></Select>
        <Select value={filters.category} onValueChange={(category) => setFilters((f) => ({ ...f, category }))}><SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
        <Input aria-label="From date" type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} /><Input aria-label="To date" type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
      </div>
      <div className="flex justify-between text-sm text-muted-foreground"><span>{loading ? "Loading…" : `${tickets.length} tickets`}</span><Button variant="ghost" size="sm" onClick={() => setFilters({ status: "all", priority: "all", category: "all", from: "", to: "", search: "" })}>Reset filters</Button></div>
    </CardHeader><CardContent className="p-0"><TicketTable tickets={tickets} loading={loading} error={error} onRetry={load} /></CardContent></Card>
  </div>;
}
