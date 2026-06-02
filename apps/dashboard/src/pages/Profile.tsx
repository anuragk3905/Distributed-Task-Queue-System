import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { User, Mail, Shield } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your personal details and assigned role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Full Name</p>
              <p className="font-semibold text-lg">{user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Email Address</p>
              <p className="font-semibold text-lg">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
            <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Platform Role</p>
              <p className="font-semibold text-lg">{user.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
