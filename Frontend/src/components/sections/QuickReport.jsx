import { useForm } from "react-hook-form"
import { useState } from "react"
import { AlertTriangle, MapPin, CheckCircle } from "lucide-react"
import axios from "../lib/axios"

const EMERGENCY_TYPES = ["Flood", "Fire", "Earthquake", "Medical", "Accident", "Cyclone", "Other"]

export default function QuickReport() {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm()
  const [submitted, setSubmitted] = useState(null)
  const [locating, setLocating] = useState(false)

  const getLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition((pos) => {
      setValue("lat", pos.coords.latitude)
      setValue("lng", pos.coords.longitude)
      setLocating(false)
    }, () => setLocating(false))
  }

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("/incidents/quick-report", data)
      setSubmitted(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  if (submitted) {
    return (
      <div className="bg-zinc-950 py-24">
        <div className="max-w-lg mx-auto px-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-400 w-8 h-8" />
          </div>
          <h2 className="text-white text-2xl font-black">Report Submitted</h2>
          <p className="text-gray-400 mt-2">Nearby volunteers and coordinators have been alerted.</p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mt-6 text-left">
            <p className="text-gray-400 text-sm">Case ID</p>
            <p className="text-red-500 font-mono font-bold text-xl mt-1">{submitted.caseId}</p>
          </div>
          <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-4 mt-4">
            <p className="text-red-400 text-sm">
              ⚠️ For life-threatening emergencies, call <strong>112</strong> immediately.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="bg-zinc-950 py-24" id="quick-report">
      <div className="max-w-2xl mx-auto px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="text-white w-5 h-5" />
          </div>
          <div>
            <p className="text-red-500 text-xs tracking-widest uppercase">No login required</p>
            <h2 className="text-white text-3xl font-black">Report Emergency Now</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                {...register("name", { required: true })}
                placeholder="Your Name"
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
            <div>
              <input
                {...register("phone", { required: true })}
                placeholder="Phone Number"
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
          </div>

          <select
            {...register("emergencyType", { required: true })}
            className="w-full bg-zinc-900 border border-zinc-800 text-gray-300 px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
          >
            <option value="">Select Emergency Type</option>
            {EMERGENCY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <textarea
            {...register("details", { required: true })}
            placeholder="Describe the situation..."
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:border-red-500 focus:outline-none transition-colors resize-none"
          />

          <input type="hidden" {...register("lat")} />
          <input type="hidden" {...register("lng")} />

          <button
            type="button"
            onClick={getLocation}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition-colors"
          >
            <MapPin size={16} />
            {locating ? "Getting location..." : "Use Current Location (recommended)"}
          </button>

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <AlertTriangle size={20} />
            Submit Emergency Report
          </button>
        </form>
      </div>
    </section>
  )
}