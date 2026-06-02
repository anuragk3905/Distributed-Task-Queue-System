import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListTodo, 
  GitMerge, 
  Users, 
  Settings2, 
  BarChart3, 
  AlertOctagon, 
  HeartPulse,
  UserCog
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
};

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "Operator", "Viewer"] },
  { name: "Create Task", href: "/dashboard/create-task", icon: PlusCircle, roles: ["Admin", "Operator"] },
  { name: "Jobs", href: "/dashboard/jobs", icon: ListTodo, roles: ["Admin", "Operator", "Viewer"] },
  { name: "Workflows", href: "/dashboard/workflows", icon: GitMerge, roles: ["Admin", "Operator"] },
  { name: "Workers", href: "/dashboard/workers", icon: Users, roles: ["Admin", "Operator", "Viewer"] },
  { name: "Queue Management", href: "/dashboard/queue", icon: Settings2, roles: ["Admin"] },
  { name: "Metrics", href: "/dashboard/metrics", icon: BarChart3, roles: ["Admin", "Operator", "Viewer"] },
  { name: "DLQ", href: "/dashboard/dlq", icon: AlertOctagon, roles: ["Admin", "Operator"] },
  { name: "Health", href: "/dashboard/health", icon: HeartPulse, roles: ["Admin", "Operator", "Viewer"] },
  { name: "Users", href: "/dashboard/users", icon: UserCog, roles: ["Admin"] },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <GitMerge className="h-6 w-6 text-primary mr-2" />
        <span className="text-lg font-bold tracking-tight">TaskFlow HQ</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

    </div>
  );
}
