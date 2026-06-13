import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { AlertTriangle, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import api from "../../lib/axios"
import { useAuth } from "../../context/AuthContext"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import Select from "../../components/ui/Select"

const SKILLS = ["medical", "rescue", "food", "transport", "shelter", "general", "fire"]

export default function Register() {
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get("role") || "victim"
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: defaultRole }
  })
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [selectedSkills, setSelectedSkills] = useState([])

  const role = watch("role")

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const onSubmit = async (data) => {
    if (data.role === "volunteer" && selectedSkills.length === 0) {
      setApiError("Please select at least one volunteer skill")
      return
    }
    setLoading(true)
    setApiError("")
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        role: data.role,
        ...(data.role === "volunteer" && {
          address: data.address,
          volunteerProfile: { skills: selectedSkills },
        }),
      }
      const res = await api.post("/auth/register", payload)
      login(res.data.user, res.data.token)
      navigate(data.role === "volunteer" ? "/volunteer/dashboard" : "/victim/dashboard")
    } catch (err) {
      setApiError(err.response?.data?.message || "Registration failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
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
        className="w-full max-w-lg"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle size={18} className="text-white" />
          </div>
          <span className="text-white font-black text-xl tracking-tight">
            CRISIS<span className="text-red-500">CONNECT</span>
          </span>
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 p-8">
          <h1 className="text-white text-2xl font-black mb-1">Create Account</h1>
          <p className="text-gray-500 text-sm mb-8">Join to make a difference</p>

          {apiError && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-400 px-4 py-3 mb-6 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role selector */}
            <div className="grid grid-cols-3 gap-2">
              {["victim", "volunteer"].map((r) => (
                <label
                  key={r}
                  className={`cursor-pointer border p-3 text-center text-sm font-medium transition-all col-span-${r === "victim" ? "1" : "2"} ${
                    role === r
                      ? "border-red-500 bg-red-500/10 text-red-400"
                      : "border-zinc-800 text-gray-500 hover:border-zinc-600"
                  }`}
                >
                  <input type="radio" value={r} className="hidden" {...register("role")} />
                  <span className="capitalize">{r}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Your name"
                error={errors.name?.message}
                {...register("name", { required: "Required" })}
              />
              <Input
                label="Phone Number"
                placeholder="10-digit number"
                error={errors.phoneNumber?.message}
                {...register("phoneNumber", { required: "Required" })}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email", {
                required: "Required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
              })}
            />

            <div className="flex flex-col gap-1 relative">
              <label className="text-gray-400 text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  className={`w-full bg-zinc-950 border text-white px-4 py-3 pr-12 focus:outline-none transition-colors placeholder-gray-600 ${errors.password ? "border-red-500" : "border-zinc-800 focus:border-red-500"}`}
                  {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 characters" } })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
            </div>

            {/* Volunteer-only fields */}
            {role === "volunteer" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 border-t border-zinc-800 pt-4"
              >
                <Input
                  label="Your Address (for nearby matching)"
                  placeholder="e.g. Near XYZ School, Bhubaneswar, Odisha"
                  error={errors.address?.message}
                  {...register("address", {
                    required: role === "volunteer" ? "Address required for volunteers" : false,
                  })}
                />

                <div>
                  <label className="text-gray-400 text-sm block mb-3">Your Skills (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 text-xs font-medium border transition-all capitalize ${
                          selectedSkills.includes(skill)
                            ? "border-red-500 bg-red-500/10 text-red-400"
                            : "border-zinc-700 text-gray-400 hover:border-zinc-500"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
              Create Account
            </Button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-red-400 hover:text-red-300 font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}