import { useState, useEffect } from "react";
import { api } from "../api/api";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Users as UsersIcon, Shield, Trash2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const loadUsers = async () => {
    try {
      const response = await api.get("/api/users");
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await api.put(`/api/users/${userId}/role`, { role: newRole });
      if (response.data.success) {
        toast.success("Role updated successfully");
        loadUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await api.delete(`/api/users/${userId}`);
      if (response.data.success) {
        toast.success("User deleted successfully");
        loadUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading users...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">Manage platform access and assign roles.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" />
            Registered Users
          </CardTitle>
          <CardDescription>View and manage all users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3 rounded-tr-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {u.role === "Admin" && <ShieldAlert className="h-4 w-4 text-rose-500" />}
                        {u.role === "Operator" && <Shield className="h-4 w-4 text-amber-500" />}
                        {u.role === "Viewer" && <UsersIcon className="h-4 w-4 text-slate-500" />}
                        <select
                          className="h-8 w-[120px] rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={u._id === currentUser?.id}
                        >
                          <option value="Admin" className="bg-background text-foreground">Admin</option>
                          <option value="Operator" className="bg-background text-foreground">Operator</option>
                          <option value="Viewer" className="bg-background text-foreground">Viewer</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(u._id)}
                        disabled={u._id === currentUser?.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
