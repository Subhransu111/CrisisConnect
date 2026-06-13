import { useState } from "react"
import { MapPin, Clock, ChevronRight, CheckCircle, Navigation } from "lucide-react"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import Modal from "../../components/ui/Modal"
import LiveTracking from "../../components/map/LiveTracking"
import api from "../../lib/axios"
import { useAuth } from "../../context/AuthContext"
import { useGeolocation } from "../../hooks/useGeolocation"
import { SEVERITY_COLORS, STATUS_COLORS, INCIDENT_TYPE_ICONS, HELP_CATEGORY_ICONS, timeAgo, formatStatus } from "../../utils/helper"
import { toast } from "sonner"

const HELP_CATEGORIES = ["medical", "rescue", "food", "transport", "shelter", "general", "fire"]

export default function NearbyCase({ incident, onAccepted, onSelect, isMyCase }) {
  const { user } = useAuth()
  const { coords, getLocation } = useGeolocation()
  const [accepting, setAccepting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showTracking, setShowTracking] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Find this volunteer's assignment in this incident
  const myAssignment = incident.assignedVolunteers?.find(
    (av) => av.volunteer?._id === user?.id || av.volunteer?.id === user?.id || av.volunteer === user?.id
  )

  const availableCategories = incident.requiredHelp?.filter(
    (rh) => rh.fulfilledVolunteers < rh.requiredVolunteers
  )

  const alreadyAccepted = !!myAssignment

  const handleAccept = async () => {
    if (!selectedCategory) {
      toast.error("Please select a help category")
      return
    }
    setAccepting(true)
    try {
      await api.post(`/incidents/${incident._id}/accept`, { helpCategory: selectedCategory })
      toast.success("You've accepted this incident!")
      setShowAcceptModal(false)
      onAccepted?.()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept incident")
    } finally {
      setAccepting(false)
    }
  }

  const updateStatus = async (status) => {
    setUpdatingStatus(true)
    try {
      if (status === "on_the_way") {
        getLocation()
      }
      await api.patch(`/incidents/${incident._id}/volunteer-status`, { status })
      toast.success(`Status updated to: ${formatStatus(status)}`)
      onAccepted?.()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleWithdraw = async () => {
    if (!window.confirm("Are you sure you want to withdraw from this incident?")) return
    setUpdatingStatus(true)
    try {
      await api.post(`/incidents/${incident._id}/withdraw`)
      toast.success("Withdrawn from incident")
      onAccepted?.()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to withdraw")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const nextStatusMap = {
    accepted: { label: "Start Journey", nextStatus: "on_the_way", color: "primary" },
    on_the_way: { label: "Mark Reached", nextStatus: "reached", color: "success" },
    reached: { label: "Mark Completed", nextStatus: "completed", color: "success" },
  }

  const nextStep = myAssignment ? nextStatusMap[myAssignment.status] : null

  return (
    <>
      <div
        className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-5 transition-all group cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-lg">{INCIDENT_TYPE_ICONS[incident.type]}</span>
              <Badge className={SEVERITY_COLORS[incident.severity]}>{incident.severity}</Badge>
              <Badge className={STATUS_COLORS[incident.resolutionStatus]}>
                {formatStatus(incident.resolutionStatus)}
              </Badge>
              {alreadyAccepted && (
                <Badge className="bg-green-500/10 text-green-400 border border-green-500/30">
                  ✓ Accepted — {formatStatus(myAssignment.status)}
                </Badge>
              )}
              <span className="text-zinc-600 text-xs font-mono">{incident.caseId}</span>
            </div>

            <h3 className="text-white font-bold truncate">{incident.title}</h3>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{incident.description}</p>

            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {incident.address}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {timeAgo(incident.createdAt)}
              </span>
            </div>

            {/* Volunteer slots */}
            {incident.requiredHelp?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {incident.requiredHelp.map((rh) => (
                  <div key={rh.category} className="bg-zinc-800 px-2.5 py-1 text-xs flex items-center gap-1.5">
                    <span>{HELP_CATEGORY_ICONS[rh.category]}</span>
                    <span className="text-gray-400 capitalize">{rh.category}</span>
                    <span className={`font-bold ${rh.fulfilledVolunteers >= rh.requiredVolunteers ? "text-green-400" : "text-orange-400"}`}>
                      {rh.fulfilledVolunteers}/{rh.requiredVolunteers}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 items-end shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Status update buttons for my cases */}
            {isMyCase && myAssignment && nextStep && myAssignment.status !== "completed" && (
              <Button
                variant={nextStep.color}
                size="sm"
                loading={updatingStatus}
                onClick={() => updateStatus(nextStep.nextStatus)}
              >
                {nextStep.label}
              </Button>
            )}

            {/* Live tracking */}
            {myAssignment?.status === "on_the_way" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowTracking(true)}
              >
                <Navigation size={14} />
                Live Map
              </Button>
            )}

            {/* Accept button for nearby (not already accepted) */}
            {!isMyCase && !alreadyAccepted && availableCategories?.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAcceptModal(true)}
              >
                Accept <ChevronRight size={14} />
              </Button>
            )}

            {/* Withdraw */}
            {isMyCase && myAssignment && !["completed", "cancelled"].includes(myAssignment.status) && (
              <Button variant="ghost" size="sm" onClick={handleWithdraw} className="text-red-500 hover:text-red-400 text-xs">
                Withdraw
              </Button>
            )}

            {myAssignment?.status === "completed" && (
              <span className="text-green-400 text-xs flex items-center gap-1">
                <CheckCircle size={14} /> Completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Accept Modal */}
      <Modal
        open={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title={`Accept: ${incident.title}`}
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Select the help category you'll provide for this incident.
          </p>

          <div className="space-y-2">
            {availableCategories?.map((rh) => (
              <label
                key={rh.category}
                className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                  selectedCategory === rh.category
                    ? "border-red-500 bg-red-500/10"
                    : "border-zinc-800 hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="helpCategory"
                    value={rh.category}
                    checked={selectedCategory === rh.category}
                    onChange={() => setSelectedCategory(rh.category)}
                    className="accent-red-500"
                  />
                  <span className="text-white capitalize">
                    {HELP_CATEGORY_ICONS[rh.category]} {rh.category}
                  </span>
                </div>
                <span className="text-orange-400 text-sm font-bold">
                  {rh.fulfilledVolunteers}/{rh.requiredVolunteers} filled
                </span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAcceptModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={accepting}
              onClick={handleAccept}
              className="flex-1"
            >
              Confirm Accept
            </Button>
          </div>
        </div>
      </Modal>

      {/* Live Tracking Modal */}
      <Modal
        open={showTracking}
        onClose={() => setShowTracking(false)}
        title="Live Tracking"
      >
        <LiveTracking
          incidentId={incident._id}
          victimLocation={[
            incident.location.coordinates[1],
            incident.location.coordinates[0],
          ]}
        />
      </Modal>
    </>
  )
}