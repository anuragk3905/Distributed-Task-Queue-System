import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { RoleRoute } from "./components/layout/RoleRoute";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import CreateTask from "./pages/CreateTask";
import Jobs from "./pages/Jobs";
import Workflows from "./pages/Workflows";
import Workers from "./pages/Workers";
import QueueManagement from "./pages/QueueManagement";
import Metrics from "./pages/Metrics";
import DLQ from "./pages/DLQ";
import Health from "./pages/Health";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Landing from "./pages/Landing";

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid #27272a",
          },
        }}
      />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Landing />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Outlet /></DashboardLayout></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="create-task" element={<RoleRoute allowedRoles={["Admin", "Operator"]}><CreateTask /></RoleRoute>} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="workflows" element={<RoleRoute allowedRoles={["Admin", "Operator"]}><Workflows /></RoleRoute>} />
            <Route path="workers" element={<Workers />} />
            <Route path="queue" element={<RoleRoute allowedRoles={["Admin"]}><QueueManagement /></RoleRoute>} />
            <Route path="metrics" element={<Metrics />} />
            <Route path="dlq" element={<RoleRoute allowedRoles={["Admin", "Operator"]}><DLQ /></RoleRoute>} />
            <Route path="health" element={<Health />} />
            <Route path="profile" element={<Profile />} />
            <Route path="users" element={<RoleRoute allowedRoles={["Admin"]}><Users /></RoleRoute>} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;