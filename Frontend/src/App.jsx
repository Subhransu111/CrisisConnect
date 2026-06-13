import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import SplashScreen from "./components/sections/SplashScreen"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { SocketProvider } from "./context/SocketContext"
import Home from "./pages/Home"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import VictimDashboard from "./pages/victim/VictimDashboard"
import ReportIncident from "./pages/victim/ReportIncident"
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard"
import AdminDashboard from "./pages/admin/AdminDashboard"

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/victim/dashboard" element={
          <ProtectedRoute roles={["victim", "admin"]}>
            <VictimDashboard />
          </ProtectedRoute>
        } />
        <Route path="/victim/report" element={
          <ProtectedRoute roles={["victim", "admin"]}>
            <ReportIncident />
          </ProtectedRoute>
        } />

        <Route path="/volunteer/dashboard" element={
          <ProtectedRoute roles={["volunteer"]}>
            <VolunteerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: { background: "#18181b", border: "1px solid #27272a", color: "#fff" }
          }}
        />
        {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
        {splashDone && <AppRoutes />}
      </SocketProvider>
    </AuthProvider>
  )
}