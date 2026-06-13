import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { AlertTriangle, Menu, X, LogOut, User, LayoutDashboard } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate("/")
  }

  const scrollToReport = (e) => {
    e.preventDefault()
    setMenuOpen(false)
    const el = document.getElementById("quick-report")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    } else {
      navigate("/#quick-report")
    }
  }

  const dashboardPath =
    user?.role === "admin" ? "/admin" :
    user?.role === "volunteer" ? "/volunteer/dashboard" :
    "/victim/dashboard"

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle size={16} className="text-white" />
          </div>
          <span className="text-white font-black tracking-tight">
            CRISIS<span className="text-red-500">CONNECT</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="/#quick-report"
            onClick={scrollToReport}
            className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
          >
            Report Emergency
          </a>
          {!user && (
            <>
              <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-4 py-2 transition-all"
              >
                Join as Volunteer
              </Link>
            </>
          )}
          {user && (
            <div className="flex items-center gap-4">
              <Link
                to={dashboardPath}
                className={`flex items-center gap-1.5 text-sm transition-colors ${isActive(dashboardPath) ? "text-red-400" : "text-gray-400 hover:text-white"}`}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <User size={16} />
                <span>{user.name}</span>
                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-sm text-zinc-400 uppercase">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-400 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-400 hover:text-white focus:outline-none"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden bg-zinc-950 border-t border-zinc-800 px-6 py-4 space-y-3 absolute left-0 right-0 top-16">
          <a
            href="/#quick-report"
            onClick={scrollToReport}
            className="block text-gray-400 text-sm py-2"
          >
            Report Emergency
          </a>

          {!user ? (
            <>
              <Link to="/login" className="block text-gray-400 text-sm py-2" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="block text-white bg-red-500 text-sm py-2 px-4 text-center" onClick={() => setMenuOpen(false)}>
                Join as Volunteer
              </Link>
            </>
          ) : (
            <>
              <Link to={dashboardPath} className="block text-gray-400 text-sm py-2" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="block text-red-400 text-sm py-2 w-full text-left">
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}