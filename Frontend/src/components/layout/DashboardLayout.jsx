import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Navbar from "./Navbar"

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    navigate("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-16">{children}</div>
    </div>
  )
}