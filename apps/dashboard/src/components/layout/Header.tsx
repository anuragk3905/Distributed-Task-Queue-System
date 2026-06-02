
import { UserCircle, LogOut } from "lucide-react";
import { Badge } from "../ui/Badge";
import { useAuth } from "../../contexts/AuthContext";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Dashboard Overview</h2>
        <Badge variant="success">Platform Online</Badge>
      </div>
      <div className="flex items-center gap-6">
        {user && (
          <div className="flex items-center gap-2">
            <UserCircle className="h-8 w-8 text-muted-foreground" />
            <div className="flex flex-col text-sm">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        )}
        {user && (
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-secondary/50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
