import { Link } from "react-router-dom";
import { AlertCircle, ArrowUpRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const priorityStyles = {
  Critical: "border-red-200 bg-red-50 text-red-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Medium: "border-blue-200 bg-blue-50 text-blue-700",
  Low: "border-slate-200 bg-slate-100 text-slate-700",
};
const statusStyles = {
  Open: "border-amber-200 bg-amber-50 text-amber-800",
  "In Progress": "border-blue-200 bg-blue-50 text-blue-800",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Closed: "border-slate-200 bg-slate-100 text-slate-700",
};

export default function TicketTable({
  tickets = [],
  loading = false,
  error = "",
  onRetry,
  emptyMessage = "No tickets found.",
}) {
  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-28 pl-4">Ticket</TableHead>
            <TableHead className="min-w-56">Subject / Author</TableHead>
            <TableHead className="min-w-44">Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="min-w-28">Created</TableHead>
            <TableHead className="min-w-36">Assigned to</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-28 text-center text-muted-foreground"
              >
                Loading tickets…
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={8} className="h-28 text-center">
                <p className="mb-2 text-red-600">{error}</p>
                {onRetry && (
                  <Button variant="outline" size="sm" onClick={onRetry}>
                    Retry
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ) : tickets.length ? (
            tickets.map((ticket) => {
              const oldUnresolved =
                !["Resolved", "Closed"].includes(ticket.status) &&
                Date.now() - new Date(ticket.createdAt).getTime() >
                  7 * 86400000;
              return (
                <TableRow
                  key={ticket._id}
                  className={
                    ticket.priority === "Critical" || oldUnresolved
                      ? "bg-amber-50/50"
                      : undefined
                  }
                >
                  <TableCell className="pl-4 font-medium">
                    {ticket.ticketNumber || ticket._id?.slice(-8)}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.author?.name || "Unknown author"}
                    </p>
                  </TableCell>
                  <TableCell>{ticket.category || "Unclassified"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={priorityStyles[ticket.priority]}
                    >
                      {ticket.priority}
                    </Badge>
                    {ticket.priority === "Critical" && (
                      <AlertCircle className="ml-1 inline size-3 text-red-600" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusStyles[ticket.status]}
                    >
                      {ticket.status}
                    </Badge>
                    {oldUnresolved && (
                      <span className="ml-1 text-xs text-amber-800">
                        Older than 7d
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleDateString("en-IN")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {ticket.assignedTo?.name || "Unassigned"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        to={`/admin/tickets/${ticket._id}`}
                        aria-label={`View ${ticket.ticketNumber || ticket.subject}`}
                      >
                        <ArrowUpRight className="mr-1 size-4" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center">
                <Search className="mx-auto mb-2 size-5 text-muted-foreground" />
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
