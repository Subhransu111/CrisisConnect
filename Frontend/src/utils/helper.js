export const SEVERITY_COLORS = {
  critical: "bg-red-500/10 text-red-400 border border-red-500/30",
  high: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
  low: "bg-green-500/10 text-green-400 border border-green-500/30",
}

export const STATUS_COLORS = {
  open: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  partially_assigned: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
  in_progress: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
  resolved: "bg-green-500/10 text-green-400 border border-green-500/30",
  closed: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30",
}

export const VERIFICATION_COLORS = {
  pending: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
  verified: "bg-green-500/10 text-green-400 border border-green-500/30",
  rejected: "bg-red-500/10 text-red-400 border border-red-500/30",
  duplicate: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30",
}

export const INCIDENT_TYPE_ICONS = {
  flood: "🌊",
  earthquake: "🌍",
  fire: "🔥",
  accident: "🚗",
  medical: "🏥",
  shelter: "🏠",
  food: "🍽️",
  other: "⚠️",
}

export const HELP_CATEGORY_ICONS = {
  medical: "🏥",
  rescue: "🚨",
  food: "🍽️",
  transport: "🚗",
  shelter: "🏠",
  general: "🤝",
  fire: "🔥",
}

export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export const formatStatus = (s) =>
  s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? ""