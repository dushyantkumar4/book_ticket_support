
import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

export default function ProtectedRoute({ role, children }) {
  const user = useAuthStore((state) => state.user);
  const isCheckingAuth = useAuthStore(
    (state) => state.isCheckingAuth
  );

  if (isCheckingAuth) {
    return <div className="p-8">Checking your session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/author/dashboard"}
        replace
      />
    );
  }

  return children;
}
