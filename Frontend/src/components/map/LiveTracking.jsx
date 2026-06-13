import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import { useSocket } from "../../context/SocketContext"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

const victimIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function MapUpdater({ center }) {
  const map = useMap()
  useEffect(() => { map.setView(center, map.getZoom()) }, [center])
  return null
}

export default function LiveTracking({ incidentId, victimLocation, volunteerName }) {
  const socket = useSocket()
  const [volunteerPos, setVolunteerPos] = useState(null)
  const [path, setPath] = useState([])
  const [isTracking, setIsTracking] = useState(false)

  const center = victimLocation || [20.2961, 85.8245]

  useEffect(() => {
    if (!socket || !incidentId) return
    socket.emit("join:incident", incidentId)
    setIsTracking(true)

    socket.on("volunteer:location-update", ({ coordinates }) => {
      const pos = [coordinates[1], coordinates[0]]
      setVolunteerPos(pos)
      setPath((prev) => [...prev, pos])
    })

    socket.on("volunteer:status-update", (incident) => {
      const v = incident.assignedVolunteers?.find(
        (av) => av.status === "completed" || av.status === "reached"
      )
      if (v?.status === "completed") setIsTracking(false)
    })

    return () => {
      socket.emit("leave:incident", incidentId)
      socket.off("volunteer:location-update")
      socket.off("volunteer:status-update")
    }
  }, [socket, incidentId])

  return (
    <div className="bg-zinc-900 border border-zinc-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isTracking ? "bg-green-400 animate-pulse" : "bg-zinc-500"}`} />
          <span className="text-white text-sm font-bold">
            {isTracking ? "Live Tracking" : "Tracking Ended"}
          </span>
          {volunteerName && (
            <span className="text-gray-500 text-xs">— {volunteerName}</span>
          )}
        </div>
        <span className="text-zinc-600 text-xs">Updates every 15s</span>
      </div>

      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "380px" }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />
        <MapUpdater center={center} />

        {/* Victim */}
        <Marker position={center} icon={victimIcon}>
          <Popup>📍 Your location</Popup>
        </Marker>

        {/* Volunteer */}
        {volunteerPos && (
          <Marker position={volunteerPos}>
            <Popup>🚗 {volunteerName || "Volunteer"} is here</Popup>
          </Marker>
        )}

        {/* Trail */}
        {path.length > 1 && (
          <Polyline positions={path} color="#ef4444" weight={3} opacity={0.7} dashArray="6" />
        )}
      </MapContainer>

      {!volunteerPos && isTracking && (
        <div className="px-4 py-3 bg-zinc-950 text-gray-500 text-xs text-center">
          Waiting for volunteer to start journey and share location...
        </div>
      )}
    </div>
  )
}