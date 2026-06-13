import { motion } from "framer-motion"
import { Shield, Users, Clock, CheckCircle } from "lucide-react"

const stats = [
  { icon: Shield, number: "1,200+", label: "Incidents Resolved" },
  { icon: Users, number: "850+", label: "Active Volunteers" },
  { icon: CheckCircle, number: "94%", label: "Response Rate" },
  { icon: Clock, number: "< 8 min", label: "Avg Response Time" },
]

export default function StatsBar() {
  return (
    <div className="bg-red-500 py-6">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(({ icon: Icon, number, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3"
          >
            <Icon size={28} className="text-red-200 shrink-0" />
            <div>
              <p className="text-white font-black text-2xl leading-none">{number}</p>
              <p className="text-red-200 text-xs uppercase tracking-widest mt-0.5">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}