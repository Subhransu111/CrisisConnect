import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { AlertTriangle, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import api from "../../lib/axios"
import { useAuth } from "../../context/AuthContext"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError("")
    try {
      const res = await api.post("/auth/login", data)
      login(res.data.user, res.data.token)
      const role = res.data.user.role
      navigate(
        role === "admin" ? "/admin" :
        role === "volunteer" ? "/volunteer/dashboard" :
        "/victim/dashboard"
      )
    } catch (err) {
      setApiError(err.response?.data?.message || "Login failed. Check credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle size={18} className="text-white" />
          </div>
          <span className="text-white font-black text-xl tracking-tight">
            CRISIS<span className="text-red-500">CONNECT</span>
          </span>
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 p-8">
          <h1 className="text-white text-2xl font-black mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account</p>

          {apiError && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-400 px-4 py-3 mb-6 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" }
              })}
            />

            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full bg-zinc-950 border text-white px-4 py-3 pr-12 focus:outline-none transition-colors placeholder-gray-600 ${errors.password ? "border-red-500" : "border-zinc-800 focus:border-red-500"}`}
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
              Sign In
            </Button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-red-400 hover:text-red-300 font-medium transition-colors">
              Register
            </Link>
          </p>
        </div>

        <p className="text-zinc-700 text-xs text-center mt-6">
          Not a replacement for 112 • For life-threatening emergencies call emergency services
        </p>
      </motion.div>
    </div>
  )
}