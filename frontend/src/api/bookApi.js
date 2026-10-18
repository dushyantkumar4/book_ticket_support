
import api from "@/api/api";

export const getMyBooks = async () => {
  const response = await api.get("/books/mine");
  return response.data;
};

export const getBookById = async (bookId) => {
  const response = await api.get(`/books/${bookId}`);
  return response.data;
};
