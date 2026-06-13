import { Copy, Phone, MessageSquare, ExternalLink } from "lucide-react"
import { toast } from "sonner"

export default function EmergencyMessage({ incident, user }) {
  const name = user?.name || incident?.reporterInfo?.name || "Unknown"
  const phone = user?.phoneNumber || incident?.reporterInfo?.phoneNumber || "Unknown"
  const lat = incident?.location?.coordinates?.[1]
  const lng = incident?.location?.coordinates?.[0]

  const message = `🚨 Emergency Alert

Name: ${name}
Phone: ${phone}
Type: ${incident?.type}
Severity: ${incident?.severity}
Address: ${incident?.address}
${lat && lng ? `Location: https://maps.google.com/?q=${lat},${lng}` : ""}
Case ID: ${incident?.caseId}
Details: ${incident?.description}

Please respond immediately.`

  const copy = () => {
    navigator.clipboard.writeText(message)
    toast.success("Emergency message copied to clipboard!")
  }

  const openMaps = () => {
    if (lat && lng) window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank")
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-5">
      <h3 className="text-white font-bold text-lg flex items-center gap-2">
        <Phone size={18} className="text-red-500" />
        Emergency Contacts
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "National Emergency", number: "112", color: "bg-red-500 hover:bg-red-600" },
          { label: "Police", number: "100", color: "bg-blue-700 hover:bg-blue-800" },
          { label: "Fire Brigade", number: "101", color: "bg-orange-600 hover:bg-orange-700" },
          { label: "Ambulance", number: "108", color: "bg-green-700 hover:bg-green-800" },
        ].map(({ label, number, color }) => (
          <a
            key={number}
            href={`tel:${number}`}
            className={`${color} text-white font-bold py-3 flex flex-col items-center text-sm transition-all`}
          >
            <span className="text-lg font-black">{number}</span>
            <span className="text-xs opacity-80">{label}</span>
          </a>
        ))}
      </div>

      {/* Message preview */}
      <div>
        <p className="text-gray-500 text-xs mb-2 uppercase tracking-widest">Emergency Message</p>
        <div className="bg-zinc-950 border border-zinc-800 p-4">
          <pre className="text-gray-300 text-xs whitespace-pre-wrap font-mono leading-relaxed">{message}</pre>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={copy}
          className="flex-1 border border-zinc-700 hover:border-red-500 text-white text-sm py-3 flex items-center justify-center gap-2 transition-all"
        >
          <Copy size={15} /> Copy Message
        </button>
        
        <a
          href={`sms:?body=${encodeURIComponent(message)}`}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm py-3 flex items-center justify-center gap-2 transition-all"
        >
          <MessageSquare size={15} /> Send SMS
        </a>
        {lat && lng && (
          <button
            onClick={openMaps}
            className="border border-zinc-700 hover:border-red-500 text-gray-400 hover:text-white text-sm py-3 px-4 flex items-center justify-center transition-all"
          >
            <ExternalLink size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
