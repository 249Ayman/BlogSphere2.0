import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  BarChart,
  FileText,
  Plus,
  MessageSquare,
  Settings,
  LayoutDashboard,
} from "lucide-react";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: location === "/dashboard",
    },
    {
      name: "My Posts",
      href: "/posts",
      icon: FileText,
      current: location === "/posts",
    },
    {
      name: "New Post",
      href: "/new-post",
      icon: Plus,
      current: location === "/new-post",
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart,
      current: location === "/analytics",
    },
    {
      name: "Comments",
      href: "/comments",
      icon: MessageSquare,
      current: location === "/comments",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: location === "/settings",
    },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 lg:static lg:translate-x-0 transition-transform duration-200 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="ml-2 text-xl font-semibold text-gray-800">BlogWave</span>
        </div>

        {/* Close button (mobile only) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-md lg:hidden hover:bg-gray-100"
        >
          <svg
            className="w-6 h-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href}>
            <a
              className={cn(
                "flex items-center w-full px-4 py-2 text-left rounded-md group hover:bg-blue-50",
                item.current ? "bg-blue-50 text-primary" : "text-gray-700"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </a>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {user.firstName ? user.firstName[0] : user.username[0]}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
