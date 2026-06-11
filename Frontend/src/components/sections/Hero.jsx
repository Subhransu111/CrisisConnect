import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { AlertTriangle, Users } from "lucide-react"
import HeroOrb from "./HeroOrb"

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex items-center">
      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />
      {/* Red glow */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] -translate-y-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 grid grid-cols-2 gap-16 items-center w-full">
        {/* Left */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs tracking-widest uppercase font-medium">
              Live — Incidents being tracked now
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl font-black text-white leading-[1.05] tracking-tight"
          >
            When Crisis Hits,<br />
            <span className="text-red-500">Help Arrives</span><br />
            In Minutes.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg mt-6 max-w-md leading-relaxed"
          >
            CrisisConnect bridges victims with verified nearby volunteers
            during disasters — no login required to report an emergency.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 mt-10"
          >
            <Link
              to="/quick-report"
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 transition-all active:scale-95"
            >
              <AlertTriangle size={18} />
              Report Emergency
            </Link>
            <Link
              to="/register?role=volunteer"
              className="flex items-center gap-2 border border-zinc-700 hover:border-red-500 text-white font-bold px-8 py-4 transition-all"
            >
              <Users size={18} />
              Join as Volunteer
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-zinc-600 text-xs mt-6"
          >
            Not a replacement for 112 • For life-threatening emergencies call emergency services immediately
          </motion.p>
        </div>

        {/* Right — 3D */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative"
        >
          <HeroOrb />
          {/* Floating stat cards */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-8 -left-8 bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-lg"
          >
            <p className="text-red-500 font-black text-xl">1,200+</p>
            <p className="text-gray-400 text-xs">Incidents Resolved</p>
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-16 -right-4 bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-lg"
          >
            <p className="text-red-500 font-black text-xl">&lt; 8 min</p>
            <p className="text-gray-400 text-xs">Avg Response Time</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}