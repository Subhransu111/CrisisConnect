import { motion } from "framer-motion"
import { ShieldAlert, Users, MapPin, Clock, Radio, Bell } from "lucide-react"

const features = [
  {
    icon: ShieldAlert,
    title: "Instant Emergency Report",
    desc: "No login required. Report with name, phone, type, severity, location and photo in under 60 seconds.",
  },
  {
    icon: Users,
    title: "Multi-Volunteer Dispatch",
    desc: "One incident can require multiple volunteers across categories — rescue, medical, food, transport.",
  },
  {
    icon: MapPin,
    title: "Live Location Tracking",
    desc: "Track volunteer movement on a live map in real time — like Swiggy, but for disaster response.",
  },
  {
    icon: Clock,
    title: "Priority-Based Matching",
    desc: "Volunteers see cases sorted by severity, proximity, and skill match for fastest possible response.",
  },
  {
    icon: Radio,
    title: "Real-Time Updates",
    desc: "Socket.io powered live status updates — victim, volunteer, and admin all stay in sync instantly.",
  },
  {
    icon: Bell,
    title: "Critical Alerts",
    desc: "Critical incidents trigger immediate broadcast alerts to all connected volunteers in the area.",
  },
]

export default function Features() {
  return (
    <section className="bg-zinc-950 py-24">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-red-500 text-xs tracking-widest uppercase font-medium">Our Operations</p>
          <h2 className="text-white text-4xl font-black mt-2">
            Crisis Response &{" "}
            <span className="text-red-500">Coordination Features</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-zinc-950 p-8 group hover:bg-zinc-900 transition-all cursor-default"
            >
              <div className="w-10 h-10 bg-red-500/10 flex items-center justify-center mb-5 group-hover:bg-red-500/20 transition-all">
                <Icon size={20} className="text-red-500" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}