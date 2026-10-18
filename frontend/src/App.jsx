import { useEffect } from "react";
import Login from "./pages/Login";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthorLayout from "./layouts/AuthorLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminTickets from "./pages/admin/AdminTickets";
import AuthorDashboard from "./pages/author/AuthorDashboard";
import AuthorBooks from "./pages/author/AuthorBooks";
import AuthorTickets from "./pages/author/AuthorTickets";
import CreateTicket from "./pages/author/CreateTicket";
import AuthorTicketDetails from "./pages/author/AuthorTicketDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthStore from "./store/authStore";
import AdminTicketDetails from "./pages/admin/AdminTicketDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";

const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Author pages share AuthorLayout */}
      <Route
        path="/author"
        element={
          <ProtectedRoute role="author">
            <AuthorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AuthorDashboard />} />
        <Route path="books" element={<AuthorBooks />} />
        <Route path="tickets" element={<AuthorTickets />} />
        <Route path="tickets/new" element={<CreateTicket />} />
        <Route path="tickets/:ticketId" element={<AuthorTicketDetails />} />
      </Route>

      {/* Admin pages share AdminLayout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="tickets" element={<AdminTickets />} />
        <Route path="tickets/:ticketId" element={<AdminTicketDetails />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
