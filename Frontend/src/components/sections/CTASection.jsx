import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { AlertTriangle, Users } from "lucide-react"

export default function CTASection() {
  return (
    <section className="bg-black py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-black text-white leading-tight">
            Every Second Counts.<br />
            <span className="text-red-500">Are You Ready?</span>
          </h2>
          <p className="text-gray-400 text-lg mt-6 max-w-2xl mx-auto">
            Join thousands of volunteers already making a difference. Or report an emergency right now — no login needed.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <Link
              to="/#quick-report"
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-10 py-4 text-lg transition-all"
            >
              <AlertTriangle size={20} />
              Report Emergency Now
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 border border-zinc-600 hover:border-red-500 text-white font-bold px-10 py-4 text-lg transition-all"
            >
              <Users size={20} />
              Become a Volunteer
            </Link>
          </div>

          <p className="text-zinc-600 text-sm mt-8">
            For life-threatening emergencies, always call{" "}
            <a href="tel:112" className="text-red-500 font-bold">112</a> immediately.
          </p>
        </motion.div>
      </div>
    </section>
  )
}