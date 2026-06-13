import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"
import { AlertTriangle, Users, CheckCircle, Clock, Shield, MapPin, RefreshCw } from "lucide-react"
import DashboardLayout from "../../components/layout/DashboardLayout"
import IncidentMap from "../../components/map/IncidentMap"
import Badge from "../../components/ui/Badge"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Modal from "../../components/ui/Modal"
import api from "../../lib/axios"
import { useSocketEvent } from "../../hooks/useSocket"
import { SEVERITY_COLORS, STATUS_COLORS, INCIDENT_TYPE_ICONS, timeAgo, formatStatus } from "../../utils/helper"
import { toast } from "sonner"

const CHART_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [tab, setTab] = useState("overview") // overview | incidents | map

  useEffect(() => {
    fetchStats()
    fetchAllIncidents()
  }, [])

  useSocketEvent("incident:new", useCallback((inc) => {
    setIncidents((prev) => [inc, ...prev])
    toast.error(`New incident: ${inc.title}`, { duration: 5000 })
  }, []))

  useSocketEvent("incident:update", useCallback((updated) => {
    setIncidents((prev) => prev.map((i) => i._id === updated._id ? updated : i))
  }, []))

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats")
      setStats(res.data.stats)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchAllIncidents = async () => {
    setLoading(true)
    try {
      const res = await api.get("/incidents?limit=100")
      setIncidents(res.data.incidents)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const verifyIncident = async (id, status) => {
    setVerifying(true)
    try {
      await api.patch(`/incidents/${id}/verify`, { verificationStatus: status })
      toast.success(`Incident ${status}`)
      fetchAllIncidents()
      setSelectedIncident(null)
    } catch (err) {
      toast.error("Failed to update verification")
    } finally {
      setVerifying(false)
    }
  }

  const closeIncident = async (id) => {
    try {
      await api.patch(`/incidents/${id}/status`, { resolutionStatus: "closed" })
      toast.success("Incident closed")
      fetchAllIncidents()
      setSelectedIncident(null)
    } catch (err) {
      toast.error("Failed to close incident")
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-white text-2xl font-black">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Live coordination center</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { fetchStats(); fetchAllIncidents() }}
              className="flex items-center gap-2 text-sm border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white px-4 py-2 transition-all"
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-8 border-b border-zinc-800">
          {[
            { key: "overview", label: "Overview" },
            { key: "incidents", label: `Incidents (${incidents.length})` },
            { key: "map", label: "Live Map" },
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

        {/* OVERVIEW TAB */}
        {tab === "overview" && stats && (
          <div className="space-y-8">
            {/* Incident stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Incidents", value: stats.incidents.total, icon: AlertTriangle, color: "text-white" },
                { label: "Open", value: stats.incidents.open, icon: Clock, color: "text-blue-400" },
                { label: "In Progress", value: stats.incidents.inProgress, icon: Shield, color: "text-orange-400" },
                { label: "Resolved", value: stats.incidents.resolved, icon: CheckCircle, color: "text-green-400" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-xs uppercase tracking-widest">{label}</p>
                    <Icon size={16} className={color} />
                  </div>
                  <p className={`font-black text-3xl ${color}`}>{value}</p>
                </Card>
              ))}
            </div>

            {/* Volunteer stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Volunteers", value: stats.volunteers.total, color: "text-white" },
                { label: "Available", value: stats.volunteers.available, color: "text-green-400" },
                { label: "Busy", value: stats.volunteers.busy, color: "text-orange-400" },
                { label: "Offline", value: stats.volunteers.offline, color: "text-zinc-500" },
              ].map(({ label, value, color }) => (
                <Card key={label} className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={14} className="text-gray-600" />
                    <p className="text-gray-500 text-xs uppercase tracking-widest">{label}</p>
                  </div>
                  <p className={`font-black text-3xl ${color}`}>{value}</p>
                </Card>
              ))}
            </div>

            {/* Charts */}
            {stats.charts && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* By Type */}
                <Card className="p-6">
                  <p className="text-white font-bold mb-4">Incidents by Type</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.charts.byType}>
                      <XAxis dataKey="_id" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", color: "#fff" }} />
                      <Bar dataKey="count" fill="#ef4444" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* By Severity */}
                <Card className="p-6">
                  <p className="text-white font-bold mb-4">Incidents by Severity</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={stats.charts.bySeverity}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.charts.bySeverity.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            )}

            {/* Recent Critical Incidents */}
            {stats.recentCriticalIncidents?.length > 0 && (
              <div>
                <p className="text-white font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  Recent Critical Incidents
                </p>
                <div className="space-y-2">
                  {stats.recentCriticalIncidents.map((inc) => (
                    <Card
                      key={inc._id}
                      hover
                      className="p-4"
                      onClick={() => {
                        setSelectedIncident(inc)
                        setTab("incidents")
                      }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-zinc-600 text-xs font-mono">{inc.caseId}</span>
                            <Badge className={SEVERITY_COLORS[inc.severity]}>{inc.severity}</Badge>
                          </div>
                          <p className="text-white text-sm font-medium truncate">{inc.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{inc.address}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge className={STATUS_COLORS[inc.resolutionStatus]}>
                            {formatStatus(inc.resolutionStatus)}
                          </Badge>
                          <p className="text-zinc-600 text-xs mt-1">{timeAgo(inc.createdAt)}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* INCIDENTS TAB */}
        {tab === "incidents" && (
          <div className="space-y-4">
            {loading && (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
              </div>
            )}

            {incidents.map((inc, i) => (
              <motion.div
                key={inc._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card hover className="p-5" onClick={() => setSelectedIncident(inc)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span>{INCIDENT_TYPE_ICONS[inc.type]}</span>
                        <Badge className={SEVERITY_COLORS[inc.severity]}>{inc.severity}</Badge>
                        <Badge className={STATUS_COLORS[inc.resolutionStatus]}>
                          {formatStatus(inc.resolutionStatus)}
                        </Badge>
                        {inc.verificationStatus === "pending" && (
                          <Badge className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                            Pending Verification
                          </Badge>
                        )}
                        <span className="text-zinc-600 text-xs font-mono">{inc.caseId}</span>
                      </div>
                      <h3 className="text-white font-bold truncate">{inc.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin size={12} />{inc.address}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{timeAgo(inc.createdAt)}</span>
                        {inc.source === "quick_report" && (
                          <span className="text-zinc-600">Quick Report</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {inc.verificationStatus === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => verifyIncident(inc._id, "verified")}
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => verifyIncident(inc._id, "rejected")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {inc.resolutionStatus !== "closed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-zinc-600 hover:text-red-400 text-xs"
                          onClick={() => closeIncident(inc._id)}
                        >
                          Close
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* MAP TAB */}
        {tab === "map" && (
          <div className="border border-zinc-800 overflow-hidden">
            <IncidentMap
              incidents={incidents}
              height="600px"
              onIncidentClick={setSelectedIncident}
            />
          </div>
        )}
      </div>

      {/* Incident Detail Modal */}
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
              <p><span className="text-gray-600">Type:</span> {selectedIncident.type}</p>
              <p><span className="text-gray-600">Source:</span> {selectedIncident.source}</p>
              <p><span className="text-gray-600">Address:</span> {selectedIncident.address}</p>
              <p><span className="text-gray-600">Description:</span> {selectedIncident.description}</p>
              {selectedIncident.reporterInfo && (
                <>
                  <p><span className="text-gray-600">Reporter:</span> {selectedIncident.reporterInfo.name}</p>
                  <p><span className="text-gray-600">Phone:</span> {selectedIncident.reporterInfo.phoneNumber}</p>
                </>
              )}
            </div>

            {selectedIncident.assignedVolunteers?.length > 0 && (
              <div>
                <p className="text-white font-bold mb-2">Assigned Volunteers ({selectedIncident.assignedVolunteers.length})</p>
                <div className="space-y-2">
                  {selectedIncident.assignedVolunteers.map((av, i) => (
                    <div key={i} className="bg-zinc-950 border border-zinc-800 p-3 flex justify-between items-center">
                      <div>
                        <p className="text-white text-sm">{av.volunteer?.name || "Volunteer"}</p>
                        <p className="text-gray-500 text-xs">{av.volunteer?.phoneNumber} · {av.helpCategory}</p>
                      </div>
                      <Badge className={
                        av.status === "completed" ? "bg-green-500/10 text-green-400 border border-green-500/30" :
                        "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                      }>
                        {formatStatus(av.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 flex-wrap">
              {selectedIncident.verificationStatus === "pending" && (
                <>
                  <Button variant="success" size="sm" loading={verifying} onClick={() => verifyIncident(selectedIncident._id, "verified")}>
                    Verify
                  </Button>
                  <Button variant="danger" size="sm" loading={verifying} onClick={() => verifyIncident(selectedIncident._id, "rejected")}>
                    Reject
                  </Button>
                  <Button variant="secondary" size="sm" loading={verifying} onClick={() => verifyIncident(selectedIncident._id, "duplicate")}>
                    Mark Duplicate
                  </Button>
                </>
              )}
              {selectedIncident.resolutionStatus !== "closed" && (
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => closeIncident(selectedIncident._id)}>
                  Close Incident
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}