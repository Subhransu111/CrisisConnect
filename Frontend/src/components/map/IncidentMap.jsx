import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { SEVERITY_COLORS, INCIDENT_TYPE_ICONS, timeAgo } from "../../utils/helper"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

const severityMarkerColor = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
}

function createSeverityIcon(severity) {
  const color = severityMarkerColor[severity] || "#888"
  return L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 0 8px ${color}99;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function FitBounds({ incidents }) {
  const map = useMap()
  useEffect(() => {
    if (!incidents?.length) return
    const bounds = incidents.map((inc) => [
      inc.location.coordinates[1],
      inc.location.coordinates[0],
    ])
    if (bounds.length === 1) {
      map.setView(bounds[0], 14)
    } else {
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [incidents])
  return null
}

export default function IncidentMap({ incidents = [], center = [20.2961, 85.8245], height = "400px", onIncidentClick }) {
  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height }}
      className="z-0 w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap contributors'
      />
      <FitBounds incidents={incidents} />

      {incidents.map((inc) => {
        const pos = [inc.location.coordinates[1], inc.location.coordinates[0]]
        return (
          <Marker
            key={inc._id}
            position={pos}
            icon={createSeverityIcon(inc.severity)}
            eventHandlers={{ click: () => onIncidentClick?.(inc) }}
          >
            <Popup>
              <div className="text-sm min-w-[180px]">
                <p className="font-bold text-zinc-900">{INCIDENT_TYPE_ICONS[inc.type]} {inc.title}</p>
                <p className="text-zinc-600 text-xs mt-1">{inc.address}</p>
                <p className="text-zinc-500 text-xs mt-1">{timeAgo(inc.createdAt)}</p>
                <div className="mt-2 flex gap-1 flex-wrap">
                  <span className="text-xs bg-zinc-100 px-2 py-0.5 rounded capitalize">{inc.severity}</span>
                  <span className="text-xs bg-zinc-100 px-2 py-0.5 rounded capitalize">{inc.resolutionStatus}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}