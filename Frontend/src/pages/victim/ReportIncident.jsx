import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { AlertTriangle, MapPin, CheckCircle, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import api from "../../lib/axios"
import { useAuth } from "../../context/AuthContext"
import { useGeolocation } from "../../hooks/useGeolocation"
import DashboardLayout from "../../components/layout/DashboardLayout"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import Select from "../../components/ui/Select"

const TYPES = ["flood", "earthquake", "fire", "accident", "medical", "shelter", "food", "other"]
const SEVERITIES = ["low", "medium", "high", "critical"]
const HELP_CATEGORIES = ["medical", "rescue", "food", "transport", "shelter", "general", "fire"]

export default function ReportIncident() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { coords, loading: locLoading, getLocation } = useGeolocation()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [submitted, setSubmitted] = useState(null)
  const [helpCategories, setHelpCategories] = useState([
    { category: "", requiredVolunteers: 1 },
  ])

  const handleGetLocation = () => {
    getLocation()
    if (coords) {
      setValue("lat", coords.lat)
      setValue("lng", coords.lng)
    }
  }

  const addCategory = () =>
    setHelpCategories([...helpCategories, { category: "", requiredVolunteers: 1 }])

  const removeCategory = (i) =>
    setHelpCategories(helpCategories.filter((_, idx) => idx !== i))

  const updateCategory = (i, field, value) => {
    const updated = [...helpCategories]
    updated[i][field] = value
    setHelpCategories(updated)
  }

  const onSubmit = async (data) => {
    if (!coords && !data.lat) {
      setApiError("Please capture your location before submitting")
      return
    }
    setLoading(true)
    setApiError("")
    try {
      const lat = coords?.lat || Number(data.lat)
      const lng = coords?.lng || Number(data.lng)

      const payload = {
        title: data.title,
        description: data.description,
        type: data.type,
        severity: data.severity,
        address: data.address,
        location: { type: "Point", coordinates: [lng, lat] },
        requiredHelp: helpCategories
          .filter((h) => h.category)
          .map((h) => ({
            category: h.category,
            requiredVolunteers: Number(h.requiredVolunteers),
          })),
      }

      const res = await api.post("/incidents", payload)
      setSubmitted(res.data.incident)
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to create incident")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-400 w-10 h-10" />
          </div>
          <h2 className="text-white text-3xl font-black">Incident Reported</h2>
          <p className="text-gray-400 mt-3">Volunteers are being notified.</p>
          <div className="bg-zinc-900 border border-zinc-800 p-6 mt-6 text-left">
            <p className="text-gray-500 text-sm">Case ID</p>
            <p className="text-red-500 font-mono font-black text-3xl mt-1">{submitted.caseId}</p>
          </div>
          <div className="flex gap-3 mt-6 justify-center">
            <Button variant="secondary" onClick={() => navigate("/victim/dashboard")}>
              View Dashboard
            </Button>
            <Button variant="primary" onClick={() => setSubmitted(null)}>
              Report Another
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/victim/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-red-500 flex items-center justify-center">
            <AlertTriangle className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-white text-2xl font-black">Report Incident</h1>
            <p className="text-gray-500 text-sm">Detailed incident report for registered users</p>
          </div>
        </div>

        {apiError && (
          <div className="bg-red-950/40 border border-red-500/30 text-red-400 px-4 py-3 mb-6 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Incident Title"
            placeholder="Brief title of the emergency"
            error={errors.title?.message}
            {...register("title", { required: "Required" })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" error={errors.type?.message} {...register("type", { required: "Required" })}>
              <option value="">Select type</option>
              {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </Select>
            <Select label="Severity" {...register("severity")}>
              {SEVERITIES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Description</label>
            <textarea
              rows={5}
              placeholder="Describe in detail: number of people, immediate needs, current situation..."
              className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:border-red-500 focus:outline-none transition-colors resize-none placeholder-gray-600"
              {...register("description", { required: "Required" })}
            />
            {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
          </div>

          <Input
            label="Address / Landmark"
            placeholder="Nearest landmark or full address"
            error={errors.address?.message}
            {...register("address", { required: "Required" })}
          />

          <input type="hidden" {...register("lat")} />
          <input type="hidden" {...register("lng")} />

          <div>
            <button
              type="button"
              onClick={handleGetLocation}
              className={`flex items-center gap-2 text-sm transition-colors ${
                coords ? "text-green-400" : "text-gray-400 hover:text-red-400"
              }`}
            >
              <MapPin size={16} />
              {locLoading ? "Getting location..." : coords ? `✓ Location captured (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})` : "Capture Current Location"}
            </button>
          </div>

          {/* Required Help */}
          <div className="border-t border-zinc-800 pt-5">
            <p className="text-white font-bold mb-3">Volunteers Required</p>
            <div className="space-y-2">
              {helpCategories.map((hc, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select
                    value={hc.category}
                    onChange={(e) => updateCategory(i, "category", e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-white px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                  >
                    <option value="">Select category</option>
                    {HELP_CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 text-xs">Count:</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={hc.requiredVolunteers}
                      onChange={(e) => updateCategory(i, "requiredVolunteers", e.target.value)}
                      className="w-16 bg-zinc-900 border border-zinc-800 text-white px-2 py-2.5 text-sm focus:border-red-500 focus:outline-none text-center"
                    />
                  </div>
                  {helpCategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCategory(i)}
                      className="text-zinc-600 hover:text-red-400 text-lg leading-none transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addCategory}
              className="text-zinc-500 hover:text-red-400 text-xs mt-3 transition-colors"
            >
              + Add another help category
            </button>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            <AlertTriangle size={18} />
            Submit Incident Report
          </Button>
        </form>
      </div>
    </DashboardLayout>
  )
}