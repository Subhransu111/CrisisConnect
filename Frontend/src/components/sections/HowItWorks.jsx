import { motion } from "framer-motion"
import { AlertTriangle, Zap, HandHelping } from "lucide-react"

const steps = [
  {
    icon: AlertTriangle,
    number: "01",
    title: "Report the Emergency",
    desc: "Anyone can submit a quick emergency report — no login required. Include location, type, and severity.",
  },
  {
    icon: Zap,
    number: "02",
    title: "Volunteers Are Alerted",
    desc: "Verified nearby volunteers receive instant alerts sorted by proximity, severity, and skill match.",
  },
  {
    icon: HandHelping,
    number: "03",
    title: "Help Arrives in Minutes",
    desc: "Accepted volunteers update their status in real time. Victims track arrival on a live map.",
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-red-500 text-xs tracking-widest uppercase font-medium">How It Works</p>
          <h2 className="text-white text-4xl font-black mt-2">
            Three Steps.<br />
            <span className="text-red-500">One Goal — Save Lives.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-0">
          {steps.map(({ icon: Icon, number, title, desc }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative border border-zinc-800 p-8 group hover:border-red-500/40 transition-all"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 right-0 w-px h-8 bg-zinc-800 translate-x-0" />
              )}
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                  <Icon size={22} className="text-red-500" />
                </div>
                <span className="text-zinc-700 font-black text-5xl">{number}</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}