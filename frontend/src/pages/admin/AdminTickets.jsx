import { getTickets } from "@/api/ticketApi";
import { useMemo, useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Search,
  Ticket,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sampleTickets = [
  {
    id: "TKT-1001",
    subject: "Royalty payment not received",
    author: "Rahul Sharma",
    category: "Royalty & Payments",
    priority: "Critical",
    status: "Open",
    createdAt: "2026-10-17",
  },
  {
    id: "TKT-1002",
    subject: "Incorrect ISBN on book listing",
    author: "Priya Verma",
    category: "ISBN & Metadata Issues",
    priority: "High",
    status: "In Progress",
    createdAt: "2026-10-16",
  },
  {
    id: "TKT-1003",
    subject: "Book listing not available on Amazon",
    author: "Amit Kumar",
    category: "Distribution & Availability",
    priority: "Medium",
    status: "Open",
    createdAt: "2026-10-15",
  },
  {
    id: "TKT-1004",
    subject: "Damaged printed copies received",
    author: "Neha Singh",
    category: "Printing & Quality",
    priority: "High",
    status: "In Progress",
    createdAt: "2026-10-14",
  },
  {
    id: "TKT-1005",
    subject: "Update book description",
    author: "Ankit Gupta",
    category: "ISBN & Metadata Issues",
    priority: "Low",
    status: "Resolved",
    createdAt: "2026-10-13",
  },
  {
    id: "TKT-1006",
    subject: "Need an update on book production",
    author: "Pooja Mishra",
    category: "Book Status & Production Updates",
    priority: "Medium",
    status: "Open",
    createdAt: "2026-10-12",
  },
];

const categories = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];

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

const AdminTickets = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [tickets, setTickets] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState("");


useEffect(() => {
  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getTickets();

      // Adjust this line to match your backend response.
      setTickets(data.tickets);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load tickets"
      );
    } finally {
      setIsLoading(false);
    }
  };

  fetchTickets();
}, []);

if (isLoading) {
  return <div className="p-6">Loading tickets...</div>;
}

if (error) {
  return (
    <div className="p-6">
      <p className="text-red-500">{error}</p>
      <Button onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  );
}

  // const filteredTickets = useMemo(() => {
  //   const searchText = search.trim().toLowerCase();

  //   return sampleTickets.filter((ticket) => {
  //     const matchesSearch =
  //       !searchText ||
  //       ticket.id.toLowerCase().includes(searchText) ||
  //       ticket.subject.toLowerCase().includes(searchText) ||
  //       ticket.author.toLowerCase().includes(searchText);

  //     const matchesStatus =
  //       status === "all" || ticket.status === status;

  //     const matchesPriority =
  //       priority === "all" || ticket.priority === priority;

  //     const matchesCategory =
  //       category === "all" || ticket.category === category;

  //     return (
  //       matchesSearch &&
  //       matchesStatus &&
  //       matchesPriority &&
  //       matchesCategory
  //     );
  //   });
  // }, [search, status, priority, category]);

  const openCount = sampleTickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const inProgressCount = sampleTickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;

  const criticalCount = sampleTickets.filter(
    (ticket) =>
      ticket.priority === "Critical" &&
      ticket.status !== "Resolved" &&
      ticket.status !== "Closed"
  ).length;

  const resolvedCount = sampleTickets.filter(
    (ticket) => ticket.status === "Resolved"
  ).length;

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setPriority("all");
    setCategory("all");
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Support Tickets
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review author requests, manage priorities, and track resolutions.
          </p>
        </div>

        <Badge variant="outline" className="w-fit gap-1.5 px-3 py-1.5">
          <span className="size-2 rounded-full bg-emerald-500" />
          Admin workspace
        </Badge>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total tickets"
          value={sampleTickets.length}
          description="Across all statuses"
          icon={Ticket}
        />
        <SummaryCard
          title="Open tickets"
          value={openCount}
          description="Awaiting action"
          icon={AlertCircle}
        />
        <SummaryCard
          title="In progress"
          value={inProgressCount}
          description="Currently being handled"
          icon={Clock3}
        />
        <SummaryCard
          title="Critical priority"
          value={criticalCount}
          description={`${resolvedCount} resolved tickets`}
          icon={CheckCircle2}
        />
      </div>

      {/* Ticket table */}
      <Card className="overflow-hidden">
        <CardHeader className="gap-4">
          <div>
            <CardTitle>All tickets</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Search and filter requests by their current state.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative sm:col-span-2 xl:col-span-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tickets or authors..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filteredTickets.length}
              </span>{" "}
              of {sampleTickets.length} tickets
            </p>

            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset filters
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-28 pl-6">Ticket</TableHead>
                  <TableHead className="min-w-64">Subject / Author</TableHead>
                  <TableHead className="min-w-48">Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-28">Created</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="pl-6 font-medium">
                        {ticket.id}
                      </TableCell>

                      <TableCell>
                        <div className="max-w-xs space-y-1">
                          <p className="font-medium leading-snug">
                            {ticket.subject}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ticket.author}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm">{ticket.category}</span>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={priorityStyles[ticket.priority]}
                        >
                          {ticket.priority}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusStyles[ticket.status]}
                        >
                          {ticket.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(
                          `${ticket.createdAt}T00:00:00`
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Actions for ${ticket.id}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/admin/tickets/${ticket.id}`)
                              }
                            >
                              <ArrowUpRight className="mr-2 size-4" />
                              View ticket
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Search className="mb-1 size-5 text-muted-foreground" />
                        <p className="font-medium">No tickets found</p>
                        <p className="text-sm text-muted-foreground">
                          Try changing your search or filters.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function SummaryCard({ title, value, description, icon: Icon }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <div className="rounded-lg bg-muted p-2.5">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminTickets;
