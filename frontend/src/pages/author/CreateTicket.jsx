
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyBooks } from "@/api/bookApi";
import { createTicket } from "@/api/ticketApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [bookId, setBookId] = useState("");
  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyBooks()
      .then((data) => setBooks(data.books ?? []))
      .catch(() => setError("Could not load your books."))
      .finally(() => setBooksLoading(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!subject.trim() || !description.trim()) {
      setError("Please enter both a subject and description.");
      return;
    }

    try {
      setLoading(true);

      await createTicket({
        subject: subject.trim(),
        description: description.trim(),
        book: bookId || null,
      });

      navigate("/author/tickets", {
        replace: true,
        state: { message: "Your support ticket has been created." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create your ticket."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          to="/author/tickets"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Back to tickets
        </Link>
        <h1 className="mt-3 text-2xl font-bold">Create Support Ticket</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tell our support team how we can help.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border bg-white p-5 sm:p-7"
      >
        <div className="space-y-2">
          <Label htmlFor="book">Related book (optional)</Label>
          <select
            id="book"
            value={bookId}
            onChange={(event) => setBookId(event.target.value)}
            disabled={booksLoading}
            className="h-10 w-full rounded-md border bg-white px-3 text-sm"
          >
            <option value="">General inquiry — no specific book</option>
            {books.map((book) => (
              <option key={book._id} value={book._id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="e.g. Question about my royalty payment"
            maxLength={150}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Explain your issue in detail..."
            rows={6}
            maxLength={5000}
            required
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link to="/author/tickets">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading || booksLoading}>
            {loading ? "Submitting..." : "Submit Ticket"}
          </Button>
        </div>
      </form>
    </div>
  );
}
