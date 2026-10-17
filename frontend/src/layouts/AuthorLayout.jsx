
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BookOpen, LayoutDashboard, MessagesSquare, PlusCircle, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import useAuthStore from "@/store/authStore";

const navigation = [
  { label: "Dashboard", path: "/author/dashboard", icon: LayoutDashboard },
  { label: "My Books", path: "/author/books", icon: BookOpen },
  { label: "Support Tickets", path: "/author/tickets", icon: MessagesSquare },
  { label: "Create Ticket", path: "/author/tickets/new", icon: PlusCircle },
];

export default function AuthorLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="border-b border-slate-800 px-6 py-5">
        <h1 className="text-xl font-bold">BookLeaf</h1>
        <p className="mt-1 text-sm text-slate-400">Author Portal</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/author/tickets"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-3 truncate px-2 text-sm">
          <p className="font-medium">{user?.name || "Author"}</p>
          <p className="truncate text-slate-400">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="fixed inset-y-0 left-0 hidden w-64 md:block">
        {sidebar}
      </aside>

      <header className="flex items-center justify-between border-b bg-white p-4 md:hidden">
        <span className="font-bold">BookLeaf Author Portal</span>
        <button
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-2 hover:bg-slate-100"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="absolute inset-y-0 left-0 w-72">
            {sidebar}
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1 p-4 sm:p-6 md:ml-64 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
