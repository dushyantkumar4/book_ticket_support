
import { useEffect, useState } from "react";
import { getMyBooks } from "@/api/bookApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthorBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyBooks()
      .then((data) => setBooks(data.books ?? []))
      .catch((err) => {
        setError(
          err.response?.data?.message || "Failed to load your books."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your books...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Books</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your book details, production status and royalties.
        </p>
      </div>

      {books.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-500">
            No books found for your account.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <Card key={book._id || book.bookId}>
              <CardHeader>
                <CardTitle className="text-lg">{book.title}</CardTitle>
                <p className="text-sm text-slate-500">
                  ISBN: {book.isbn || "Not assigned"}
                </p>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Genre</span>
                  <span>{book.genre || "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Status</span>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">
                    {book.status || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Copies sold</span>
                  <span>{book.totalCopiesSold ?? 0}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Total royalties</span>
                  <span>
                    ₹{Number(book.totalRoyaltyEarned || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between gap-3 border-t pt-3">
                  <span className="text-slate-500">Pending royalties</span>
                  <span className="font-semibold">
                    ₹{Number(book.royaltyPending || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Last payout</span>
                  <span>
                    {book.lastRoyaltyPayoutDate
                      ? new Date(book.lastRoyaltyPayoutDate).toLocaleDateString()
                      : "No payout recorded"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
