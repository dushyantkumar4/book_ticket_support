
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTickets } from "@/api/ticketApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const statusStyles = {
  Open: "bg-blue-50 text-blue-700",
  "In Progress": "bg-amber-50 text-amber-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  Closed: "bg-slate-100 text-slate-600",
};

export default function AuthorTickets() {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTickets()
      .then((data) => setTickets(data.tickets ?? []))
      .catch((err) => {
        setError(
          err.response?.data?.message || "Failed to load tickets."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredTickets =
    statusFilter === "All"
      ? tickets
      : tickets.filter((ticket) => ticket.status === statusFilter);

  if (loading) return <p>Loading support tickets...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="mt-1 text-sm text-slate-500">
            Follow your requests and read responses from the BookLeaf team.
          </p>
        </div>

        <Button asChild>
          <Link to="/author/tickets/new">Create Ticket</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", "Open", "In Progress", "Resolved", "Closed"].map((status) => (
          <Button
            key={status}
            size="sm"
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-500">
            No tickets match this filter.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket._id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="min-w-0">
                  <CardTitle className="text-base">
                    {ticket.subject}
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    {ticket.ticketNumber || ticket._id}
                    {" · "}
                    {ticket.category || "General Inquiry"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    statusStyles[ticket.status] || "bg-slate-100"
                  }`}
                >
                  {ticket.status}
                </span>
              </CardHeader>

              <CardContent className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="text-sm text-slate-500">
                  Priority: {ticket.priority || "Not assigned"}
                  <p>
                    Created:{" "}
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <Button variant="outline" size="sm" asChild>
                  <Link to={`/author/tickets/${ticket._id}`}>
                    View conversation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
