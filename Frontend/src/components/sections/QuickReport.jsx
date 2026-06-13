import { useState } from "react"
import { useForm } from "react-hook-form"
import { AlertTriangle, MapPin, CheckCircle, Camera } from "lucide-react"
import { motion } from "framer-motion"
import api from "../../lib/axios"
import Button from "../ui/Button"
import Input from "../ui/Input"
import Select from "../ui/Select"

const EMERGENCY_TYPES = ["flood", "earthquake", "fire", "accident", "medical", "shelter", "food", "other"]
const SEVERITIES = ["low", "medium", "high", "critical"]
const HELP_CATEGORIES = ["medical", "rescue", "food", "transport", "shelter", "general", "fire"]

export default function QuickReport() {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm()
  const [submitted, setSubmitted] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locationSet, setLocationSet] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [helpCategories, setHelpCategories] = useState([{ category: "", requiredVolunteers: 1 }])

const getLocation = () => {
  setLocating(true)
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setValue("lat", lat)
      setValue("lng", lng)
      setLocationSet(true)
      setLocating(false)

      // Reverse geocode to get address
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { "User-Agent": "CrisisConnect/1.0" } }
        )
        const data = await res.json()
        if (data.display_name) {
          setValue("address", data.display_name)
        }
      } catch {
      }
    },
    () => {
      setLocating(false)
      setApiError("Could not get location. Please allow location access.")
    }
  )
}

  const addHelpCategory = () => {
    setHelpCategories([...helpCategories, { category: "", requiredVolunteers: 1 }])
  }

  const removeHelpCategory = (i) => {
    setHelpCategories(helpCategories.filter((_, idx) => idx !== i))
  }

  const updateHelpCategory = (i, field, value) => {
    const updated = [...helpCategories]
    updated[i][field] = value
    setHelpCategories(updated)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError("")
    try {
      const payload = {
        title: data.title,
        description: data.description,
        type: data.type,
        severity: data.severity || "medium",
        address: data.address,
        location: {
          type: "Point",
          coordinates: [Number(data.lng), Number(data.lat)],
        },
        reporterInfo: {
          name: data.name,
          phoneNumber: data.phone,
        },
        requiredHelp: helpCategories
          .filter((h) => h.category)
          .map((h) => ({
            category: h.category,
            requiredVolunteers: Number(h.requiredVolunteers),
          })),
      }
      const res = await api.post("/incidents/quick-report", payload)
      setSubmitted(res.data.incident)
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to submit report. Try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section className="bg-zinc-950 py-24" id="quick-report">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto px-8 text-center"
        >
          <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-400 w-10 h-10" />
          </div>
          <h2 className="text-white text-3xl font-black">Report Submitted</h2>
          <p className="text-gray-400 mt-3">Nearby volunteers and coordinators have been alerted.</p>

          <div className="bg-zinc-900 border border-zinc-800 p-6 mt-8 text-left">
            <p className="text-gray-500 text-sm">Your Case ID</p>
            <p className="text-red-500 font-mono font-black text-3xl mt-1">{submitted.caseId}</p>
            <p className="text-gray-500 text-xs mt-3">Save this ID to track your case</p>
          </div>

          <div className="bg-red-950/30 border border-red-500/20 p-4 mt-4 text-left">
            <p className="text-red-400 text-sm font-medium flex items-center gap-2">
              <AlertTriangle size={16} />
              For life-threatening emergencies, call <strong>112</strong> immediately.
            </p>
          </div>

          <button
            onClick={() => setSubmitted(null)}
            className="mt-6 text-gray-500 hover:text-white text-sm underline transition-colors"
          >
            Submit another report
          </button>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="bg-zinc-950 py-24" id="quick-report">
      <div className="max-w-2xl mx-auto px-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-red-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="text-white w-6 h-6" />
          </div>
          <div>
            <p className="text-red-500 text-xs tracking-widest uppercase font-medium">No login required</p>
            <h2 className="text-white text-3xl font-black">Report Emergency Now</h2>
          </div>
        </div>

        {apiError && (
          <div className="bg-red-950/40 border border-red-500/30 text-red-400 px-4 py-3 mb-6 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Your Name"
              placeholder="Full name"
              error={errors.name?.message}
              {...register("name", { required: "Required" })}
            />
            <Input
              label="Phone Number"
              placeholder="10-digit number"
              error={errors.phone?.message}
              {...register("phone", { required: "Required" })}
            />
          </div>

          <Input
            label="Incident Title"
            placeholder="e.g. Flood near railway bridge"
            error={errors.title?.message}
            {...register("title", { required: "Required" })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Emergency Type"
              error={errors.type?.message}
              {...register("type", { required: "Required" })}
            >
              <option value="">Select type</option>
              {EMERGENCY_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </Select>

            <Select
              label="Severity"
              {...register("severity")}
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Description</label>
            <textarea
              rows={4}
              placeholder="Describe the situation, number of people affected, immediate needs..."
              className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:border-red-500 focus:outline-none transition-colors resize-none placeholder-gray-600"
              {...register("description", { required: "Required" })}
            />
            {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
          </div>

          <Input
            label="Address"
            placeholder="Nearest landmark or full address"
            error={errors.address?.message}
            {...register("address", { required: "Required" })}
          />

          <input type="hidden" {...register("lat")} />
          <input type="hidden" {...register("lng")} />

          <button
            type="button"
            onClick={getLocation}
            className={`flex items-center gap-2 text-sm transition-colors ${
              locationSet ? "text-green-400" : "text-gray-400 hover:text-red-400"
            }`}
          >
            <MapPin size={16} />
            {locating ? "Getting your location..." : locationSet ? "✓ Location captured" : "Use Current Location (recommended)"}
          </button>

          {/* Help Categories */}
          <div>
            <p className="text-gray-400 text-sm mb-3">Volunteers Needed (optional)</p>
            <div className="space-y-2">
              {helpCategories.map((hc, i) => (
                <div key={i} className="flex gap-2">
                  <select
                    value={hc.category}
                    onChange={(e) => updateHelpCategory(i, "category", e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                  >
                    <option value="">Select category</option>
                    {HELP_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={hc.requiredVolunteers}
                    onChange={(e) => updateHelpCategory(i, "requiredVolunteers", e.target.value)}
                    className="w-16 bg-zinc-900 border border-zinc-800 text-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none text-center"
                  />
                  {helpCategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHelpCategory(i)}
                      className="text-zinc-600 hover:text-red-400 px-2 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addHelpCategory}
              className="text-zinc-500 hover:text-red-400 text-xs mt-2 transition-colors"
            >
              + Add another category
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            <AlertTriangle size={20} />
            Submit Emergency Report
          </Button>

          <p className="text-zinc-600 text-xs text-center">
            For life-threatening emergencies, call 112 immediately
          </p>
        </form>
      </div>
    </section>
  )
}