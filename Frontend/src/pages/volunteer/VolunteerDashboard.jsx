import { useEffect, useState } from "react"
import { MapPin, Clock, Users, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import axios from "../../lib/axios"

const SEVERITY_COLOR = {
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/10 text-green-400 border-green-500/30",
}

export default function VolunteerDashboard() {
  const [cases, setCases] = useState([])

  useEffect(() => {
    axios.get("/incidents/nearby").then(res => setCases(res.data))
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-8 py-6">
        <h1 className="text-2xl font-black">Nearby Cases</h1>
        <p className="text-gray-500 text-sm mt-1">Sorted by severity and proximity</p>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 space-y-4">
        {cases.map((c, i) => (
          <motion.div
            key={c._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 p-6 cursor-pointer transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs px-2 py-1 border rounded-sm font-medium uppercase tracking-wide ${SEVERITY_COLOR[c.severity]}`}>
                    {c.severity}
                  </span>
                  <span className="text-gray-500 text-xs">{c.type}</span>
                  <span className="text-gray-500 text-xs">#{c.caseId}</span>
                </div>
                <h3 className="text-white font-bold text-lg">{c.title}</h3>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{c.description}</p>

                {/* Volunteer slots */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {c.requiredHelp?.map(rh => (
                    <div key={rh.category} className="bg-zinc-800 px-3 py-1.5 rounded-sm text-xs">
                      <span className="text-gray-300">{rh.category}</span>
                      <span className={`ml-2 font-bold ${rh.joined >= rh.required ? "text-green-400" : "text-red-400"}`}>
                        {rh.joined}/{rh.required}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 ml-6">
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <MapPin size={14} />
                  <span>{c.distance} km away</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Clock size={14} />
                  <span>{c.timeAgo}</span>
                </div>
                <button className="mt-4 bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-4 py-2 flex items-center gap-1 transition-all">
                  Accept <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}