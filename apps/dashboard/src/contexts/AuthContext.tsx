/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../api/api";
import toast from "react-hot-toast";

export type Role = "Admin" | "Operator" | "Viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await api.get("/api/auth/me");
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (data: any) => {
    try {
      const response = await api.post("/api/auth/login", data);
      if (response.data.success) {
        setUser(response.data.user);
        toast.success("Logged in successfully");
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await api.post("/api/auth/register", data);
      if (response.data.success) {
        setUser(response.data.user);
        toast.success("Registered successfully");
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error", error);
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
