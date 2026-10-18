import { useCallback, useEffect, useState } from "react";
import { getTickets } from "@/api/ticketApi";
import TicketTable from "@/components/common/TicketTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getTickets({ limit: 100 });
      setTickets(result.tickets ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load dashboard tickets.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const active = tickets.filter(
    (t) => !["Resolved", "Closed"].includes(t.status),
  );
  const cards = [
    ["Tickets", tickets.length],
    ["Open", tickets.filter((t) => t.status === "Open").length],
    ["Critical", active.filter((t) => t.priority === "Critical").length],
    [
      "Unresolved over 7 days",
      active.filter(
        (t) => Date.now() - new Date(t.createdAt).getTime() > 7 * 86400000,
      ).length,
    ],
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Current ticket workload and urgent author requests.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([title, value]) => (
          <Card key={title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{value}</CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TicketTable
            tickets={tickets.slice(0, 10)}
            loading={loading}
            error={error}
            onRetry={load}
          />
        </CardContent>
      </Card>
    </div>
  );
}
