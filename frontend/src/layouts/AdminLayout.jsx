
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  BookOpen,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/authStore";

const navigation = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Support Tickets",
    path: "/admin/tickets",
    icon: LifeBuoy,
  },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
          <BookOpen className="size-5" />
        </div>
        <div>
          <p className="font-bold tracking-tight">BookLeaf</p>
          <p className="text-xs text-muted-foreground">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Icon className="size-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.name || "BookLeaf Admin"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email || "Administrator"}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Log out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background md:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-background shadow-xl">
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="size-5" />
              </Button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
            <div>
              <p className="font-semibold">Support Operations</p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Author Support & Communication Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Signed in as Admin
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
