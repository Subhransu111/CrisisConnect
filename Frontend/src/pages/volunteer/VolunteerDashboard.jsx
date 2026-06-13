import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { MapPin, Clock, ChevronRight, Filter, RefreshCw } from "lucide-react"
import DashboardLayout from "../../components/layout/DashboardLayout"
import IncidentMap from "../../components/map/IncidentMap"
import Badge from "../../components/ui/Badge"
import Card from "../../components/ui/Card"
import Modal from "../../components/ui/Modal"
import Button from "../../components/ui/Button"
import api from "../../lib/axios"
import { useAuth } from "../../context/AuthContext"
import { useGeolocation } from "../../hooks/useGeolocation"
import { useSocketEvent } from "../../hooks/useSocket"
import {
  SEVERITY_COLORS, STATUS_COLORS, INCIDENT_TYPE_ICONS,
  HELP_CATEGORY_ICONS, timeAgo, formatStatus
} from "../../utils/helper"
import NearbyCase from "./NearbyCase"

const HELP_CATEGORIES = ["medical", "rescue", "food", "transport", "shelter", "general", "fire"]

export default function VolunteerDashboard() {
  const { user } = useAuth()
  const { coords, getLocation } = useGeolocation()
  const [tab, setTab] = useState("nearby") // "nearby" | "my-cases"
  const [incidents, setIncidents] = useState([])
  const [myCases, setMyCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [availability, setAvailability] = useState(user?.volunteerProfile?.availability || "offline")
  const [updatingAvailability, setUpdatingAvailability] = useState(false)
  const [mapView, setMapView] = useState(false)

  useEffect(() => {
    getLocation()
    fetchMyCases()
  }, [])

  useEffect(() => {
    if (coords) fetchNearby()
  }, [coords])

  // Live socket updates
  useSocketEvent("incident:new", useCallback((incident) => {
    setIncidents((prev) => [incident, ...prev])
  }, []))

  useSocketEvent("incident:update", useCallback((updated) => {
    setIncidents((prev) => prev.map((i) => i._id === updated._id ? updated : i))
    setMyCases((prev) => prev.map((i) => i._id === updated._id ? updated : i))
  }, []))

  const fetchNearby = async () => {
    if (!coords) return
    setLoading(true)
    try {
      const res = await api.get(`/incidents/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=20000`)
      setIncidents(res.data.incidents)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyCases = async () => {
    try {
      const res = await api.get("/volunteers/my-cases")
      setMyCases(res.data.incidents)
    } catch (err) {
      console.error(err)
    }
  }

  const updateAvailability = async (status) => {
    setUpdatingAvailability(true)
    try {
      await api.patch("/volunteers/availability", { availability: status })
      setAvailability(status)
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingAvailability(false)
    }
  }

  const availabilityColor = {
    available: "bg-green-500/10 text-green-400 border-green-500/30",
    busy: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    offline: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
  }

  const displayedIncidents = tab === "nearby" ? incidents : myCases

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-white text-2xl font-black">Volunteer Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              {coords
                ? `Showing cases within 20km of your location`
                : "Getting your location..."}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Availability toggle */}
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1">
              {["available", "busy", "offline"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateAvailability(s)}
                  disabled={updatingAvailability}
                  className={`px-3 py-1.5 text-xs font-medium capitalize transition-all border ${
                    availability === s
                      ? availabilityColor[s]
                      : "border-transparent text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={fetchNearby}
              className="text-zinc-500 hover:text-white transition-colors p-2 border border-zinc-800 hover:border-zinc-600"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={() => setMapView(!mapView)}
              className={`text-sm px-4 py-2 border transition-all ${
                mapView
                  ? "border-red-500 text-red-400 bg-red-500/10"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              {mapView ? "List View" : "Map View"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Nearby Cases", value: incidents.length, color: "text-white" },
            { label: "My Active Cases", value: myCases.filter((c) => c.resolutionStatus !== "resolved").length, color: "text-orange-400" },
            { label: "Completed", value: myCases.filter((c) => c.resolutionStatus === "resolved").length, color: "text-green-400" },
            { label: "Critical Nearby", value: incidents.filter((c) => c.severity === "critical").length, color: "text-red-400" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-5">
              <p className="text-gray-500 text-xs uppercase tracking-widest">{label}</p>
              <p className={`font-black text-3xl mt-1 ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        {/* Map view */}
        {mapView && (
          <div className="mb-8 border border-zinc-800 overflow-hidden">
            <IncidentMap
              incidents={displayedIncidents}
              height="380px"
              center={coords ? [coords.lat, coords.lng] : undefined}
              onIncidentClick={setSelectedIncident}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 mb-6 border-b border-zinc-800">
          {[
            { key: "nearby", label: `Nearby Cases (${incidents.length})` },
            { key: "my-cases", label: `My Cases (${myCases.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-6 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                tab === key
                  ? "border-red-500 text-red-400"
                  : "border-transparent text-gray-500 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Cases list */}
        {loading && tab === "nearby" && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
          </div>
        )}

        {!loading && displayedIncidents.length === 0 && (
          <Card className="p-12 text-center">
            <MapPin size={40} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-gray-500">
              {tab === "nearby"
                ? "No nearby incidents found within 20km"
                : "You haven't accepted any cases yet"}
            </p>
          </Card>
        )}

        <div className="space-y-4">
          {displayedIncidents.map((inc, i) => (
            <motion.div
              key={inc._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <NearbyCase
                incident={inc}
                onAccepted={fetchMyCases}
                onSelect={() => setSelectedIncident(inc)}
                isMyCase={tab === "my-cases"}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Incident detail modal */}
      {selectedIncident && (
        <Modal
          open={!!selectedIncident}
          onClose={() => setSelectedIncident(null)}
          title={selectedIncident.title}
        >
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge className={SEVERITY_COLORS[selectedIncident.severity]}>{selectedIncident.severity}</Badge>
              <Badge className={STATUS_COLORS[selectedIncident.resolutionStatus]}>
                {formatStatus(selectedIncident.resolutionStatus)}
              </Badge>
            </div>

            <div className="space-y-2 text-gray-400">
              <p><span className="text-gray-600">Case ID:</span> <span className="text-red-400 font-mono">{selectedIncident.caseId}</span></p>
              <p><span className="text-gray-600">Type:</span> {INCIDENT_TYPE_ICONS[selectedIncident.type]} {selectedIncident.type}</p>
              <p><span className="text-gray-600">Address:</span> {selectedIncident.address}</p>
              <p><span className="text-gray-600">Description:</span> {selectedIncident.description}</p>
            </div>

            {selectedIncident.requiredHelp?.length > 0 && (
              <div>
                <p className="text-white font-bold mb-2">Required Volunteers</p>
                <div className="space-y-2">
                  {selectedIncident.requiredHelp.map((rh) => (
                    <div key={rh.category} className="flex justify-between items-center bg-zinc-950 p-3">
                      <span className="text-gray-300 capitalize">{HELP_CATEGORY_ICONS[rh.category]} {rh.category}</span>
                      <span className={`font-bold ${rh.fulfilledVolunteers >= rh.requiredVolunteers ? "text-green-400" : "text-red-400"}`}>
                        {rh.fulfilledVolunteers}/{rh.requiredVolunteers} filled
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}