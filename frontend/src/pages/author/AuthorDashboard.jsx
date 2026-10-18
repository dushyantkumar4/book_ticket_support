
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, IndianRupee, MessagesSquare, Clock3 } from "lucide-react";
import { getMyBooks } from "@/api/bookApi";
import { getMyTickets } from "@/api/ticketApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/authStore";

export default function AuthorDashboard() {
  const user = useAuthStore((state) => state.user);
  const [books, setBooks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [bookData, ticketData] = await Promise.all([
          getMyBooks(),
          getMyTickets(),
        ]);

        setBooks(bookData.books ?? []);
        setTickets(ticketData.tickets ?? []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <p>Loading your dashboard...</p>;

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  const pendingRoyalty = books.reduce(
    (total, book) => total + Number(book.royaltyPending || 0),
    0
  );

  const openTickets = tickets.filter(
    (ticket) => !["Resolved", "Closed"].includes(ticket.status)
  ).length;

  const stats = [
    {
      title: "My Books",
      value: books.length,
      icon: BookOpen,
    },
    {
      title: "Pending Royalties",
      value: `₹${pendingRoyalty.toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
    {
      title: "Total Tickets",
      value: tickets.length,
      icon: MessagesSquare,
    },
    {
      title: "Open Tickets",
      value: openTickets,
      icon: Clock3,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {user?.name || "Author"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here's an overview of your books and support requests.
          </p>
        </div>

        <Button asChild>
          <Link to="/author/tickets/new">Create Support Ticket</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {title}
              </CardTitle>
              <Icon size={18} className="text-slate-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Books</CardTitle>
        </CardHeader>
        <CardContent>
          {books.length === 0 ? (
            <p className="text-sm text-slate-500">
              No books are associated with your account yet.
            </p>
          ) : (
            <div className="space-y-4">
              {books.slice(0, 4).map((book) => (
                <div
                  key={book._id || book.bookId}
                  className="flex flex-col justify-between gap-2 border-b pb-4 last:border-0 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-medium">{book.title}</p>
                    <p className="text-sm text-slate-500">
                      ISBN: {book.isbn || "Not assigned"}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                    {book.status}
                  </span>
                </div>
              ))}
              <Button variant="outline" asChild>
                <Link to="/author/books">View all books</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-sm text-slate-500">
              You haven't created any support tickets yet.
            </p>
          ) : (
            <div className="space-y-4">
              {tickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket._id}
                  className="flex flex-col justify-between gap-2 border-b pb-4 last:border-0 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-slate-500">
                      {ticket.ticketNumber || ticket._id}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                    {ticket.status}
                  </span>
                </div>
              ))}
              <Button variant="outline" asChild>
                <Link to="/author/tickets">View all tickets</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
