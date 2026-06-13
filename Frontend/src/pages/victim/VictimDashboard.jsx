import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { AlertTriangle, Plus, MapPin, Clock, ChevronRight } from "lucide-react"
import DashboardLayout from "../../components/layout/DashboardLayout"
import IncidentMap from "../../components/map/IncidentMap"
import EmergencyMessage from "../../components/EmergencyMessage"
import LiveTracking from "../../components/map/LiveTracking"
import Badge from "../../components/ui/Badge"
import Card from "../../components/ui/Card"
import Modal from "../../components/ui/Modal"
import api from "../../lib/axios"
import { useAuth } from "../../context/AuthContext"
import {
  SEVERITY_COLORS, STATUS_COLORS, INCIDENT_TYPE_ICONS,
  timeAgo, formatStatus
} from "../../utils/helper"

export default function VictimDashboard() {
  const { user } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [showEmergency, setShowEmergency] = useState(false)
  const [showTracking, setShowTracking] = useState(false)
  const [trackingIncident, setTrackingIncident] = useState(null)

  useEffect(() => {
    fetchMyIncidents()
  }, [])

  const fetchMyIncidents = async () => {
    try {
      const res = await api.get("/incidents?page=1&limit=50")
      // filter only the current user's incidents
      const myIncidents = res.data.incidents.filter(
        (inc) => inc.reportedBy?._id === user?.id || inc.reportedBy?.id === user?.id
      )
      setIncidents(myIncidents)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openTracking = (incident) => {
    setTrackingIncident(incident)
    setShowTracking(true)
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-black">My Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Track your reported incidents</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowEmergency(true)}
              className="flex items-center gap-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 px-4 py-2 text-sm font-medium transition-all"
            >
              <AlertTriangle size={16} />
              Emergency Contacts
            </button>
            <Link
              to="/victim/report"
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-bold transition-all"
            >
              <Plus size={16} />
              Report Incident
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Reports", value: incidents.length, color: "text-white" },
            { label: "Open", value: incidents.filter((i) => i.resolutionStatus === "open").length, color: "text-blue-400" },
            { label: "In Progress", value: incidents.filter((i) => i.resolutionStatus === "in_progress").length, color: "text-orange-400" },
            { label: "Resolved", value: incidents.filter((i) => i.resolutionStatus === "resolved").length, color: "text-green-400" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-5">
              <p className="text-gray-500 text-xs uppercase tracking-widest">{label}</p>
              <p className={`font-black text-3xl mt-1 ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        {/* Map of all incidents */}
        {incidents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-white font-bold mb-3">Incident Map</h2>
            <div className="border border-zinc-800 overflow-hidden">
              <IncidentMap
                incidents={incidents}
                height="300px"
                onIncidentClick={setSelectedIncident}
              />
            </div>
            <p className="text-zinc-600 text-xs mt-2">Click a marker to see incident details</p>
          </div>
        )}

        {/* Incidents List */}
        <div>
          <h2 className="text-white font-bold mb-4">Your Reports</h2>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
            </div>
          )}

          {!loading && incidents.length === 0 && (
            <Card className="p-12 text-center">
              <AlertTriangle size={40} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-gray-500">No incidents reported yet</p>
              <Link
                to="/victim/report"
                className="inline-flex items-center gap-2 mt-4 bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-6 py-2.5 transition-all"
              >
                <Plus size={16} /> Report Your First Incident
              </Link>
            </Card>
          )}

          <div className="space-y-4">
            {incidents.map((inc, i) => (
              <motion.div
                key={inc._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card hover className="p-5" onClick={() => setSelectedIncident(inc)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-lg">{INCIDENT_TYPE_ICONS[inc.type]}</span>
                        <Badge className={SEVERITY_COLORS[inc.severity]}>{inc.severity}</Badge>
                        <Badge className={STATUS_COLORS[inc.resolutionStatus]}>
                          {formatStatus(inc.resolutionStatus)}
                        </Badge>
                        <span className="text-zinc-600 text-xs font-mono">{inc.caseId}</span>
                      </div>
                      <h3 className="text-white font-bold truncate">{inc.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {inc.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {timeAgo(inc.createdAt)}
                        </span>
                      </div>

                      {/* Volunteer slots */}
                      {inc.requiredHelp?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {inc.requiredHelp.map((rh) => (
                            <div
                              key={rh.category}
                              className="bg-zinc-800 px-2.5 py-1 text-xs flex items-center gap-1.5"
                            >
                              <span className="text-gray-400 capitalize">{rh.category}</span>
                              <span className={`font-bold ${rh.fulfilledVolunteers >= rh.requiredVolunteers ? "text-green-400" : "text-red-400"}`}>
                                {rh.fulfilledVolunteers}/{rh.requiredVolunteers}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {inc.assignedVolunteers?.some((v) => v.status === "on_the_way") && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openTracking(inc) }}
                          className="text-xs bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1.5 hover:bg-green-500/20 transition-all flex items-center gap-1"
                        >
                          📍 Track Live
                        </button>
                      )}
                      <ChevronRight size={18} className="text-zinc-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Incident Detail Modal */}
      <Modal
        open={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident?.title || "Incident Details"}
      >
        {selectedIncident && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge className={SEVERITY_COLORS[selectedIncident.severity]}>
                {selectedIncident.severity}
              </Badge>
              <Badge className={STATUS_COLORS[selectedIncident.resolutionStatus]}>
                {formatStatus(selectedIncident.resolutionStatus)}
              </Badge>
            </div>

            <div className="space-y-2 text-gray-400">
              <p><span className="text-gray-600">Case ID:</span> <span className="text-red-400 font-mono font-bold">{selectedIncident.caseId}</span></p>
              <p><span className="text-gray-600">Type:</span> {INCIDENT_TYPE_ICONS[selectedIncident.type]} {selectedIncident.type}</p>
              <p><span className="text-gray-600">Address:</span> {selectedIncident.address}</p>
              <p><span className="text-gray-600">Description:</span> {selectedIncident.description}</p>
            </div>

            {/* Assigned volunteers */}
            {selectedIncident.assignedVolunteers?.length > 0 && (
              <div>
                <p className="text-white font-bold mb-2">Assigned Volunteers</p>
                <div className="space-y-2">
                  {selectedIncident.assignedVolunteers.map((av, i) => (
                    <div key={i} className="bg-zinc-950 border border-zinc-800 p-3 flex justify-between items-center">
                      <div>
                        <p className="text-white text-sm font-medium">{av.volunteer?.name || "Volunteer"}</p>
                        <p className="text-gray-500 text-xs capitalize">{av.helpCategory}</p>
                      </div>
                      <Badge className={
                        av.status === "completed" ? "bg-green-500/10 text-green-400 border border-green-500/30" :
                        av.status === "reached" ? "bg-blue-500/10 text-blue-400 border border-blue-500/30" :
                        av.status === "on_the_way" ? "bg-orange-500/10 text-orange-400 border border-orange-500/30" :
                        "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30"
                      }>
                        {formatStatus(av.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <EmergencyMessage incident={selectedIncident} user={user} />
          </div>
        )}
      </Modal>

      {/* Live Tracking Modal */}
      <Modal
        open={showTracking}
        onClose={() => setShowTracking(false)}
        title="Live Volunteer Tracking"
      >
        {trackingIncident && (
          <LiveTracking
            incidentId={trackingIncident._id}
            victimLocation={[
              trackingIncident.location.coordinates[1],
              trackingIncident.location.coordinates[0],
            ]}
            volunteerName={trackingIncident.assignedVolunteers?.find(
              (v) => v.status === "on_the_way"
            )?.volunteer?.name}
          />
        )}
      </Modal>

      {/* Emergency contacts modal */}
      <Modal open={showEmergency} onClose={() => setShowEmergency(false)} title="Emergency Contacts">
        <EmergencyMessage incident={null} user={user} />
      </Modal>
    </DashboardLayout>
  )
}